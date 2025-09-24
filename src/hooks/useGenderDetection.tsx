import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

interface GenderDetectionResult {
  detectedGender: Gender | null;
  confidence: number;
  needsConfirmation: boolean;
}

export const useGenderDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const detectGender = async (imageData: string): Promise<GenderDetectionResult> => {
    setIsDetecting(true);
    setDetectionError(null);

    try {
      const { data, error } = await supabase.functions.invoke('detect-gender', {
        body: {
          imageData: imageData,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Mock detection for now - in production this would use actual AI
      // The edge function will implement real gender detection
      const result: GenderDetectionResult = {
        detectedGender: data?.detectedGender || null,
        confidence: data?.confidence || 0.5,
        needsConfirmation: (data?.confidence || 0.5) < 0.8, // Ask for confirmation if confidence < 80%
      };

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to detect gender';
      setDetectionError(errorMessage);
      
      // Return fallback result on error
      return {
        detectedGender: null,
        confidence: 0,
        needsConfirmation: true,
      };
    } finally {
      setIsDetecting(false);
    }
  };

  const saveGenderPreference = async (userId: string, gender: Gender) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: userId, 
          gender: gender 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving gender preference:', error);
      throw error;
    }
  };

  return {
    detectGender,
    saveGenderPreference,
    isDetecting,
    detectionError,
  };
};