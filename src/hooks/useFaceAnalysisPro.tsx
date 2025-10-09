import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FaceAnalysisResult {
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

export const useFaceAnalysisPro = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FaceAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { user } = useAuth();

  const analyzeFace = async (imageData: string): Promise<FaceAnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log('Starting face analysis...');

      const { data, error } = await supabase.functions.invoke('face-analysis-enhanced', {
        body: {
          imageData,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Face analysis failed');
      }

      if (!data) {
        throw new Error('No analysis data received');
      }

      console.log('Analysis complete:', data);
      setAnalysis(data);
      
      // Save to face_reports table
      if (user) {
        const { error: saveError } = await supabase
          .from('face_reports')
          .insert({
            user_id: user.id,
            face_shape: data.faceShape,
            skin_tone: data.skinTone,
            analysis_data: data,
            confidence_score: data.confidence
          });

        if (saveError) {
          console.error('Error saving analysis:', saveError);
        }
      }

      return data;

    } catch (error: any) {
      console.error('Face analysis error:', error);
      const errorMessage = error.message || 'Failed to analyze face. Please try with a clearer photo.';
      setAnalysisError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setAnalysisError(null);
  };

  return {
    analyzeFace,
    isAnalyzing,
    analysis,
    analysisError,
    clearAnalysis
  };
};