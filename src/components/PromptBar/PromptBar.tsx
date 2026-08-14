import React from 'react';
import { cx } from '../../lib/cx';
import { Textarea } from '../Textarea/Textarea';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface PromptBarProps {
  /** Controlled value -- component holds no internal text state. */
  value: string;
  onChange: (value: string) => void;
  /** Fires on submit (Enter without Shift, or the send button). Not called for an
   *  empty/whitespace-only value. */
  onSubmit: (value: string) => void;
  /** 'landing': large, centered, autofocus by default. 'docked': slim, full-width, no
   *  autofocus. Toggle this prop on one mounted instance to get the resize transition --
   *  conditionally rendering two separate elements will unmount/remount instead. */
  variant: 'landing' | 'docked';
  placeholder?: string;
  /** True while a query is in flight. Disables the textarea and send button; does not
   *  clear `value`. Refocuses the input once this returns to false. */
  loading?: boolean;
  /** Disabled for reasons other than an in-flight query (e.g. feature-gated). */
  disabled?: boolean;
  /** Optional slot for extra controls to the left of the send button. */
  actions?: React.ReactNode;
  /** Accessible label for the textarea, since there's no visible <label> in either state. */
  ariaLabel?: string;
  className?: string;
}

const MAX_LINES = 4;
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export function PromptBar({
  value,
  onChange,
  onSubmit,
  variant,
  placeholder = 'Ask a question…',
  loading = false,
  disabled = false,
  actions,
  ariaLabel = 'Ask a question',
  className,
}: PromptBarProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const prevLoadingRef = React.useRef(loading);
  const reduceMotion = useReducedMotion();
  const isLanding = variant === 'landing';

  // Auto-grow, capped at MAX_LINES. useLayoutEffect avoids a one-frame flash of the wrong
  // height (e.g. on programmatic clear after submit).
  useIsomorphicLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const maxHeight = lineHeight * MAX_LINES;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [value, variant]);

  // Refocus once a loading request completes -- matters for the docked "keep asking" loop.
  React.useEffect(() => {
    if (prevLoadingRef.current && !loading) textareaRef.current?.focus();
    prevLoadingRef.current = loading;
  }, [loading]);

  const trySubmit = () => {
    if (loading || disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      trySubmit();
    }
  };

  const heightTransition = reduceMotion ? 'none' : 'height 200ms ease';
  const containerTransition = reduceMotion ? 'none' : 'max-width 220ms ease, padding 220ms ease';

  return (
    <div
      className={cx('__s9cmpx-prompt-bar', `__s9cmpx-prompt-bar--${variant}`, className)}
      aria-busy={loading ? 'true' : undefined}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
        maxWidth: isLanding ? 540 : undefined,
        margin: isLanding ? '0 auto' : undefined,
        padding: isLanding ? '12px 12px 12px 20px' : '8px 8px 8px 16px',
        borderRadius: 'var(--__s9cmpx-border-radius-40)',
        background: 'var(--__s9cmpx-static-background-standard)',
        border: '1px solid var(--__s9cmpx-interactive-outline-secondary-default)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : undefined,
        transition: containerTransition,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          rows={1}
          disabled={disabled || loading}
          autoFocus={isLanding}
          textareaClassName="__s9cmpx-prompt-bar__textarea"
          style={{
            border: 'none',
            boxShadow: 'none',
            background: 'transparent',
            resize: 'none',
            borderRadius: 0,
            padding: 0,
            width: '100%',
            transition: heightTransition,
          }}
        />
      </div>
      {actions}
      <Button
        iconOnly
        iconLeft="send"
        aria-label="Send"
        variant="primary"
        size={isLanding ? 'm' : 's'}
        isLoading={loading}
        loadingIcon={<Spinner size={isLanding ? 'sm' : 'xs'} />}
        disabled={disabled || !value.trim()}
        onClick={trySubmit}
      />
    </div>
  );
}
