import { Card, CardContent } from "@/components/ui/card";
import { Flame, CheckCircle, Book, Trophy } from "lucide-react";

interface Stats {
  journalStreak: number;
  taskStreak: number;
  totalEntries: number;
  completedTasks: number;
}

interface StatsWidgetProps {
  stats: Stats;
}

export default function StatsWidget({ stats }: StatsWidgetProps) {
  return (
    <Card className="glassmorphism">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          📊 Your Stats
        </h2>

        <div className="space-y-4">
          <div className="bg-white/50 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Flame className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Journal Streak</p>
                  <p className="font-semibold text-gray-800">{stats.journalStreak} days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Task Streak</p>
                  <p className="font-semibold text-gray-800">{stats.taskStreak} days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Book className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="font-semibold text-gray-800">{stats.totalEntries}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Tasks</p>
                  <p className="font-semibold text-gray-800">{stats.completedTasks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
