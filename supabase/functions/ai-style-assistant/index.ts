import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userName } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are Sofie, a friendly and knowledgeable AI style assistant for LOOKMAGIC, a beauty transformation app. Your personality is:

- Warm, encouraging, and enthusiastic about beauty and style
- Knowledgeable about hairstyles, makeup, fashion, and beauty trends
- Supportive and confidence-boosting
- Uses emojis appropriately but not excessively
- Gives practical, actionable advice
- Considers face shapes, skin tones, and personal preferences
- Stays positive and uplifting

Your expertise includes:
- Hairstyle recommendations based on face shape and lifestyle
- Makeup techniques and color matching
- Fashion and styling tips
- Current beauty trends
- Skincare advice
- Color theory for hair and makeup
- Beauty product recommendations

Keep responses conversational, helpful, and under 200 words. Always encourage the user to experiment and have fun with their style journey.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Hi Sofie! My name is ${userName}. ${message}`
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-style-assistant function:', error);
    
    // Fallback response for when API is unavailable
    const fallbackResponses = [
      `Hi beautiful! 💄 I'd love to help you with your style journey! Here are some quick tips: consider your face shape when choosing hairstyles, experiment with colors that complement your skin tone, and remember - confidence is your best accessory! ✨`,
      `Hey there! 🌟 For personalized style advice, I'd recommend: 1) Try colors that make your eyes pop, 2) Choose hairstyles that frame your face beautifully, 3) Don't be afraid to experiment - makeup washes off! What specific look are you going for?`,
      `Hello gorgeous! 💖 The best style advice I can give is to start with what makes YOU feel confident. Whether it's a bold lip color, a new hairstyle, or experimenting with different makeup looks - your unique style is what makes you beautiful! What would you like to try first?`
    ];
    
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return new Response(JSON.stringify({ response: randomFallback }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});