import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Portfolios() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portfolios</h1>
          <Button size="icon" variant="ghost" className="text-primary">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plus className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Portfolios Yet</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Create your first portfolio to track your cryptocurrency holdings and performance
        </p>
        <Button className="gap-2" data-testid="button-create-portfolio">
          <Plus className="h-4 w-4" />
          Create Portfolio
        </Button>
      </div>
    </div>
  );
}
