import React from 'react';
import type { Preview } from '@storybook/react-vite';

import '../src/styles/vendor/sy-design-system-reset.min.css';
import '../src/styles/vendor/syena-default-theme.css';
import '../src/styles/vendor/sy-design-system.min.css';
import '../src/styles/overrides.css';
import '../src/styles/themes/green.css';
import '../src/styles/themes/blue.css';
import '../src/styles/themes/analytics.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Syena theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Syena Default' },
          { value: 'green', title: 'Green theme' },
          { value: 'blue', title: 'Blue theme' },
          { value: 'analytics', title: 'Analytics theme' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'default',
  },
  decorators: [
    (Story, context) => (
      <div
        data-theme={context.globals.theme}
        style={{
          fontFamily: 'var(--sy-font-families-primary)',
          color: 'var(--sy-static-text-standard)',
          background: 'var(--sy-static-background-weak)',
          minHeight: '100vh',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
