import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Card className="w-full max-w-md mx-4 glassmorphism">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">1%</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Daily Growth Tracker
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Transform your life one day at a time. Write journal entries, set meaningful goals, 
              and let AI create personalized daily tasks to help you achieve 1% better every day.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                size="lg"
              >
                Get Started
              </Button>
              
              <div className="text-sm text-gray-500">
                Start your journey to continuous improvement
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-primary font-semibold">📝</div>
                  <div className="text-xs text-gray-600 mt-1">Journal</div>
                </div>
                <div>
                  <div className="text-primary font-semibold">🎯</div>
                  <div className="text-xs text-gray-600 mt-1">Goals</div>
                </div>
                <div>
                  <div className="text-primary font-semibold">🤖</div>
                  <div className="text-xs text-gray-600 mt-1">AI Tasks</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
