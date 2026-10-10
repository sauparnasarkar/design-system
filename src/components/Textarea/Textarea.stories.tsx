import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    label: 'Feedback',
    placeholder: 'Tell us what you were looking for…',
    error: false,
    disabled: false,
    rows: 4,
  },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Textarea {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The label is wired to the textarea via the auto-generated id.
    const ta = canvas.getByLabelText('Feedback');
    await expect(ta).toHaveAttribute('rows', '4');
    await userEvent.type(ta, 'hello');
    await expect(ta).toHaveValue('hello');
  },
};

export const WithError: Story = {
  args: { error: true },
  render: (args) => <Textarea {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Feedback')).toHaveClass('__s9cmpx-textarea__input--error');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Textarea {...args} />,
  play: async ({ canvasElement }) => {
    const ta = within(canvasElement).getByLabelText('Feedback');
    await expect(ta).toBeDisabled();
    await userEvent.type(ta, 'nope');
    await expect(ta).toHaveValue('');
  },
};
