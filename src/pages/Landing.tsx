import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Sparkles, Users, Star, ChevronRight, Zap, Heart, Smile } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Hairstyle Magic",
      description: "Try countless hairstyles with advanced AI - short, long, trendy, or classic looks"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Makeup & Beauty",
      description: "Experiment with different makeup styles and intensities to find your perfect look"
    },
    {
      icon: <Smile className="h-6 w-6" />,
      title: "Facial Features",
      description: "Subtle facial slimming, contouring, and facial hair simulation with adjustable styles"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description: "Real-time AI processing delivers stunning transformations in seconds"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion Blogger",
      content: "LOOKMAGIC helped me find the perfect hairstyle before my wedding. The AI is incredibly realistic!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Content Creator",
      content: "As someone who experiments with looks for social media, this app is a game-changer.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Makeup Artist",
      content: "I use LOOKMAGIC to show clients different makeup options. They love seeing the previews!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgb3BhY2l0eT0iMC4xIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPgo8L2c+Cjwvc3ZnPgo=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Transform Your Style with
              <span className="block bg-gradient-accent bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experiment with hairstyles, makeup, and facial features before making real changes. 
              See yourself in a whole new light with our advanced AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow text-lg px-8 py-6 h-auto group"
                asChild
              >
                <Link to="/auth/signup">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Transforming
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                asChild
              >
                <Link to="/camera">
                  Try Quick Demo
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">100K+ Transformations</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful AI Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover endless possibilities with our cutting-edge AI transformation technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See the Magic in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              Watch your style transform in real-time
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 shadow-glow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Before & After Magic
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    Upload your photo and watch as our AI instantly applies realistic 
                    transformations. Swipe between before and after to see the dramatic difference.
                  </p>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Instant face detection
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      High-quality results
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Save & share easily
                    </li>
                  </ul>
                </div>
                
                <div className="relative">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="bg-white/20 rounded-lg h-48 flex items-center justify-center">
                      <Camera className="h-16 w-16 text-white/60" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-white/80 text-sm">
                        App Preview Coming Soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-background-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Style Enthusiasts
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users are saying about their transformations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Look?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users who have discovered their perfect style with LOOKMAGIC
            </p>
            
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow text-lg px-8 py-6 h-auto group"
              asChild
            >
              <Link to="/auth/signup">
                Get Started Free
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;