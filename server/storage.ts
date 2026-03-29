import { db } from "./db";
import {
  users, accounts, transactions, cards, loans, bills, rewards, rewardEvents, savingsGoals,
  type User, type InsertUser,
  type Account, type InsertAccount,
  type Transaction, type InsertTransaction,
  type Card, type InsertCard,
  type Loan, type InsertLoan,
  type Bill, type InsertBill,
  type Reward, type RewardEvent,
  type SavingsGoal, type InsertSavingsGoal
} from "@shared/schema";
import { eq, or, desc } from "drizzle-orm";
import Decimal from "decimal.js";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // using email as username
  createUser(user: InsertUser): Promise<User>;

  // Accounts
  getAccounts(userId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByNumber(accountNumber: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount & { accountNumber: string }): Promise<Account>;
  updateAccountBalance(id: number, amount: string): Promise<Account>;
  createBill(bill: InsertBill): Promise<Bill>;

  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>; // Get all transactions for a user's accounts
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Cards
  getCards(userId: number): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;

  // Loans
  getLoans(userId: number): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  updateLoanBalance(id: number, remainingBalance: string): Promise<Loan>;
  createLoan(loan: InsertLoan): Promise<Loan>;

  // Rewards
  getRewards(userId: number): Promise<Reward | null>;
  addRewardPoints(userId: number, points: number, action: string, description: string): Promise<Reward>;
  getRewardEvents(userId: number): Promise<RewardEvent[]>;

  // Savings Goals
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal & { userId: number }): Promise<SavingsGoal>;
  contributeSavingsGoal(id: number, amount: string): Promise<SavingsGoal>;
  deleteSavingsGoal(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAccounts(userId: number): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async getAccountByNumber(accountNumber: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.accountNumber, accountNumber));
    return account;
  }

  async createAccount(account: InsertAccount & { accountNumber: string }): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccountBalance(id: number, newBalance: string): Promise<Account> {
    const [updated] = await db
      .update(accounts)
      .set({ balance: newBalance })
      .where(eq(accounts.id, id))
      .returning();
    return updated;
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    const userAccounts = await this.getAccounts(userId);
    const accountIds = userAccounts.map(a => a.id);

    if (accountIds.length === 0) return [];

    return await db.select()
      .from(transactions)
      .where(
        or(
          or(...accountIds.map(id => eq(transactions.fromAccountId, id))),
          or(...accountIds.map(id => eq(transactions.toAccountId, id)))
        )
      )
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTx] = await db.insert(transactions).values(transaction).returning();
    return newTx;
  }

  async getCards(userId: number): Promise<Card[]> {
    const userAccounts = await this.getAccounts(userId);
    const accountIds = userAccounts.map(a => a.id);

    if (accountIds.length === 0) return [];

    return await db.select()
      .from(cards)
      .where(or(...accountIds.map(id => eq(cards.accountId, id))));
  }

  async createCard(card: InsertCard): Promise<Card> {
    const [newCard] = await db.insert(cards).values(card).returning();
    return newCard;
  }

  async getLoans(userId: number): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.userId, userId));
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan;
  }

  async updateLoanBalance(id: number, remainingBalance: string): Promise<Loan> {
    const [updated] = await db
      .update(loans)
      .set({ remainingBalance, status: parseFloat(remainingBalance) <= 0 ? "paid" : "active" })
      .where(eq(loans.id, id))
      .returning();
    return updated;
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const [newLoan] = await db.insert(loans).values(loan).returning();
    return newLoan;
  }

  // ─── Rewards ─────────────────────────────────────────────────────────────────
  async getRewards(userId: number): Promise<Reward | null> {
    const [row] = await db.select().from(rewards).where(eq(rewards.userId, userId));
    return row || null;
  }

  async addRewardPoints(userId: number, points: number, action: string, description: string): Promise<Reward> {
    // Insert event
    await db.insert(rewardEvents).values({ userId, points, action, description });

    // Upsert rewards row
    const existing = await this.getRewards(userId);
    const newTotal = (existing?.totalPoints ?? 0) + points;
    const newTier = newTotal >= 5000 ? "platinum" : newTotal >= 2000 ? "gold" : newTotal >= 500 ? "silver" : "bronze";

    if (existing) {
      const [updated] = await db
        .update(rewards)
        .set({ totalPoints: newTotal, tier: newTier, updatedAt: new Date() })
        .where(eq(rewards.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(rewards)
        .values({ userId, totalPoints: newTotal, tier: newTier })
        .returning();
      return created;
    }
  }

  async getRewardEvents(userId: number): Promise<RewardEvent[]> {
    return await db
      .select()
      .from(rewardEvents)
      .where(eq(rewardEvents.userId, userId))
      .orderBy(desc(rewardEvents.createdAt));
  }

  // ─── Savings Goals ────────────────────────────────────────────────────────────
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId)).orderBy(desc(savingsGoals.createdAt));
  }

  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, id));
    return goal;
  }

  async createSavingsGoal(goal: InsertSavingsGoal & { userId: number }): Promise<SavingsGoal> {
    const [created] = await db.insert(savingsGoals).values(goal).returning();
    return created;
  }

  async contributeSavingsGoal(id: number, amount: string): Promise<SavingsGoal> {
    const goal = await this.getSavingsGoal(id);
    if (!goal) throw new Error("Goal not found");
    const newAmount = new Decimal(goal.currentAmount).plus(amount);
    const isCompleted = newAmount.gte(new Decimal(goal.targetAmount));
    const [updated] = await db
      .update(savingsGoals)
      .set({ currentAmount: newAmount.toString(), status: isCompleted ? "completed" : "active" })
      .where(eq(savingsGoals.id, id))
      .returning();
    return updated;
  }

  async deleteSavingsGoal(id: number): Promise<void> {
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
  }
}

export const storage = new DatabaseStorage();
