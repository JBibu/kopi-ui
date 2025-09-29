import React from 'react';
import { Control, Controller, FieldError, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'checkbox' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  rules?: RegisterOptions<T>;
  error?: FieldError;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  description,
  required = false,
  rules,
  error,
  options = [],
  className = '',
  disabled = false,
  rows = 3,
}: FormFieldProps<T>) {
  const fieldRules = rules || (required ? { required: `${label} is required` } : {});

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className={required ? 'required' : ''}>
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field }) => {
          switch (type) {
            case 'textarea':
              return (
                <Textarea
                  {...field}
                  id={name}
                  placeholder={placeholder}
                  className={error ? 'border-destructive' : ''}
                  disabled={disabled}
                  rows={rows}
                />
              );
            case 'checkbox':
              return (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                  {description && (
                    <Label htmlFor={name} className="font-normal">
                      {description}
                    </Label>
                  )}
                </div>
              );
            case 'select':
              return (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger
                    id={name}
                    className={error ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            case 'number':
              return (
                <Input
                  {...field}
                  id={name}
                  type="number"
                  placeholder={placeholder}
                  className={error ? 'border-destructive' : ''}
                  disabled={disabled}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              );
            default:
              return (
                <Input
                  {...field}
                  id={name}
                  type={type}
                  placeholder={placeholder}
                  className={error ? 'border-destructive' : ''}
                  disabled={disabled}
                />
              );
          }
        }}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      {description && type !== 'checkbox' && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}