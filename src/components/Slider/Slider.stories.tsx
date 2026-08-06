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

    // WCAG 2.2 §2.5.8: the rendered touch target must be at least 24x24 CSS px.
    // Runs in a real browser (not jsdom), so getBoundingClientRect() reflects the
    // actual overrides.css fix rather than all-zero stub values.
    const rect = thumb.getBoundingClientRect();
    await expect(rect.width).toBeGreaterThanOrEqual(24);
    await expect(rect.height).toBeGreaterThanOrEqual(24);
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

/**
 * `showRangeLabels` marks the track's two ends (here, the animated-choropleth's 1990/2024
 * bounds -- SPEC.md §5.17); `showThumbValue` floats a small label above the thumb that tracks
 * its position live, useful on a wide range where the fixed showValue text sits far from
 * wherever the thumb currently is. Both are additive to the existing showValue header line, not
 * a replacement for it.
 */
export const YearRangeWithMovingLabel: Story = {
  args: {
    label: 'Year',
    min: 1990,
    max: 2024,
    step: 1,
    value: 2007,
    showValue: true,
    showRangeLabels: true,
    showThumbValue: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1990')).toBeInTheDocument();
    await expect(canvas.getByText('2024')).toBeInTheDocument();
    // "2007" appears twice -- once in the static showValue header, once in the moving
    // showThumbValue bubble above the thumb.
    await expect(canvas.getAllByText('2007')).toHaveLength(2);
  },
};
