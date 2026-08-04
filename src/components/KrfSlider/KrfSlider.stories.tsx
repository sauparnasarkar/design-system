import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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

export const KeyboardNav: Story = {
  // No fixed `value` — stays uncontrolled (internal state, defaulting to options[0]) so
  // arrow-key/click selection actually shows up, same reasoning as RangeSlider's
  // uncontrolled keyboard-nav stories.
  args: { value: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marks = canvas.getAllByRole('radio');
    await expect(marks[0]).toHaveAttribute('aria-checked', 'true');

    marks[0].focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(marks[2]).toHaveAttribute('aria-checked', 'true');
    await expect(marks[0]).toHaveAttribute('aria-checked', 'false');

    marks[2].focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(marks[1]).toHaveAttribute('aria-checked', 'true');
  },
};

export const ClickSelectsMark: Story = {
  args: { value: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marks = canvas.getAllByRole('radio');
    await userEvent.click(marks[5]);
    await expect(marks[5]).toHaveAttribute('aria-checked', 'true');
    await expect(marks[0]).toHaveAttribute('aria-checked', 'false');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const mark of canvas.getAllByRole('radio')) {
      await expect(mark).toBeDisabled();
    }
  },
};

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
