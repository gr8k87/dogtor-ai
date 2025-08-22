import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BaseField {
  id: string;
  question?: string;
  label?: string;
  required?: boolean;
}

interface RadioField extends BaseField {
  type: "radio";
  options: string[];
}

interface CheckboxField extends BaseField {
  type: "checkbox";
  options: string[];
}

interface DropdownField extends BaseField {
  type: "dropdown";
  options: string[];
}

interface YesNoField extends BaseField {
  type: "yesno";
}

interface SelectField extends BaseField {
  type: "select";
  options: string[];
}

type FormQuestion =
  | RadioField
  | CheckboxField
  | DropdownField
  | YesNoField
  | SelectField;

interface DynamicFormProps {
  schema: FormQuestion[];
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

export default function DynamicForm({
  schema,
  value,
  onChange,
}: DynamicFormProps) {
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
    <div className="space-y-6">
      {schema.map((field) => (
        <div key={field.id} className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            {field.question || field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {(field.type === "dropdown" || field.type === "select") && (
            <Select
              value={value[field.id] ?? ""}
              onValueChange={(val: string) => setVal(field.id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "radio" && (
            <div className="flex gap-4 flex-wrap">
              {field.options.map((option) => (
                <label
                  key={option}
                  className="inline-flex items-center gap-2 cursor-pointer"
                >
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

          {field.type === "checkbox" && (
            <div className="space-y-3">
              {field.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer"
                >
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

          {field.type === "yesno" && (
            <div className="flex gap-4">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="inline-flex items-center gap-2 cursor-pointer"
                >
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
        </div>
      ))}
    </div>
  );
}
