import { useState } from 'react';
import { usePhoto } from '@/contexts/PhotoContext';
import { supabase } from '@/integrations/supabase/client';

export interface TransformationOptions {
  category: 'hairstyles' | 'makeup' | 'facial';
  style: string;
  intensity?: number;
}

export const useAITransformation = () => {
  const { 
    currentPhoto, 
    setTransformedPhoto, 
    setIsProcessing, 
    setProcessingProgress,
    logError 
  } = usePhoto();
  const [isTransforming, setIsTransforming] = useState(false);

  const transformPhoto = async (options: TransformationOptions): Promise<string | null> => {
    if (!currentPhoto) {
      logError('No photo available for transformation');
      return null;
    }

    setIsTransforming(true);
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Convert base64 to blob if needed
      const imageBlob = await dataURLToBlob(currentPhoto);
      
      // Upload image to Supabase storage
      const fileName = `transform_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('transformations')
        .upload(fileName, imageBlob);

      if (uploadError) {
        throw new Error('Failed to upload image: ' + uploadError.message);
      }

      setProcessingProgress(25);

      // Call AI transformation edge function
      const { data, error } = await supabase.functions.invoke('transform-image', {
        body: {
          imagePath: uploadData.path,
          category: options.category,
          style: options.style,
          intensity: options.intensity || 1.0,
        }
      });

      if (error) {
        throw new Error('AI transformation failed: ' + error.message);
      }

      setProcessingProgress(75);

      // Get the transformed image URL
      if (data?.transformedImageUrl) {
        setTransformedPhoto(data.transformedImageUrl);
        setProcessingProgress(100);
        
        // Clean up progress after a delay
        setTimeout(() => {
          setProcessingProgress(0);
          setIsProcessing(false);
        }, 500);
        
        return data.transformedImageUrl;
      } else {
        throw new Error('No transformed image returned from AI service');
      }

    } catch (error: any) {
      logError('Photo transformation failed', { 
        error: error.message, 
        options,
        hasPhoto: !!currentPhoto 
      });
      setIsProcessing(false);
      setProcessingProgress(0);
      return null;
    } finally {
      setIsTransforming(false);
    }
  };

  return {
    transformPhoto,
    isTransforming,
  };
};

// Helper function to convert data URL to blob
const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const response = await fetch(dataURL);
  return response.blob();
};