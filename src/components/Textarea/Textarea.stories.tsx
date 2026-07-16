import type { Meta, StoryObj } from '@storybook/react-vite';
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
};
