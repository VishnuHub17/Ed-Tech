
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
}

export function DateTimePicker({ date, setDate, label = "Pick date and time" }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, "HH:mm") : ""
  );

  // Update the time when the selectedTime changes
  const handleTimeChange = React.useCallback((time: string) => {
    setSelectedTime(time);
    
    if (!date && time) {
      // If we have a time but no date, create a new date for today
      const newDate = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      setDate(newDate);
      return;
    }
    
    if (!date) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      setDate(newDate);
    }
  }, [date, setDate]);

  // Update selected time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime(format(date, "HH:mm"));
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-[120px]"
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const currentTime = selectedTime ? selectedTime.split(":").map(Number) : [0, 0];
              const hours = currentTime[0] || 0;
              const minutes = currentTime[1] || 0;
              
              const newDate = new Date(selectedDate);
              newDate.setHours(hours, minutes, 0, 0);
              setDate(newDate);
            } else {
              setDate(undefined);
            }
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateTimeRangePicker({
  startDate, 
  endDate, 
  onStartChange, 
  onEndChange
}: {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartChange: (date: Date | undefined) => void;
  onEndChange: (date: Date | undefined) => void;
}) {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
      <div className="flex-1">
        <DateTimePicker 
          date={startDate} 
          setDate={onStartChange} 
          label="Start date & time" 
        />
      </div>
      <div className="flex-1">
        <DateTimePicker 
          date={endDate} 
          setDate={onEndChange} 
          label="End date & time" 
        />
      </div>
    </div>
  );
}
