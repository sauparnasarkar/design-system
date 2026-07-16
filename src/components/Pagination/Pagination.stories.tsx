import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const Compact: Story = {
  args: { compact: true },
  render: (args) => <Controlled {...args} />,
};
