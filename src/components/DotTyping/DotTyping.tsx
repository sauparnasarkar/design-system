import React from 'react';
import { cx } from '../../lib/cx';

export interface DotTypingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of bouncing dots */
  dots?: number;
}

/** Bouncing-dots "typing" indicator (`__s9cmpx-dot-typing`), used by AI-chat-style panels while responding. */
export function DotTyping({ dots = 4, className, ...rest }: DotTypingProps) {
  return (
    <div role="status" aria-label="Typing" className={cx('__s9cmpx-dot-typing', className)} {...rest}>
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className="__s9cmpx-dot-typing__dot" />
      ))}
    </div>
  );
}
