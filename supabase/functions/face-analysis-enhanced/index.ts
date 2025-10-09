import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FaceAnalysisResult {
  faceShape: string;
  skinTone: string;
  detectedGender: string;
  detectedEmotion: string;
  detectedAge: string;
  confidence: number;
  facialFeatures: {
    eyeShape: string;
    noseShape: string;
    lipShape: string;
    facialStructure: string;
  };
  recommendations: {
    hairstyles: string[];
    makeupStyles: string[];
    facialHair: string[];
    accessories: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, userId } = await req.json();
    console.log('Face analysis request for user:', userId);

    if (!imageData) {
      throw new Error('No image data provided');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Lovable AI key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create detailed analysis prompt
    const analysisPrompt = `Analyze this face image in detail and provide a JSON response with the following structure:
{
  "faceShape": "oval|round|square|heart|diamond",
  "skinTone": "fair|light|medium|tan|dark",
  "detectedGender": "male|female|non-binary",
  "detectedEmotion": "happy|neutral|sad|confident|surprised|thoughtful",
  "detectedAge": "child|teen|young adult|adult|senior",
  "confidence": 0.0-1.0,
  "facialFeatures": {
    "eyeShape": "almond|round|hooded|upturned|downturned",
    "noseShape": "straight|button|roman|aquiline",
    "lipShape": "full|thin|heart-shaped|bow-shaped",
    "facialStructure": "angular|soft|defined|delicate"
  },
  "recommendations": {
    "hairstyles": ["style1", "style2", "style3"],
    "makeupStyles": ["style1", "style2", "style3"],
    "facialHair": ["style1", "style2"] (if applicable),
    "accessories": ["accessory1", "accessory2"]
  }
}

Provide specific, actionable recommendations based on the detected features.`;

    // Call Lovable AI for analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`Face analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis result received');
    }

    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid analysis format');
    }

    const analysisResult: FaceAnalysisResult = JSON.parse(jsonMatch[0]);
    console.log('Analysis complete:', analysisResult);

    // Create image hash for caching
    const imageHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(imageData.substring(0, 1000))
    );
    const hashArray = Array.from(new Uint8Array(imageHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store in cache if userId provided
    if (userId) {
      await supabase
        .from('face_analysis_cache')
        .upsert({
          user_id: userId,
          image_hash: hashHex,
          analysis_data: analysisResult,
          confidence_score: analysisResult.confidence,
          detected_gender: analysisResult.detectedGender,
          detected_emotion: analysisResult.detectedEmotion,
          detected_age_range: analysisResult.detectedAge
        }, {
          onConflict: 'user_id,image_hash'
        });
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in face-analysis-enhanced:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed',
        details: 'Unable to analyze face. Please try with a clearer photo.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});