// components/TimeInput.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeInputProps 
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  className,
  error,
  label,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {label}
            {props.required && <span className="text-destructive">*</span>}
          </div>
        </label>
      )}
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="time"
          className={cn(
            "flex h-10 w-full rounded-md border border-input px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-background",
            error ? "border-destructive focus-visible:ring-destructive" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default TimeInput;