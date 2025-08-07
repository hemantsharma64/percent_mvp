import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import TaskList from "@/components/TaskList";
import GoalCard from "@/components/GoalCard";
import StatsWidget from "@/components/StatsWidget";
import JournalEditor from "@/components/JournalEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Quote } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    retry: false,
    enabled: !!user,
  });

  const generateTasksMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/generate-tasks", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "New tasks generated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate tasks",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const { tasks, dashboardContent, goals, stats, hasJournalToday } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation 
        user={user}
        currentDate={today}
        journalStreak={stats.journalStreak}
      />

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Daily Quote */}
        {dashboardContent && (
          <div className="mb-8">
            <Card className="glassmorphism">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Quote className="text-primary text-2xl mb-4 mx-auto" />
                  <blockquote className="text-lg text-gray-700 italic mb-4">
                    {dashboardContent.dailyQuote}
                  </blockquote>
                  <p className="text-sm text-gray-500">
                    Today's Focus: <span className="text-primary font-medium">{dashboardContent.focusArea}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Today's Tasks */}
          <div className="lg:col-span-2">
            <TaskList tasks={tasks} />
            
            {/* Journal Entry */}
            <div className="mt-6">
              <JournalEditor hasJournalToday={hasJournalToday} />
            </div>
          </div>

          {/* Right Column: Goals & Stats */}
          <div className="space-y-6">
            {/* Goals Progress */}
            <Card className="glassmorphism">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    🎯 Goals Progress
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80"
                    onClick={() => window.location.href = '/goals'}
                  >
                    ➕ Add Goal
                  </Button>
                </div>

                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No goals yet. Start by adding your first goal!</p>
                    </div>
                  ) : (
                    goals.slice(0, 3).map((goal) => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Widget */}
            <StatsWidget stats={stats} />

            {/* Quick Actions */}
            <Card className="glassmorphism">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  ⚡ Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start bg-white/60 hover:bg-white/80 border border-white/20"
                    onClick={() => window.location.href = '/history'}
                  >
                    📜 View Journal History
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    className="w-full justify-start bg-white/60 hover:bg-white/80 border border-white/20"
                    onClick={() => generateTasksMutation.mutate()}
                    disabled={generateTasksMutation.isPending}
                  >
                    🔄 {generateTasksMutation.isPending ? 'Generating...' : 'Generate New Tasks'}
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    className="w-full justify-start bg-white/60 hover:bg-white/80 border border-white/20"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    ⚙️ Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="floating-button bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
          onClick={() => window.location.href = '/journal'}
        >
          ✏️
        </Button>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 p-2">
            <span className="text-primary">🏠</span>
            <span className="text-xs text-primary">Dashboard</span>
          </button>
          <button 
            className="flex flex-col items-center space-y-1 p-2"
            onClick={() => window.location.href = '/journal'}
          >
            <span className="text-gray-400">📝</span>
            <span className="text-xs text-gray-400">Journal</span>
          </button>
          <button 
            className="flex flex-col items-center space-y-1 p-2"
            onClick={() => window.location.href = '/goals'}
          >
            <span className="text-gray-400">🎯</span>
            <span className="text-xs text-gray-400">Goals</span>
          </button>
          <button 
            className="flex flex-col items-center space-y-1 p-2"
            onClick={() => window.location.href = '/history'}
          >
            <span className="text-gray-400">📜</span>
            <span className="text-xs text-gray-400">History</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
