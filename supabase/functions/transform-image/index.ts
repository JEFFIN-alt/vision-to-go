import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imagePath, category, style, intensity = 1.0 } = await req.json()

    if (!imagePath || !category || !style) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the image from storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('transformations')
      .download(imagePath)

    if (downloadError) {
      throw new Error('Failed to download image: ' + downloadError.message)
    }

    // Convert image to base64 for AI processing
    const imageBuffer = await imageData.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

    // Create transformation prompt based on category and style
    const prompts = {
      hairstyles: {
        'Short & Trendy': 'Transform this person with a modern pixie cut hairstyle, keeping facial features identical',
        'Long & Wavy': 'Transform this person with long flowing beach waves hairstyle, keeping facial features identical',
        'Classic Bob': 'Transform this person with a classic shoulder-length bob hairstyle, keeping facial features identical',
        'Curly Style': 'Transform this person with natural spiral curls hairstyle, keeping facial features identical',
      },
      makeup: {
        'Natural Glow': 'Apply subtle natural makeup enhancement to this person, keeping facial features identical',
        'Glamorous': 'Apply bold evening glamorous makeup to this person, keeping facial features identical',
        'Smokey Eyes': 'Apply dramatic smokey eye makeup to this person, keeping facial features identical',
        'Fresh & Clean': 'Apply minimal fresh natural makeup to this person, keeping facial features identical',
      },
      facial: {
        'Full Beard': 'Add a classic full beard to this person, keeping all other facial features identical',
        'Goatee': 'Add a stylish goatee to this person, keeping all other facial features identical',
        'Mustache': 'Add a classic mustache to this person, keeping all other facial features identical',
        'Stubble': 'Add 5 o\'clock shadow stubble to this person, keeping all other facial features identical',
      }
    }

    const categoryPrompts = prompts[category as keyof typeof prompts];
    const prompt = (categoryPrompts && typeof categoryPrompts === 'object' && style in categoryPrompts) 
      ? (categoryPrompts as Record<string, string>)[style]
      : `Transform this person with ${style} style, keeping facial features identical`

    // Check if we have OpenAI API key configured
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      // For demo purposes, return a simulated response
      console.log('OpenAI API key not configured, returning demo response')
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return new Response(
        JSON.stringify({ 
          transformedImageUrl: `data:image/jpeg;base64,${base64Image}`,
          message: 'Demo mode: Original image returned. Configure OpenAI API key for real transformations.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI image generation API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const aiResponse = await response.json()
    const transformedImageB64 = aiResponse.data[0].b64_json
    const transformedImageUrl = `data:image/png;base64,${transformedImageB64}`

    // Save transformed image to storage
    const transformedFileName = `transformed_${Date.now()}.png`
    const transformedImageBuffer = Uint8Array.from(atob(transformedImageB64), c => c.charCodeAt(0))
    
    const { error: uploadError } = await supabase.storage
      .from('transformations')
      .upload(transformedFileName, transformedImageBuffer, {
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('Failed to save transformed image:', uploadError)
      // Still return the image URL even if storage fails
    }

    return new Response(
      JSON.stringify({ 
        transformedImageUrl,
        savedPath: transformedFileName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Transform image error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Transformation failed', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})