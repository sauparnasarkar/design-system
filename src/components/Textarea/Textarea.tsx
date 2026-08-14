import React from 'react';
import { cx } from '../../lib/cx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  label?: React.ReactNode;
  /** Extra class name(s) applied to the <textarea> itself, alongside the component's own
   *  vendor classes -- distinct from `className`, which stays wrapper-<div>-only. */
  textareaClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  error = false,
  label,
  className,
  textareaClassName,
  id,
  rows = 4,
  style,
  ...rest
}, ref) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="__s9cmpx-label3" style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cx(
          '__s9cmpx-textarea',
          '__s9cmpx-textarea--m',
          '__s9cmpx-body3-short',
          error && '__s9cmpx-textarea__input--error',
          textareaClassName,
        )}
        style={{ borderRadius: 3, padding: '8px 10px', resize: 'vertical', ...style }}
        {...rest}
      />
    </div>
  );
});
