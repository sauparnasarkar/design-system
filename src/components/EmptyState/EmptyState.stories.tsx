import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  argTypes: {
    size: { control: 'select', options: ['medium', 'large'] },
    icon: { control: 'select', options: ['search', 'document', 'warning', 'info'] },
  },
  args: {
    title: 'No results found',
    message: 'Try adjusting your filters or searching for a different entity, report, or instrument.',
    icon: 'search',
    size: 'medium',
    bordered: true,
    background: false,
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <EmptyState {...args} actions={<Button variant="secondary" size="s">Clear filters</Button>} />
    </div>
  ),
};
