import React from 'react';
import { cx } from '../../lib/cx';

export interface DotTypingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of bouncing dots */
  dots?: number;
}

/** Bouncing-dots "typing" indicator (`sy-dot-typing`), used by the Syena AI chat while responding. */
export function DotTyping({ dots = 4, className, ...rest }: DotTypingProps) {
  return (
    <div role="status" aria-label="Typing" className={cx('sy-dot-typing', className)} {...rest}>
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className="sy-dot-typing__dot" />
      ))}
    </div>
  );
}
