import { storage } from "../storage";
import { aiService } from "./aiService";
import { format, subDays } from "date-fns";

export class TaskGenerator {
  async generateTasksForUser(userId: string, targetDate: string): Promise<void> {
    try {
      console.log(`Generating tasks for user ${userId} for date ${targetDate}`);

      // Get user data
      const userData = await this.getUserData(userId);
      
      if (!userData) {
        console.log(`No data found for user ${userId}, skipping task generation`);
        return;
      }

      // Generate tasks using AI
      const aiResponse = await aiService.generateTasksFromJournals(
        userData.recentJournals,
        userData.mediumJournals,
        userData.oldJournals,
        userData.goals
      );

      // Save tasks
      for (const taskData of aiResponse.tasks) {
        await storage.createTask({
          userId,
          date: targetDate,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          timeEstimate: taskData.timeEstimate,
          priority: taskData.priority,
          completed: false,
          relatedGoalId: taskData.relatedGoalId || null,
        });
      }

      // Save dashboard content
      await storage.createDashboardContent({
        userId,
        date: targetDate,
        dailyQuote: aiResponse.dailyQuote,
        focusArea: aiResponse.focusArea,
      });

      console.log(`Successfully generated ${aiResponse.tasks.length} tasks for user ${userId}`);
    } catch (error) {
      console.error(`Failed to generate tasks for user ${userId}:`, error);
    }
  }

  async generateTasksForAllUsers(): Promise<void> {
    console.log("Starting daily task generation for all users...");
    
    const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    try {
      // Get all users who have journal entries (active users)
      const activeUsers = await this.getActiveUsers();
      
      for (const userId of activeUsers) {
        await this.generateTasksForUser(userId, tomorrow);
      }
      
      console.log(`Task generation complete for ${activeUsers.length} users`);
    } catch (error) {
      console.error("Failed to generate tasks for all users:", error);
    }
  }

  private async getUserData(userId: string) {
    try {
      const now = new Date();
      const sevenDaysAgo = format(subDays(now, 7), 'yyyy-MM-dd');
      const thirtyDaysAgo = format(subDays(now, 30), 'yyyy-MM-dd');
      const today = format(now, 'yyyy-MM-dd');

      // Get recent journals (last 7 days)
      const recentJournals = await storage.getJournalsFromDateRange(userId, sevenDaysAgo, today);
      
      // Get medium-term journals (8-30 days ago)
      const mediumJournals = await storage.getJournalsFromDateRange(userId, thirtyDaysAgo, sevenDaysAgo);
      
      // Get older journals (sample of older entries)
      const allJournals = await storage.getUserJournals(userId, 50);
      const oldJournals = allJournals.filter(j => j.date < thirtyDaysAgo).slice(0, 5);

      // Get user goals
      const goals = await storage.getUserGoals(userId);

      if (recentJournals.length === 0 && goals.length === 0) {
        return null; // No data to work with
      }

      return {
        recentJournals: recentJournals.map(j => ({ date: j.date, content: j.content })),
        mediumJournals: mediumJournals.map(j => ({ date: j.date, content: j.content })),
        oldJournals: oldJournals.map(j => ({ date: j.date, content: j.content })),
        goals: goals.map(g => ({
          title: g.title,
          duration: g.duration,
          progress: g.progress || 0,
          description: g.description || undefined
        }))
      };
    } catch (error) {
      console.error(`Error getting user data for ${userId}:`, error);
      return null;
    }
  }

  private async getActiveUsers(): Promise<string[]> {
    try {
      // Get users who have written at least one journal entry in the last 30 days
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const recentJournals = await storage.getUserJournals("", 1000); // Get all recent journals
      
      const activeUserIds = new Set<string>();
      for (const journal of recentJournals) {
        if (journal.date >= thirtyDaysAgo) {
          activeUserIds.add(journal.userId);
        }
      }
      
      return Array.from(activeUserIds);
    } catch (error) {
      console.error("Error getting active users:", error);
      return [];
    }
  }
}

export const taskGenerator = new TaskGenerator();

// Schedule task generation for midnight every day
export function scheduleTaskGeneration() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setDate(now.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

  setTimeout(() => {
    taskGenerator.generateTasksForAllUsers();
    
    // Schedule recurring generation every 24 hours
    setInterval(() => {
      taskGenerator.generateTasksForAllUsers();
    }, 24 * 60 * 60 * 1000);
    
  }, timeUntilMidnight);

  console.log(`Task generation scheduled for ${nextMidnight.toISOString()}`);
}
