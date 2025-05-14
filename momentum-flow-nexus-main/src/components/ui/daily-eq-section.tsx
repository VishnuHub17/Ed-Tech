
import { useState, useEffect } from "react";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { EqReflectionCard, EqReflectionItem } from "./eq-reflection-card";
import { Button } from "@/components/ui/button";
import { getTodaysReflection, updateReflectionItem } from "@/services/eq-reflections";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Default EQ reflection items - clean state for new users
const defaultReflectionItems = {
  empathy: {
    type: "empathy",
    title: "Empathy",
    idealTime: "Late Afternoon (4:00 – 6:00 PM)",
    task: "During a conversation, say: \"That makes sense,\" to validate someone's feelings.",
    reason: "Simple validation strengthens emotional connection and understanding.",
    completed: false
  } as EqReflectionItem,
  
  social_skills: {
    type: "social_skills",
    title: "Social Skills",
    idealTime: "Evening (7:00 – 9:00 PM)",
    task: "Share a quick voice note or video message instead of text with someone.",
    reason: "Adds tone and warmth to communication, enhancing relational depth.",
    completed: false
  } as EqReflectionItem,
  
  self_regulation: {
    type: "self_regulation",
    title: "Self-Regulation",
    idealTime: "Mid-morning (10:00 – 11:00 AM)",
    task: "Pause during a moment of stress and slowly trace a square in the air with your finger as you breathe.",
    reason: "Combining movement and breath engages focus and eases tension.",
    completed: false
  } as EqReflectionItem,
  
  self_awareness: {
    type: "self_awareness",
    title: "Self-Awareness",
    idealTime: "Morning (7:00 – 9:00 AM)",
    task: "Write: \"An emotion I often dismiss but need to listen to more is ______.\"",
    reason: "Recognizing ignored emotions helps uncover valuable inner signals.",
    completed: false
  } as EqReflectionItem
};

export function DailyEqSection() {
  const { toast } = useToast();
  const [reflectionItems, setReflectionItems] = useState(defaultReflectionItems);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadReflections = async () => {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session?.user;
      setIsAuthenticated(isAuth);
      setAuthChecked(true);
      
      if (isAuth) {
        try {
          // Load today's reflection data
          const reflection = await getTodaysReflection();
          
          // Only update state if there's actual data
          if (reflection) {
            const updatedItems = { ...defaultReflectionItems };
            
            // Parse JSON strings back to objects
            if (reflection.empathy) {
              try {
                updatedItems.empathy = {
                  ...updatedItems.empathy,
                  ...JSON.parse(reflection.empathy)
                };
              } catch (e) {
                console.error("Error parsing empathy data:", e);
              }
            }
            
            if (reflection.social_skills) {
              try {
                updatedItems.social_skills = {
                  ...updatedItems.social_skills,
                  ...JSON.parse(reflection.social_skills)
                };
              } catch (e) {
                console.error("Error parsing social_skills data:", e);
              }
            }
            
            if (reflection.self_regulation) {
              try {
                updatedItems.self_regulation = {
                  ...updatedItems.self_regulation,
                  ...JSON.parse(reflection.self_regulation)
                };
              } catch (e) {
                console.error("Error parsing self_regulation data:", e);
              }
            }
            
            if (reflection.self_awareness) {
              try {
                updatedItems.self_awareness = {
                  ...updatedItems.self_awareness,
                  ...JSON.parse(reflection.self_awareness)
                };
              } catch (e) {
                console.error("Error parsing self_awareness data:", e);
              }
            }
            
            setReflectionItems(updatedItems);
          } else {
            // For first-time users, use the default items
            setReflectionItems(defaultReflectionItems);
          }
        } catch (error) {
          console.error("Error loading reflections:", error);
          toast({
            title: "Error",
            description: "Failed to load today's reflections",
            variant: "destructive",
          });
        }
      }
      
      setLoading(false);
    };
    
    checkAuthAndLoadReflections();
  }, [toast]);

  const handleComplete = async (type: keyof typeof reflectionItems, item: EqReflectionItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your reflections",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update the UI immediately for better user experience
      setReflectionItems(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          completed: true
        }
      }));
      
      // Save to database
      const updatedItem = { ...item, completed: true };
      await updateReflectionItem(type, updatedItem);
      
      toast({
        title: "Success",
        description: `Completed your ${item.title} task!`,
      });
    } catch (error) {
      console.error(`Error completing ${type} reflection:`, error);
      toast({
        title: "Error",
        description: `Failed to save your ${type} reflection`,
        variant: "destructive",
      });
      
      // Revert UI on error
      setReflectionItems(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          completed: false
        }
      }));
    }
  };

  const handleUpdate = async (type: keyof typeof reflectionItems, item: EqReflectionItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your reflections",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update the UI immediately
      setReflectionItems(prev => ({
        ...prev,
        [type]: item
      }));
      
      // Save to database
      await updateReflectionItem(type, item);
      
      toast({
        title: "Success",
        description: `Your ${item.title} reflection has been updated`,
      });
    } catch (error) {
      console.error(`Error updating ${type} reflection:`, error);
      toast({
        title: "Error",
        description: `Failed to update your ${item.title} reflection`,
        variant: "destructive",
      });
    }
  };

  if (loading && !authChecked) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <GradientHeading as="h2" variant="blue">
          EQ Development
        </GradientHeading>
        
        {!isAuthenticated && authChecked && (
          <Button variant="outline" size="sm" asChild>
            <a href="/auth">Sign in to track progress</a>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EqReflectionCard 
          item={reflectionItems.empathy} 
          onComplete={() => handleComplete("empathy", reflectionItems.empathy)}
          onUpdate={(item) => handleUpdate("empathy", item)}
          disabled={!isAuthenticated}
        />
        
        <EqReflectionCard 
          item={reflectionItems.social_skills}
          onComplete={() => handleComplete("social_skills", reflectionItems.social_skills)}
          onUpdate={(item) => handleUpdate("social_skills", item)}
          disabled={!isAuthenticated}
        />
        
        <EqReflectionCard 
          item={reflectionItems.self_regulation}
          onComplete={() => handleComplete("self_regulation", reflectionItems.self_regulation)}
          onUpdate={(item) => handleUpdate("self_regulation", item)}
          disabled={!isAuthenticated}
        />
        
        <EqReflectionCard 
          item={reflectionItems.self_awareness}
          onComplete={() => handleComplete("self_awareness", reflectionItems.self_awareness)}
          onUpdate={(item) => handleUpdate("self_awareness", item)}
          disabled={!isAuthenticated}
        />
      </div>
      
      {!isAuthenticated && (
        <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-md text-center">
          <h3 className="text-lg font-medium mb-2">Get the most out of your EQ development</h3>
          <p className="mb-4 text-muted-foreground">Sign in to track your daily progress and customize your EQ tasks</p>
          <Button asChild>
            <a href="/auth">Sign in or Create Account</a>
          </Button>
        </div>
      )}
    </div>
  );
}
