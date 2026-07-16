import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';

export interface FileUploadProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Primary line inside the dropzone */
  label?: React.ReactNode;
  /** Secondary hint (file types, size limit) */
  hint?: React.ReactNode;
  className?: string;
}

/** Drag-and-drop upload area (`sy-file-upload`). */
export function FileUpload({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  loading = false,
  label = 'Drag and drop a file, or click to browse',
  hint,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles?.([...list]);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cx(
        'sy-file-upload',
        dragActive && 'sy-file-upload--drag-active',
        disabled && 'sy-file-upload--disabled',
        loading && 'sy-file-upload--loading',
        className,
      )}
      onClick={() => !disabled && !loading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (!disabled && !loading) handleFiles(e.dataTransfer.files);
      }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 32, textAlign: 'center' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      {loading ? (
        <Spinner label="Uploading…" />
      ) : (
        <>
          <span style={{ color: 'var(--sy-static-text-weak)' }}>
            <Icon name="download" size={28} style={{ transform: 'rotate(180deg)' }} />
          </span>
          <span className="sy-body3-short">{label}</span>
          {hint && <span className="sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>{hint}</span>}
        </>
      )}
    </div>
  );
}
