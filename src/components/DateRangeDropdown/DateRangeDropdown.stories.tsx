import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { DateRangeDropdown } from './DateRangeDropdown';

const meta: Meta<typeof DateRangeDropdown> = {
  title: 'Components/DateRangeDropdown',
  component: DateRangeDropdown,
  args: {
    placeholder: 'Select Date',
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof DateRangeDropdown>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 420 }}>
      <DateRangeDropdown {...args} />
    </div>
  ),
};

export const SelectingAPresetUpdatesTriggerAndCloses: Story = {
  render: (args) => (
    <div style={{ minHeight: 420 }}>
      <DateRangeDropdown {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Select Date/ });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The accessible name of role="option" resolves from its child <button>'s text, but the
    // click handler lives on that <button> itself — a click dispatched at the <li> (the
    // "option" role) never reaches it, since it's the <li>'s descendant, not an ancestor.
    const option = canvas.getByRole('button', { name: 'Last 30 Days' });
    await userEvent.click(option);

    // Selecting a preset both closes the menu and relabels the trigger — the placeholder
    // text must be gone, replaced by the chosen preset's own label.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('button', { name: /Last 30 Days/ })).toBeInTheDocument();
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

export const CustomRangeApplyRequiresBothDates: Story = {
  render: (args) => (
    <div style={{ minHeight: 420 }}>
      <DateRangeDropdown {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Select Date/ }));

    const applyButton = canvas.getByRole('button', { name: 'Apply' });
    await expect(applyButton).toBeDisabled();

    // fireEvent.change rather than userEvent.type: <input type="date">'s .value setter
    // accepts a literal ISO string directly, sidestepping keystroke-order/locale quirks of
    // simulating segment-by-segment typing into a native date picker.
    fireEvent.change(canvas.getByLabelText('From'), { target: { value: '2026-01-01' } });
    await expect(applyButton).toBeDisabled();

    fireEvent.change(canvas.getByLabelText('To'), { target: { value: '2026-01-31' } });
    await expect(applyButton).toBeEnabled();

    await userEvent.click(applyButton);
    await expect(canvas.getByRole('button', { name: /2026-01-01 – 2026-01-31/ })).toBeInTheDocument();
  },
};
