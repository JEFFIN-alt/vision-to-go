import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TrendData {
  style_name: string;
  category: string;
  trend_score: number;
  source: string;
  metadata: Record<string, any>;
}

async function logJobStart(jobName: string): Promise<string> {
  const { data, error } = await supabase
    .from('jobs_log')
    .insert([{
      job_name: jobName,
      status: 'running',
      started_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data.id;
}

async function logJobComplete(jobId: string, success: boolean, errorMessage?: string, metadata?: Record<string, any>) {
  await supabase
    .from('jobs_log')
    .update({
      status: success ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
      metadata: metadata || {}
    })
    .eq('id', jobId);
}

async function fetchGoogleTrends(): Promise<TrendData[]> {
  // Simulate Google Trends API (replace with actual API call)
  const mockTrends: TrendData[] = [
    {
      style_name: "Wolf Cut",
      category: "hairstyles",
      trend_score: 85,
      source: "google_trends",
      metadata: { region: "US", timeframe: "last_7_days" }
    },
    {
      style_name: "Clean Girl Makeup",
      category: "makeup",
      trend_score: 92,
      source: "google_trends",
      metadata: { region: "US", timeframe: "last_7_days" }
    },
    {
      style_name: "Curtain Bangs",
      category: "hairstyles",
      trend_score: 78,
      source: "google_trends",
      metadata: { region: "US", timeframe: "last_7_days" }
    }
  ];
  
  // Add some randomness to simulate real data
  return mockTrends.map(trend => ({
    ...trend,
    trend_score: Math.floor(Math.random() * 20) + trend.trend_score - 10
  }));
}

async function fetchSocialMediaTrends(): Promise<TrendData[]> {
  // Simulate social media trends (replace with actual API calls)
  const mockSocialTrends: TrendData[] = [
    {
      style_name: "Glam Gothic",
      category: "makeup",
      trend_score: 67,
      source: "instagram",
      metadata: { hashtag_count: 15420, engagement_rate: 4.2 }
    },
    {
      style_name: "Textured Bob",
      category: "hairstyles",
      trend_score: 73,
      source: "tiktok",
      metadata: { video_count: 8930, view_count: 2400000 }
    },
    {
      style_name: "Vanilla Girl Aesthetic",
      category: "makeup",
      trend_score: 89,
      source: "pinterest",
      metadata: { pin_count: 45000, saves: 120000 }
    }
  ];
  
  return mockSocialTrends;
}

async function saveTrendsToDatabase(trends: TrendData[]) {
  // Clear expired trends first
  await supabase.rpc('cleanup_expired_trends');
  
  // Insert new trends
  const { error } = await supabase
    .from('trending_styles')
    .upsert(trends.map(trend => ({
      ...trend,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })), {
      onConflict: 'style_name,category,source'
    });
    
  if (error) throw error;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const jobId = await logJobStart('fetch_trends');
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      console.log(`Fetching trends (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // Fetch trends from multiple sources
      const [googleTrends, socialTrends] = await Promise.all([
        fetchGoogleTrends(),
        fetchSocialMediaTrends()
      ]);
      
      const allTrends = [...googleTrends, ...socialTrends];
      console.log(`Fetched ${allTrends.length} trends`);
      
      // Save to database
      await saveTrendsToDatabase(allTrends);
      
      await logJobComplete(jobId, true, undefined, { 
        trends_count: allTrends.length,
        sources: ['google_trends', 'instagram', 'tiktok', 'pinterest'],
        retry_count: retryCount
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        trends_count: allTrends.length,
        retry_count: retryCount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount > maxRetries) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await logJobComplete(jobId, false, errorMessage, { retry_count: retryCount - 1 });
        return new Response(JSON.stringify({ 
          error: 'Failed after maximum retries',
          details: errorMessage,
          retry_count: retryCount - 1
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  // This should never be reached, but return error for TypeScript
  return new Response(JSON.stringify({ error: 'Unexpected error' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});