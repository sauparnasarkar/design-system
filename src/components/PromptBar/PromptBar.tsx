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
  /** Optional content shown in a panel that expands from inside the bar itself (not a separate
   *  element below it) while the bar has focus -- e.g. starter/suggested prompts. Purely a slot:
   *  PromptBar has no opinion on what's inside, only when it's shown. Shown on focus entering the
   *  bar (the textarea or anything inside this content), hidden on focus leaving the bar entirely
   *  or on a successful submit. Omit to get the original, unexpandable bar exactly as before. */
  expandedContent?: React.ReactNode;
  /** Accessible label for the textarea, since there's no visible <label> in either state. */
  ariaLabel?: string;
  className?: string;
}

const MAX_LINES = 4;
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// Exposes the underlying textarea element via ref -- same pattern Textarea itself already uses
// (React.forwardRef<HTMLTextAreaElement, ...>), rather than inventing a bespoke handle type, so
// a caller can call .focus() after e.g. prefilling `value` from a suggestion in expandedContent
// (SPEC.md "Corrections applied" #18 in the consuming climate-emissions-analysis-project repo
// flagged exactly this gap: no way to move focus into the textarea after a prefill click).
export const PromptBar = React.forwardRef<HTMLTextAreaElement, PromptBarProps>(function PromptBar({
  value,
  onChange,
  onSubmit,
  variant,
  placeholder = 'Ask a question…',
  loading = false,
  disabled = false,
  actions,
  expandedContent,
  ariaLabel = 'Ask a question',
  className,
}, ref) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);
  const prevLoadingRef = React.useRef(loading);
  const reduceMotion = useReducedMotion();
  const isLanding = variant === 'landing';
  const [expanded, setExpanded] = React.useState(false);

  // Focus/blur, not click, so keyboard users tabbing into the textarea get the same expand
  // behavior as a mouse click -- and React's onFocus/onBlur already bubble from any descendant
  // (the textarea, or a tile inside expandedContent), so this one pair of handlers on the outer
  // container covers the whole bar without wiring each interactive child individually.
  const handleFocus = () => {
    if (expandedContent) setExpanded(true);
  };
  // relatedTarget is the element gaining focus -- null when focus leaves to a non-focusable
  // target (a plain click on the page background) or leaves the document entirely (tab out to
  // browser chrome), and non-null but outside this container when focus moves to some other
  // control on the page. Either way that's "focus left the bar" -- collapse. A click on a tile
  // inside expandedContent moves focus TO that tile (StarterPromptTile sets tabIndex={0}
  // specifically so this works) before the blur's relatedTarget is read, so it's correctly seen
  // as still-inside and doesn't collapse out from under the click.
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setExpanded(false);
  };

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

  // Also collapse on `loading` turning true, not just inside trySubmit -- an instant-submit tile
  // inside expandedContent (e.g. a starter prompt that submits immediately on click rather than
  // just prefilling the textarea) is typically wired by the caller to submit directly, bypassing
  // trySubmit entirely. `loading` flipping true is the one signal guaranteed to follow *any*
  // submission regardless of which path triggered it, internal or external.
  React.useEffect(() => {
    if (loading) setExpanded(false);
  }, [loading]);

  const trySubmit = () => {
    if (loading || disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    // Collapse explicitly rather than relying on the blur handler above -- Enter-key submission
    // never blurs the textarea at all (focus stays put), so blur-based collapse alone would miss
    // that path entirely.
    setExpanded(false);
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
  const panelTransition = reduceMotion ? 'none' : 'grid-template-rows 200ms ease';
  const showExpanded = expanded && !!expandedContent;

  return (
    <div
      className={cx('__s9cmpx-prompt-bar', `__s9cmpx-prompt-bar--${variant}`, className)}
      aria-busy={loading ? 'true' : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        // Landing no longer caps at a narrower 540px than docked -- the two variants now render
        // at the same width (whatever their container provides), not just the same visual style,
        // so the bar doesn't visibly resize between "before the first submit" and "after".
        padding: isLanding ? '12px 12px 12px 20px' : '8px 8px 8px 16px',
        borderRadius: 'var(--__s9cmpx-border-radius-40)',
        background: 'var(--__s9cmpx-static-background-standard)',
        border: '1px solid var(--__s9cmpx-interactive-outline-secondary-default)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : undefined,
        transition: containerTransition,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%' }}>
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
      {expandedContent && (
        // grid-template-rows 0fr -> 1fr, not max-height, so the panel animates to its real
        // content height without guessing a cap -- expandedContent's own size is unknown to this
        // component (a 2x2 vs 3x3 prompt grid, say). The inner div is the grid item that actually
        // gets clipped by the animated row height; overflow:hidden on both layers is required for
        // the 0fr state to actually hide (a grid item's own content otherwise still influences the
        // implicit minimum row size).
        <div
          className="__s9cmpx-prompt-bar__expanded-panel"
          data-expanded={showExpanded}
          aria-hidden={!showExpanded}
          inert={!showExpanded}
          style={{
            display: 'grid',
            gridTemplateRows: showExpanded ? '1fr' : '0fr',
            transition: panelTransition,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0, paddingTop: 12 }}>{expandedContent}</div>
        </div>
      )}
    </div>
  );
});
