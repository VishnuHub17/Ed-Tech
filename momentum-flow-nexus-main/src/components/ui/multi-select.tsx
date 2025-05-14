
import * as React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Option = {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  badgeClassName?: string;
}

export function MultiSelect({
  options = [], 
  selected = [], 
  onChange,
  placeholder = "Select options...",
  className,
  badgeClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Ensure options is an array and all values are strings
  const safeOptions = Array.isArray(options) ? options.map(opt => ({
    label: String(opt?.label || ""),
    value: String(opt?.value || "")
  })) : [];
  
  // Ensure selected is an array and all values are strings
  const safeSelected = Array.isArray(selected) 
    ? selected.map(item => String(item || ""))
    : [];

  const handleUnselect = (item: string) => {
    onChange(safeSelected.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (safeSelected.length > 0) {
        handleUnselect(safeSelected[safeSelected.length - 1]);
      }
      e.preventDefault();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between h-auto ${safeSelected.length > 0 ? "h-auto" : ""}`}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
        >
          <div className="flex flex-wrap gap-2">
            {safeSelected.length > 0 ? (
              safeSelected.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className={cn(
                    "mr-1 mb-1 text-xs",
                    badgeClassName
                  )}
                >
                  {safeOptions.find((option) => option.value === item)?.label || item}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {safeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={String(option.value)}
                onSelect={() => {
                  onChange(
                    safeSelected.includes(option.value)
                      ? safeSelected.filter((item) => item !== option.value)
                      : [...safeSelected, option.value]
                  );
                  setOpen(true); // Keep the popover open after selection
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    safeSelected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
