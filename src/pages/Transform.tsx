import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, User, Paintbrush, Scissors } from "lucide-react";
import { Link } from "react-router-dom";

const Transform = () => {
  const [selectedCategory, setSelectedCategory] = useState("hairstyles");

  const categories = [
    {
      id: "hairstyles",
      label: "Hairstyles",
      icon: <Scissors className="h-5 w-5" />,
      styles: [
        { name: "Short & Trendy", preview: "Modern pixie cut" },
        { name: "Long & Wavy", preview: "Flowing beach waves" },
        { name: "Classic Bob", preview: "Timeless shoulder-length" },
        { name: "Curly Style", preview: "Natural spiral curls" },
      ]
    },
    {
      id: "makeup",
      label: "Makeup",
      icon: <Paintbrush className="h-5 w-5" />,
      styles: [
        { name: "Natural Glow", preview: "Subtle enhancement" },
        { name: "Glamorous", preview: "Bold evening look" },
        { name: "Smokey Eyes", preview: "Dramatic eye makeup" },
        { name: "Fresh & Clean", preview: "Minimal natural look" },
      ]
    },
    {
      id: "facial",
      label: "Facial Hair",
      icon: <User className="h-5 w-5" />,
      styles: [
        { name: "Full Beard", preview: "Classic full coverage" },
        { name: "Goatee", preview: "Stylish chin hair" },
        { name: "Mustache", preview: "Classic upper lip" },
        { name: "Stubble", preview: "5 o'clock shadow" },
      ]
    }
  ];

  const handleApplyTransformation = (categoryId: string, styleName: string) => {
    // TODO: Implement AI transformation
    console.log(`Applying ${styleName} from ${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-border">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/camera">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Transform Style</h1>
        <div className="w-10" />
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Photo Preview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>Your Photo Preview</p>
                <p className="text-sm">Photo processing coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transformation Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.styles.map((style, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{style.name}</CardTitle>
                          <CardDescription className="text-sm">{style.preview}</CardDescription>
                        </div>
                        <div className="bg-gradient-primary w-10 h-10 rounded-full flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-gray-50 rounded-md h-24 flex items-center justify-center mb-3">
                        <p className="text-xs text-muted-foreground">Style Preview</p>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleApplyTransformation(category.id, style.name)}
                      >
                        Apply Style
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Premium Banner */}
        <Card className="mt-8 bg-gradient-primary text-white">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-accent" />
            <h3 className="text-lg font-semibold mb-2">Unlock Premium Styles</h3>
            <p className="text-white/90 text-sm mb-4">
              Access exclusive transformations and high-resolution downloads
            </p>
            <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transform;