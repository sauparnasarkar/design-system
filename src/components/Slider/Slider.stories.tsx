import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  args: {
    label: 'Minimum ESG score',
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    showTicks: false,
    showValue: true,
  },
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {};

export const WithTicks: Story = {
  args: {
    label: 'Rating notches',
    min: 0,
    max: 10,
    step: 1,
    showTicks: true,
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 40 },
};
