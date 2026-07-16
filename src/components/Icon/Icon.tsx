import React from 'react';

const PATHS: Record<string, React.ReactNode> = {
  search: (
    <path d="M10.5 3a7.5 7.5 0 015.916 12.111l4.236 4.237-1.414 1.414-4.237-4.236A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
  ),
  'chevron-down': <path d="M12 15.5l-6-6 1.414-1.414L12 12.672l4.586-4.586L18 9.5z" />,
  'chevron-up': <path d="M12 8.5l6 6-1.414 1.414L12 11.328l-4.586 4.586L6 14.5z" />,
  'chevron-right': <path d="M9.914 6l6 6-6 6L8.5 16.586 13.086 12 8.5 7.414z" />,
  'chevron-left': <path d="M14.086 18l-6-6 6-6L15.5 7.414 10.914 12l4.586 4.586z" />,
  close: (
    <path d="M12 10.586l5.293-5.293 1.414 1.414L13.414 12l5.293 5.293-1.414 1.414L12 13.414l-5.293 5.293-1.414-1.414L10.586 12 5.293 6.707l1.414-1.414z" />
  ),
  download: <path d="M11 3h2v9.086l3.293-3.293 1.414 1.414L12 15.914l-5.707-5.707 1.414-1.414L11 12.086V3zM5 19h14v2H5v-2z" />,
  check: <path d="M9.5 16.086L5.414 12 4 13.414l5.5 5.5 10.5-10.5L18.586 7z" />,
  info: (
    <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16zm1 6v6h-2v-6h2zm0-4v2h-2V6h2z" />
  ),
  warning: (
    <path d="M12 2l11 19H1L12 2zm0 4L4.47 19h15.06L12 6zm1 5v4h-2v-4h2zm0 5v2h-2v-2h2z" />
  ),
  error: (
    <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16zm1 3v7h-2V7h2zm0 9v2h-2v-2h2z" />
  ),
  menu: <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />,
  bell: (
    <path d="M12 2a6 6 0 016 6v4l2 3v1H4v-1l2-3V8a6 6 0 016-6zm0 2a4 4 0 00-4 4v4.606L6.869 14h10.262L16 12.606V8a4 4 0 00-4-4zm2 15a2 2 0 11-4 0h4z" />
  ),
  user: (
    <path d="M12 2a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm0 9c4.418 0 8 2.239 8 5v2H4v-2c0-2.761 3.582-5 8-5zm0 2c-3.363 0-6 1.573-6 3h12c0-1.427-2.637-3-6-3z" />
  ),
  grid: (
    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
  ),
  external: (
    <path d="M14 3h7v7h-2V6.414l-8.293 8.293-1.414-1.414L17.586 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" />
  ),
  document: (
    <path d="M6 2h9l5 5v15H6V2zm2 2v16h10V8h-4V4H8zm8 .414V6h1.586L16 4.414zM9 11h8v2H9v-2zm0 4h8v2H9v-2z" />
  ),
  home: <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8zm0 2.694L7.6 9.6V18H8v-6h8v6h.4V9.6L12 5.694z" />,
  mail: (
    <path d="M3 5h18v14H3V5zm2 2v.511l7 4.376 7-4.376V7H5zm14 2.868l-7 4.375-7-4.375V17h14V9.868z" />
  ),
  phone: (
    <path d="M7.1 3c.5 0 .94.33 1.08.81l1.2 4.1a1.13 1.13 0 01-.29 1.12L7.6 10.52a12.6 12.6 0 005.88 5.88l1.49-1.49c.3-.3.73-.41 1.12-.29l4.1 1.2c.48.14.81.58.81 1.08v3.1c0 .62-.5 1.13-1.13 1.12C10.7 20.9 3.1 13.3 3 4.13 2.99 3.5 3.5 3 4.12 3H7.1zM6.4 5H5.03c.26 7.4 6.17 13.31 13.57 13.57v-1.37l-3.3-.97-1.9 1.9-.63-.32a14.6 14.6 0 01-7.48-7.48l-.32-.63 1.9-1.9L6.4 5z" />
  ),
  calendar: (
    <path d="M8 2v2h8V2h2v2h3v18H3V4h3V2h2zM5 9v11h14V9H5zm0-2h14V6H5v1zm3 5h3v3H8v-3z" />
  ),
};

export type IconName = keyof typeof PATHS;
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Which glyph to render */
  name: IconName;
  /** Square dimension in px */
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
