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

async function cleanupExpiredTransformations(): Promise<{ deletedFiles: number, deletedRecords: number }> {
  console.log('Starting cleanup of expired transformations...');
  
  // Find expired transformations
  const { data: expiredTransformations, error: selectError } = await supabase
    .from('transformations')
    .select('id, original_image_url, transformed_image_url')
    .lt('expires_at', new Date().toISOString());

  if (selectError) {
    throw new Error(`Failed to fetch expired transformations: ${selectError.message}`);
  }

  if (!expiredTransformations || expiredTransformations.length === 0) {
    console.log('No expired transformations found');
    return { deletedFiles: 0, deletedRecords: 0 };
  }

  console.log(`Found ${expiredTransformations.length} expired transformations`);

  let deletedFiles = 0;
  
  // Delete associated files from storage
  for (const transformation of expiredTransformations) {
    try {
      // Extract file paths from URLs
      if (transformation.original_image_url) {
        const originalPath = transformation.original_image_url.split('/').pop();
        if (originalPath) {
          const { error: deleteError } = await supabase.storage
            .from('transformations')
            .remove([originalPath]);
          if (!deleteError) deletedFiles++;
        }
      }
      
      if (transformation.transformed_image_url) {
        const transformedPath = transformation.transformed_image_url.split('/').pop();
        if (transformedPath) {
          const { error: deleteError } = await supabase.storage
            .from('transformations')
            .remove([transformedPath]);
          if (!deleteError) deletedFiles++;
        }
      }
    } catch (error) {
      console.warn(`Failed to delete files for transformation ${transformation.id}:`, error);
    }
  }

  // Delete database records
  const { error: deleteError } = await supabase
    .from('transformations')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (deleteError) {
    throw new Error(`Failed to delete expired transformation records: ${deleteError.message}`);
  }

  const deletedRecords = expiredTransformations.length;
  console.log(`Cleanup completed: ${deletedRecords} records and ${deletedFiles} files deleted`);
  
  return { deletedFiles, deletedRecords };
}

async function cleanupExpiredTrends(): Promise<number> {
  console.log('Starting cleanup of expired trends...');
  
  const { data: expiredTrends, error: selectError } = await supabase
    .from('trending_styles')
    .select('id')
    .lt('expires_at', new Date().toISOString());

  if (selectError) {
    throw new Error(`Failed to fetch expired trends: ${selectError.message}`);
  }

  if (!expiredTrends || expiredTrends.length === 0) {
    console.log('No expired trends found');
    return 0;
  }

  const { error: deleteError } = await supabase
    .from('trending_styles')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (deleteError) {
    throw new Error(`Failed to delete expired trends: ${deleteError.message}`);
  }

  console.log(`Deleted ${expiredTrends.length} expired trends`);
  return expiredTrends.length;
}

async function processUserDataDeletionRequests(): Promise<number> {
  console.log('Processing user data deletion requests...');
  
  // Find pending deletion requests
  const { data: deletionRequests, error: selectError } = await supabase
    .from('user_data_requests')
    .select('*')
    .eq('request_type', 'delete')
    .eq('status', 'pending');

  if (selectError) {
    throw new Error(`Failed to fetch deletion requests: ${selectError.message}`);
  }

  if (!deletionRequests || deletionRequests.length === 0) {
    console.log('No pending deletion requests found');
    return 0;
  }

  let processedRequests = 0;

  for (const request of deletionRequests) {
    try {
      console.log(`Processing deletion request for user ${request.user_id}`);
      
      // Mark as processing
      await supabase
        .from('user_data_requests')
        .update({ status: 'processing' })
        .eq('id', request.id);

      // Delete user's transformations and associated files
      const { data: userTransformations } = await supabase
        .from('transformations')
        .select('original_image_url, transformed_image_url')
        .eq('user_id', request.user_id);

      if (userTransformations) {
        // Delete files from storage
        const filesToDelete: string[] = [];
        userTransformations.forEach(t => {
          if (t.original_image_url) {
            const path = t.original_image_url.split('/').pop();
            if (path) filesToDelete.push(path);
          }
          if (t.transformed_image_url) {
            const path = t.transformed_image_url.split('/').pop();
            if (path) filesToDelete.push(path);
          }
        });

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from('transformations')
            .remove(filesToDelete);
        }
      }

      // Delete user data from all tables
      await Promise.all([
        supabase.from('transformations').delete().eq('user_id', request.user_id),
        supabase.from('profiles').delete().eq('user_id', request.user_id),
        supabase.from('feedback').delete().eq('user_id', request.user_id),
      ]);

      // Mark request as completed
      await supabase
        .from('user_data_requests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      processedRequests++;
      console.log(`Successfully processed deletion request for user ${request.user_id}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to process deletion request for user ${request.user_id}:`, error);
      
      // Mark request as failed
      await supabase
        .from('user_data_requests')
        .update({ 
          status: 'pending', // Reset to pending for retry
          metadata: { error: errorMessage, last_attempt: new Date().toISOString() }
        })
        .eq('id', request.id);
    }
  }

  console.log(`Processed ${processedRequests} user deletion requests`);
  return processedRequests;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const jobId = await logJobStart('cleanup_expired_data');

  try {
    console.log('Starting comprehensive data cleanup...');
    
    const [transformationResult, expiredTrends, deletionRequests] = await Promise.all([
      cleanupExpiredTransformations(),
      cleanupExpiredTrends(),
      processUserDataDeletionRequests()
    ]);

    const metadata = {
      deleted_transformation_records: transformationResult.deletedRecords,
      deleted_transformation_files: transformationResult.deletedFiles,
      deleted_expired_trends: expiredTrends,
      processed_deletion_requests: deletionRequests,
      cleanup_timestamp: new Date().toISOString()
    };

    await logJobComplete(jobId, true, undefined, metadata);

    console.log('Data cleanup completed successfully:', metadata);

    return new Response(JSON.stringify({
      success: true,
      ...metadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Data cleanup failed:', error);
    
    await logJobComplete(jobId, false, errorMessage);

    return new Response(JSON.stringify({
      error: 'Data cleanup failed',
      details: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});