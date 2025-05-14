
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/components/ui/task-card";
import { DateTimeRangePicker } from "@/components/ui/date-time-picker";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { format } from "date-fns";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  isImportant: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  objective: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timeFrameText: z.string().optional(),
  quality: z.string().optional(),
  dependencies: z.string().optional(),
  resources: z.string().optional(),
  linkedProject: z.string().optional(),
  linkedTimeframes: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const timeframeOptions: Option[] = [
  { label: "Weekly Tracker", value: "weekly" },
  { label: "Monthly Tracker", value: "monthly" },
  { label: "Projects", value: "projects" },
];

interface TaskFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  initialData?: Partial<Task>;
  isEditing?: boolean;
}

export function TaskForm({ onSubmit, onCancel, initialData, isEditing = false }: TaskFormProps) {
  // Convert initialData.timeFrame to dates if present
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  );
  
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  );

  // Ensure initialTimeframes is always an array of strings
  const initialTimeframes = Array.isArray(initialData?.linkedTimeframes) ? 
    initialData.linkedTimeframes.map(item => String(item || "")) :
    (initialData?.linkedTimeframe && initialData.linkedTimeframe !== "none" ? 
      [String(initialData.linkedTimeframe)] : 
      []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "medium",
      isImportant: initialData?.isImportant || false,
      isUrgent: initialData?.isUrgent || false,
      objective: initialData?.objective || "",
      startDate: startDate,
      endDate: endDate,
      timeFrameText: initialData?.timeFrame || "",
      quality: initialData?.quality || "",
      dependencies: initialData?.dependencies || "",
      resources: initialData?.resources || "",
      linkedProject: initialData?.linkedProject || "",
      linkedTimeframes: initialTimeframes,
    }
  });

  const handleTimeRangeChange = (start: Date | undefined, end: Date | undefined) => {
    form.setValue("startDate", start);
    form.setValue("endDate", end);
    
    // Update timeFrameText based on date range
    if (start && end) {
      const timeFrameText = `${format(start, "MMM d, h:mm a")} - ${format(end, "MMM d, h:mm a")}`;
      form.setValue("timeFrameText", timeFrameText);
    } else {
      form.setValue("timeFrameText", "");
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Format the time frame as text if dates are selected
    const formattedData = {
      ...values,
      linkedTimeframes: Array.isArray(values.linkedTimeframes) ? values.linkedTimeframes : [], // Ensure linkedTimeframes is always an array
      timeFrame: values.timeFrameText || formatTimeFrame(values.startDate, values.endDate),
    };
    
    onSubmit(formattedData);
    form.reset();
  };

  const formatTimeFrame = (start?: Date, end?: Date): string => {
    if (start && end) {
      return `${format(start, "MMM d, h:mm a")} - ${format(end, "MMM d, h:mm a")}`;
    } else if (start) {
      return `From ${format(start, "MMM d, h:mm a")}`;
    } else if (end) {
      return `Until ${format(end, "MMM d, h:mm a")}`;
    }
    return "";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl>
                    <Input placeholder="Task objective" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Time Frame</FormLabel>
              <div className="space-y-2">
                <DateTimeRangePicker 
                  startDate={startDate}
                  endDate={endDate}
                  onStartChange={(date) => {
                    setStartDate(date);
                    handleTimeRangeChange(date, endDate);
                  }}
                  onEndChange={(date) => {
                    setEndDate(date);
                    handleTimeRangeChange(startDate, date);
                  }}
                />
                <FormField
                  control={form.control}
                  name="timeFrameText"
                  render={({ field }) => (
                    <Input 
                      placeholder="Or enter time frame manually (e.g. 2 days, 1 week)" 
                      {...field} 
                      onFocus={() => {
                        // Clear dates when manual entry is used
                        if (startDate || endDate) {
                          setStartDate(undefined);
                          setEndDate(undefined);
                          form.setValue("startDate", undefined);
                          form.setValue("endDate", undefined);
                        }
                      }}
                    />
                  )}
                />
              </div>
            </FormItem>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isImportant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Important</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Urgent</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quality</FormLabel>
                  <FormControl>
                    <Input placeholder="Quality standard" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dependencies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dependencies</FormLabel>
                  <FormControl>
                    <Input placeholder="Task dependencies" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources</FormLabel>
                  <FormControl>
                    <Input placeholder="Required resources" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedTimeframes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Timeframes</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={timeframeOptions}
                      selected={Array.isArray(field.value) ? field.value.map(String) : []}
                      onChange={(newValue) => {
                        field.onChange(Array.isArray(newValue) ? newValue.map(String) : []);
                      }}
                      placeholder="Select timeframes to link"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedProject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Project</FormLabel>
                  <FormControl>
                    <Input placeholder="Project name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
