import { useState, useEffect } from "react";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function Journal() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const today = format(new Date(), 'yyyy-MM-dd');

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

  // Get today's journal if it exists
  const { data: todayJournal } = useQuery({
    queryKey: ["/api/journals", today],
    retry: false,
    enabled: !!user,
  });

  // Update content when journal loads
  useEffect(() => {
    if (todayJournal) {
      setContent(todayJournal.content);
    }
  }, [todayJournal]);

  const saveJournalMutation = useMutation({
    mutationFn: async () => {
      if (!content.trim()) {
        throw new Error("Journal content cannot be empty");
      }
      
      await apiRequest("POST", "/api/journals", {
        date: today,
        content: content.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
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
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Today's Journal</h1>
              <p className="text-gray-600">{currentDate}</p>
            </div>
          </div>
          
          {todayJournal && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                ✅ You've already written a journal entry for today! You can view it below, but you cannot edit it once saved.
              </p>
            </div>
          )}
        </div>

        {/* Journal Editor */}
        <Card className="glassmorphism">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {todayJournal ? (
                // Display existing journal
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Journal Entry</h3>
                  <div className="bg-white/60 rounded-xl p-6 border border-white/20">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {todayJournal.content}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>{todayJournal.wordCount} words</span>
                    <span>Written on {format(new Date(todayJournal.createdAt), 'PPpp')}</span>
                  </div>
                </div>
              ) : (
                // Create new journal
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    How was your day? What are you thinking about?
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    The AI will use this journal entry to create better, more personalized tasks for tomorrow. 
                    Be honest about your feelings, challenges, wins, and what you'd like to work on.
                  </p>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-white/20">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start writing about your day..."
                      className="w-full min-h-[300px] bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-500 text-base leading-relaxed"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      {wordCount} words
                    </div>
                    <Button
                      onClick={() => saveJournalMutation.mutate()}
                      disabled={!content.trim() || saveJournalMutation.isPending}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {saveJournalMutation.isPending ? "Saving..." : "Save Journal"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tips for better journaling */}
        {!todayJournal && (
          <Card className="glassmorphism mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Tips for Better Journaling</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <span className="text-primary">•</span>
                  <span>Write about your emotions and how you felt throughout the day</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">•</span>
                  <span>Mention any challenges you faced and how you handled them</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">•</span>
                  <span>Note what energized you or made you feel accomplished</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">•</span>
                  <span>Include what you'd like to work on or improve tomorrow</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary">•</span>
                  <span>Be honest and authentic - this helps the AI create better tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
