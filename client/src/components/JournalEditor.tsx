import { useState } from "react";
import { useMutation, queryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JournalEditorProps {
  hasJournalToday: boolean;
}

export default function JournalEditor({ hasJournalToday }: JournalEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const saveJournalMutation = useMutation({
    mutationFn: async () => {
      if (!content.trim()) {
        throw new Error("Journal content cannot be empty");
      }
      
      const today = format(new Date(), 'yyyy-MM-dd');
      await apiRequest("POST", "/api/journals", {
        date: today,
        content: content.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setContent("");
      toast({
        title: "Success",
        description: "Journal saved successfully!",
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
        description: error.message || "Failed to save journal",
        variant: "destructive",
      });
    },
  });

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  if (hasJournalToday) {
    return (
      <Card className="glassmorphism">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              📖 Today's Journal
            </h2>
            <div className="text-sm text-green-600 font-medium">
              ✅ Written
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 text-sm">
              Great job! You've written your journal entry for today. The AI will use this to create better tasks for tomorrow.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.href = '/journal'}
            >
              View Today's Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            📖 Today's Journal
          </h2>
          <div className="text-sm text-accent">
            Not written yet
          </div>
        </div>
        
        <div className="bg-white/60 rounded-xl p-4 border border-white/20">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How did today go? What are you thinking about? The AI will use this to create better tasks for tomorrow..."
            className="w-full h-32 bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {wordCount} words
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/journal'}
            >
              Full Editor
            </Button>
            <Button
              onClick={() => saveJournalMutation.mutate()}
              disabled={!content.trim() || saveJournalMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {saveJournalMutation.isPending ? "Saving..." : "Save Journal"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
