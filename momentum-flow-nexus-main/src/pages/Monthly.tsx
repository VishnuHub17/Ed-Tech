
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, Check, ArrowRight, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

interface MonthlyTracker {
  id: string;
  monthDate: Date;
  title: string;
  description: string;
  northStar: string;
  linkedProjects: string[];
  outcomes: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  wins: string;
  challenges: string;
  reflection: string;
  completionPercentage: number;
}

const Monthly = () => {
  const [monthlyTrackers, setMonthlyTrackers] = useState<MonthlyTracker[]>(getSampleMonthlyTrackers());
  const [expandedTracker, setExpandedTracker] = useState<string | null>(monthlyTrackers[0]?.id || null);
  
  const handleToggleExpand = (trackerId: string) => {
    setExpandedTracker(expandedTracker === trackerId ? null : trackerId);
  };
  
  const handleAddMonthlyTracker = () => {
    // Create a new tracker for next month
    const lastTracker = monthlyTrackers[0];
    const nextMonthStart = lastTracker 
      ? addMonths(new Date(lastTracker.monthDate), 1)
      : startOfMonth(new Date());
    
    const newTracker: MonthlyTracker = {
      id: `monthly-${Date.now()}`,
      monthDate: nextMonthStart,
      title: `Month of ${format(nextMonthStart, "MMMM yyyy")}`,
      description: "",
      northStar: "",
      linkedProjects: [],
      outcomes: [],
      wins: "",
      challenges: "",
      reflection: "",
      completionPercentage: 0,
    };
    
    setMonthlyTrackers([newTracker, ...monthlyTrackers]);
    setExpandedTracker(newTracker.id);
  };
  
  const handleToggleOutcome = (trackerId: string, outcomeId: string) => {
    setMonthlyTrackers(monthlyTrackers.map(tracker => {
      if (tracker.id === trackerId) {
        const updatedOutcomes = tracker.outcomes.map(outcome => {
          if (outcome.id === outcomeId) {
            return { ...outcome, completed: !outcome.completed };
          }
          return outcome;
        });
        
        const completedOutcomesCount = updatedOutcomes.filter(o => o.completed).length;
        const completionPercentage = updatedOutcomes.length > 0 
          ? (completedOutcomesCount / updatedOutcomes.length) * 100 
          : 0;
        
        return { 
          ...tracker, 
          outcomes: updatedOutcomes,
          completionPercentage
        };
      }
      return tracker;
    }));
  };
  
  const handleAddOutcome = (trackerId: string, outcomeTitle: string) => {
    if (!outcomeTitle.trim()) return;
    
    setMonthlyTrackers(monthlyTrackers.map(tracker => {
      if (tracker.id === trackerId) {
        const newOutcome = {
          id: `outcome-${Date.now()}`,
          title: outcomeTitle,
          completed: false
        };
        
        const updatedOutcomes = [...tracker.outcomes, newOutcome];
        const completionPercentage = updatedOutcomes.filter(o => o.completed).length / updatedOutcomes.length * 100;
        
        return {
          ...tracker,
          outcomes: updatedOutcomes,
          completionPercentage
        };
      }
      return tracker;
    }));
  };
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <GradientHeading as="h1">Monthly Outcome Tracker</GradientHeading>
          <p className="text-muted-foreground">Track your monthly goals and outcomes</p>
        </div>
        <Button 
          onClick={handleAddMonthlyTracker}
          className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> New Month
        </Button>
      </div>
      
      <div className="space-y-6">
        {monthlyTrackers.map((tracker) => {
          const isExpanded = expandedTracker === tracker.id;
          const monthStart = new Date(tracker.monthDate);
          const monthEnd = endOfMonth(monthStart);
          
          return (
            <Card key={tracker.id} className={`transition-all duration-300 ${isExpanded ? 'shadow-lg' : ''}`}>
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => handleToggleExpand(tracker.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{tracker.title}</CardTitle>
                    <CardDescription>
                      {format(monthStart, "MMMM d")} - {format(monthEnd, "MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {Math.round(tracker.completionPercentage)}%
                      </div>
                      <Progress value={tracker.completionPercentage} className="w-[100px]" />
                    </div>
                    <ArrowRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea 
                        placeholder="What do you want to achieve this month?" 
                        className="min-h-[80px]"
                        value={tracker.description}
                        onChange={(e) => {
                          setMonthlyTrackers(monthlyTrackers.map(t => 
                            t.id === tracker.id ? { ...t, description: e.target.value } : t
                          ));
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">North Star Metric</label>
                      <Input 
                        placeholder="What's your main KPI for this month?" 
                        value={tracker.northStar}
                        onChange={(e) => {
                          setMonthlyTrackers(monthlyTrackers.map(t => 
                            t.id === tracker.id ? { ...t, northStar: e.target.value } : t
                          ));
                        }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Key Outcomes</label>
                        <div className="text-sm text-muted-foreground">
                          {tracker.outcomes.filter(o => o.completed).length}/{tracker.outcomes.length} completed
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {tracker.outcomes.map(outcome => (
                          <div 
                            key={outcome.id} 
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                          >
                            <button
                              onClick={() => handleToggleOutcome(tracker.id, outcome.id)}
                              className={`flex items-center justify-center h-5 w-5 rounded border ${
                                outcome.completed 
                                  ? 'bg-primary border-primary text-primary-foreground' 
                                  : 'border-gray-300'
                              }`}
                            >
                              {outcome.completed && <Check className="h-3 w-3" />}
                            </button>
                            <span className={outcome.completed ? 'line-through text-muted-foreground' : ''}>
                              {outcome.title}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add a new outcome" 
                          id={`new-outcome-${tracker.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              handleAddOutcome(tracker.id, input.value);
                              input.value = '';
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            const input = document.getElementById(`new-outcome-${tracker.id}`) as HTMLInputElement;
                            handleAddOutcome(tracker.id, input.value);
                            input.value = '';
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Wins</label>
                      <Textarea 
                        placeholder="What went well this month?" 
                        className="min-h-[80px]"
                        value={tracker.wins}
                        onChange={(e) => {
                          setMonthlyTrackers(monthlyTrackers.map(t => 
                            t.id === tracker.id ? { ...t, wins: e.target.value } : t
                          ));
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Challenges</label>
                      <Textarea 
                        placeholder="What challenges did you face?" 
                        className="min-h-[80px]"
                        value={tracker.challenges}
                        onChange={(e) => {
                          setMonthlyTrackers(monthlyTrackers.map(t => 
                            t.id === tracker.id ? { ...t, challenges: e.target.value } : t
                          ));
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Reflection</label>
                      <Textarea 
                        placeholder="Reflect on your month. What did you learn? What would you do differently?"
                        className="min-h-[100px]"
                        value={tracker.reflection}
                        onChange={(e) => {
                          setMonthlyTrackers(monthlyTrackers.map(t => 
                            t.id === tracker.id ? { ...t, reflection: e.target.value } : t
                          ));
                        }}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      Last updated: {format(new Date(), "MMM d, yyyy")}
                    </div>
                    <Button variant="default">
                      Save Changes
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
};

function getSampleMonthlyTrackers(): MonthlyTracker[] {
  const currentMonthStart = startOfMonth(new Date());
  const lastMonthStart = subMonths(currentMonthStart, 1);
  
  return [
    {
      id: 'monthly-1',
      monthDate: currentMonthStart,
      title: `Month of ${format(currentMonthStart, "MMMM yyyy")}`,
      description: "Focus on launching new product features and expanding customer base",
      northStar: "Increase revenue by 15% compared to last month",
      linkedProjects: ['Product Launch', 'Customer Acquisition'],
      outcomes: [
        { id: 'monthly-outcome-1', title: "Release new product feature X", completed: true },
        { id: 'monthly-outcome-2', title: "Onboard 50 new customers", completed: false },
        { id: 'monthly-outcome-3', title: "Achieve 95% customer satisfaction rating", completed: false },
        { id: 'monthly-outcome-4', title: "Complete security audit", completed: true },
      ],
      wins: "",
      challenges: "",
      reflection: "",
      completionPercentage: 50,
    },
    {
      id: 'monthly-2',
      monthDate: lastMonthStart,
      title: `Month of ${format(lastMonthStart, "MMMM yyyy")}`,
      description: "Focus on product development and team building",
      northStar: "Complete MVP and hire 2 new developers",
      linkedProjects: ['Product Development', 'Recruitment'],
      outcomes: [
        { id: 'monthly-outcome-5', title: "Finalize MVP requirements", completed: true },
        { id: 'monthly-outcome-6', title: "Conduct 10 user interviews", completed: true },
        { id: 'monthly-outcome-7', title: "Hire senior developer", completed: true },
        { id: 'monthly-outcome-8', title: "Set up CI/CD pipeline", completed: true },
      ],
      wins: "Successfully launched MVP ahead of schedule. Great feedback from beta users.",
      challenges: "Recruitment process took longer than expected. Had to adjust timeline for some features.",
      reflection: "Overall a productive month. Team morale is high and we're making good progress.",
      completionPercentage: 100,
    }
  ];
}

export default Monthly;
