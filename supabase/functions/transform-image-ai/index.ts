import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, category, style, userId } = await req.json();
    console.log('Transform request:', { category, style, userId });

    if (!imageData || !category || !style) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the Lovable AI API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create transformation prompt based on category and style
    const prompts: Record<string, Record<string, string>> = {
      'hairstyle': {
        'Short Hair': 'Transform this person to have a stylish short hairstyle, keeping facial features identical',
        'Long Hair': 'Transform this person to have long flowing hair, keeping facial features identical',
        'Curly Hair': 'Transform this person to have beautiful curly hair, keeping facial features identical',
        'Braids': 'Transform this person to have elegant braids, keeping facial features identical'
      },
      'makeup': {
        'Natural': 'Apply natural, subtle makeup to enhance this person\'s features',
        'Glamorous': 'Apply glamorous, elegant makeup with defined eyes and lips',
        'Bold': 'Apply bold, artistic makeup with vibrant colors',
        'Evening': 'Apply sophisticated evening makeup look'
      },
      'facial-hair': {
        'Clean Shaven': 'Remove all facial hair while keeping other features identical',
        'Beard': 'Add a well-groomed full beard',
        'Goatee': 'Add a stylish goatee',
        'Mustache': 'Add a distinguished mustache'
      }
    };

    const prompt = prompts[category]?.[style] || `Apply ${style} transformation to this person`;
    
    console.log('Using prompt:', prompt);

    // Call Lovable AI image generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI transformation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the generated image
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No transformed image received from AI');
    }

    // Convert base64 to blob for storage
    const base64Data = generatedImageUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const fileName = `${userId}/transform_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('transformations')
      .upload(fileName, bytes.buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to save transformed image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('transformations')
      .getPublicUrl(fileName);

    console.log('Transformation complete:', publicUrl);

    return new Response(
      JSON.stringify({ 
        transformedImageUrl: publicUrl,
        originalPrompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transform-image-ai:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Transformation failed',
        details: 'Please try again or contact support if the issue persists'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});