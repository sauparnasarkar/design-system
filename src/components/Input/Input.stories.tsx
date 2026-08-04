import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    size: { control: 'select', options: ['xs', 's', 'm', 'l', 'xl'] },
    iconLeft: { control: 'select', options: [undefined, 'search', 'user'] },
    iconRight: { control: 'select', options: [undefined, 'close', 'chevron-down'] },
  },
  args: {
    placeholder: 'Search Research, Entities, Issues, and Sectors',
    size: 'm',
    error: false,
    disabled: false,
    label: '',
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search Research, Entities, Issues, and Sectors');
    await userEvent.type(input, 'emissions');
    await expect(input).toHaveValue('emissions');
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
      <Input label="Default" placeholder="Placeholder" />
      <Input label="With icon" placeholder="Search…" iconLeft="search" />
      <Input label="Error" defaultValue="Invalid value" error />
      <Input label="Disabled" placeholder="Disabled" disabled />
    </div>
  ),
};
