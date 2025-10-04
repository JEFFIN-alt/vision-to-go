import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';

interface FeatureFlag {
  id: string;
  flag_key: string;
  is_enabled: boolean;
  description: string | null;
}

export function FeatureFlagsManager() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_key');

      if (error) throw error;
      setFlags(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: !currentValue })
        .eq('id', flagId);

      if (error) throw error;

      setFlags((prev) =>
        prev.map((flag) =>
          flag.id === flagId ? { ...flag, is_enabled: !currentValue } : flag
        )
      );

      toast({
        title: 'Feature flag updated',
        description: 'The change will take effect immediately',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading feature flags...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Feature Flags</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable features across the platform
        </p>
      </div>

      {flags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No feature flags configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{flag.flag_key}</CardTitle>
                    {flag.description && (
                      <CardDescription>{flag.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={flag.id}
                      checked={flag.is_enabled}
                      onCheckedChange={() => toggleFlag(flag.id, flag.is_enabled)}
                    />
                    <Label
                      htmlFor={flag.id}
                      className={flag.is_enabled ? 'text-green-600' : 'text-muted-foreground'}
                    >
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
