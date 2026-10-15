import type { SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function SelectField({
  label,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { label: string; value: string }[] }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function TextAreaField({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea {...props} />
    </label>
  );
}
