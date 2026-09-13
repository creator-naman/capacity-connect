"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Field, controlClassName } from "./Field";
import { cn } from "@/lib/utils";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "aria-invalid"> & {
  label: string;
  hint?: string;
  error?: string;
};

/**
 * Labeled text input with hint and error states. Errors are announced via
 * role="alert" in the Field shell and wired with aria-invalid/aria-describedby.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) => (
        <input
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(controlClassName(invalid), "h-10", className)}
          {...props}
        />
      )}
    </Field>
  );
});
Input.displayName = "Input";
