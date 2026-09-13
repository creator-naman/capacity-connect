"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Field, controlClassName } from "./Field";
import { cn } from "@/lib/utils";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "aria-invalid"> & {
  label: string;
  hint?: string;
  error?: string;
};

/** Labeled multi-line control with the same Field wiring as Input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, rows = 4, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(controlClassName(invalid), "py-2.5 leading-relaxed", className)}
          {...props}
        />
      )}
    </Field>
  );
});
Textarea.displayName = "Textarea";
