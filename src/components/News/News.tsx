import React from 'react';
import { cx } from '../../lib/cx';

export interface NewsProps {
  title: React.ReactNode;
  /** Teaser text; line-clamped */
  description?: React.ReactNode;
  /** Metadata items rendered with • separators (source, type, sector, date…) */
  status?: React.ReactNode[];
  /** Thumbnail image source (140×140) */
  imageSrc?: string;
  /** Lines to clamp the description to */
  descriptionLines?: number;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/** Research/news list item (`sy-news`): optional thumbnail, title, clamped teaser, dot-separated status row. */
export function News({
  title,
  description,
  status = [],
  imageSrc,
  descriptionLines = 3,
  onClick,
  href,
  className,
}: NewsProps) {
  const clickable = Boolean(onClick || href);
  const Wrapper = (href ? 'a' : clickable ? 'button' : 'div') as React.ElementType;
  return (
    <Wrapper
      className={cx('sy-news__wrapper', !imageSrc && !description && 'sy-news__wrapper--without-image-and-description', className)}
      onClick={onClick}
      href={href}
      {...(Wrapper === 'button' ? { type: 'button' } : null)}
      style={{ border: 0, color: 'inherit', textDecoration: 'none', width: '100%' }}
    >
      {imageSrc && (
        <span className="sy-news__image">
          <img src={imageSrc} alt="" style={{ objectFit: 'cover', borderRadius: 2 }} />
        </span>
      )}
      <span className="sy-news__content-wrapper">
        <span className="sy-news__content">
          <span className="sy-news__title sy-headline7" style={{ display: 'block' }}>{title}</span>
          {description && (
            <span className="sy-news__description sy-body3-long" style={{ WebkitLineClamp: descriptionLines }}>
              {description}
            </span>
          )}
        </span>
        {status.length > 0 && (
          <span className="sy-news__status sy-label3" style={{ display: 'block' }}>
            {status.map((s, i) => (
              <span key={i} className="sy-news__status-item">{s}</span>
            ))}
          </span>
        )}
      </span>
    </Wrapper>
  );
}
