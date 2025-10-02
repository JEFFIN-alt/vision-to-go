import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, History, Settings, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ConfidenceQuotes from "@/components/ConfidenceQuotes";
import AIAssistant from "@/components/AIAssistant";

const Dashboard = () => {
  const { user } = useAuth();
  const [showAI, setShowAI] = useState(false);
  const [aiMinimized, setAiMinimized] = useState(false);

  const userName = user?.email?.split('@')[0] || 'Beautiful';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            LOOKMAGIC
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {userName.charAt(0).toUpperCase() + userName.slice(1)}! ✨
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAI(true)}
            className="bg-gradient-primary text-primary-foreground border-0 hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Ask Sofie
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Confidence Quotes */}
        <ConfidenceQuotes />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start your transformation journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/camera">
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-2 mx-auto">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Take Photo</CardTitle>
                    <CardDescription>
                      Capture with camera
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/upload">
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="bg-gradient-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-2 mx-auto">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Upload Photo</CardTitle>
                    <CardDescription>
                      From gallery
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/history">
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="bg-gradient-accent w-12 h-12 rounded-lg flex items-center justify-center mb-2 mx-auto">
                      <History className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">View History</CardTitle>
                    <CardDescription>
                      Past transformations
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trending Styles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <CardTitle>Trending Styles</CardTitle>
            </div>
            <CardDescription>Popular looks everyone's trying right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-secondary p-4 rounded-lg text-secondary-foreground">
                <h4 className="font-semibold">Curtain Bangs</h4>
                <p className="text-sm opacity-90">+47% this week</p>
              </div>
              <div className="bg-gradient-accent p-4 rounded-lg text-accent-foreground">
                <h4 className="font-semibold">Glass Skin</h4>
                <p className="text-sm opacity-90">+32% this week</p>
              </div>
              <div className="bg-gradient-primary p-4 rounded-lg text-primary-foreground">
                <h4 className="font-semibold">Wolf Cut</h4>
                <p className="text-sm opacity-90">+28% this week</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold">Bold Lips</h4>
                <p className="text-sm text-muted-foreground">+25% this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transformations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transformations</CardTitle>
            <CardDescription>
              Your latest style experiments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transformations yet</p>
              <p className="text-sm">Start by taking a photo or uploading an image!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={showAI && !aiMinimized} 
        onClose={() => setShowAI(false)}
        onMinimize={() => setAiMinimized(true)}
      />

      {/* Minimized AI Assistant Button */}
      {aiMinimized && (
        <Button
          onClick={() => setAiMinimized(false)}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-accent-glow z-40"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex flex-col items-center gap-1">
              <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                <div className="h-2 w-2 bg-primary rounded"></div>
              </div>
              <span className="text-xs">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/camera" className="flex flex-col items-center gap-1">
              <Camera className="h-6 w-6" />
              <span className="text-xs">Transform</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history" className="flex flex-col items-center gap-1">
              <History className="h-6 w-6" />
              <span className="text-xs">History</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings" className="flex flex-col items-center gap-1">
              <Settings className="h-6 w-6" />
              <span className="text-xs">Profile</span>
            </Link>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;