import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, History, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LOOKMAGIC
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Your Dashboard
          </h2>
          <p className="text-muted-foreground">
            Ready to transform your style? Choose an option below to get started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link to="/camera">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Take Photo</CardTitle>
                <CardDescription>
                  Capture a new photo with your camera for instant transformation
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="bg-gradient-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Upload Photo</CardTitle>
                <CardDescription>
                  Upload an existing photo from your device gallery
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="bg-gradient-accent w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-white" />
                </div>
                <CardTitle>View History</CardTitle>
                <CardDescription>
                  Browse your previous transformations and saved looks
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
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