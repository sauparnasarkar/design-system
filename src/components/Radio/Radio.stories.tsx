import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  args: {
    label: 'Include withdrawn ratings',
    name: 'playground',
    error: false,
    large: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof Radio>;

export const Playground: Story = {};

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Radio name="g" label="All reports" defaultChecked />
      <Radio name="g" label="Rating actions only" />
      <Radio name="g" label="Research only" />
      <Radio name="g" label="Disabled option" disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allReports = canvas.getByRole('radio', { name: 'All reports' });
    const research = canvas.getByRole('radio', { name: 'Research only' });
    await expect(allReports).toBeChecked();

    // Selecting a sibling within the same native `name` group must uncheck the
    // previously-checked one — real radio-group semantics, not just visual styling.
    await userEvent.click(research);
    await expect(research).toBeChecked();
    await expect(allReports).not.toBeChecked();

    await expect(canvas.getByRole('radio', { name: 'Disabled option' })).toBeDisabled();
  },
};
