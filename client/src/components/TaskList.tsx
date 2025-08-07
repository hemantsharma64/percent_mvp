import { useMutation, queryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  timeEstimate: string;
  priority: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { toast } = useToast();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    updateTaskMutation.mutate({ taskId, completed });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      learning: "bg-blue-100 text-blue-700",
      health: "bg-green-100 text-green-700",
      wellness: "bg-green-100 text-green-700",
      productivity: "bg-orange-100 text-orange-700",
      creativity: "bg-purple-100 text-purple-700",
      social: "bg-pink-100 text-pink-700",
      financial: "bg-yellow-100 text-yellow-700",
      personal: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.personal;
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Card className="glassmorphism">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            ✅ Today's Tasks
            <span className="ml-2 bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </h2>
          <div className="text-sm text-gray-600">
            {completedTasks} of {tasks.length} completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-secondary to-green-400 h-2 rounded-full progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks generated yet. Write a journal entry to get personalized tasks!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="task-item bg-white/50 rounded-xl p-4 flex items-start space-x-4 border border-white/20"
              >
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                  className="mt-1"
                />
                <label htmlFor={task.id} className="flex-1 cursor-pointer">
                  <div className={`font-medium text-gray-800 ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </div>
                  <div className={`text-sm text-gray-600 mt-1 ${task.completed ? 'opacity-60' : ''}`}>
                    {task.description}
                  </div>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.timeEstimate}
                    </span>
                    {task.priority === 'high' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        High Priority
                      </span>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
