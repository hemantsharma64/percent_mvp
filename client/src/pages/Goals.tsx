import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";

export default function Goals() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    duration: "",
    category: "",
  });

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

  const { data: goals, isLoading: isGoalsLoading } = useQuery({
    queryKey: ["/api/goals"],
    retry: false,
    enabled: !!user,
  });

  const createGoalMutation = useMutation({
    mutationFn: async () => {
      if (!newGoal.title.trim() || !newGoal.duration || !newGoal.category) {
        throw new Error("Please fill in all required fields");
      }
      
      await apiRequest("POST", "/api/goals", newGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsCreateDialogOpen(false);
      setNewGoal({ title: "", description: "", duration: "", category: "" });
      toast({
        title: "Success",
        description: "Goal created successfully!",
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
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isGoalsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation 
        user={user}
        currentDate={currentDate}
        journalStreak={0}
      />

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Your Goals</h1>
                <p className="text-gray-600">Track your progress and stay motivated</p>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Goal Title *
                    </label>
                    <Input
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Learn Python Programming"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    <Textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Describe what you want to achieve..."
                      className="w-full min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Duration *
                    </label>
                    <Select value={newGoal.duration} onValueChange={(value) => setNewGoal({ ...newGoal, duration: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category *
                    </label>
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="creativity">Creativity</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createGoalMutation.mutate()}
                      disabled={createGoalMutation.isPending}
                      className="flex-1 bg-primary text-white hover:bg-primary/90"
                    >
                      {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Goals Grid */}
        {!goals || goals.length === 0 ? (
          <Card className="glassmorphism">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Goals Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your growth journey by setting your first goal. Goals help the AI create better, 
                  more focused tasks for you.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} showActions />
            ))}
          </div>
        )}

        {/* Goal Tips */}
        <Card className="glassmorphism mt-8">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Tips for Setting Effective Goals</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-primary">✓</span>
                  <span>Make goals specific and measurable</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">✓</span>
                  <span>Choose realistic but challenging timeframes</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">✓</span>
                  <span>Focus on 3-5 goals at a time</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-primary">✓</span>
                  <span>Write about your goals in your journal</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">✓</span>
                  <span>Break large goals into smaller milestones</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">✓</span>
                  <span>Review and update progress regularly</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
