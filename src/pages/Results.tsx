import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, RefreshCw, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { usePhoto } from "@/contexts/PhotoContext";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const [showComparison, setShowComparison] = useState(false);
  const { currentPhoto, transformedPhoto, clearPhotos } = usePhoto();
  const { toast } = useToast();

  const handleShare = async () => {
    if (!transformedPhoto) return;

    try {
      if (navigator.share) {
        // Use native sharing if available
        const response = await fetch(transformedPhoto);
        const blob = await response.blob();
        const file = new File([blob], 'lookmagic-transformation.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'My LOOKMAGIC Transformation',
          text: 'Check out my new look created with LOOKMAGIC!',
          files: [file]
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(transformedPhoto);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share transformation.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!transformedPhoto) return;

    const link = document.createElement('a');
    link.href = transformedPhoto;
    link.download = `lookmagic-transformation-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started!",
      description: "Your transformation is being downloaded.",
    });
  };

  const handleNewTransformation = () => {
    clearPhotos();
  };

  if (!transformedPhoto) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No transformation available</p>
            <Button asChild>
              <Link to="/camera">Take New Photo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/transform">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Your Transformation</h1>
        <Button variant="ghost" size="sm" onClick={handleNewTransformation} asChild>
          <Link to="/camera">
            <RefreshCw className="h-5 w-5" />
          </Link>
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Before/After Toggle */}
        <div className="mb-4">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={!showComparison ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setShowComparison(false)}
            >
              New Look
            </Button>
            <Button
              variant={showComparison ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setShowComparison(true)}
            >
              Before/After
            </Button>
          </div>
        </div>

        {/* Image Display */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="relative">
              {!showComparison ? (
                // Show only transformed image
                <img
                  src={transformedPhoto}
                  alt="Transformed look"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                // Show before/after comparison
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">Before</p>
                    <img
                      src={currentPhoto || ''}
                      alt="Original"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">After</p>
                    <img
                      src={transformedPhoto}
                      alt="Transformed"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full" variant="outline">
            <Link to="/transform">Try Another Style</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link to="/camera">Take New Photo</Link>
          </Button>
        </div>

        {/* Premium Upgrade Banner */}
        <Card className="mt-8 bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-3 text-accent" />
            <h3 className="text-lg font-semibold mb-2">Love Your Look?</h3>
            <p className="text-primary-foreground/90 text-sm mb-4">
              Unlock unlimited transformations and HD downloads
            </p>
            <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;