import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  title: string;
  description?: string;
  duration: string;
  progress: number;
  category: string;
  status: string;
}

interface GoalCardProps {
  goal: Goal;
  showActions?: boolean;
}

export default function GoalCard({ goal, showActions = false }: GoalCardProps) {
  const { toast } = useToast();

  const updateGoalMutation = useMutation({
    mutationFn: async ({ progress }: { progress: number }) => {
      await apiRequest("PATCH", `/api/goals/${goal.id}`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Goal progress updated!",
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
        description: "Failed to update goal",
        variant: "destructive",
      });
    },
  });

  const getDurationLabel = (duration: string) => {
    const labels = {
      "1month": "1 month",
      "3months": "3 months", 
      "6months": "6 months",
      "1year": "1 year"
    };
    return labels[duration] || duration;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "from-green-500 to-green-600";
    if (progress >= 60) return "from-yellow-500 to-yellow-600";
    if (progress >= 40) return "from-blue-500 to-blue-600";
    return "from-primary to-indigo-600";
  };

  const incrementProgress = () => {
    const newProgress = Math.min(goal.progress + 10, 100);
    updateGoalMutation.mutate({ progress: newProgress });
  };

  const decrementProgress = () => {
    const newProgress = Math.max(goal.progress - 10, 0);
    updateGoalMutation.mutate({ progress: newProgress });
  };

  return (
    <div className="goal-card bg-white/50 rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800">{goal.title}</h3>
        <span className="text-sm text-gray-500">{getDurationLabel(goal.duration)}</span>
      </div>
      
      {goal.description && (
        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
      )}
      
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>
      
      {showActions ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={decrementProgress}
              disabled={goal.progress === 0 || updateGoalMutation.isPending}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={incrementProgress}
              disabled={goal.progress === 100 || updateGoalMutation.isPending}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            {goal.progress === 100 ? "🎉 Completed!" : `${100 - goal.progress}% to go`}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          {goal.progress === 100 ? "🎉 Completed!" : `Next: Continue working towards ${goal.title}`}
        </p>
      )}
    </div>
  );
}
