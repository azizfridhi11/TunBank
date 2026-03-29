import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertAccountSchema, insertTransactionSchema, insertCardSchema, rechargeSchema } from "@shared/schema";
import Decimal from "decimal.js";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

// ─── Reward point values per action ──────────────────────────────────────────
const REWARD_POINTS = {
  recharge:           20,
  bill_payment:       50,
  local_transfer:     10,
  intl_transfer:      30,
  loan_repayment:    100,
  account_creation:   25,
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === SERVICES / RECHARGE ===
  app.post("/api/recharge", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { accountId, provider, phoneNumber, amount } = rechargeSchema.parse(req.body);
      const account = await storage.getAccount(accountId);
      if (!account || account.userId !== req.user.id) {
        return res.status(404).json({ message: "Account not found" });
      }

      const balance = new Decimal(account.balance);
      const rechargeAmount = new Decimal(amount);

      if (balance.lessThan(rechargeAmount)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      await storage.updateAccountBalance(account.id, balance.minus(rechargeAmount).toString());

      await storage.createBill({
        userId: req.user.id,
        accountId: account.id,
        type: "mobile_recharge",
        provider,
        amount: rechargeAmount.toString(),
        phoneNumber,
        status: "completed"
      });

      await storage.createTransaction({
        fromAccountId: account.id,
        toAccountId: null,
        amount: rechargeAmount.toString(),
        type: "recharge",
        status: "completed",
        description: `Mobile Recharge - ${provider} (${phoneNumber})`
      });

      // 🎁 Award reward points
      await storage.addRewardPoints(
        req.user.id,
        REWARD_POINTS.recharge,
        "recharge",
        `Recharge ${provider} — +${REWARD_POINTS.recharge} pts`
      );

      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === ACCOUNTS ===
  app.get(api.accounts.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const accounts = await storage.getAccounts(req.user.id);
    res.json(accounts);
  });

  app.post(api.accounts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = insertAccountSchema.parse(req.body);
      const accountNumber = "AC" + Math.floor(Math.random() * 1000000000).toString();
      const account = await storage.createAccount({ ...input, userId: req.user.id, accountNumber });

      // 🎁 Award reward points for opening a new account
      await storage.addRewardPoints(
        req.user.id,
        REWARD_POINTS.account_creation,
        "account_creation",
        `New account opened — +${REWARD_POINTS.account_creation} pts`
      );

      res.status(201).json(account);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.accounts.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const account = await storage.getAccount(Number(req.params.id));
    if (!account) return res.sendStatus(404);
    if (account.userId !== req.user.id && req.user.role !== 'admin') return res.sendStatus(403);
    res.json(account);
  });

  // === TRANSACTIONS ===
  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactions = await storage.getTransactions(req.user.id);
    res.json(transactions);
  });

  const EXCHANGE_RATES: Record<string, Record<string, number>> = {
    TND: { TND: 1, USD: 0.34, EUR: 0.31, GBP: 0.27 },
    USD: { TND: 2.94, USD: 1, EUR: 0.91, GBP: 0.79 },
    EUR: { TND: 3.22, USD: 1.10, EUR: 1, GBP: 0.87 },
    GBP: { TND: 3.70, USD: 1.27, EUR: 1.15, GBP: 1 },
  };

  app.post(api.transactions.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.transactions.create.input.parse(req.body);
      const { toCurrency, recipientCardNumber, recipientName } = req.body as {
        toCurrency?: string;
        recipientCardNumber?: string;
        recipientName?: string;
      };

      if (input.fromAccountId) {
        const fromAccount = await storage.getAccount(input.fromAccountId);
        if (!fromAccount) return res.status(404).json({ message: "Account not found" });
        if (fromAccount.userId !== req.user.id) return res.sendStatus(403);

        const balance = new Decimal(fromAccount.balance);
        const amount = new Decimal(input.amount.toString());

        if (balance.lessThan(amount)) {
          return res.status(400).json({ message: "Insufficient funds" });
        }

        await storage.updateAccountBalance(fromAccount.id, balance.minus(amount).toString());

        if (input.toAccountId && !toCurrency) {
          const toAccount = await storage.getAccount(input.toAccountId);
          if (toAccount) {
            await storage.updateAccountBalance(toAccount.id, new Decimal(toAccount.balance).plus(amount).toString());
          }
        }
      }

      let fromCurrency = "TND";
      if (input.fromAccountId) {
        const fromAcc = await storage.getAccount(input.fromAccountId);
        fromCurrency = fromAcc?.currency || "TND";
      }

      let txExchangeRate: string | undefined;
      let txConvertedAmount: string | undefined;
      const isIntl = !!(toCurrency && toCurrency !== fromCurrency);
      if (isIntl) {
        const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency!] || 1;
        const amt = new Decimal(input.amount.toString());
        txExchangeRate = rate.toString();
        txConvertedAmount = amt.mul(rate).toFixed(2);
      }

      const transaction = await storage.createTransaction({
        ...input,
        status: "completed",
        amount: input.amount.toString(),
        toCurrency: toCurrency || null,
        exchangeRate: txExchangeRate || null,
        convertedAmount: txConvertedAmount || null,
        recipientCardNumber: recipientCardNumber || null,
        recipientName: recipientName || null,
      });

      // 🎁 Award reward points
      if (isIntl) {
        await storage.addRewardPoints(
          req.user.id, REWARD_POINTS.intl_transfer, "intl_transfer",
          `International transfer to ${toCurrency} — +${REWARD_POINTS.intl_transfer} pts`
        );
      } else if (input.fromAccountId) {
        await storage.addRewardPoints(
          req.user.id, REWARD_POINTS.local_transfer, "local_transfer",
          `Local transfer — +${REWARD_POINTS.local_transfer} pts`
        );
      }

      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === CARDS ===
  app.get(api.cards.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cards = await storage.getCards(req.user.id);
    res.json(cards);
  });

  // === LOANS ===
  app.get(api.loans.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const loans = await storage.getLoans(req.user.id);
    res.json(loans);
  });

  app.post(api.loans.repay.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const loanId = Number(req.params.id);
      const { amount, accountId } = api.loans.repay.input.parse(req.body);

      const loan = await storage.getLoan(loanId);
      const account = await storage.getAccount(accountId);

      if (!loan || loan.userId !== req.user.id) return res.status(404).json({ message: "Loan not found" });
      if (!account || account.userId !== req.user.id) return res.status(404).json({ message: "Account not found" });

      const accountBalance = new Decimal(account.balance);
      const repaymentAmount = new Decimal(amount);
      const remainingLoanBalance = new Decimal(loan.remainingBalance);

      if (accountBalance.lessThan(repaymentAmount)) {
        return res.status(400).json({ message: "Insufficient funds in selected account" });
      }

      const newAccountBalance = accountBalance.minus(repaymentAmount).toString();
      const newLoanBalance = Decimal.max(0, remainingLoanBalance.minus(repaymentAmount)).toString();

      await storage.updateAccountBalance(account.id, newAccountBalance);
      await storage.updateLoanBalance(loan.id, newLoanBalance);

      await storage.createTransaction({
        fromAccountId: account.id,
        toAccountId: null,
        amount: repaymentAmount.toString(),
        type: "payment",
        status: "completed",
        description: `Loan Repayment - Loan ID: ${loanId}`
      });

      // 🎁 Award reward points for loan repayment
      await storage.addRewardPoints(
        req.user.id,
        REWARD_POINTS.loan_repayment,
        "loan_repayment",
        `Loan installment paid — +${REWARD_POINTS.loan_repayment} pts`
      );

      res.json({ success: true, newBalance: newLoanBalance });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === SAVINGS GOALS ===
  app.get("/api/savings-goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const goals = await storage.getSavingsGoals(req.user.id);
    res.json(goals);
  });

  app.post("/api/savings-goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { title, emoji, color, targetAmount, targetDate } = req.body;
      if (!title || !targetAmount) return res.status(400).json({ message: "Title and target amount are required" });
      const goal = await storage.createSavingsGoal({
        userId: req.user.id,
        title,
        emoji: emoji || "🎯",
        color: color || "#6366f1",
        targetAmount: String(targetAmount),
        targetDate: targetDate ? new Date(targetDate) : null,
      });
      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.post("/api/savings-goals/:id/contribute", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const goalId = Number(req.params.id);
      const { accountId, amount } = req.body;

      const goal = await storage.getSavingsGoal(goalId);
      if (!goal || goal.userId !== req.user.id) return res.status(404).json({ message: "Goal not found" });

      const account = await storage.getAccount(accountId);
      if (!account || account.userId !== req.user.id) return res.status(404).json({ message: "Account not found" });

      const balance = new Decimal(account.balance);
      const contribution = new Decimal(String(amount));

      if (balance.lessThan(contribution)) return res.status(400).json({ message: "Insufficient funds" });

      // Deduct from account
      await storage.updateAccountBalance(account.id, balance.minus(contribution).toString());

      // Add to goal
      const updatedGoal = await storage.contributeSavingsGoal(goalId, contribution.toString());

      // Record transaction
      await storage.createTransaction({
        fromAccountId: account.id,
        toAccountId: null,
        amount: contribution.toString(),
        type: "payment",
        status: "completed",
        description: `Savings Goal — ${goal.title}`,
      });

      // 🎁 Award points for saving
      await storage.addRewardPoints(req.user.id, 15, "savings", `Saved toward "${goal.title}" — +15 pts`);

      res.json(updatedGoal);
    } catch (err) {
      res.status(500).json({ message: "Failed to contribute" });
    }
  });

  app.delete("/api/savings-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const goalId = Number(req.params.id);
    const goal = await storage.getSavingsGoal(goalId);
    if (!goal || goal.userId !== req.user.id) return res.status(404).json({ message: "Goal not found" });
    await storage.deleteSavingsGoal(goalId);
    res.json({ success: true });
  });

  // === REWARDS ===
  app.get("/api/rewards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const reward = await storage.getRewards(req.user.id);
    res.json(reward || { totalPoints: 0, tier: "bronze" });
  });

  app.get("/api/rewards/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const events = await storage.getRewardEvents(req.user.id);
    res.json(events);
  });

  return httpServer;
}
