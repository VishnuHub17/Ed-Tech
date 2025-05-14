
import { Clock, Brain, Heart, Users, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EqReflectionForm } from "./eq-reflection-form";
import { toast } from "@/hooks/use-toast";

export interface EqReflectionItem {
  id?: string;
  type: "empathy" | "social_skills" | "self_regulation" | "self_awareness";
  title: string;
  idealTime: string;
  task: string;
  reason: string;
  completed?: boolean;
}

export interface EqReflection {
  id?: string;
  date: string;
  empathy?: EqReflectionItem;
  social_skills?: EqReflectionItem;
  self_regulation?: EqReflectionItem;
  self_awareness?: EqReflectionItem;
}

const getIcon = (type: string) => {
  switch (type) {
    case "empathy":
      return <Heart className="h-5 w-5 text-momentum-pink" />;
    case "social_skills":
      return <Users className="h-5 w-5 text-blue-500" />;
    case "self_regulation":
      return <Shield className="h-5 w-5 text-purple-500" />;
    case "self_awareness":
      return <Brain className="h-5 w-5 text-green-500" />;
    default:
      return <Heart className="h-5 w-5" />;
  }
};

interface EqReflectionCardProps {
  item: EqReflectionItem;
  onComplete?: (item: EqReflectionItem) => void;
  onUpdate?: (item: EqReflectionItem) => void;
  disabled?: boolean;
}

export function EqReflectionCard({ item, onComplete, onUpdate, disabled = false }: EqReflectionCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        ...item,
        completed: true,
      });
      toast({
        title: "Reflection completed",
        description: "Your daily EQ practice has been marked as completed.",
      });
    }
  };

  const handleUpdate = (updatedItem: EqReflectionItem) => {
    if (onUpdate) {
      onUpdate(updatedItem);
      setIsFormOpen(false);
    }
  };

  return (
    <Card className={`transition-all duration-300 ${item.completed ? "bg-muted/40" : "gradient-border"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon(item.type)}
            <CardTitle className="text-base font-medium">{item.title}</CardTitle>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {item.idealTime}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="mb-1 text-sm">{item.task}</p>
        <p className="text-xs text-muted-foreground">{item.reason}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit {item.title} Reflection</DialogTitle>
              </DialogHeader>
              <EqReflectionForm 
                initialData={item}
                onSubmit={handleUpdate}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {!item.completed && (
            <Button 
              size="sm" 
              onClick={handleComplete} 
              className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white"
              disabled={disabled}
            >
              Complete
            </Button>
          )}
          
          {item.completed && (
            <span className="text-xs font-medium text-emerald-600">
              ✓ Completed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
