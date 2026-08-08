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

// Forces window.scrollTo to apply synchronously (behavior: 'auto') and fire a real 'scroll'
// event -- only needed for the no-targetId fallback path below, which calls window.scrollTo
// directly. The targetId path (the one this app actually uses) goes through scrollToJumpTarget's
// Element.scrollIntoView instead, confirmed live to behave reliably with 'auto'/instant behavior
// regardless of this stub.
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
 * Clicking the button scrolls `targetId` into view and focuses it (via scrollToJumpTarget,
 * JumpLinks, SPEC.md §5.19) rather than leaving focus wherever the click happened to land --
 * lands wherever that element sits (e.g. an app's <main> landmark near the top of the page), not
 * necessarily window.scrollY === 0 itself. Forces reduced motion before mount so the scroll is
 * instant, not animated -- keeps this assertion independent of real scroll-animation timing.
 */
export const ClickScrollsToTargetAndFocusesIt: Story = {
  render: (args) => {
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as typeof window.matchMedia;
    return (
      <div>
        <h2 id="page-target" tabIndex={-1}>Page target</h2>
        <div style={{ height: 3000 }} />
        <BackToTop {...args} targetId="page-target" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    window.scrollTo(0, 1000);
    window.dispatchEvent(new Event('scroll'));
    const button = await canvas.findByRole('button', { name: 'Back to top' });

    await userEvent.click(button);
    await expect(canvas.getByText('Page target')).toHaveFocus();
    await expect(document.getElementById('page-target')?.getBoundingClientRect().top).toBeLessThan(10);
  },
};

/**
 * Activating the button via keyboard (not just a mouse click) and landing back near the top --
 * past the visibility threshold -- must not unmount the button while it still holds focus, or a
 * keyboard user's focus silently drops into the void. `focusWithin` keeps it mounted for exactly
 * that case, confirmed here with the no-targetId fallback path (a plain instant
 * window.scrollTo(0, 0), stubbed synchronous via installScrollToStub for a deterministic
 * assertion) since it reliably crosses back below the threshold.
 */
export const KeyboardActivationKeepsFocusedButtonMounted: Story = {
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
