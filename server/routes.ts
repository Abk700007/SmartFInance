import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { 
  insertFinancialEntrySchema, 
  insertBudgetSchema, 
  insertAiAdviceRequestSchema,
  type InsertFinancialEntry,
  type InsertBudget,
  type InsertAiAdviceRequest
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper for handling validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: fromZodError(error).message };
      }
      return { data: null, error: "Invalid input data" };
    }
  };
  
  // Authentication endpoints
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    try {
      const user = await storage.createUser({ username, password });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // For a real app, this would set up a session
      res.status(201).json({ 
        message: "User registered successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      // Check if user exists and password matches
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // For a real app, this would set up a session with JWT or cookies
      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    // In a real app, this would verify the user's session/token
    // For now, we'll return a mock authenticated user
    const userId = 1; // This would come from the session
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user information" });
    }
  });

  // Financial entries endpoints
  app.get("/api/entries", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const entries = await storage.getFinancialEntries(userId);
    res.json(entries);
  });

  app.get("/api/entries/:month/:year", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    const entries = await storage.getFinancialEntriesByMonth(userId, month, year);
    res.json(entries);
  });

  app.post("/api/entries", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const validation = validateRequest(
      insertFinancialEntrySchema,
      { ...req.body, userId }
    );
    
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    
    const entry = await storage.createFinancialEntry(validation.data as InsertFinancialEntry);
    res.status(201).json(entry);
  });

  app.put("/api/entries/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const updated = await storage.updateFinancialEntry(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    res.json(updated);
  });

  app.delete("/api/entries/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const deleted = await storage.deleteFinancialEntry(id);
    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    res.status(204).send();
  });

  // Budget endpoints
  app.get("/api/budgets", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const budgets = await storage.getBudgets(userId);
    res.json(budgets);
  });

  app.get("/api/budgets/:month/:year", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    const budgets = await storage.getBudgetsByMonth(userId, month, year);
    res.json(budgets);
  });

  app.post("/api/budgets", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const validation = validateRequest(
      insertBudgetSchema,
      { ...req.body, userId }
    );
    
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    
    const budget = await storage.createBudget(validation.data as InsertBudget);
    res.status(201).json(budget);
  });

  app.put("/api/budgets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const updated = await storage.updateBudget(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json(updated);
  });

  app.delete("/api/budgets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const deleted = await storage.deleteBudget(id);
    if (!deleted) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.status(204).send();
  });

  // AI Advice endpoints
  app.get("/api/advice", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const requests = await storage.getAiAdviceRequests(userId);
    res.json(requests);
  });

  app.post("/api/advice", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    const validation = validateRequest(
      insertAiAdviceRequestSchema,
      { ...req.body, userId }
    );
    
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      // Create the advice request in the database
      const requestData = validation.data as InsertAiAdviceRequest;
      const request = await storage.createAiAdviceRequest(requestData);
      
      // Call the HuggingFace API for AI advice
      const apiKey = process.env.HUGGINGFACE_API_KEY || "";
      
      if (!apiKey) {
        return res.status(500).json({ 
          message: "HuggingFace API key is not configured",
          adviceRequest: request
        });
      }
      
      // Log for debugging
      console.log("Sending request to HuggingFace API with key:", apiKey ? "API Key Present" : "No API Key");
      
      // Use a better model for financial advice - google/flan-t5-large is better at instruction following
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-large",
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: `Provide helpful, practical, and accurate financial advice for the following query: "${requestData.query}"
                    Include specific, actionable recommendations that are realistic and responsible.`,
            parameters: {
              max_length: 300,
              temperature: 0.3 // Lower temperature for more focused/coherent responses
              // Removed return_full_text as it's not supported by this model
            },
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HuggingFace API error: ${errorData}`);
      }
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw HuggingFace API response:", responseText);
      
      // Parse the response
      let aiResponse = "Sorry, I couldn't generate advice at this time.";
      try {
        const data = JSON.parse(responseText);
        if (Array.isArray(data) && data.length > 0) {
          aiResponse = data[0].generated_text || aiResponse;
        } else if (data.generated_text) {
          aiResponse = data.generated_text;
        } else if (typeof data === 'string') {
          aiResponse = data;
        }
      } catch (e) {
        console.error("Error parsing HuggingFace response:", e);
        // If we can't parse as JSON, just use the raw text if it's not too long
        if (responseText && responseText.length < 5000) {
          aiResponse = responseText;
        }
      }
      
      // Update the advice request with the response
      const updatedRequest = await storage.updateAiAdviceResponse(request.id, aiResponse);
      
      res.status(201).json(updatedRequest);
    } catch (error) {
      console.error("Error generating AI advice:", error);
      res.status(500).json({ 
        message: `Error generating AI advice: ${error instanceof Error ? error.message : "Unknown error"}` 
      });
    }
  });

  // Get financial summary (for dashboard)
  app.get("/api/summary", async (req: Request, res: Response) => {
    const userId = 1; // Default for demo
    
    try {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Get entries for the current month
      const entries = await storage.getFinancialEntriesByMonth(userId, currentMonth, currentYear);
      
      // Calculate total income
      const income = entries
        .filter(entry => entry.isIncome)
        .reduce((total, entry) => total + parseFloat(entry.amount.toString()), 0);
      
      // Calculate total expenses
      const expenses = entries
        .filter(entry => !entry.isIncome)
        .reduce((total, entry) => total + parseFloat(entry.amount.toString()), 0);
      
      // Calculate savings rate
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      
      // Get expense categories breakdown
      const expensesByCategory = entries
        .filter(entry => !entry.isIncome)
        .reduce((acc, entry) => {
          const category = entry.category;
          const amount = parseFloat(entry.amount.toString());
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {} as Record<string, number>);
      
      // Get budgets for the current month
      const budgets = await storage.getBudgetsByMonth(userId, currentMonth, currentYear);
      
      // Compare expenses with budgets
      const budgetStatus = Object.entries(expensesByCategory).map(([category, amount]) => {
        const budget = budgets.find(b => b.category === category);
        if (!budget) return { category, amount, limit: 0, status: 'unbudgeted' };
        
        const limit = parseFloat(budget.limit.toString());
        const percentage = (amount / limit) * 100;
        let status = 'on-track';
        
        if (percentage > 100) {
          status = 'over-budget';
        } else if (percentage > 90) {
          status = 'near-limit';
        }
        
        return {
          category,
          amount,
          limit,
          percentage,
          status
        };
      });
      
      const summary = {
        income,
        expenses,
        savingsRate,
        expensesByCategory,
        budgetStatus,
        month: currentMonth,
        year: currentYear
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ 
        message: `Error generating summary: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
