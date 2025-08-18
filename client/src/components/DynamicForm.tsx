
import React from 'react';

type FormField = 
  | { id: string; type: 'select'; label: string; options: string[]; required?: boolean }
  | { id: string; type: 'radio'; label: string; options: string[]; required?: boolean }
  | { id: string; type: 'yesno'; label: string; required?: boolean }
  | { id: string; type: 'text'; label: string; placeholder?: string; required?: boolean }
  | { id: string; type: 'number'; label: string; min?: number; max?: number; step?: number; required?: boolean };

interface DynamicFormProps {
  schema: FormField[];
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export default function DynamicForm({ schema, value, onChange, errors = {} }: DynamicFormProps) {
  const updateValue = (fieldId: string, fieldValue: any) => {
    onChange({
      ...value,
      [fieldId]: fieldValue
    });
  };

  const renderField = (field: FormField) => {
    const hasError = errors[field.id];
    const errorClass = hasError ? 'border-red-500' : 'border-gray-300';
    
    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value[field.id] || ''}
              onChange={(e) => updateValue(field.id, e.target.value)}
              className={`w-full min-h-12 px-3 py-2 border ${errorClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              aria-label={field.label}
            >
              <option value="">Select an option</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value[field.id] === option}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    aria-label={`${field.label}: ${option}`}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'yesno':
        return (
          <div key={field.id} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value[field.id] === option}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    aria-label={`${field.label}: ${option}`}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value[field.id] || ''}
              onChange={(e) => updateValue(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full min-h-12 px-3 py-2 border ${errorClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              aria-label={field.label}
            />
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value[field.id] || ''}
              onChange={(e) => updateValue(field.id, e.target.value ? Number(e.target.value) : '')}
              min={field.min}
              max={field.max}
              step={field.step}
              className={`w-full min-h-12 px-3 py-2 border ${errorClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              aria-label={field.label}
            />
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {schema.map(renderField)}
    </div>
  );
}
