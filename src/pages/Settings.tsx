import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, Moon, Sun, Palette, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FeedbackSystem from "@/components/FeedbackSystem";

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailUpdates: true,
    saveTransformations: true,
    analyticsEnabled: true,
  });

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('push_notifications, email_updates, save_transformations, analytics_enabled')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setPreferences({
          pushNotifications: profile.push_notifications ?? true,
          emailUpdates: profile.email_updates ?? true,
          saveTransformations: profile.save_transformations ?? true,
          analyticsEnabled: profile.analytics_enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreference = async (key: keyof typeof preferences, value: boolean) => {
    if (!user) return;

    setPreferences(prev => ({ ...prev, [key]: value }));

    try {
      const columnMap = {
        pushNotifications: 'push_notifications',
        emailUpdates: 'email_updates', 
        saveTransformations: 'save_transformations',
        analyticsEnabled: 'analytics_enabled',
      };

      await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id, 
          [columnMap[key]]: value 
        });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showFeedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <FeedbackSystem onClose={() => setShowFeedback(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-border">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="w-10" />
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary w-12 h-12 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5" />
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch 
                id="push-notifications" 
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-updates">Email Updates</Label>
              <Switch 
                id="email-updates" 
                checked={preferences.emailUpdates}
                onCheckedChange={(checked) => updatePreference('emailUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your privacy settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="save-transformations">Save Transformations</Label>
              <Switch 
                id="save-transformations" 
                checked={preferences.saveTransformations}
                onCheckedChange={(checked) => updatePreference('saveTransformations', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <Switch 
                id="analytics" 
                checked={preferences.analyticsEnabled}
                onCheckedChange={(checked) => updatePreference('analyticsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5" />
              <CardTitle>Help & Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              FAQ
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Feedback
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Terms of Service
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;