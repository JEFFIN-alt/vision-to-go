import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, RotateCcw, Upload, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCamera } from "@/hooks/useCamera";
import { useToast } from "@/hooks/use-toast";
import { usePhoto } from "@/contexts/PhotoContext";
import { useGenderDetection } from "@/hooks/useGenderDetection";
import { useAuth } from "@/contexts/AuthContext";
import GenderConfirmationDialog from "@/components/GenderConfirmationDialog";

const Camera = () => {
  const { 
    videoRef, 
    canvasRef, 
    isStreaming, 
    error, 
    startCamera, 
    stopCamera, 
    capturePhoto, 
    switchCamera 
  } = useCamera();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentPhoto, logError } = usePhoto();
  const { detectGender, saveGenderPreference, isDetecting } = useGenderDetection();
  const [showGenderDialog, setShowGenderDialog] = useState(false);
  const [genderDetectionResult, setGenderDetectionResult] = useState<any>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapturePhoto = async () => {
    try {
      const photoData = capturePhoto();
      if (photoData) {
        setCurrentPhoto(photoData);
        
        toast({
          title: "Photo captured!",
          description: "Analyzing your photo for the best style recommendations...",
        });

        // Detect gender for personalized recommendations
        try {
          const genderResult = await detectGender(photoData);
          setGenderDetectionResult(genderResult);
          
          if (genderResult.needsConfirmation && user) {
            setShowGenderDialog(true);
          } else {
            // Save detected gender if confident enough
            if (genderResult.detectedGender && genderResult.confidence > 0.8 && user) {
              await saveGenderPreference(user.id, genderResult.detectedGender);
            }
            navigate("/transform");
          }
        } catch (error) {
          // Continue without gender detection if it fails
          console.warn('Gender detection failed:', error);
          navigate("/transform");
        }
      } else {
        throw new Error("Failed to capture photo data");
      }
    } catch (error: any) {
      logError('Camera capture failed', { error: error.message });
      toast({
        title: "Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenderConfirm = async (gender: any) => {
    if (user) {
      try {
        await saveGenderPreference(user.id, gender);
        toast({
          title: "Preferences saved!",
          description: "We'll show you personalized style recommendations.",
        });
      } catch (error) {
        console.error('Error saving gender preference:', error);
      }
    }
    setShowGenderDialog(false);
    navigate("/transform");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/50 text-white relative z-10">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Take Photo</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6">
            <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Camera Error</p>
            <p className="text-sm opacity-75 mb-4">{error}</p>
            <Button variant="outline" onClick={startCamera} className="text-black">
              Retry Camera Access
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Face Detection Overlay Guide */}
            {isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-2 border-white/50 rounded-full flex items-end justify-center pb-8">
                  <div className="text-white/70 text-sm bg-black/50 px-3 py-1 rounded">
                    Position your face here
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 p-6">
        <div className="flex items-center justify-center gap-8">
          {/* Gallery Button */}
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-white hover:bg-white/20 w-16 h-16 rounded-full"
            asChild
          >
            <Link to="/upload">
              <Upload className="h-6 w-6" />
            </Link>
          </Button>

          {/* Capture Button */}
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-white text-black hover:bg-white/90"
            onClick={handleCapturePhoto}
          >
            <CameraIcon className="h-8 w-8" />
          </Button>

          {/* Flip Camera Button */}
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-white hover:bg-white/20 w-16 h-16 rounded-full"
            onClick={switchCamera}
            disabled={!isStreaming}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-white/70 text-sm">
            Tap the capture button or upload from gallery
          </p>
        </div>
      </div>

      {/* Gender Confirmation Dialog */}
      <GenderConfirmationDialog
        isOpen={showGenderDialog}
        detectedGender={genderDetectionResult?.detectedGender}
        confidence={genderDetectionResult?.confidence || 0}
        onConfirm={handleGenderConfirm}
        onCancel={() => {
          setShowGenderDialog(false);
          navigate("/transform");
        }}
      />
    </div>
  );
};

export default Camera;