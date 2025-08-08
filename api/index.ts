// Vercel serverless function entry point
import express from 'express';
import { createServer } from 'http';
import { storage } from '../server/storage';
import { setupAuth, isAuthenticated } from '../server/replitAuth';
import { insertJournalSchema, insertGoalSchema, insertTaskSchema } from '../shared/schema';
import { taskGenerator, scheduleTaskGeneration } from '../server/services/taskGenerator';
import { format } from 'date-fns';

const app = express();

// Configure express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
setupAuth(app).then(() => {
  console.log('Auth setup completed');
});

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

    const stats = {
      journalStreak,
      taskStreak,
      totalEntries,
      completedTasks,
    };

    // Check if user has journal entry for today
    const todayJournal = await storage.getJournalEntry(userId, today);
    const hasJournalToday = !!todayJournal;

    res.json({
      tasks,
      dashboardContent,
      goals,
      stats,
      hasJournalToday,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// Goals routes
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

// Tasks routes
app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const date = req.query.date as string || format(new Date(), 'yyyy-MM-dd');
    const tasks = await storage.getTasksForDate(userId, date);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

app.post('/api/tasks/generate', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { goalId } = req.body;
    
    if (!goalId) {
      return res.status(400).json({ message: "Goal ID is required" });
    }

    // Get the goal
    const goal = await storage.getGoal(goalId);
    if (!goal || goal.userId !== userId) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Generate tasks for this goal
    const tasks = await taskGenerator.generateTasksForGoal(goal);
    res.json({ tasks });
  } catch (error) {
    console.error("Error generating tasks:", error);
    res.status(500).json({ message: "Failed to generate tasks", error: (error as Error).message });
  }
});

// Journal routes
app.get('/api/journal', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const date = req.query.date as string;
    
    if (date) {
      const entry = await storage.getJournalEntry(userId, date);
      res.json(entry);
    } else {
      const entries = await storage.getUserJournalEntries(userId);
      res.json(entries);
    }
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
});

app.post('/api/journal', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const journalData = insertJournalSchema.parse({
      ...req.body,
      userId,
    });
    
    const entry = await storage.createJournalEntry(journalData);
    res.json(entry);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ message: "Failed to create journal entry" });
  }
});

// Export for Vercel serverless function
export default app;