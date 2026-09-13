"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { Field, controlClassName } from "./Field";
import { cn } from "@/lib/utils";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "aria-invalid"> & {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

/** Labeled select with the same Field wiring as Input. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, options, placeholder, className, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) => (
        <select
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(controlClassName(invalid), "h-10 appearance-none bg-[position:right_0.6rem_center] bg-[length:1rem] bg-no-repeat pr-9", className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23838d92' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});
Select.displayName = "Select";
