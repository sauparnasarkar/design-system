import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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

export const SelectClosesAndFiresOnSelect: Story = {
  args: { onSelect: fn() },
  render: (args) => (
    <div style={{ minHeight: 280 }}>
      <DropdownMenu {...args} trigger={<Button variant="secondary" iconRight="chevron-down">Actions</Button>} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);

    const item = canvas.getByRole('menuitem', { name: 'Download XLSX' });
    await expect(item).toBeInTheDocument();
    await userEvent.click(item);

    await expect(args.onSelect).toHaveBeenCalledWith('xlsx');
    // Selecting an item must close the menu, not leave it open.
    await expect(canvas.queryByRole('menuitem', { name: 'Download XLSX' })).not.toBeInTheDocument();
  },
};

export const DisabledItemNotSelectable: Story = {
  args: {
    onSelect: fn(),
    items: [
      { id: 'pdf', label: 'Download PDF', icon: 'download' },
      { id: 'locked', label: 'Locked action', icon: 'close', disabled: true },
    ],
  },
  render: (args) => (
    <div style={{ minHeight: 280 }}>
      <DropdownMenu {...args} trigger={<Button variant="secondary" iconRight="chevron-down">Actions</Button>} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    const locked = canvas.getByRole('menuitem', { name: 'Locked action' });
    await expect(locked).toBeDisabled();
    await userEvent.click(locked);
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
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
