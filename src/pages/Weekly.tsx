
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, Check, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyTracker {
  id: string;
  weekStartDate: Date;
  title: string;
  description: string;
  northStar: string;
  linkedProjects: string[];
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    dailyTaskId?: string;
  }[];
  reflection: string;
  completionPercentage: number;
}

const Weekly = () => {
  const [weeklyTrackers, setWeeklyTrackers] = useState<WeeklyTracker[]>([]);
  const [expandedTracker, setExpandedTracker] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // This would come from a global state or context in a real app
  const linkedDailyTasks = window.localStorage.getItem('linkedWeeklyTasks') 
    ? JSON.parse(window.localStorage.getItem('linkedWeeklyTasks') || '[]') 
    : [];
  
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session?.user;
      setIsAuthenticated(isAuth);
      
      // If user is authenticated, load their data or create a default tracker
      if (isAuth) {
        // In a real app, this would fetch from the database
        const trackers = getSampleWeeklyTrackers();
        setWeeklyTrackers(trackers);
        
        if (trackers.length > 0) {
          setExpandedTracker(trackers[0].id);
        }
      } else {
        // For non-authenticated users, show an empty state
        setWeeklyTrackers([]);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    // In a real app, this would be handled through context or state management
    // This is a simplified example of how tasks from Daily Tasks could be connected
    if (linkedDailyTasks.length > 0 && weeklyTrackers.length > 0) {
      const currentTracker = weeklyTrackers[0];
      
      if (currentTracker) {
        const updatedTasks = [...currentTracker.tasks];
        
        linkedDailyTasks.forEach(dailyTask => {
          // Check if this task is already in the weekly tracker
          const existingTaskIndex = updatedTasks.findIndex(
            task => task.dailyTaskId === dailyTask.id
          );
          
          if (existingTaskIndex === -1) {
            // Add the task if it's not already there
            updatedTasks.push({
              id: `weekly-task-${Date.now()}-${Math.random()}`,
              title: dailyTask.title,
              completed: dailyTask.status === 'completed',
              dailyTaskId: dailyTask.id
            });
            
            toast({
              title: "Task Added",
              description: `Task "${dailyTask.title}" added to Weekly Tracker`,
            });
          } else if (updatedTasks[existingTaskIndex].completed !== (dailyTask.status === 'completed')) {
            // Update completion status if it's changed
            updatedTasks[existingTaskIndex] = {
              ...updatedTasks[existingTaskIndex],
              completed: dailyTask.status === 'completed'
            };
            
            toast({
              title: "Task Updated",
              description: `Task "${dailyTask.title}" marked as ${dailyTask.status === 'completed' ? 'complete' : 'incomplete'}`,
            });
          }
        });
        
        // Calculate new completion percentage
        const completedTasksCount = updatedTasks.filter(t => t.completed).length;
        const completionPercentage = updatedTasks.length > 0 
          ? (completedTasksCount / updatedTasks.length) * 100 
          : 0;
        
        // Update the tracker with new tasks
        setWeeklyTrackers(weeklyTrackers.map(tracker => 
          tracker.id === currentTracker.id
            ? { ...tracker, tasks: updatedTasks, completionPercentage }
            : tracker
        ));
      }
    }
  }, [linkedDailyTasks, weeklyTrackers, toast]);
  
  const handleToggleExpand = (trackerId: string) => {
    setExpandedTracker(expandedTracker === trackerId ? null : trackerId);
  };
  
  const handleAddWeeklyTracker = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create weekly trackers",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new tracker for next week
    const lastTracker = weeklyTrackers[0];
    const nextWeekStart = lastTracker 
      ? addWeeks(new Date(lastTracker.weekStartDate), 1)
      : startOfWeek(new Date());
    
    const newTracker: WeeklyTracker = {
      id: `weekly-${Date.now()}`,
      weekStartDate: nextWeekStart,
      title: `Week of ${format(nextWeekStart, "MMM d, yyyy")}`,
      description: "",
      northStar: "",
      linkedProjects: [],
      tasks: [],
      reflection: "",
      completionPercentage: 0,
    };
    
    setWeeklyTrackers([newTracker, ...weeklyTrackers]);
    setExpandedTracker(newTracker.id);
  };
  
  const handleToggleTask = (trackerId: string, taskId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update tasks",
        variant: "destructive",
      });
      return;
    }
    
    setWeeklyTrackers(weeklyTrackers.map(tracker => {
      if (tracker.id === trackerId) {
        const updatedTasks = tracker.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: !task.completed };
          }
          return task;
        });
        
        const completedTasksCount = updatedTasks.filter(t => t.completed).length;
        const completionPercentage = updatedTasks.length > 0 
          ? (completedTasksCount / updatedTasks.length) * 100 
          : 0;
        
        return { 
          ...tracker, 
          tasks: updatedTasks,
          completionPercentage
        };
      }
      return tracker;
    }));
  };
  
  const handleAddTask = (trackerId: string, taskTitle: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add tasks",
        variant: "destructive",
      });
      return;
    }
    
    if (!taskTitle.trim()) return;
    
    setWeeklyTrackers(weeklyTrackers.map(tracker => {
      if (tracker.id === trackerId) {
        const newTask = {
          id: `task-${Date.now()}`,
          title: taskTitle,
          completed: false
        };
        
        const updatedTasks = [...tracker.tasks, newTask];
        const completionPercentage = updatedTasks.filter(t => t.completed).length / updatedTasks.length * 100;
        
        return {
          ...tracker,
          tasks: updatedTasks,
          completionPercentage
        };
      }
      return tracker;
    }));
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <GradientHeading as="h1">Weekly Tracker</GradientHeading>
          <p className="text-muted-foreground">Track your weekly goals and outcomes</p>
        </div>
        <Button 
          onClick={() => handleAddWeeklyTracker()}
          className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> New Week
        </Button>
      </div>
      
      {weeklyTrackers.length > 0 ? (
        <div className="space-y-6">
          {weeklyTrackers.map((tracker) => {
            const isExpanded = expandedTracker === tracker.id;
            const weekStart = new Date(tracker.weekStartDate);
            const weekEnd = endOfWeek(weekStart);
            
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
                        {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
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
                          placeholder="What are your main goals for this week?" 
                          className="min-h-[80px]"
                          value={tracker.description}
                          onChange={(e) => {
                            setWeeklyTrackers(weeklyTrackers.map(t => 
                              t.id === tracker.id ? { ...t, description: e.target.value } : t
                            ));
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">North Star Metric</label>
                        <Input 
                          placeholder="What's your main KPI for this week?" 
                          value={tracker.northStar}
                          onChange={(e) => {
                            setWeeklyTrackers(weeklyTrackers.map(t => 
                              t.id === tracker.id ? { ...t, northStar: e.target.value } : t
                            ));
                          }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium">Key Tasks</label>
                          <div className="text-sm text-muted-foreground">
                            {tracker.tasks.filter(t => t.completed).length}/{tracker.tasks.length} completed
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {tracker.tasks.map(task => (
                            <div 
                              key={task.id} 
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                            >
                              <button
                                onClick={() => handleToggleTask(tracker.id, task.id)}
                                className={`flex items-center justify-center h-5 w-5 rounded border ${
                                  task.completed 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'border-gray-300'
                                }`}
                              >
                                {task.completed && <Check className="h-3 w-3" />}
                              </button>
                              <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Add a new task" 
                            id={`new-task-${tracker.id}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                handleAddTask(tracker.id, input.value);
                                input.value = '';
                              }
                            }}
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              const input = document.getElementById(`new-task-${tracker.id}`) as HTMLInputElement;
                              handleAddTask(tracker.id, input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Weekly Reflection</label>
                        <Textarea 
                          placeholder="Reflect on your week. What went well? What could be improved?"
                          className="min-h-[100px]"
                          value={tracker.reflection}
                          onChange={(e) => {
                            setWeeklyTrackers(weeklyTrackers.map(t => 
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
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Weekly Trackers Yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Weekly trackers help you stay focused on your goals and reflect on your progress each week.
          </p>
          
          {isAuthenticated ? (
            <Button 
              onClick={handleAddWeeklyTracker}
              className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Start Your First Week
            </Button>
          ) : (
            <Button asChild>
              <a href="/auth">Sign in to Create Tracker</a>
            </Button>
          )}
        </div>
      )}
    </MainLayout>
  );
};

function getSampleWeeklyTrackers(): WeeklyTracker[] {
  // For authenticated users, return some sample data
  // In a real app, this would be fetched from the database
  const currentWeekStart = startOfWeek(new Date());
  const lastWeekStart = addWeeks(currentWeekStart, -1);
  
  return [
    {
      id: 'weekly-1',
      weekStartDate: currentWeekStart,
      title: `Week of ${format(currentWeekStart, "MMM d, yyyy")}`,
      description: "Focus on product launch preparations and marketing strategy",
      northStar: "Complete all pre-launch tasks and increase email sign-ups by 25%",
      linkedProjects: ['Marketing Campaign', 'Product Launch'],
      tasks: [
        { id: 'weekly-task-1', title: "Finalize landing page copy", completed: true },
        { id: 'weekly-task-2', title: "Create social media graphics", completed: true },
        { id: 'weekly-task-3', title: "Prepare email campaign", completed: false },
        { id: 'weekly-task-4', title: "Test product with beta users", completed: false },
      ],
      reflection: "",
      completionPercentage: 50,
    },
    {
      id: 'weekly-2',
      weekStartDate: lastWeekStart,
      title: `Week of ${format(lastWeekStart, "MMM d, yyyy")}`,
      description: "Focus on user research and initial product design",
      northStar: "Complete user interviews and finalize initial wireframes",
      linkedProjects: ['Product Design'],
      tasks: [
        { id: 'weekly-task-5', title: "Interview 5 potential users", completed: true },
        { id: 'weekly-task-6', title: "Create user personas", completed: true },
        { id: 'weekly-task-7', title: "Draft initial wireframes", completed: true },
        { id: 'weekly-task-8', title: "Review wireframes with team", completed: true },
      ],
      reflection: "Had great insights from user interviews. The wireframes were well-received by the team, with some minor adjustments needed for the dashboard layout.",
      completionPercentage: 100,
    }
  ];
}

export default Weekly;
