import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertAccountSchema, insertTransactionSchema, insertCardSchema } from "@shared/schema";
import Decimal from "decimal.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

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

  app.post(api.transactions.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.transactions.create.input.parse(req.body);
      
      // Basic transaction logic (Transfer)
      if (input.fromAccountId && input.toAccountId) {
        const fromAccount = await storage.getAccount(input.fromAccountId);
        const toAccount = await storage.getAccount(input.toAccountId);

        if (!fromAccount || !toAccount) {
          return res.status(404).json({ message: "Account not found" });
        }

        // Verify ownership
        if (fromAccount.userId !== req.user.id) return res.sendStatus(403);

        // Check balance
        const balance = new Decimal(fromAccount.balance);
        const amount = new Decimal(input.amount.toString());

        if (balance.lessThan(amount)) {
          return res.status(400).json({ message: "Insufficient funds" });
        }

        // Execute Transfer
        await storage.updateAccountBalance(fromAccount.id, balance.minus(amount).toString());
        await storage.updateAccountBalance(toAccount.id, new Decimal(toAccount.balance).plus(amount).toString());
      }
      
      const transaction = await storage.createTransaction({
        ...input,
        status: "completed", // Auto-complete for MVP
        amount: input.amount.toString() // Ensure string for decimal
      });
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

      // Update balances
      const newAccountBalance = accountBalance.minus(repaymentAmount).toString();
      const newLoanBalance = Decimal.max(0, remainingLoanBalance.minus(repaymentAmount)).toString();

      await storage.updateAccountBalance(account.id, newAccountBalance);
      await storage.updateLoanBalance(loan.id, newLoanBalance);

      // Create transaction record
      await storage.createTransaction({
        fromAccountId: account.id,
        toAccountId: null,
        amount: repaymentAmount.toString(),
        type: "payment",
        status: "completed",
        description: `Loan Repayment - Loan ID: ${loanId}`
      });

      res.json({ success: true, newBalance: newLoanBalance });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
