import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, RotateCcw, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Camera = () => {
  const handleCapturePhoto = () => {
    // TODO: Implement camera functionality
    console.log("Capturing photo...");
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
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-center">
            <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Camera Preview</p>
            <p className="text-sm opacity-75">Camera functionality coming soon</p>
          </div>
        </div>

        {/* Face Detection Overlay Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-80 border-2 border-white/50 rounded-full flex items-end justify-center pb-8">
            <div className="text-white/70 text-sm">Position your face here</div>
          </div>
        </div>
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
            onClick={() => console.log("Flip camera")}
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
    </div>
  );
};

export default Camera;