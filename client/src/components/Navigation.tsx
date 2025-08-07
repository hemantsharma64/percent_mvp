import { Flame } from "lucide-react";

interface NavigationProps {
  user: any;
  currentDate: string;
  journalStreak: number;
}

export default function Navigation({ user, currentDate, journalStreak }: NavigationProps) {
  return (
    <header className="glassmorphism sticky top-0 z-40 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">1%</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Daily Growth</h1>
            <p className="text-sm text-gray-600">{currentDate}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-white/60 rounded-full px-3 py-1.5">
            <Flame className="h-4 w-4 text-accent streak-flame" />
            <span className="text-sm font-medium text-gray-700">{journalStreak} day streak</span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.firstName?.[0] || user?.email?.[0] || '?'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
