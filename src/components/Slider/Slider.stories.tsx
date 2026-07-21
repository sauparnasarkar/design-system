import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider');
    thumb.focus();
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');

    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowUp}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '3');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '2');
  },
};

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Disabled must be removed from the tab order entirely, not just visually dimmed.
    await expect(canvas.getByRole('slider')).toHaveAttribute('tabindex', '-1');
  },
};
