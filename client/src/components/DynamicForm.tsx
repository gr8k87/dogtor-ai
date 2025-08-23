import React from "react";

interface BaseField {
  id: string;
  question?: string;
  label?: string;
  required?: boolean;
}

interface RadioField extends BaseField {
  type: 'radio';
  options: string[];
}

interface CheckboxField extends BaseField {
  type: 'checkbox';
  options: string[];
}

interface DropdownField extends BaseField {
  type: 'dropdown';
  options: string[];
}



interface YesNoField extends BaseField {
  type: 'yesno';
}

interface SelectField extends BaseField {
  type: 'select';
  options: string[];
}

type FormQuestion = RadioField | CheckboxField | DropdownField | YesNoField | SelectField;

interface DynamicFormProps {
  schema: FormQuestion[];
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

export default function DynamicForm({ schema, value, onChange }: DynamicFormProps) {
  function setVal(id: string, v: any) {
    onChange({ ...value, [id]: v });
  }

  function toggleCheckboxValue(id: string, option: string) {
    const current = value[id] || [];
    const newValue = current.includes(option) 
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    setVal(id, newValue);
  }

  return (
    <div className="space-y-4">
      {schema.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {field.question || field.label}
            {field.required && <span className="text-destructive">*</span>}
          </label>

          {field.type === 'dropdown' && (
            <select 
              className="input w-full"
              value={value[field.id] ?? ''} 
              onChange={(e) => setVal(field.id, e.target.value)}
            >
              <option value="" disabled>Select an option...</option>
              {field.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}

          {field.type === 'radio' && (
            <div className="flex gap-3 flex-wrap">
              {field.options.map((option) => (
                <label key={option} className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name={field.id} 
                    checked={value[field.id] === option}
                    onChange={() => setVal(field.id, option)}
                    className="w-4 h-4 text-primary border-input focus:ring-ring"
                  /> 
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-2">
              {field.options.map((option) => (
                <label key={option} className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(value[field.id] || []).includes(option)}
                    onChange={() => toggleCheckboxValue(field.id, option)}
                    className="w-4 h-4 text-primary border-input focus:ring-ring rounded"
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          )}



          {field.type === 'yesno' && (
            <div className="flex gap-3">
              {['Yes', 'No'].map((option) => (
                <label key={option} className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name={field.id} 
                    checked={value[field.id] === option}
                    onChange={() => setVal(field.id, option)}
                    className="w-4 h-4 text-primary border-input focus:ring-ring"
                  /> 
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'select' && (
            <select 
              className="input w-full"
              value={value[field.id] ?? ''} 
              onChange={(e) => setVal(field.id, e.target.value)}
            >
              <option value="" disabled>Select an option...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}