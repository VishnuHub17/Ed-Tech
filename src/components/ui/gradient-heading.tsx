
import { cn } from "@/lib/utils";

interface GradientHeadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: "purple" | "orange" | "blue";
  as?: "h1" | "h2" | "h3" | "h4";
}

export function GradientHeading({ 
  children, 
  className, 
  variant = "purple", 
  as: Component = "h2" 
}: GradientHeadingProps) {
  const variantClassMap = {
    purple: "gradient-text",
    orange: "gradient-text-orange",
    blue: "gradient-text-blue",
  };
  
  const variantClass = variantClassMap[variant];
  
  const sizeClassMap = {
    h1: "text-3xl md:text-4xl font-bold",
    h2: "text-2xl md:text-3xl font-bold",
    h3: "text-xl md:text-2xl font-semibold",
    h4: "text-lg md:text-xl font-semibold",
  };
  
  const sizeClass = sizeClassMap[Component];
  
  return (
    <Component className={cn(variantClass, sizeClass, className)}>
      {children}
    </Component>
  );
}
