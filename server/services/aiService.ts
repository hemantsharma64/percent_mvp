interface AITaskResponse {
  tasks: Array<{
    title: string;
    description: string;
    category: string;
    timeEstimate: string;
    relatedGoalId?: string;
    priority: "high" | "medium" | "low";
  }>;
  dailyQuote: string;
  focusArea: string;
}

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("AI API key not found in environment variables");
    }
  }

  async generateTasksFromJournals(
    recentJournals: Array<{ date: string; content: string }>,
    mediumJournals: Array<{ date: string; content: string }>,
    oldJournals: Array<{ date: string; content: string }>,
    userGoals: Array<{ title: string; duration: string; progress: number; description?: string }>
  ): Promise<AITaskResponse> {
    const prompt = this.createTaskGenerationPrompt(recentJournals, mediumJournals, oldJournals, userGoals);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.error("Failed to parse AI response:", aiResponse);
        return this.getFallbackResponse();
      }
    } catch (error) {
      console.error("AI service error:", error);
      return this.getFallbackResponse();
    }
  }

  private createTaskGenerationPrompt(
    recentJournals: Array<{ date: string; content: string }>,
    mediumJournals: Array<{ date: string; content: string }>,
    oldJournals: Array<{ date: string; content: string }>,
    userGoals: Array<{ title: string; duration: string; progress: number; description?: string }>
  ): string {
    return `
You are a life coach AI. Create 5-7 specific, actionable tasks for tomorrow based on this user's information:

RECENT JOURNALS (Most Important - Last 7 days):
${recentJournals.map(j => `Date: ${j.date}\nContent: ${j.content}`).join('\n\n')}

USER GOALS:
${userGoals.map(g => `Goal: ${g.title}\nDuration: ${g.duration}\nProgress: ${g.progress}%\nDescription: ${g.description || 'No description'}`).join('\n\n')}

MEDIUM TERM JOURNALS (8-30 days ago):
${mediumJournals.slice(0, 3).map(j => `${j.date}: ${j.content.substring(0, 100)}...`).join('\n')}

OLD JOURNALS (30+ days ago):
${oldJournals.slice(0, 2).map(j => `${j.date}: ${j.content.substring(0, 50)}...`).join('\n')}

INSTRUCTIONS:
1. Create 5-7 specific tasks for tomorrow
2. Focus mostly on recent journals (40% weight) and user goals (40% weight)
3. Medium journals get 15% weight, old journals get 5% weight
4. Each task should take 10-45 minutes
5. Make tasks actionable and specific
6. Include tasks that help achieve the user's goals
7. Consider the user's mood, challenges, and interests from their journals

RESPONSE FORMAT (must be valid JSON):
{
  "tasks": [
    {
      "title": "Specific task title",
      "description": "Clear description of what to do and why",
      "category": "learning|health|productivity|wellness|creativity|social",
      "timeEstimate": "X minutes",
      "priority": "high|medium|low"
    }
  ],
  "dailyQuote": "Inspiring quote relevant to user's current situation",
  "focusArea": "Main area of focus for tomorrow (2-4 words)"
}
`;
  }

  private getFallbackResponse(): AITaskResponse {
    return {
      tasks: [
        {
          title: "Write in your journal",
          description: "Reflect on today's experiences and thoughts",
          category: "wellness",
          timeEstimate: "10 minutes",
          priority: "high"
        },
        {
          title: "Take a 20-minute walk",
          description: "Get some fresh air and light exercise",
          category: "health", 
          timeEstimate: "20 minutes",
          priority: "medium"
        },
        {
          title: "Read for 15 minutes",
          description: "Continue learning with a book or article",
          category: "learning",
          timeEstimate: "15 minutes", 
          priority: "medium"
        },
        {
          title: "Organize your workspace",
          description: "Clear your desk and organize your materials",
          category: "productivity",
          timeEstimate: "15 minutes",
          priority: "low"
        }
      ],
      dailyQuote: "Progress, not perfection, is the goal. Every small step counts.",
      focusArea: "Personal Growth"
    };
  }
}

export const aiService = new AIService();
