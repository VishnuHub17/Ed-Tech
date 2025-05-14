
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { ProgressRing } from "@/components/ui/progress-ring";
import { QuoteCard } from "@/components/ui/quote-card";
import { TaskCard, Task } from "@/components/ui/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DailyEqSection } from "@/components/ui/daily-eq-section";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  const handleAddTask = () => {
    if (newTask.title.trim() === "") return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      priority: "medium",
      status: "todo",
      isImportant: true,
      dueDate: new Date().toLocaleDateString(),
    };
    
    setTasks([task, ...tasks]);
    setNewTask({ title: "", description: "" });
    setShowQuickEntry(false);
  };

  const handleComplete = (taskId: string) => {
    setTasks(
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: "completed" } 
          : task
      )
    );
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome Back</h1>
          <p className="text-muted-foreground">Here's an overview of your productivity today</p>
        </div>
        <Button 
          onClick={() => setShowQuickEntry(!showQuickEntry)} 
          className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Quick Add
        </Button>
      </div>

      {showQuickEntry && (
        <Card className="mb-8 animate-scale-in">
          <CardHeader>
            <CardTitle>
              <GradientHeading as="h3">Add New Task</GradientHeading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input 
                  placeholder="Task title" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <Textarea 
                  placeholder="Task description (optional)" 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowQuickEntry(false)}>Cancel</Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>
              <GradientHeading>Daily Focus</GradientHeading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ProgressRing 
                progress={65} 
                label="65%" 
                subLabel="Completed" 
              />
            </div>
            <div className="mt-4">
              <p className="text-center text-sm text-muted-foreground">
                4 of 6 tasks completed today
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              <GradientHeading variant="blue">Weekly Outcome</GradientHeading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ProgressRing 
                progress={42} 
                label="42%" 
                subLabel="Progress" 
                color="url(#blue-gradient)"
              />
              <defs>
                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#9b87f5" />
                </linearGradient>
              </defs>
            </div>
            <div className="mt-4">
              <p className="text-center text-sm text-muted-foreground">
                10 of 24 tasks completed this week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              <GradientHeading variant="orange">Monthly Goals</GradientHeading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ProgressRing 
                progress={30} 
                label="30%" 
                subLabel="Progress" 
                color="url(#orange-gradient)"
              />
              <defs>
                <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#D946EF" />
                </linearGradient>
              </defs>
            </div>
            <div className="mt-4">
              <p className="text-center text-sm text-muted-foreground">
                2 of 5 goals reached this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <GradientHeading as="h2" className="mb-4">Today's Tasks</GradientHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.filter(task => task.status !== "completed").slice(0, 4).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={handleComplete}
                />
              ))}
            </div>
            {tasks.filter(task => task.status !== "completed").length > 4 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm">View All Tasks</Button>
              </div>
            )}
          </div>
          
          <div>
            <GradientHeading as="h2" variant="blue" className="mb-4">Completed Tasks</GradientHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.filter(task => task.status === "completed").slice(0, 2).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                />
              ))}
            </div>
          </div>
          
          {/* EQ Development Section */}
          <DailyEqSection />
        </div>
        
        <div className="space-y-6">
          <div>
            <GradientHeading as="h2" variant="orange" className="mb-4">Daily Inspiration</GradientHeading>
            <QuoteCard 
              quote="The way to get started is to quit talking and begin doing."
              author="Walt Disney"
            />
          </div>
          
          <div>
            <GradientHeading as="h3" className="mb-4">Linked Projects</GradientHeading>
            <div className="space-y-2">
              {linkedProjects.map(project => (
                <Card key={project.id} className="gradient-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{project.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                        {project.taskCount} tasks
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-momentum-purple to-momentum-pink rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <GradientHeading as="h3" variant="blue" className="mb-4">
              🧠 Second Brain
            </GradientHeading>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Recent Notes</h4>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <ul className="space-y-2">
                  {recentNotes.map(note => (
                    <li key={note.id} className="flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md">
                      <div className="h-2 w-2 rounded-full bg-momentum-purple" />
                      {note.title}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Sample data
const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Complete project proposal",
    description: "Finish the draft and send for review",
    priority: "high",
    status: "todo",
    isImportant: true,
    isUrgent: true,
    dueDate: "Today, 5:00 PM",
    linkedProjects: [{ id: "proj-1", name: "Marketing Campaign" }]
  },
  {
    id: "task-2",
    title: "Weekly team meeting",
    priority: "medium",
    status: "todo",
    dueDate: "Today, 2:00 PM",
  },
  {
    id: "task-3",
    title: "Review analytics dashboard",
    description: "Check conversion rates and user engagement",
    priority: "medium",
    status: "in-progress",
    isImportant: true,
    dueDate: "Today",
    linkedProjects: [{ id: "proj-2", name: "Website Redesign" }]
  },
  {
    id: "task-4",
    title: "Prepare presentation slides",
    description: "For tomorrow's client meeting",
    priority: "high",
    status: "todo",
    isUrgent: true,
    dueDate: "Today, 6:00 PM",
    linkedProjects: [{ id: "proj-1", name: "Marketing Campaign" }]
  },
  {
    id: "task-5",
    title: "Send follow-up emails",
    priority: "low",
    status: "completed",
    dueDate: "Today",
  },
  {
    id: "task-6",
    title: "Update task documentation",
    priority: "low",
    status: "completed",
    dueDate: "Yesterday",
  }
];

const linkedProjects = [
  {
    id: "proj-1", 
    name: "Marketing Campaign", 
    taskCount: 12, 
    progress: 65
  },
  {
    id: "proj-2", 
    name: "Website Redesign", 
    taskCount: 8, 
    progress: 40
  },
  {
    id: "proj-3", 
    name: "Product Launch", 
    taskCount: 15, 
    progress: 25
  }
];

const recentNotes = [
  { id: "note-1", title: "Meeting notes: Product strategy" },
  { id: "note-2", title: "Research: Competitor analysis" },
  { id: "note-3", title: "Ideas for upcoming presentation" },
  { id: "note-4", title: "Book summary: Atomic Habits" }
];

export default Index;
