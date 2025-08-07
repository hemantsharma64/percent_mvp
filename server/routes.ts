import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertJournalSchema, insertGoalSchema, insertTaskSchema } from "@shared/schema";
import { taskGenerator, scheduleTaskGeneration } from "./services/taskGenerator";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Start task generation scheduler
  scheduleTaskGeneration();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get today's tasks
      const tasks = await storage.getTasksForDate(userId, today);
      
      // Get dashboard content (quote, focus area)
      const dashboardContent = await storage.getDashboardContentForDate(userId, today);
      
      // Get user goals
      const goals = await storage.getUserGoals(userId);
      
      // Get statistics
      const [journalStreak, taskStreak, totalEntries, completedTasks] = await Promise.all([
        storage.getJournalStreak(userId),
        storage.getTaskStreak(userId),
        storage.getTotalJournalEntries(userId),
        storage.getTotalCompletedTasks(userId),
      ]);
      
      // Check if journal written today
      const todayJournal = await storage.getJournalByDate(userId, today);
      
      res.json({
        tasks,
        dashboardContent,
        goals,
        stats: {
          journalStreak,
          taskStreak,
          totalEntries,
          completedTasks,
        },
        hasJournalToday: !!todayJournal,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Journal routes
  app.post('/api/journals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const journalData = insertJournalSchema.parse({
        ...req.body,
        userId,
        wordCount: req.body.content ? req.body.content.split(/\s+/).length : 0,
      });

      // Check if journal exists for this date
      const existingJournal = await storage.getJournalByDate(userId, journalData.date);
      
      if (existingJournal) {
        return res.status(400).json({ message: "Journal already exists for this date" });
      }

      const journal = await storage.createJournal(journalData);
      res.json(journal);
    } catch (error) {
      console.error("Error creating journal:", error);
      res.status(500).json({ message: "Failed to create journal" });
    }
  });

  app.get('/api/journals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const journals = await storage.getUserJournals(userId, limit ? parseInt(limit) : undefined);
      res.json(journals);
    } catch (error) {
      console.error("Error fetching journals:", error);
      res.status(500).json({ message: "Failed to fetch journals" });
    }
  });

  app.get('/api/journals/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      const journal = await storage.getJournalByDate(userId, date);
      
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      res.json(journal);
    } catch (error) {
      console.error("Error fetching journal:", error);
      res.status(500).json({ message: "Failed to fetch journal" });
    }
  });

  // Goal routes
  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId,
      });

      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.patch('/api/goals/:goalId', isAuthenticated, async (req: any, res) => {
    try {
      const { goalId } = req.params;
      const updates = req.body;
      
      const goal = await storage.updateGoal(goalId, updates);
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, limit } = req.query;
      
      let tasks;
      if (date) {
        tasks = await storage.getTasksForDate(userId, date as string);
      } else {
        tasks = await storage.getUserTasks(userId, limit ? parseInt(limit) : undefined);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch('/api/tasks/:taskId', isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Generate tasks manually (for testing)
  app.post('/api/tasks/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.body;
      const targetDate = date || format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      await taskGenerator.generateTasksForUser(userId, targetDate);
      res.json({ message: "Tasks generated successfully" });
    } catch (error) {
      console.error("Error generating tasks:", error);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });

  // Manual task generation trigger (for testing)
  app.post('/api/generate-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = format(new Date(), 'yyyy-MM-dd');
      
      console.log(`Manual task generation triggered for user ${userId}`);
      await taskGenerator.generateTasksForUser(userId, today);
      
      res.json({ message: "Tasks generated successfully", date: today });
    } catch (error) {
      console.error("Manual task generation error:", error);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
