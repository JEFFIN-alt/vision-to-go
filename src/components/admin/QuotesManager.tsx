import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Quote as QuoteIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Quote {
  id: string;
  quote_text: string;
  author: string | null;
  category: string;
  is_active: boolean;
}

export function QuotesManager() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quote_text: '',
    author: '',
    category: 'confidence',
    is_active: true,
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingQuote) {
        const { error } = await supabase
          .from('quotes')
          .update(formData)
          .eq('id', editingQuote.id);

        if (error) throw error;
        toast({ title: 'Quote updated successfully' });
      } else {
        const { error } = await supabase.from('quotes').insert([formData]);

        if (error) throw error;
        toast({ title: 'Quote created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchQuotes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Quote deleted successfully' });
      fetchQuotes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      quote_text: quote.quote_text,
      author: quote.author || '',
      category: quote.category,
      is_active: quote.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingQuote(null);
    setFormData({
      quote_text: '',
      author: '',
      category: 'confidence',
      is_active: true,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading quotes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Motivational Quotes</h3>
          <p className="text-sm text-muted-foreground">
            Manage inspiring quotes shown to users
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Quote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQuote ? 'Edit Quote' : 'Add New Quote'}
              </DialogTitle>
              <DialogDescription>
                {editingQuote
                  ? 'Update the quote details'
                  : 'Add a new motivational quote'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="quote_text">Quote Text*</Label>
                <Textarea
                  id="quote_text"
                  value={formData.quote_text}
                  onChange={(e) =>
                    setFormData({ ...formData, quote_text: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Enter an inspiring quote..."
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Quote author (optional)"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="confidence, beauty, style, etc."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active (visible to users)</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingQuote ? 'Update Quote' : 'Create Quote'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QuoteIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No quotes yet. Add your first quote!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <CardTitle className="text-base leading-relaxed">
                  "{quote.quote_text}"
                </CardTitle>
                {quote.author && (
                  <p className="text-sm text-muted-foreground">— {quote.author}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{quote.category}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={quote.is_active ? 'text-green-600' : 'text-red-600'}
                  >
                    {quote.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(quote)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(quote.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
