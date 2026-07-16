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
        <label htmlFor={inputId} className="sy-label3" style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cx('sy-textarea', 'sy-textarea--m', 'sy-body3-short', error && 'sy-textarea__input--error')}
        style={{ borderRadius: 3, padding: '8px 10px', resize: 'vertical' }}
        {...rest}
      />
    </div>
  );
}
