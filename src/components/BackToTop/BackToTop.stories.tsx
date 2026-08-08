import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BackToTop } from './BackToTop';

const meta: Meta<typeof BackToTop> = {
  title: 'Components/BackToTop',
  component: BackToTop,
  args: { threshold: 200 },
};
export default meta;
type Story = StoryObj<typeof BackToTop>;

function installScrollToStub() {
  const originalScrollTo = window.scrollTo;
  window.scrollTo = ((optionsOrX?: ScrollToOptions | number, y?: number) => {
    const left = typeof optionsOrX === 'number' ? optionsOrX : optionsOrX?.left ?? window.scrollX;
    const top = typeof optionsOrX === 'number' ? y ?? window.scrollY : optionsOrX?.top ?? window.scrollY;
    originalScrollTo({ left, top, behavior: 'auto' });
    window.dispatchEvent(new Event('scroll'));
  }) as typeof window.scrollTo;
  return () => {
    window.scrollTo = originalScrollTo;
  };
}

export const Playground: Story = {
  render: (args) => (
    <div>
      <p>Scroll down 200px to reveal the button.</p>
      <div style={{ height: 3000 }} />
      <BackToTop {...args} />
    </div>
  ),
};

/**
 * The button is absent entirely (not just visually hidden) below the threshold, and appears once
 * the page scrolls past it (SPEC.md §5.20).
 */
export const VisibleOnlyPastTheThreshold: Story = {
  render: (args) => (
    <div>
      <div style={{ height: 3000 }} />
      <BackToTop {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('scroll'));
    await expect(canvas.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();

    window.scrollTo(0, 1000);
    window.dispatchEvent(new Event('scroll'));
    await expect(await canvas.findByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  },
};

/**
 * Clicking the button returns to the top of the page and, given a `targetId`, moves focus there
 * -- mirroring JumpLinks' scrollToJumpTarget (SPEC.md §5.19) rather than leaving focus wherever
 * the click happened to land. Stubs `scrollTo` so the assertion is deterministic regardless of
 * whether the browser animates smooth scrolling.
 */
export const ClickScrollsToTopAndFocusesTarget: Story = {
  render: (args) => (
    <div>
      <div style={{ height: 3000 }} />
      <h2 id="page-target" tabIndex={-1}>Page target</h2>
      <BackToTop {...args} targetId="page-target" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreScrollTo = installScrollToStub();

    try {
      window.scrollTo(0, 1000);
      const button = await canvas.findByRole('button', { name: 'Back to top' });
      await userEvent.click(button);
      await expect(window.scrollY).toBe(0);
      await expect(canvas.getByText('Page target')).toHaveFocus();
    } finally {
      restoreScrollTo();
    }
  },
};

export const ClickWithoutTargetKeepsFocusedButtonMounted: Story = {
  render: (args) => (
    <div>
      <div style={{ height: 3000 }} />
      <BackToTop {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreScrollTo = installScrollToStub();

    try {
      window.scrollTo(0, 1000);
      const button = await canvas.findByRole('button', { name: 'Back to top' });
      button.focus();
      await userEvent.keyboard('{Enter}');
      await expect(window.scrollY).toBe(0);
      await expect(button).toHaveFocus();
      await expect(button).toBeInTheDocument();
    } finally {
      restoreScrollTo();
    }
  },
};
