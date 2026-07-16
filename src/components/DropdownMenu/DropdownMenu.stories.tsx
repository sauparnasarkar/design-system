import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropdownMenu } from './DropdownMenu';
import { Button } from '../Button/Button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    size: 'medium',
    withBorder: true,
    items: [
      { id: 'pdf', label: 'Download PDF', icon: 'download' },
      { id: 'xlsx', label: 'Download XLSX', icon: 'download' },
      { id: 'share', label: 'Copy link', icon: 'external' },
      { id: 'remove', label: 'Remove from portfolio', icon: 'close', dividerBefore: true },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 280 }}>
      <DropdownMenu {...args} trigger={<Button variant="secondary" iconRight="chevron-down">Actions</Button>} />
    </div>
  ),
};

export const WithHeaderFooter: Story = {
  args: {
    header: 'Export options',
    footer: <Button variant="ghost-blue" size="s">Manage defaults</Button>,
  },
  render: (args) => (
    <div style={{ minHeight: 320 }}>
      <DropdownMenu {...args} trigger={<Button variant="secondary" iconRight="chevron-down">Export</Button>} />
    </div>
  ),
};
