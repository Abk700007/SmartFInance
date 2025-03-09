import { pgTable, text, serial, numeric, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define financial entries
export const financialEntries = pgTable("financial_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  isIncome: boolean("is_income").notNull(),
});

export const insertFinancialEntrySchema = createInsertSchema(financialEntries).omit({
  id: true,
});

// Define budget categories
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  limit: numeric("limit", { precision: 10, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
});

// Define AI advice requests
export const aiAdviceRequests = pgTable("ai_advice_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  response: text("response"),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertAiAdviceRequestSchema = createInsertSchema(aiAdviceRequests).omit({
  id: true,
  date: true,
  response: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FinancialEntry = typeof financialEntries.$inferSelect;
export type InsertFinancialEntry = z.infer<typeof insertFinancialEntrySchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type AiAdviceRequest = typeof aiAdviceRequests.$inferSelect;
export type InsertAiAdviceRequest = z.infer<typeof insertAiAdviceRequestSchema>;

// Category types for frontend
export const expenseCategories = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Clothing",
  "Personal",
  "Debt",
  "Savings",
  "Other"
] as const;

export const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Rental",
  "Gift",
  "Other"
] as const;

export type ExpenseCategory = typeof expenseCategories[number];
export type IncomeCategory = typeof incomeCategories[number];
