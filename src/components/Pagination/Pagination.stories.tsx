import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    page: 3,
    pageCount: 12,
    siblingCount: 1,
    compact: false,
  },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

function Controlled(args: React.ComponentProps<typeof Pagination>) {
  const [page, setPage] = React.useState(args.page);
  return <Pagination {...args} page={page} onChange={setPage} />;
}

export const Playground: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Native <button>s throughout — Tab+Enter should just work via the browser, no
    // custom keyboard handling to verify. Confirm current-page semantics and that
    // clicking a page number, and the prev/next buttons, actually navigate.
    // page=3, pageCount=12, siblingCount=1 -> visible numbers are 1,2,3,4,...,12.
    await expect(canvas.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: '4' }));
    await expect(canvas.getByRole('button', { name: '4' })).toHaveAttribute('aria-current', 'page');

    // Now on page 4, the sibling window shifts to 3,4,5, so "5" is visible.
    await userEvent.click(canvas.getByRole('button', { name: '5' }));
    await expect(canvas.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByRole('button', { name: '6' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Previous page' }));
    await expect(canvas.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');
  },
};

export const Compact: Story = {
  args: { compact: true },
  render: (args) => <Controlled {...args} />,
};
