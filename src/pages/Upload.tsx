import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, ArrowLeft, Image, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = () => {
    if (selectedFile) {
      // TODO: Store the selected image and navigate to transform page
      navigate("/transform");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-border">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Upload Photo</h1>
        <div className="w-10" />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {!preview ? (
          <Card 
            className={`cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardHeader className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UploadIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Upload Your Photo</CardTitle>
              <CardDescription>
                Drag and drop your image here, or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, and other image formats
              </p>
              <Button>
                <Image className="mr-2 h-4 w-4" />
                Choose from Gallery
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected Photo</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Selected" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    File: {selectedFile?.name}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={clearSelection}>
                      Choose Different Photo
                    </Button>
                    <Button onClick={handleContinue}>
                      Continue to Transform
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;