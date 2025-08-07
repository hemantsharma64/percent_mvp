import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";

export default function History() {
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

  const { data: journals, isLoading: isJournalsLoading } = useQuery({
    queryKey: ["/api/journals"],
    retry: false,
    enabled: !!user,
  });

  if (isLoading || isJournalsLoading) {
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
              <h1 className="text-2xl font-bold text-gray-800">Journal History</h1>
              <p className="text-gray-600">Your personal growth journey</p>
            </div>
          </div>
        </div>

        {/* Journal Entries */}
        {!journals || journals.length === 0 ? (
          <Card className="glassmorphism">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Journal Entries Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start writing your first journal entry to begin tracking your thoughts and progress.
                </p>
                <Button
                  onClick={() => window.location.href = '/journal'}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Write First Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {journals.map((journal) => (
              <Card key={journal.id} className="glassmorphism">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {format(parseISO(journal.date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {journal.wordCount} words • Written at {format(new Date(journal.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-white/20">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {journal.content.length > 500 
                        ? `${journal.content.substring(0, 500)}...` 
                        : journal.content
                      }
                    </div>
                    {journal.content.length > 500 && (
                      <button className="text-primary hover:text-primary/80 text-sm mt-3 font-medium">
                        Read more
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics Card */}
        {journals && journals.length > 0 && (
          <Card className="glassmorphism mt-8">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Your Journaling Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{journals.length}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {Math.round(journals.reduce((sum, j) => sum + (j.wordCount || 0), 0) / journals.length)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {journals.reduce((sum, j) => sum + (j.wordCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {journals.length > 0 
                      ? Math.ceil((Date.now() - new Date(journals[journals.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">Days Writing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
