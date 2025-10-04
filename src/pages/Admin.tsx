import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Package, Settings, MessageSquare, Flag, Quote } from 'lucide-react';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { SettingsManager } from '@/components/admin/SettingsManager';
import { FeedbackManager } from '@/components/admin/FeedbackManager';
import { FeatureFlagsManager } from '@/components/admin/FeatureFlagsManager';
import { QuotesManager } from '@/components/admin/QuotesManager';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to access the admin panel',
          variant: 'destructive',
        });
        navigate('/auth/signin');
        return;
      }

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roleData) {
        toast({
          title: 'Access denied',
          description: 'You do not have permission to access the admin panel',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify admin status',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">Manage LOOKMAGIC platform settings and content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <Tabs defaultValue="products" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="quotes" className="flex items-center gap-2">
                  <Quote className="w-4 h-4" />
                  <span className="hidden sm:inline">Quotes</span>
                </TabsTrigger>
                <TabsTrigger value="flags" className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span className="hidden sm:inline">Flags</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feedback</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="products" className="mt-0">
                <ProductsManager />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsManager />
              </TabsContent>

              <TabsContent value="quotes" className="mt-0">
                <QuotesManager />
              </TabsContent>

              <TabsContent value="flags" className="mt-0">
                <FeatureFlagsManager />
              </TabsContent>

              <TabsContent value="feedback" className="mt-0">
                <FeedbackManager />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
