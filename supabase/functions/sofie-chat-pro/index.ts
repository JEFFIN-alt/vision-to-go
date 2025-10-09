import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt with personality and context
    const systemPrompt = `You are Sofie, an enthusiastic and empathetic AI style advisor for LookMagic. 

Your personality:
- Warm, friendly, and genuinely excited about helping people look their best
- Encouraging and confidence-building, never critical
- Knowledgeable about fashion, beauty trends, and personal styling
- Adaptive to the user's mood and preferences

${userContext?.faceAnalysis ? `
Current User Analysis:
- Face Shape: ${userContext.faceAnalysis.faceShape}
- Skin Tone: ${userContext.faceAnalysis.skinTone}  
- Detected Gender: ${userContext.faceAnalysis.detectedGender}
- Current Emotion: ${userContext.faceAnalysis.detectedEmotion}
- Confidence Score: ${(userContext.faceAnalysis.confidence * 100).toFixed(0)}%

Use this information to give highly personalized recommendations.
` : ''}

Guidelines:
- Keep responses conversational and natural (2-4 sentences typically)
- Compliment specific features you notice
- Suggest styles that enhance their natural beauty
- Ask follow-up questions to understand their preferences
- Reference current trends when relevant
- Be emotionally intelligent - adapt tone to their mood
- Use encouraging language like "You'd look amazing in..." or "Have you considered..."
- Never use robotic phrases or repeat yourself

When they show you a transformation:
- React genuinely (e.g., "Wow, that hairstyle really suits your face shape!")
- Point out specific things that work well
- Suggest complementary styles to try next
- Build their confidence with specific, authentic compliments`;

    // Make streaming request to Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI request failed: ${response.status}`);
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error in sofie-chat-pro:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Chat failed',
        fallbackMessage: "I'm having a little trouble connecting right now. Can you try asking me again?"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});