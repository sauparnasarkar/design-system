import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RangeSlider } from './RangeSlider';

const meta: Meta<typeof RangeSlider> = {
  title: 'Components/RangeSlider',
  component: RangeSlider,
  args: {
    label: 'Year',
    min: 1990,
    max: 2024,
    step: 1,
    disabled: false,
    showTicks: false,
    showValue: true,
    thumbLabels: ['Minimum year', 'Maximum year'],
  },
};
export default meta;
type Story = StoryObj<typeof RangeSlider>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [lowerThumb, upperThumb] = canvas.getAllByRole('slider');

    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '1990');
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2024');

    // Each thumb moves independently.
    lowerThumb.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '1992');
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2024');

    upperThumb.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2023');
    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '1992');
  },
};

export const ClampsInsteadOfCrossing: Story = {
  // No fixed `value` — stays uncontrolled (internal state, defaulting to [min, max]) so
  // keyboard-driven changes actually show up; a fixed `value` arg would make this a
  // controlled component and pin it to that value regardless of key presses, exactly like
  // the existing single-value `Slider` stories avoid doing for the same reason.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [lowerThumb, upperThumb] = canvas.getAllByRole('slider');

    // Bring the upper thumb down to a known value first (2024 → 2002, 22 presses).
    upperThumb.focus();
    for (let i = 0; i < 22; i++) {
      await userEvent.keyboard('{ArrowLeft}');
    }
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2002');

    // Driving the lower thumb past the upper thumb must clamp it to the upper thumb's
    // current value (a single-year selection), never let it cross past.
    lowerThumb.focus();
    for (let i = 0; i < 30; i++) {
      await userEvent.keyboard('{ArrowRight}');
    }
    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '2002');
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2002');

    // And the same in the other direction for the upper thumb.
    upperThumb.focus();
    for (let i = 0; i < 30; i++) {
      await userEvent.keyboard('{ArrowLeft}');
    }
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2002');
  },
};

export const LowerEndClampsToUpperBound: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [lowerThumb, upperThumb] = canvas.getAllByRole('slider');

    // Bring the upper thumb down to a specific, known value first (2024 → 2010, 14 presses).
    upperThumb.focus();
    for (let i = 0; i < 14; i++) {
      await userEvent.keyboard('{ArrowLeft}');
    }
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2010');

    lowerThumb.focus();
    await userEvent.keyboard('{End}');
    // The lower thumb's own upper bound is the other thumb's current value (2010), not the
    // slider's global max (2024) — a distinct, discriminating expected value from either.
    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '2010');
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2010');
  },
};

export const UpperHomeClampsToLowerBound: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [lowerThumb, upperThumb] = canvas.getAllByRole('slider');

    // Bring the lower thumb up to a specific, known value first (1990 → 2000, 10 presses).
    lowerThumb.focus();
    for (let i = 0; i < 10; i++) {
      await userEvent.keyboard('{ArrowRight}');
    }
    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '2000');

    upperThumb.focus();
    await userEvent.keyboard('{Home}');
    // The upper thumb's own lower bound is the other thumb's current value (2000), not the
    // slider's global min (1990) — a distinct, discriminating expected value from either.
    await expect(upperThumb).toHaveAttribute('aria-valuenow', '2000');
    await expect(lowerThumb).toHaveAttribute('aria-valuenow', '2000');
  },
};

export const WithTicks: Story = {
  args: {
    label: 'Rating notches',
    min: 0,
    max: 10,
    step: 1,
    showTicks: true,
    thumbLabels: ['Minimum notch', 'Maximum notch'],
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: [1995, 2015] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [lowerThumb, upperThumb] = canvas.getAllByRole('slider');
    // Disabled must remove both thumbs from the tab order entirely, not just visually dim them.
    await expect(lowerThumb).toHaveAttribute('tabindex', '-1');
    await expect(upperThumb).toHaveAttribute('tabindex', '-1');
  },
};
