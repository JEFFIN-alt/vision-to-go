import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
}

export function SettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
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

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">App Settings</h3>
        <p className="text-sm text-muted-foreground">Configure global application settings</p>
      </div>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No settings configured yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-base font-semibold">{setting.setting_key}</Label>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                    )}
                  </div>
                  <Textarea
                    value={JSON.stringify(setting.setting_value, null, 2)}
                    readOnly
                    className="font-mono text-sm"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
