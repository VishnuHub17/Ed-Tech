
import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import MainLayout from "@/components/layout/MainLayout";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Task } from "@/components/ui/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Columns, LayoutGrid } from "lucide-react";
import { TaskForm } from "@/components/ui/task-form";
import { SortableTaskCard } from "@/components/ui/sortable-task-card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Ensure each task has linkedTimeframes as an array of strings
const ensureTaskFormat = (task: any): Task => {
  const linkedTimeframes = task.linkedTimeframes ? 
    (Array.isArray(task.linkedTimeframes) ? 
      task.linkedTimeframes.map(String) : 
      [String(task.linkedTimeframes)]) : 
    (task.linkedTimeframe ? 
      [String(task.linkedTimeframe)] : 
      []);
  
  return {
    ...task,
    linkedTimeframes: linkedTimeframes
  };
};

// Format the sample tasks to ensure they have the right structure
const formattedSampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Complete project proposal",
    description: "Finish the draft and send for review",
    priority: "high",
    status: "todo",
    isImportant: true,
    isUrgent: true,
    dueDate: "Today, 5:00 PM",
    linkedTimeframes: ["weekly", "projects"],
    linkedProjects: [{ id: "proj-1", name: "Marketing Campaign" }]
  },
  {
    id: "task-2",
    title: "Weekly team meeting",
    priority: "medium",
    status: "todo",
    dueDate: "Today, 2:00 PM",
    linkedTimeframes: ["weekly"],
  },
  {
    id: "task-3",
    title: "Review analytics dashboard",
    description: "Check conversion rates and user engagement",
    priority: "medium",
    status: "in-progress",
    isImportant: true,
    dueDate: "Today",
    linkedTimeframes: [],
  },
  {
    id: "task-4",
    title: "Prepare presentation slides",
    description: "For tomorrow's client meeting",
    priority: "high",
    status: "todo",
    isUrgent: true,
    dueDate: "Today, 6:00 PM",
    linkedTimeframes: [],
  },
  {
    id: "task-5",
    title: "Send follow-up emails",
    priority: "low",
    status: "completed",
    dueDate: "Today",
    linkedTimeframes: [],
  },
  {
    id: "task-6",
    title: "Update task documentation",
    priority: "low",
    status: "completed",
    dueDate: "Yesterday",
    linkedTimeframes: [],
  },
  {
    id: "task-7",
    title: "Research new marketing strategies",
    description: "Focus on social media trends",
    priority: "medium",
    status: "todo",
    isImportant: true,
    isUrgent: false,
    linkedTimeframes: [],
  },
  {
    id: "task-8",
    title: "Respond to customer support emails",
    priority: "medium",
    status: "todo",
    isUrgent: true,
    isImportant: false,
    linkedTimeframes: [],
  },
  {
    id: "task-9",
    title: "Organize digital files",
    priority: "low",
    status: "todo",
    isUrgent: false,
    isImportant: false,
    linkedTimeframes: [],
  }
];

