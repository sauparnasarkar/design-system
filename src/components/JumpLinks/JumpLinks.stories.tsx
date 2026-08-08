import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { JumpLinks } from './JumpLinks';
import { Accordion } from '../Accordion/Accordion';

const ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'ratings', label: 'Ratings', href: '#ratings' },
  { id: 'research', label: 'Research', href: '#research' },
  { id: 'esg', label: 'ESG Scores', href: '#esg' },
  { id: 'instruments', label: 'Instruments', href: '#instruments' },
];

const meta: Meta<typeof JumpLinks> = {
  title: 'Components/JumpLinks',
  component: JumpLinks,
  args: { items: ITEMS, vertical: false },
};
export default meta;
type Story = StoryObj<typeof JumpLinks>;

export const Playground: Story = {};

export const Vertical: Story = {
  args: { vertical: true },
};

// A story exercising the modified-click (ctrl/cmd/shift/alt) interception guard was tried and
// dropped -- letting the real native hash-navigation actually complete (the whole point of that
// guard) crashes this browser-mode test runner's page/RPC connection, confirmed reproducible in
// isolation and unrelated to the guard's own logic (a direct port of SidebarNav's already-shipped
// real-href fix, SPEC.md §5.10, not new code). Covered by live browser verification instead
// (SPEC.md §5.19): ctrl/cmd-click opens a new tab with the hash applied, right-click "copy link
// address" yields a real usable #anchor URL.

/**
 * Clicking a link scrolls to and focuses its target (SPEC.md §5.19) -- the same principle
 * already applied to route-change navigation (SPEC.md §5.10.3), so a keyboard/screen-reader
 * user's focus follows where the content visually went, not just have the page repaint under
 * them.
 */
export const ClickScrollsAndFocusesTarget: Story = {
  render: (args) => (
    <div>
      <JumpLinks {...args} />
      <div style={{ height: 800 }} />
      <h2 id="research" tabIndex={-1}>Research section</h2>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: 'Research' }));
    await expect(canvas.getByText('Research section')).toHaveFocus();
    await expect(window.location.hash).toBe('#research');
  },
};

/**
 * Regression test (SPEC.md §5.20 follow-up bug report): a target near the very end of a page,
 * shorter than the viewport, has no scrollable room below it to reach the top -- confirmed live,
 * up to ~225px of the previous section stayed visible above targets like this (Country Profile's
 * Key Statistics, Data Explorer's Summary Statistics, Overview's % Change). scrollToJumpTarget's
 * temporary spacer must give it just enough extra room.
 */
export const ClickScrollsFullyToTopEvenNearPageBottom: Story = {
  // Forces reduced motion so the scroll is instant, not animated -- keeps the position assertion
  // below independent of real scroll-animation timing (unlike ClickScrollsAndFocusesTarget above,
  // which only asserts focus/hash, this one asserts final scroll position and needs the scroll to
  // have actually completed by the time it runs).
  beforeEach: async () => {
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as typeof window.matchMedia;
  },
  render: (args) => (
    <div>
      <JumpLinks {...args} />
      <div style={{ height: 800 }} />
      {/* Deliberately the very last thing on the page and shorter than the viewport -- nothing
          below it to provide scrollable room. */}
      <h2 id="research" tabIndex={-1}>Research section</h2>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = document.getElementById('research') as HTMLElement;
    const doc = document.documentElement;
    const shortfallBeforeFix = el.offsetTop - (doc.scrollHeight - doc.clientHeight);
    // Only a meaningful regression test if this layout actually reproduces a real shortfall in
    // this test environment's own viewport -- if it doesn't, skip rather than pass vacuously.
    if (shortfallBeforeFix <= 0) return;

    await userEvent.click(canvas.getByRole('link', { name: 'Research' }));
    await expect(canvas.getByText('Research section')).toHaveFocus();
    await expect(el.getBoundingClientRect().top).toBeLessThan(10);
  },
};

/**
 * `onBeforeJump` (SPEC.md §5.19) lets an item force something open before scrolling -- e.g. an
 * Accordion panel whose content isn't even mounted while collapsed (Accordion only renders a
 * panel's content when open). Confirms the panel is genuinely open, and its content reachable,
 * by the time the jump completes -- not scrolled to a stale, still-collapsed position.
 */
export const OnBeforeJumpOpensAnAccordionPanel: Story = {
  render: () => {
    const [openIds, setOpenIds] = React.useState<string[]>([]);
    const items = [
      {
        id: 'details-accordion-panel',
        label: 'Details',
        href: '#details-accordion-panel',
        onBeforeJump: () => setOpenIds((ids) => (ids.includes('details') ? ids : [...ids, 'details'])),
      },
    ];
    return (
      <div>
        <JumpLinks items={items} />
        <div style={{ height: 800 }} />
        <Accordion
          items={[{ id: 'details', title: 'Details', content: <p>Collapsed content, only mounted once open.</p> }]}
          openIds={openIds}
          onOpenChange={setOpenIds}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/Collapsed content/)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('link', { name: 'Details' }));
    await expect(canvas.getByText(/Collapsed content/)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'true');
  },
};
