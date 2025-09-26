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
    const { message, userName, conversationHistory = [], streamResponse = true } = await req.json();

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      const fallbackResponse = "Hi there! 💄✨ I'm Sofie, your AI style assistant! I'm here to help you explore amazing transformations with LOOKMAGIC. Upload a photo to try different hairstyles, makeup looks, or facial hair styles. What would you like to experiment with today?";
      
      if (streamResponse) {
        // Return streaming fallback
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const chunks = fallbackResponse.split(' ');
            let index = 0;
            
            const sendChunk = () => {
              if (index < chunks.length) {
                const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: chunk, done: false })}\n\n`));
                index++;
                setTimeout(sendChunk, 50); // 50ms delay between words
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: '', done: true })}\n\n`));
                controller.close();
              }
            };
            
            sendChunk();
          }
        });
        
        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      } else {
        return new Response(JSON.stringify({ response: fallbackResponse }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const systemPrompt = `You are Sofie, the AI style assistant for LOOKMAGIC - a revolutionary beauty transformation app that uses AI to help users visualize style changes before making them.

Your personality:
- Warm, encouraging, and authentically enthusiastic about beauty and style
- Expert knowledge in hairstyles, makeup, fashion, and current trends
- Confidence-boosting and supportive, making users feel beautiful
- Uses emojis thoughtfully (1-2 per response)
- Gives specific, actionable advice tailored to individual needs
- Remembers context from the conversation
- Professional yet friendly, like talking to a knowledgeable beauty consultant friend

Your LOOKMAGIC expertise:
- Hairstyle transformations: short to long, color changes, trendy cuts (bob, pixie, waves, curly, straight)
- Makeup applications: natural, glamorous, smokey, bold, vintage looks
- Facial hair simulations: beard, mustache, goatee, stubble styles
- Face shape analysis and personalized recommendations
- Color theory for hair, makeup, and skin tone matching
- Current beauty trends and seasonal styles
- Style psychology and confidence building

LOOKMAGIC features you can reference:
- AI photo transformations with multiple style categories
- Before/after comparisons with swipe functionality
- Style history and favorites saving
- Social sharing capabilities
- Face analysis for personalized recommendations
- Trending styles updated regularly
- Premium transformations with high-resolution outputs

Guidelines:
- Keep responses under 150 words for better mobile readability
- Ask follow-up questions to provide personalized advice
- Reference LOOKMAGIC features when relevant
- Encourage experimentation with the app's transformations
- Be specific about face shapes, skin tones, and style preferences
- Always end with actionable next steps or questions
- Stay focused on beauty, style, and transformation topics
- If asked about non-beauty topics, gently redirect to style-related discussions`;

    // Build conversation messages with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: any) => ({
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

    console.log(`Processing ${streamResponse ? 'streaming' : 'regular'} request for user: ${userName}, message length: ${message.length}`);

    const requestBody = {
      model: 'gpt-4.1-2025-04-14',
      messages: messages,
      max_completion_tokens: 250,
      stream: streamResponse,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    if (streamResponse) {
      // Handle streaming response
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n').filter(line => line.trim());

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: '', done: true })}\n\n`));
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: content, done: false })}\n\n`));
                    }
                  } catch (parseError) {
                    console.warn('Failed to parse streaming chunk:', parseError);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // Handle regular response
      const data = await response.json();
      const generatedResponse = data.choices[0].message.content;

      return new Response(JSON.stringify({ response: generatedResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in sofie-chat-streaming function:', error);
    
    const fallbackResponses = [
      `Hi there! 💄 I'm excited to help you explore new looks with LOOKMAGIC! Try uploading a photo to see how different hairstyles would look on you - from sleek bobs to flowing waves. What style transformation are you curious about?`,
      `Hey there! ✨ LOOKMAGIC's AI can show you countless possibilities! Upload your photo and experiment with: bold hair colors, trendy cuts, or even facial hair styles. Which transformation catches your eye first?`,
      `Hello gorgeous! 🌟 Ready to discover your next favorite look? LOOKMAGIC's transformations let you try everything risk-free - from subtle makeup changes to dramatic hair makeovers. What would you like to experiment with today?`,
      `Hi friend! Ready for some style magic? 💫 With LOOKMAGIC, you can preview any look before committing. Try different hair lengths, colors, or makeup styles. What's one style you've always wondered about?`
    ];
    
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return new Response(JSON.stringify({ 
      response: randomFallback,
      error: 'Temporary service issue - using fallback response'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});