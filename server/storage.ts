import { 
  users, type User, type InsertUser,
  financialEntries, type FinancialEntry, type InsertFinancialEntry,
  budgets, type Budget, type InsertBudget,
  aiAdviceRequests, type AiAdviceRequest, type InsertAiAdviceRequest
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Financial entries methods
  getFinancialEntries(userId: number): Promise<FinancialEntry[]>;
  getFinancialEntriesByMonth(userId: number, month: number, year: number): Promise<FinancialEntry[]>;
  createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry>;
  updateFinancialEntry(id: number, entry: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined>;
  deleteFinancialEntry(id: number): Promise<boolean>;
  
  // Budget methods
  getBudgets(userId: number): Promise<Budget[]>;
  getBudgetsByMonth(userId: number, month: number, year: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  
  // AI advice methods
  getAiAdviceRequests(userId: number): Promise<AiAdviceRequest[]>;
  createAiAdviceRequest(request: InsertAiAdviceRequest): Promise<AiAdviceRequest>;
  updateAiAdviceResponse(id: number, response: string): Promise<AiAdviceRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private financialEntries: Map<number, FinancialEntry>;
  private budgets: Map<number, Budget>;
  private aiAdviceRequests: Map<number, AiAdviceRequest>;
  private userId: number;
  private entryId: number;
  private budgetId: number;
  private adviceId: number;

  constructor() {
    this.users = new Map();
    this.financialEntries = new Map();
    this.budgets = new Map();
    this.aiAdviceRequests = new Map();
    this.userId = 1;
    this.entryId = 1;
    this.budgetId = 1;
    this.adviceId = 1;
    
    // Add a default user for testing
    this.createUser({ username: "demo", password: "password" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Financial entries methods
  async getFinancialEntries(userId: number): Promise<FinancialEntry[]> {
    return Array.from(this.financialEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }
  
  async getFinancialEntriesByMonth(userId: number, month: number, year: number): Promise<FinancialEntry[]> {
    return Array.from(this.financialEntries.values()).filter(
      (entry) => {
        const entryDate = new Date(entry.date);
        return entry.userId === userId && 
               entryDate.getMonth() + 1 === month && 
               entryDate.getFullYear() === year;
      }
    );
  }
  
  async createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry> {
    const id = this.entryId++;
    
    // Extract properties from entry to avoid typescript errors
    const { 
      userId, 
      category, 
      amount, 
      isIncome, 
      date = new Date(), 
      description = null 
    } = entry;
    
    // Create properly typed object
    const newEntry: FinancialEntry = { 
      id,
      userId, 
      category, 
      amount, 
      isIncome, 
      date, 
      description
    };
    this.financialEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateFinancialEntry(id: number, entry: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined> {
    const existingEntry = this.financialEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry: FinancialEntry = { ...existingEntry, ...entry };
    this.financialEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteFinancialEntry(id: number): Promise<boolean> {
    return this.financialEntries.delete(id);
  }
  
  // Budget methods
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }
  
  async getBudgetsByMonth(userId: number, month: number, year: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId && 
                  budget.month === month && 
                  budget.year === year
    );
  }
  
  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.budgetId++;
    const newBudget: Budget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }
  
  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) return undefined;
    
    const updatedBudget: Budget = { ...existingBudget, ...budget };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
  
  // AI advice methods
  async getAiAdviceRequests(userId: number): Promise<AiAdviceRequest[]> {
    return Array.from(this.aiAdviceRequests.values()).filter(
      (request) => request.userId === userId
    );
  }
  
  async createAiAdviceRequest(request: InsertAiAdviceRequest): Promise<AiAdviceRequest> {
    const id = this.adviceId++;
    const newRequest: AiAdviceRequest = { 
      ...request, 
      id, 
      response: null,
      date: new Date() 
    };
    this.aiAdviceRequests.set(id, newRequest);
    return newRequest;
  }
  
  async updateAiAdviceResponse(id: number, response: string): Promise<AiAdviceRequest | undefined> {
    const existingRequest = this.aiAdviceRequests.get(id);
    if (!existingRequest) return undefined;
    
    const updatedRequest: AiAdviceRequest = { ...existingRequest, response };
    this.aiAdviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
