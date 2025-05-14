
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QuoteCardProps {
  quote: string;
  author: string;
  className?: string;
}

export function QuoteCard({ quote, author, className }: QuoteCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <blockquote className="relative">
          <span className="absolute top-0 left-0 text-4xl text-gray-200">"</span>
          <p className="text-md sm:text-lg italic pl-6 pt-2">{quote}</p>
          <footer className="mt-4 text-right text-sm text-muted-foreground">
            — {author}
          </footer>
        </blockquote>
      </CardContent>
    </Card>
  );
}
