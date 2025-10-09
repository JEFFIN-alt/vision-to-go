import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePhoto } from '@/contexts/PhotoContext';
import { useAuth } from '@/contexts/AuthContext';

interface TransformationOptions {
  category: 'hairstyle' | 'makeup' | 'facial-hair';
  style: string;
  intensity?: number;
}

export const useAITransformationPro = () => {
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentPhoto, setTransformedPhoto, setIsProcessing, setProcessingProgress, setError } = usePhoto();
  const { user } = useAuth();

  const transformPhoto = async (options: TransformationOptions): Promise<string | null> => {
    if (!currentPhoto) {
      setError('No photo to transform');
      return null;
    }

    if (!user) {
      setError('Please sign in to use transformations');
      return null;
    }

    setIsTransforming(true);
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      console.log('Starting transformation:', options);
      setProcessingProgress(10);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 15;
          setProcessingProgress(next);
          return next >= 90 ? 90 : next;
        });
      }, 800);

      // Call the AI transformation function
      const { data, error } = await supabase.functions.invoke('transform-image-ai', {
        body: {
          imageData: currentPhoto,
          category: options.category,
          style: options.style,
          userId: user.id
        }
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Transformation error:', error);
        throw new Error(error.message || 'Transformation failed');
      }

      if (!data?.transformedImageUrl) {
        throw new Error('No transformed image received');
      }

      console.log('Transformation successful:', data.transformedImageUrl);
      
      // Save to transformations table
      const { error: saveError } = await supabase
        .from('transformations')
        .insert({
          user_id: user.id,
          original_image_url: currentPhoto,
          transformed_image_url: data.transformedImageUrl,
          transformation_type: options.category,
          style_name: options.style,
          settings: {
            intensity: options.intensity,
            prompt: data.originalPrompt
          }
        });

      if (saveError) {
        console.error('Error saving transformation:', saveError);
        // Don't fail the whole operation if save fails
      }

      setProcessingProgress(100);
      setTransformedPhoto(data.transformedImageUrl);
      
      return data.transformedImageUrl;

    } catch (error: any) {
      console.error('Transform error:', error);
      const errorMessage = error.message || 'Failed to transform photo. Please try again.';
      setError(errorMessage);
      setProcessingProgress(0);
      return null;
    } finally {
      setIsTransforming(false);
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  return {
    transformPhoto,
    isTransforming,
    progress
  };
};