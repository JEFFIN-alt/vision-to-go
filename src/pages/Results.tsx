import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Download, Heart, RotateCcw, Sparkles } from "lucide-react";
import { usePhoto } from "@/contexts/PhotoContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Results = () => {
  const { currentPhoto, transformedPhoto, clearPhotos } = usePhoto();
  const [showBefore, setShowBefore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!currentPhoto || !transformedPhoto) {
      navigate("/camera");
    }
  }, [currentPhoto, transformedPhoto, navigate]);

  const handleShare = async () => {
    if (!transformedPhoto) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My LOOKMAGIC Transformation",
          text: "Check out my amazing style transformation with LOOKMAGIC!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share transformation",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user || !currentPhoto || !transformedPhoto) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("transformations").insert({
        user_id: user.id,
        original_image_url: currentPhoto,
        transformed_image_url: transformedPhoto,
        transformation_type: "hairstyle", // Default for now
        style_name: "AI Generated Style",
        is_favorite: isFavorited,
        settings: {},
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Transformation saved to your history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transformation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAgain = () => {
    clearPhotos();
    navigate("/camera");
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  if (!currentPhoto || !transformedPhoto) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your Transformation
          </h1>
          <p className="text-muted-foreground">
            Swipe or tap to compare before and after
          </p>
        </div>

        {/* Image Comparison */}
        <Card className="relative overflow-hidden mb-6">
          <div className="aspect-[3/4] relative">
            <img
              src={showBefore ? currentPhoto : transformedPhoto}
              alt={showBefore ? "Before transformation" : "After transformation"}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowBefore(!showBefore)}
            />
            
            {/* Overlay indicator */}
            <div className="absolute top-4 left-4">
              <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                {showBefore ? "Before" : "After"}
              </div>
            </div>

            {/* Tap indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm animate-pulse">
                Tap to compare
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            onClick={toggleFavorite}
            className={isFavorited ? "text-red-500 border-red-500" : ""}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
            {isFavorited ? "Favorited" : "Favorite"}
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Save and Try Again */}
        <div className="space-y-3">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save to History"}
          </Button>
          
          <Button variant="outline" onClick={handleTryAgain} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Another Style
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate("/transform")}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Try Different Transformation
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-6 p-4 bg-muted/50">
          <h3 className="font-medium text-foreground mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Save your favorite looks to easily find them later</li>
            <li>• Share transformations with friends on social media</li>
            <li>• Try different lighting and angles for best results</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Results;