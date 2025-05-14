import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Clock, Link, Edit } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  isImportant?: boolean;
  isUrgent?: boolean;
  linkedProjects?: { id: string; name: string }[];
  objective?: string;
  timeFrame?: string;
  quality?: string;
  dependencies?: string;
  resources?: string;
  linkedProject?: string;
  linkedTimeframe?: "none" | "weekly" | "monthly";
  linkedTimeframes?: string[];
}

interface TaskCardProps {
  task: Task;
  className?: string;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
}

export function TaskCard({ task, className, onComplete, onEdit }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-600",
    medium: "bg-amber-100 text-amber-600",
    high: "bg-red-100 text-red-600",
  };

  // Ensure linkedTimeframes is always an array of strings
  const safeLinkedTimeframes = task.linkedTimeframes ? 
    (Array.isArray(task.linkedTimeframes) ? 
      task.linkedTimeframes.filter(Boolean).map(String) : 
      [String(task.linkedTimeframes)]) : 
    [];
  
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg leading-tight">{task.title}</h3>
          <div className="flex gap-2">
            {task.status !== "completed" && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onComplete && onComplete(task.id)}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Complete</span>
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onEdit && onEdit(task.id)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
        )}

        {task.objective && (
          <div className="mb-2">
            <span className="text-xs font-medium">Objective: </span>
            <span className="text-xs text-muted-foreground">{task.objective}</span>
          </div>
        )}
        
        <div className="flex items-center flex-wrap gap-2 mb-2">
          {task.timeFrame && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {task.timeFrame}
            </div>
          )}
          
          <div className={cn("text-xs px-2 py-0.5 rounded-full", priorityColors[task.priority])}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          
          {task.status === "completed" && (
            <div className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
              Completed
            </div>
          )}
          
          {task.status === "in-progress" && (
            <div className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
              In Progress
            </div>
          )}
        </div>
        
        {task.linkedProjects && task.linkedProjects.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {task.linkedProjects.map((project) => (
              <div 
                key={project.id}
                className="flex items-center text-xs bg-gray-100 rounded-full px-2 py-1"
              >
                <Link className="h-3 w-3 mr-1" />
                {project.name}
              </div>
            ))}
          </div>
        )}

        {task.linkedProject && (
          <div className="mt-2 flex items-center text-xs bg-gray-100 rounded-full px-2 py-1 w-fit">
            <Link className="h-3 w-3 mr-1" />
            {task.linkedProject}
          </div>
        )}

        {/* Display linked timeframes as badges */}
        {safeLinkedTimeframes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {safeLinkedTimeframes.map((timeframe) => (
              <div 
                key={timeframe}
                className="flex items-center text-xs bg-blue-50 rounded-full px-2 py-1 w-fit"
              >
                <Clock className="h-3 w-3 mr-1" />
                {timeframe === "weekly" ? "Weekly Tracker" : 
                 timeframe === "monthly" ? "Monthly Tracker" : 
                 timeframe === "projects" ? "Projects" : timeframe}
              </div>
            ))}
          </div>
        )}

        {/* For backward compatibility with the old format */}
        {task.linkedTimeframe && task.linkedTimeframe !== "none" && !safeLinkedTimeframes.length && (
          <div className="mt-2 flex items-center text-xs bg-blue-50 rounded-full px-2 py-1 w-fit">
            <Clock className="h-3 w-3 mr-1" />
            {task.linkedTimeframe === "weekly" ? "Weekly Tracker" : "Monthly Tracker"}
          </div>
        )}
        
        {(task.isUrgent || task.isImportant) && (
          <div className="mt-2 flex gap-2">
            {task.isUrgent && (
              <div className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                Urgent
              </div>
            )}
            {task.isImportant && (
              <div className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
                Important
              </div>
            )}
          </div>
        )}

        {(task.quality || task.dependencies || task.resources) && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs space-y-1">
            {task.quality && (
              <div>
                <span className="font-medium">Quality: </span>
                <span className="text-muted-foreground">{task.quality}</span>
              </div>
            )}
            {task.dependencies && (
              <div>
                <span className="font-medium">Dependencies: </span>
                <span className="text-muted-foreground">{task.dependencies}</span>
              </div>
            )}
            {task.resources && (
              <div>
                <span className="font-medium">Resources: </span>
                <span className="text-muted-foreground">{task.resources}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
