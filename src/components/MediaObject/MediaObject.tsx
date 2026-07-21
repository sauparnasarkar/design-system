import React from 'react';
import { cx } from '../../lib/cx';
import { Tag } from '../Tag/Tag';

export interface MediaObjectProps {
  title: React.ReactNode;
  /** Meta line under the title (date, duration, speaker…) */
  meta?: React.ReactNode;
  imageSrc?: string;
  /** Corner tag over the figure (e.g. "Webinar", "Podcast") */
  tag?: React.ReactNode;
  /** Dim the figure with the vendor overlay */
  withOverlay?: boolean;
  /** Stack figure above content (card style) instead of beside it */
  vertical?: boolean;
  /** Figure size in px (width; height is 9/16 when vertical, square otherwise) */
  figureSize?: number;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/**
 * Figure + content block (`__s9cmpx-media-object-figure`), as used by the
 * "Videos, Webinars, Podcasts" cards. The vendor ships only the figure
 * styles; layout mirrors the products' stack utilities.
 */
export function MediaObject({
  title,
  meta,
  imageSrc,
  tag,
  withOverlay = false,
  vertical = false,
  figureSize = 220,
  onClick,
  href,
  className,
}: MediaObjectProps) {
  const clickable = Boolean(onClick || href);
  const Wrapper = (href ? 'a' : clickable ? 'button' : 'div') as React.ElementType;
  const figureHeight = vertical ? Math.round((figureSize * 9) / 16) : figureSize;
  const figureWidth = vertical ? figureSize : figureSize;
  return (
    <Wrapper
      className={cx('__s9cmpx-media-object', className)}
      onClick={onClick}
      href={href}
      {...(Wrapper === 'button' ? { type: 'button' } : null)}
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: vertical ? 8 : 16,
        alignItems: vertical ? 'stretch' : 'center',
        background: 'none',
        border: 0,
        padding: 0,
        color: 'inherit',
        textDecoration: 'none',
        textAlign: 'left',
        cursor: clickable ? 'pointer' : 'default',
        width: vertical ? figureSize : 'auto',
      }}
    >
      <span className={cx('__s9cmpx-media-object-figure', vertical && '__s9cmpx-media-object-figure--full-width')} style={{ flexShrink: 0 }}>
        <span
          style={{
            display: 'block',
            width: figureWidth,
            height: vertical ? figureHeight : Math.round(figureSize * 0.6),
            borderRadius: 2,
            overflow: 'hidden',
            background: 'var(--__s9cmpx-color-brand-100, #ebebeb)',
          }}
        >
          {imageSrc && <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </span>
        {withOverlay && <span className="__s9cmpx-media-object-figure__overlay" style={{ borderRadius: 2 }} />}
        {tag && (
          <span className="__s9cmpx-media-object-figure__tag">
            <Tag size="small" color="white">{tag}</Tag>
          </span>
        )}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="__s9cmpx-headline7">{title}</span>
        {meta && <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{meta}</span>}
      </span>
    </Wrapper>
  );
}
