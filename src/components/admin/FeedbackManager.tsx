import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Feedback {
  id: string;
  user_id: string | null;
  subject: string;
  message: string;
  category: string;
  rating: number | null;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export function FeedbackManager() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
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

  const handleRespond = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          admin_response: response,
          status: 'resolved',
        })
        .eq('id', feedbackId);

      if (error) throw error;
      
      toast({ title: 'Response sent successfully' });
      setRespondingTo(null);
      setResponse('');
      fetchFeedback();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">User Feedback</h3>
        <p className="text-sm text-muted-foreground">View and respond to user feedback</p>
      </div>

      {feedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No feedback received yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.subject}</CardTitle>
                    <CardDescription>
                      {new Date(item.created_at).toLocaleDateString()} • {item.category}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    )}
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User Message:</p>
                  <p className="text-sm">{item.message}</p>
                </div>

                {item.admin_response && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Your Response:</p>
                    <p className="text-sm">{item.admin_response}</p>
                  </div>
                )}

                {respondingTo === item.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleRespond(item.id)}>
                        Send Response
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponse('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  !item.admin_response && (
                    <Button
                      variant="outline"
                      onClick={() => setRespondingTo(item.id)}
                    >
                      Respond
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
