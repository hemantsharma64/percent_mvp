import {
  users,
  journals,
  goals,
  tasks,
  dashboardContent,
  type User,
  type UpsertUser,
  type Journal,
  type InsertJournal,
  type Goal,
  type InsertGoal,
  type Task,
  type InsertTask,
  type DashboardContent,
  type InsertDashboardContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Journal operations
  createJournal(journal: InsertJournal): Promise<Journal>;
  getJournalByDate(userId: string, date: string): Promise<Journal | undefined>;
  getUserJournals(userId: string, limit?: number): Promise<Journal[]>;
  getJournalsFromDateRange(userId: string, startDate: string, endDate: string): Promise<Journal[]>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(goalId: string, updates: Partial<InsertGoal>): Promise<Goal>;
  getUserGoals(userId: string): Promise<Goal[]>;
  getGoal(goalId: string): Promise<Goal | undefined>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task>;
  getTasksForDate(userId: string, date: string): Promise<Task[]>;
  getUserTasks(userId: string, limit?: number): Promise<Task[]>;
  
  // Dashboard content operations
  createDashboardContent(content: InsertDashboardContent): Promise<DashboardContent>;
  getDashboardContentForDate(userId: string, date: string): Promise<DashboardContent | undefined>;
  
  // Statistics
  getJournalStreak(userId: string): Promise<number>;
  getTaskStreak(userId: string): Promise<number>;
  getTotalJournalEntries(userId: string): Promise<number>;
  getTotalCompletedTasks(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Journal operations
  async createJournal(journal: InsertJournal): Promise<Journal> {
    const [newJournal] = await db.insert(journals).values(journal).returning();
    return newJournal;
  }

  async getJournalByDate(userId: string, date: string): Promise<Journal | undefined> {
    const [journal] = await db
      .select()
      .from(journals)
      .where(and(eq(journals.userId, userId), eq(journals.date, date)));
    return journal;
  }

  async getUserJournals(userId: string, limit?: number): Promise<Journal[]> {
    const query = db
      .select()
      .from(journals)
      .where(eq(journals.userId, userId))
      .orderBy(desc(journals.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  async getJournalsFromDateRange(userId: string, startDate: string, endDate: string): Promise<Journal[]> {
    return await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.userId, userId),
          sql`${journals.date} >= ${startDate}`,
          sql`${journals.date} <= ${endDate}`
        )
      )
      .orderBy(desc(journals.date));
  }

  // Goal operations
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(goalId: string, updates: Partial<InsertGoal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, goalId))
      .returning();
    return updatedGoal;
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(goalId: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, goalId));
    return goal;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();
    return updatedTask;
  }

  async getTasksForDate(userId: string, date: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, date)))
      .orderBy(desc(tasks.generatedAt));
  }

  async getUserTasks(userId: string, limit?: number): Promise<Task[]> {
    const query = db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  // Dashboard content operations
  async createDashboardContent(content: InsertDashboardContent): Promise<DashboardContent> {
    const [newContent] = await db.insert(dashboardContent).values(content).returning();
    return newContent;
  }

  async getDashboardContentForDate(userId: string, date: string): Promise<DashboardContent | undefined> {
    const [content] = await db
      .select()
      .from(dashboardContent)
      .where(and(eq(dashboardContent.userId, userId), eq(dashboardContent.date, date)));
    return content;
  }

  // Statistics
  async getJournalStreak(userId: string): Promise<number> {
    const userJournals = await db
      .select({ date: journals.date })
      .from(journals)
      .where(eq(journals.userId, userId))
      .orderBy(desc(journals.date));

    if (userJournals.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const journal of userJournals) {
      const journalDate = journal.date;
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (journalDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getTaskStreak(userId: string): Promise<number> {
    const userTasks = await db
      .select({ date: tasks.date, completed: tasks.completed })
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.date));

    if (userTasks.length === 0) return 0;

    const dailyCompletions = new Map<string, boolean>();
    
    // Group tasks by date and check if all are completed
    for (const task of userTasks) {
      const date = task.date;
      if (!dailyCompletions.has(date)) {
        dailyCompletions.set(date, true);
      }
      if (!task.completed) {
        dailyCompletions.set(date, false);
      }
    }

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (dailyCompletions.get(dateStr) === true) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getTotalJournalEntries(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(journals)
      .where(eq(journals.userId, userId));
    return Number(result[0].count);
  }

  async getTotalCompletedTasks(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)));
    return Number(result[0].count);
  }
}

export const storage = new DatabaseStorage();
