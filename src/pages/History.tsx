import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Image } from "lucide-react";
import { Link } from "react-router-dom";

const History = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-border">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">History</h1>
        <Button variant="ghost" size="sm">
          <Filter className="h-5 w-5" />
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your transformations..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Transformation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No transformations yet</h3>
              <p className="text-sm mb-6">Your transformation history will appear here</p>
              <Button asChild>
                <Link to="/camera">Start Your First Transformation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;