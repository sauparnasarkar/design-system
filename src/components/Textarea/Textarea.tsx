import React from 'react';
import { cx } from '../../lib/cx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  label?: React.ReactNode;
}

export function Textarea({ error = false, label, className, id, rows = 4, ...rest }: TextareaProps) {
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
        id={inputId}
        rows={rows}
        className={cx('__s9cmpx-textarea', '__s9cmpx-textarea--m', '__s9cmpx-body3-short', error && '__s9cmpx-textarea__input--error')}
        style={{ borderRadius: 3, padding: '8px 10px', resize: 'vertical' }}
        {...rest}
      />
    </div>
  );
}
