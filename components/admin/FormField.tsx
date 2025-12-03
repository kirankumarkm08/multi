import { FormField as FormFieldType } from '@/types';

interface FormFieldProps {
  field: FormFieldType;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const commonProps = {
    id: field.name,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder,
    value: value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      onChange(field.name, e.target.value),
    className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
      error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    }`
  };

  return (
    <div className="space-y-2">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {field.type === 'textarea' ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input type={field.type} {...commonProps} />
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}