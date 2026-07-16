import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotTyping } from './DotTyping';

const meta: Meta<typeof DotTyping> = {
  title: 'Components/DotTyping',
  component: DotTyping,
  args: { dots: 4 },
};
export default meta;
type Story = StoryObj<typeof DotTyping>;

export const Playground: Story = {};