const Tasks = () => {
  // Initialize tasks with properly formatted data
  const [tasks, setTasks] = useState<Task[]>(formattedSampleTasks.map(ensureTaskFormat));
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "eisenhower">("list");
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // DnD setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // If we're dragging a task
    if (active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);
      
      // If we're dragging between columns in kanban
      if (activeId.startsWith('task-') && overId.startsWith('column-')) {
        const newStatus = overId.replace('column-', '') as "todo" | "in-progress" | "completed";
        setTasks(tasks.map(task => 
          task.id === activeId ? { ...task, status: newStatus } : task
        ));
      }
      // If we're reordering tasks
      else if (activeId.startsWith('task-') && overId.startsWith('task-')) {
        const oldIndex = tasks.findIndex(t => t.id === activeId);
        const newIndex = tasks.findIndex(t => t.id === overId);
        
        setTasks(arrayMove(tasks, oldIndex, newIndex));
      }
    }
  };

  const handleAddTask = (data: any) => {
    // Format the dates for storage
    const startDate = data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate ? new Date(data.endDate) : undefined;
    
    // Ensure linkedTimeframes is always an array of strings
    const linkedTimeframes = Array.isArray(data.linkedTimeframes) ? 
      data.linkedTimeframes.map(String) : 
      [];
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "todo",
      isImportant: data.isImportant,
      isUrgent: data.isUrgent,
      objective: data.objective,
      timeFrame: data.timeFrame,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      quality: data.quality,
      dependencies: data.dependencies,
      resources: data.resources,
      linkedProject: data.linkedProject,
      linkedTimeframes: linkedTimeframes,
      dueDate: endDate ? format(endDate, "PPP") : startDate ? format(startDate, "PPP") : new Date().toLocaleDateString(),
    };
    
    setTasks([task, ...tasks]);
    setShowNewTask(false);
    
    // Update any linked weekly tasks with this item
    if (linkedTimeframes.includes("weekly")) {
      toast({
        title: "Task Linked",
        description: `Task "${data.title}" linked to Weekly Tracker`,
      });
    }

    if (linkedTimeframes.includes("monthly")) {
      toast({
        title: "Task Linked",
        description: `Task "${data.title}" linked to Monthly Tracker`,
      });
    }
    
    if (linkedTimeframes.includes("projects")) {
      toast({
        title: "Task Linked",
        description: `Task "${data.title}" linked to Projects`,
      });
    }
  };

  const handleEditTask = (data: any) => {
    if (!editingTask) return;
    
    // Format the dates for storage
    const startDate = data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate ? new Date(data.endDate) : undefined;
    
    // Ensure linkedTimeframes is always an array of strings
    const linkedTimeframes = Array.isArray(data.linkedTimeframes) ? 
      data.linkedTimeframes.map(String) : 
      [];
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? { 
            ...task, 
            title: data.title,
            description: data.description,
            priority: data.priority,
            isImportant: data.isImportant,
            isUrgent: data.isUrgent,
            objective: data.objective,
            timeFrame: data.timeFrame,
            startDate: startDate ? startDate.toISOString() : undefined,
            endDate: endDate ? endDate.toISOString() : undefined,
            quality: data.quality,
            dependencies: data.dependencies,
            resources: data.resources,
            linkedProject: data.linkedProject,
            linkedTimeframes: linkedTimeframes,
            dueDate: endDate ? format(endDate, "PPP") : startDate ? format(startDate, "PPP") : task.dueDate,
          } 
        : task
    ));
    
    setEditingTask(null);
  };

  const handleComplete = (taskId: string) => {
    setTasks(
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: "completed" } 
          : task
      )
    );

    // Get the task that was completed
    const completedTask = tasks.find(task => task.id === taskId);
    
    if (completedTask && Array.isArray(completedTask.linkedTimeframes) && completedTask.linkedTimeframes.length > 0) {
      completedTask.linkedTimeframes.forEach(timeframe => {
        toast({
          title: "Task Completed",
          description: `Task marked as complete in ${timeframe === "weekly" ? "Weekly Tracker" : 
                         timeframe === "monthly" ? "Monthly Tracker" : "Projects"}`,
        });
      });
    }
  };

  const handleStartEdit = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask({
        ...task,
        linkedTimeframes: Array.isArray(task.linkedTimeframes) ? 
          task.linkedTimeframes.map(String) : 
          []
      });
    }
  };

  // Filter tasks based on status for Kanban view
  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const completedTasks = tasks.filter(task => task.status === "completed");

  // Filter tasks based on Eisenhower Matrix
  const urgentImportantTasks = tasks.filter(task => task.isUrgent && task.isImportant);
  const importantNotUrgentTasks = tasks.filter(task => task.isImportant && !task.isUrgent);
  const urgentNotImportantTasks = tasks.filter(task => task.isUrgent && !task.isImportant);
  const notUrgentNotImportantTasks = tasks.filter(task => !task.isUrgent && !task.isImportant);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <GradientHeading as="h1">Daily Task Manager</GradientHeading>
          <p className="text-muted-foreground">Organize and track your daily tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="list" onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-1" /> List
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Columns className="h-4 w-4 mr-1" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="eisenhower">
                <LayoutGrid className="h-4 w-4 mr-1" /> Matrix
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={() => {
              setShowNewTask(true);
              setEditingTask(null);
            }} 
            className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white ml-2"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Task form */}
      {(showNewTask || editingTask) && (
        <Card className="mb-8 animate-scale-in">
          <CardHeader>
            <CardTitle>
              <GradientHeading as="h3">{editingTask ? "Edit Task" : "Add New Task"}</GradientHeading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm 
              onSubmit={editingTask ? handleEditTask : handleAddTask} 
              onCancel={() => {
                setShowNewTask(false);
                setEditingTask(null);
              }}
              initialData={editingTask || undefined}
              isEditing={!!editingTask}
            />
          </CardContent>
        </Card>
      )}

      {/* Task display */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {viewMode === "list" && (
          <div className="space-y-6">
            <div>
              <GradientHeading as="h2" variant="blue" className="text-xl mb-4">To Do</GradientHeading>
              <SortableContext items={todoTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todoTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                    />
                  ))}
                </div>
              </SortableContext>
              {todoTasks.length === 0 && (
                <p className="text-muted-foreground text-center py-6">No tasks to do. Nice work!</p>
              )}
            </div>
            
            <div>
              <GradientHeading as="h2" variant="orange" className="text-xl mb-4">In Progress</GradientHeading>
              <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                    />
                  ))}
                </div>
              </SortableContext>
              {inProgressTasks.length === 0 && (
                <p className="text-muted-foreground text-center py-6">No tasks in progress.</p>
              )}
            </div>
            
            <div>
              <GradientHeading as="h2" className="text-xl mb-4">Completed</GradientHeading>
              <SortableContext items={completedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.slice(0, 3).map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleStartEdit}
                    />
                  ))}
                </div>
              </SortableContext>
              {completedTasks.length === 0 && (
                <p className="text-muted-foreground text-center py-6">No completed tasks yet.</p>
              )}
            </div>
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)] mt-4">
            <div id="column-todo" className="bg-gray-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-gray-50 py-2">To Do ({todoTasks.length})</h3>
              <SortableContext items={todoTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {todoTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
            
            <div id="column-in-progress" className="bg-gray-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-gray-50 py-2">In Progress ({inProgressTasks.length})</h3>
              <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {inProgressTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
            
            <div id="column-completed" className="bg-gray-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-gray-50 py-2">Completed ({completedTasks.length})</h3>
              <SortableContext items={completedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {completedTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        )}

        {viewMode === "eisenhower" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-16rem)] mt-4">
            <div className="bg-red-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-red-50 py-2 text-red-600">Urgent & Important</h3>
              <SortableContext items={urgentImportantTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {urgentImportantTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                  {urgentImportantTasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-6">No tasks in this category.</p>
                  )}
                </div>
              </SortableContext>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-blue-50 py-2 text-blue-600">Important, Not Urgent</h3>
              <SortableContext items={importantNotUrgentTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {importantNotUrgentTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                  {importantNotUrgentTasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-6">No tasks in this category.</p>
                  )}
                </div>
              </SortableContext>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-amber-50 py-2 text-amber-600">Urgent, Not Important</h3>
              <SortableContext items={urgentNotImportantTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {urgentNotImportantTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                  {urgentNotImportantTasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-6">No tasks in this category.</p>
                  )}
                </div>
              </SortableContext>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg shadow-sm overflow-y-auto">
              <h3 className="font-medium mb-4 sticky top-0 bg-green-50 py-2 text-green-600">Not Urgent, Not Important</h3>
              <SortableContext items={notUrgentNotImportantTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {notUrgentNotImportantTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onEdit={handleStartEdit}
                      className="bg-white"
                    />
                  ))}
                  {notUrgentNotImportantTasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-6">No tasks in this category.</p>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        )}
      </DndContext>
    </MainLayout>
  );
};

export default Tasks;
