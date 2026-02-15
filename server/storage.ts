import { db } from "./db";
import {
  users, accounts, transactions, cards,
  type User, type InsertUser,
  type Account, type InsertAccount,
  type Transaction, type InsertTransaction,
  type Card, type InsertCard
} from "@shared/schema";
import { eq, or, desc } from "drizzle-orm";

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

  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>; // Get all transactions for a user's accounts
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Cards
  getCards(userId: number): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  
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

  async getTransactions(userId: number): Promise<Transaction[]> {
    // Join transactions where from_account OR to_account belongs to user
    // For simplicity in this MVP, we'll fetch accounts then transactions
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
    // Similar to transactions, get cards for user's accounts
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
}

export const storage = new DatabaseStorage();
