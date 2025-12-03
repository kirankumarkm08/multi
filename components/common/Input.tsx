import React from "react";
import { FormField } from "./FormFields";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, containerClassName, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md",
          "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
          "placeholder-gray-500 dark:placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
          "text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400",
          error && "border-red-500 dark:border-red-400",
          className
        )}
      />
    );

    if (label) {
      return (
        <FormField
          label={label}
          error={error}
          required={props.required}
          className={containerClassName}
        >
          {input}
        </FormField>
      );
    }

    return input;
  }
);

Input.displayName = "Input";
