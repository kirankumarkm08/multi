/**
 * Reusable Form Input Components
 * Extracted from app/(tenant)/admin/page-builder/custom/page.tsx
 * Can be used across landing page and custom page builders
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// FormField Component
// ============================================================================

export interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "url";
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error,
  required = false,
  disabled = false,
  maxLength,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================================
// TextAreaField Component
// ============================================================================

export interface TextAreaFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export function TextAreaField({
  label,
  id,
  value,
  onChange,
  placeholder = "",
  error,
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {maxLength && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SelectField Component
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function SelectField({
  label,
  id,
  value,
  onValueChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = "Select an option",
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================================
// RadioField Component
// ============================================================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function RadioField({
  label,
  value,
  onValueChange,
  options,
  error,
  required = false,
  disabled = false,
}: RadioFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              id={`${label}-${option.value}`}
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onValueChange(e.target.value)}
              disabled={disabled}
              className="w-4 h-4"
            />
            <Label
              htmlFor={`${label}-${option.value}`}
              className="cursor-pointer font-normal"
            >
              {option.label}
              {option.description && (
                <span className="block text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </Label>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================================
// CheckboxField Component
// ============================================================================

export interface CheckboxFieldProps {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string;
  disabled?: boolean;
}

export function CheckboxField({
  label,
  id,
  checked,
  onChange,
  description,
  error,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded"
          disabled={disabled}
        />
        <Label htmlFor={id} className="cursor-pointer font-normal">
          {label}
        </Label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground ml-6">{description}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
