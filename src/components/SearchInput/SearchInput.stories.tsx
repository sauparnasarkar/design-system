import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  argTypes: {
    variant: { control: 'select', options: ['classic', 'full'] },
  },
  args: {
    placeholder: 'Search Entities, Reports and Instruments...',
    variant: 'classic',
  },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  args: { onChange: fn(), onClear: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    // Clear button only exists once there is text.
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();
    await userEvent.type(input, 'abc');
    await expect(input).toHaveValue('abc');
    await expect(args.onChange).toHaveBeenLastCalledWith('abc');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(input).toHaveValue('');
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith('');
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();
  },
};
