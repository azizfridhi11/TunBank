import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "employee"]);
export const accountTypeEnum = pgEnum("account_type", ["savings", "checking", "business"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "transfer", "payment"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  role: userRoleEnum("role").default("user").notNull(),
  isVerified: boolean("is_verified").default(false),
  kycStatus: text("kyc_status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountNumber: text("account_number").notNull().unique(),
  type: accountTypeEnum("type").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  currency: text("currency").default("USD").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").references(() => accounts.id),
  toAccountId: integer("to_account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  cardNumber: text("card_number").notNull().unique(),
  cardHolderName: text("card_holder_name").notNull(),
  expiryDate: text("expiry_date").notNull(), // MM/YY
  cvv: text("cvv").notNull(),
  isFrozen: boolean("is_frozen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  durationMonths: integer("duration_months").notNull(),
  monthlyInstallment: decimal("monthly_installment", { precision: 15, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 15, scale: 2 }).notNull(),
  status: text("status").default("active").notNull(), // active, paid, overdue
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true });
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  loans: many(loans),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  outgoingTransactions: many(transactions, { relationName: "fromAccount" }),
  incomingTransactions: many(transactions, { relationName: "toAccount" }),
  cards: many(cards),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  fromAccount: one(accounts, {
    fields: [transactions.fromAccountId],
    references: [accounts.id],
    relationName: "fromAccount",
  }),
  toAccount: one(accounts, {
    fields: [transactions.toAccountId],
    references: [accounts.id],
    relationName: "toAccount",
  }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, accountNumber: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, status: true, createdAt: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
