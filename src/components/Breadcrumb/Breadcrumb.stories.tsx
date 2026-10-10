import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Entities', href: '#' },
      { label: 'A.P. Moller - Maersk A/S' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Earlier crumbs are links; the last is plain text marked as the current page.
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#');
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    const current = canvas.getByText('A.P. Moller - Maersk A/S');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current.tagName).toBe('SPAN');
  },
};

/** A crumb with an href is still rendered as the (non-link) current page when it is last. */
export const LastItemWithHrefIsNotALink: Story = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Here', href: '#here' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(canvas.getByText('Here')).toHaveAttribute('aria-current', 'page');
  },
};
