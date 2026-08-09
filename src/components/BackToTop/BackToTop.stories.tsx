import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BackToTop } from './BackToTop';
import { scrollToJumpTarget } from '../JumpLinks/JumpLinks';

const meta: Meta<typeof BackToTop> = {
  title: 'Components/BackToTop',
  component: BackToTop,
  args: { threshold: 200 },
};
export default meta;
type Story = StoryObj<typeof BackToTop>;

let restoreReducedMotionStub: (() => void) | undefined;

function installReducedMotionStub() {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = originalMatchMedia;
  };
}

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
 * Regression test (SPEC.md §5.20 bug report): a JumpLinks click elsewhere on the same page (not
 * BackToTop's own button) navigates via Element.scrollIntoView, which doesn't reliably fire a
 * native 'scroll' event on window in every browser -- confirmed live, scrollY genuinely changed
 * with zero 'scroll' events observed. BackToTop's passive scroll listener must still notice and
 * become visible, which only works because scrollToJumpTarget itself now dispatches a synthetic
 * 'scroll' event after scrolling (fixed in JumpLinks.tsx, not in BackToTop -- BackToTop has no
 * special-case code for this at all).
 *
 * Caveat, confirmed by direct testing: this browser-mode test harness does not itself reproduce
 * the missing-'scroll'-event bug (a raw scrollIntoView call here fires real 'scroll' events
 * reliably), so this story passes whether or not the fix is present -- it documents the intended
 * behavior and guards against a future regression in scrollToJumpTarget's dispatch code, but the
 * bug itself was root-caused and the fix verified via a real browser session outside Storybook,
 * not through this test.
 */
export const BecomesVisibleAfterAJumpLinksNavigationElsewhere: Story = {
  render: (args) => (
    <div>
      <div style={{ height: 3000 }} />
      <h2 id="section-two" tabIndex={-1}>Section two</h2>
      <BackToTop {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('scroll'));
    await expect(canvas.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();

    // Simulates a JumpLinks click targeting a section far below -- BackToTop itself is never
    // clicked or involved in triggering this scroll.
    scrollToJumpTarget('section-two', { reduceMotion: true });
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
  beforeEach: async () => {
    restoreReducedMotionStub = installReducedMotionStub();
  },
  afterEach: async () => {
    restoreReducedMotionStub?.();
    restoreReducedMotionStub = undefined;
  },
  render: (args) => (
    <div>
      <h2 id="page-target" tabIndex={-1}>Page target</h2>
      <div style={{ height: 3000 }} />
      <BackToTop {...args} targetId="page-target" />
    </div>
  ),
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
 * Regression test (SPEC.md §5.20 sixth follow-up bug report, with screenshots): a JumpLinks
 * target near the end of a short page can leave a large scrollable gap below the real content --
 * the shortfall spacer scrollToJumpTarget uses to bring a target flush to the top is deliberately
 * never auto-removed (see its own comment), so that gap can persist well past the jump itself.
 * Reported directly: scrolling into that gap left the button rendering at its normal
 * viewport-anchored spot regardless, stranded deep inside the empty space, visibly detached from
 * (and appearing well below) the page's actual footer. With `avoidSelector` pointing at the
 * footer, the button's bottom edge must never render below the footer's top edge once the footer
 * has risen into view from below.
 */
export const DocksAboveAvoidedElementWhenScrolledPastIt: Story = {
  render: (args) => (
    <div>
      <div style={{ height: 3000 }} />
      {/* A unique selector, not the bare 'footer' tag -- this test harness doesn't unmount
          previous stories between play-function runs in the same file, so a generic tag selector
          could match an earlier story's own leftover footer instead of this one's. */}
      <footer data-avoid-target="docks-above" style={{ height: 80 }}>Page footer</footer>
      <BackToTop {...args} avoidSelector="[data-avoid-target='docks-above']" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Scrolls far enough that the footer is fully in view -- simulates scrolling into the gap a
    // shortfall spacer can leave below it.
    window.scrollTo(0, 3000);
    window.dispatchEvent(new Event('scroll'));
    const button = await canvas.findByRole('button', { name: 'Back to top' });
    const footer = canvasElement.querySelector('[data-avoid-target="docks-above"]') as HTMLElement;
    await expect(button.getBoundingClientRect().bottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top);
  },
};

/**
 * Companion to the test above: with the avoided element nowhere near the viewport yet, the button
 * must stay at its normal, viewport-anchored position -- `avoidSelector` only ever pulls the
 * button *up*, it never affects it while there's nothing to avoid on screen.
 */
export const DoesNotDockWhenAvoidedElementNotYetInView: Story = {
  render: (args) => (
    <div>
      <div style={{ height: 3000 }} />
      <footer data-avoid-target="not-yet-in-view" style={{ height: 80 }}>Page footer</footer>
      <div style={{ height: 3000 }} />
      <BackToTop {...args} avoidSelector="[data-avoid-target='not-yet-in-view']" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Past the visibility threshold, but the footer (well after another 3000px of content) is
    // nowhere near the viewport yet.
    window.scrollTo(0, 1000);
    window.dispatchEvent(new Event('scroll'));
    const button = await canvas.findByRole('button', { name: 'Back to top' });
    // Base position is 24px from the viewport's bottom edge -- some slack for the container's own
    // border-box/rounding, but nowhere near the size a real dock offset would produce.
    await expect(window.innerHeight - button.getBoundingClientRect().bottom).toBeLessThan(40);
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
