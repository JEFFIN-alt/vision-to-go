import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PhotoContextType {
  currentPhoto: string | null;
  setCurrentPhoto: (photo: string | null) => void;
  transformedPhoto: string | null;
  setTransformedPhoto: (photo: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearPhotos: () => void;
  logError: (error: string, context?: any) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const usePhoto = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhoto must be used within a PhotoProvider');
  }
  return context;
};

interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [transformedPhoto, setTransformedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearPhotos = () => {
    setCurrentPhoto(null);
    setTransformedPhoto(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setError(null);
  };

  const logError = (errorMessage: string, context?: any) => {
    console.error('[LOOKMAGIC Error]:', errorMessage, context);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Could integrate with Sentry, LogRocket, etc.
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: errorMessage,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(console.error);
      } catch (err) {
        console.error('Failed to log error to service:', err);
      }
    }
    
    setError(errorMessage);
  };

  const value: PhotoContextType = {
    currentPhoto,
    setCurrentPhoto,
    transformedPhoto,
    setTransformedPhoto,
    isProcessing,
    setIsProcessing,
    processingProgress,
    setProcessingProgress,
    error,
    setError,
    clearPhotos,
    logError,
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
};