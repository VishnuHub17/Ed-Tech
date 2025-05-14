
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EqReflectionItem } from "./eq-reflection-card";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  idealTime: z.string().min(1, { message: "Ideal time is required" }),
  task: z.string().min(1, { message: "Task is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface EqReflectionFormProps {
  initialData?: EqReflectionItem;
  onSubmit: (data: EqReflectionItem) => void;
  onCancel: () => void;
}

export function EqReflectionForm({ initialData, onSubmit, onCancel }: EqReflectionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      idealTime: initialData?.idealTime || "",
      task: initialData?.task || "",
      reason: initialData?.reason || "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    const updatedData: EqReflectionItem = {
      ...initialData!,
      ...values,
    };
    
    onSubmit(updatedData);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="idealTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ideal Time</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Morning (7:00 - 9:00 AM)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="task"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the task description" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Why is this task important?" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
