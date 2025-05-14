
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { Task, TaskCard } from "@/components/ui/task-card";

interface SortableTaskCardProps {
  task: Task;
  className?: string;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
}

export function SortableTaskCard({ task, className, onComplete, onEdit }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard
        task={task}
        onComplete={onComplete}
        onEdit={onEdit}
        className={className}
      />
    </div>
  );
}
