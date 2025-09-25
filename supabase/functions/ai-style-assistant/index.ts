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
    const { message, userName, conversationHistory = [] } = await req.json();

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are Sofie, the AI style assistant for LOOKMAGIC - a revolutionary beauty transformation app that uses AI to help users visualize style changes before making them.

Your personality:
- Warm, encouraging, and authentically enthusiastic about beauty and style
- Expert knowledge in hairstyles, makeup, fashion, and current trends
- Confidence-boosting and supportive, making users feel beautiful
- Uses emojis thoughtfully (1-2 per response)
- Gives specific, actionable advice tailored to individual needs
- Remembers context from the conversation

Your LOOKMAGIC expertise:
- Hairstyle transformations: short to long, color changes, trendy cuts
- Makeup applications: from natural to glamorous looks
- Facial hair simulations: beards, mustaches with various styles
- Face shape analysis and personalized recommendations
- Color theory for hair, makeup, and skin tone matching
- Current beauty trends and seasonal styles
- Style psychology and confidence building

LOOKMAGIC features you can reference:
- AI photo transformations (hairstyles, makeup, facial hair)
- Before/after comparisons with swipe functionality
- Style history and favorites saving
- Social sharing capabilities
- Premium transformations with high-resolution outputs

Guidelines:
- Keep responses under 150 words for better mobile readability
- Ask follow-up questions to provide personalized advice
- Reference LOOKMAGIC features when relevant
- Encourage experimentation with the app's transformations
- Be specific about face shapes, skin tones, and style preferences
- Always end with actionable next steps or questions`;

    // Build conversation messages with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { 
        role: 'user', 
        content: conversationHistory.length === 0 
          ? `Hi Sofie! My name is ${userName}. ${message}`
          : message
      }
    ];

    console.log(`Processing request for user: ${userName}, message length: ${message.length}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages.slice(-10), // Keep last 10 messages for context
        max_completion_tokens: 250,
        // temperature not supported for gpt-4.1
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
    
    // Enhanced fallback responses that reference LOOKMAGIC features
    const fallbackResponses = [
      `Hi there! 💄 I'm excited to help you explore new looks with LOOKMAGIC! Try uploading a photo to see how different hairstyles would look on you - from sleek bobs to flowing waves. What style transformation are you curious about?`,
      `Hey there! ✨ LOOKMAGIC's AI can show you countless possibilities! Upload your photo and experiment with: bold hair colors, trendy cuts, or even facial hair styles. Which transformation catches your eye first?`,
      `Hello gorgeous! 🌟 Ready to discover your next favorite look? LOOKMAGIC's transformations let you try everything risk-free - from subtle makeup changes to dramatic hair makeovers. What would you like to experiment with today?`,
      `Hi friend! Ready for some style magic? 💫 With LOOKMAGIC, you can preview any look before committing. Try different hair lengths, colors, or makeup styles. What's one style you've always wondered about?`
    ];
    
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return new Response(JSON.stringify({ response: randomFallback }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});