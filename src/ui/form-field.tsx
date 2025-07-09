import React from "react";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { validators, validationMessages } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  validation?: {
    type: "email" | "phone" | "name" | "address" | "company" | "required" | "minLength" | "maxLength";
    minLength?: number;
    maxLength?: number;
    validOptions?: string[];
  };
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  validation,
  className
}) => {
  const [localError, setLocalError] = React.useState<string>("");

  // Validation en temps réel
  const validateField = (value: string) => {
    if (!validation) return "";

    // Validation required
    if (validation.type === "required" && !value.trim()) {
      return validationMessages.required;
    }

    // Validation email
    if (validation.type === "email" && value && !validators.email(value)) {
      return validationMessages.email;
    }

    // Validation phone
    if (validation.type === "phone" && value && !validators.phone(value)) {
      return validationMessages.phone;
    }

    // Validation name
    if (validation.type === "name" && value && !validators.name(value)) {
      return validationMessages.name;
    }

    // Validation address
    if (validation.type === "address" && value && !validators.address(value)) {
      return validationMessages.address;
    }

    // Validation company
    if (validation.type === "company" && value && !validators.company(value)) {
      return validationMessages.company;
    }

    // Validation minLength
    if (validation.minLength && value.length < validation.minLength) {
      return validationMessages.minLength(validation.minLength);
    }

    // Validation maxLength
    if (validation.maxLength && value.length > validation.maxLength) {
      return validationMessages.maxLength(validation.maxLength);
    }

    return "";
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Validation en temps réel
    if (validation) {
      const errorMessage = validateField(newValue);
      setLocalError(errorMessage);
    }
  };

  const handleBlur = () => {
    if (validation) {
      const errorMessage = validateField(value);
      setLocalError(errorMessage);
    }
  };

  const hasError = error || localError;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(hasError && "text-red-600")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {type === "textarea" ? (
        <Textarea
          id={name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(hasError && "border-red-500 focus:border-red-500")}
        />
      ) : type === "select" ? (
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger 
            id={name}
            className={cn(hasError && "border-red-500 focus:border-red-500")}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(hasError && "border-red-500 focus:border-red-500")}
        />
      )}
      
      {hasError && (
        <p className="text-sm text-red-600">{hasError}</p>
      )}
    </div>
  );
}; 