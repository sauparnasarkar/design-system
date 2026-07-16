import type { Meta, StoryObj } from '@storybook/react-vite';
import { KrfSlider } from './KrfSlider';

const NOTCHES = ['aaa', 'aa', 'a', 'bbb', 'bb', 'b', 'ccc', 'cc', 'c', 'd'].map((n) => ({
  value: n,
  label: n,
}));

const meta: Meta<typeof KrfSlider> = {
  title: 'Components/KrfSlider',
  component: KrfSlider,
  args: {
    options: NOTCHES,
    value: 'bbb',
    description: 'Operating Environment — factor mid-point',
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof KrfSlider>;

export const Playground: Story = {};

export const WithSentiment: Story = {
  args: {
    options: NOTCHES.map((n, i) => ({
      ...n,
      sentiment: i < 3 ? ('positive' as const) : i > 6 ? ('negative' as const) : 'default',
    })),
    value: 'bb',
    description: 'Shaded marks show rating sensitivities (positive = blue, negative = red tokens).',
  },
};
