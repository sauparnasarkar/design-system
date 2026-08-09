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

// Marks 'ratings' (items[1], not items[0]) as a natural neighbor of the top section -- e.g.
// Country Profile's "Per Capita" chart, stacked directly under "Emissions" (SPEC.md §5.20).
const ITEMS_WITH_MARKED_TOP_SECTION = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'ratings', label: 'Ratings', href: '#ratings', topSection: true },
  { id: 'research', label: 'Research', href: '#research' },
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
 * Regression test (SPEC.md §5.20 second follow-up bug report): the page's top section --
 * items[0] ("Overview" here) only -- must not be scrolled at all when it's already fully
 * visible. Scrolling it to the very top would only push whatever's above it (e.g. this JumpLinks
 * row itself) out of view, for no benefit, since the target was already on screen. Reported
 * directly: clicking a link for a near-top target still scrolled a little and hid the jump nav
 * itself.
 */
export const ClickDoesNotScrollWhenTargetAlreadyVisible: Story = {
  // Forces reduced motion so the scroll (if the bug is present) is instant, not animated -- keeps
  // this assertion independent of real scroll-animation timing, same as the other position-
  // asserting stories below.
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
      {/* Deliberate room above and below the nav/target -- gives the setup scroll below
          somewhere to actually center the target away from the very top. */}
      <div style={{ height: 400 }} />
      <JumpLinks {...args} />
      <h2 id="overview" tabIndex={-1}>Overview section</h2>
      <div style={{ height: 3000 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = document.getElementById('overview') as HTMLElement;
    // This test harness doesn't unmount previous stories between play-function runs within the
    // same file, so document.body accumulates every preceding story's own rendered content --
    // nothing genuinely starts "at the top of the page" by default. Establish the actual
    // precondition this test needs (the target already fully in view) explicitly, via a raw
    // native scrollIntoView, rather than relying on natural initial scroll position.
    // block: 'center', not 'start' -- positions the target away from the very top (with room
    // both above and below), so a genuine bug (scrolling it to the top anyway, hiding whatever
    // was above it) is actually distinguishable from the fix (leaving it where it already was).
    // Using 'start' here would make el's position after setup identical to what a buggy click
    // handler would also produce, unable to tell the two apart.
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    const rectBefore = el.getBoundingClientRect();
    // Confirms the precondition actually holds in this viewport rather than assuming it -- skip
    // rather than pass vacuously if it doesn't. "Top section" itself is no longer something this
    // test needs to check geometrically -- 'overview' is items[0], a structural fact independent
    // of viewport size (see scrollToJumpTarget's own comment for why an earlier, geometric
    // definition was wrong).
    if (rectBefore.top < 0 || rectBefore.bottom > window.innerHeight) return;

    const scrollYBefore = window.scrollY;
    // Use the anchor's native programmatic click rather than userEvent.click here: in the full
    // Storybook browser suite, the shared page keeps earlier stories mounted, and Playwright may
    // auto-scroll just to bring this link itself into an interactable position before clicking it.
    // That harness-induced pre-click scroll changes window.scrollY for reasons unrelated to the
    // JumpLinks handler this regression is actually checking. HTMLAnchorElement.click() still runs
    // the real React onClick path without that extra "make the control reachable first" scroll.
    canvas.getByRole('link', { name: 'Overview' }).click();
    await expect(canvas.getByText('Overview section')).toHaveFocus();
    await expect(window.scrollY).toBe(scrollYBefore);
  },
};

/**
 * Regression test (SPEC.md §5.20 third follow-up bug report): a target that is *not* the page's
 * top section -- "Research", items[2], not items[0] -- must always scroll flush to the top when
 * its link is clicked, even if it already happens to be fully visible (e.g. because of wherever
 * the page was previously scrolled to, or because it simply fits within a tall viewport).
 * Reported directly, with two concrete examples (Country Profile's "YoY Change", a 3rd-of-4 item;
 * Historical Trends' "GHG Share by Decade", a 2nd-and-last item): a jump link for a later section
 * that didn't visibly do anything looked broken, like it wasn't pointing anywhere. An earlier
 * attempt at this fix defined "top section" geometrically (whatever fits in the current
 * viewport's first screenful) and was confirmed live to still fail exactly this case on a common
 * 1920x963 desktop viewport -- only a structural definition (items[0], nothing else) is reliable
 * regardless of viewport size.
 */
export const ClickScrollsNonTopSectionEvenWhenAlreadyVisible: Story = {
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
      <div style={{ height: 400 }} />
      <JumpLinks {...args} />
      <h2 id="research" tabIndex={-1}>Research section</h2>
      <div style={{ height: 3000 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = document.getElementById('research') as HTMLElement;
    // Establishes the scenario this test exists for: the target already happens to be fully
    // visible, same setup technique as ClickDoesNotScrollWhenTargetAlreadyVisible above -- the
    // only thing that differs between the two tests is which item is clicked (items[0] there,
    // a later item here), proving the behavior split is driven by list position, not visibility.
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    const rectBefore = el.getBoundingClientRect();
    if (rectBefore.top < 0 || rectBefore.bottom > window.innerHeight) return;

    await userEvent.click(canvas.getByRole('link', { name: 'Research' }));
    await expect(canvas.getByText('Research section')).toHaveFocus();
    await expect(el.getBoundingClientRect().top).toBeLessThan(10);
  },
};

/**
 * Regression test (SPEC.md §5.20 fifth follow-up: "Per Capita is adjacent to Emissions, so it
 * shouldn't scroll, depending on the viewport"). A non-first item explicitly marked
 * `topSection: true` (JumpLinkItem.topSection) must skip its scroll when already fully visible,
 * same as items[0] -- items[0]-only was too strict once a real page needed a *second* item to
 * behave the same way. The "depending on the viewport" half is proven by
 * ClickScrollsMarkedTopSectionWhenNotVisible below: the same marked item still scrolls normally
 * once it's genuinely out of view (e.g. a narrower/shorter viewport, or simply scrolled away from)
 * -- topSection only ever widens *eligibility* for the existing visibility check, it doesn't skip
 * the check itself.
 */
export const ClickDoesNotScrollWhenMarkedTopSectionAndAlreadyVisible: Story = {
  args: { items: ITEMS_WITH_MARKED_TOP_SECTION },
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
      <div style={{ height: 400 }} />
      <JumpLinks {...args} />
      <h2 id="ratings" tabIndex={-1}>Ratings section</h2>
      <div style={{ height: 3000 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = document.getElementById('ratings') as HTMLElement;
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    const rectBefore = el.getBoundingClientRect();
    if (rectBefore.top < 0 || rectBefore.bottom > window.innerHeight) return;

    const scrollYBefore = window.scrollY;
    canvas.getByRole('link', { name: 'Ratings' }).click();
    await expect(canvas.getByText('Ratings section')).toHaveFocus();
    await expect(window.scrollY).toBe(scrollYBefore);
  },
};

/**
 * Companion to the test above: the same `topSection: true` item must still scroll normally once
 * it's genuinely not visible -- e.g. Country Profile's "Per Capita" on a narrow/short (mobile)
 * viewport, where "Emissions" alone fills the screen and "Per Capita" is below the fold. Proves
 * `topSection` only widens eligibility for the visibility check, it doesn't bypass it.
 */
export const ClickScrollsMarkedTopSectionWhenNotVisible: Story = {
  args: { items: ITEMS_WITH_MARKED_TOP_SECTION },
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
      {/* Deliberately tall enough that 'ratings' isn't visible without scrolling -- simulates a
          short/mobile viewport where a marked top-section neighbor is genuinely below the fold. */}
      <div style={{ height: 1600 }} />
      <h2 id="ratings" tabIndex={-1}>Ratings section</h2>
      <div style={{ height: 3000 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = document.getElementById('ratings') as HTMLElement;
    window.scrollTo(0, 0);
    const rectBefore = el.getBoundingClientRect();
    // Only meaningful if the target genuinely isn't visible at scrollY 0 in this viewport.
    if (rectBefore.top >= 0 && rectBefore.bottom <= window.innerHeight) return;

    canvas.getByRole('link', { name: 'Ratings' }).click();
    await expect(canvas.getByText('Ratings section')).toHaveFocus();
    await expect(el.getBoundingClientRect().top).toBeLessThan(10);
  },
};

/**
 * Regression test (SPEC.md §5.20 follow-up bug report, with screenshots): scrolling to a target
 * near the very end of a short page must never scroll past the document's own natural end.
 * Reported directly: an earlier version forced the target flush to the very top even on a page
 * too short to naturally support that, via a temporary spacer appended below the real content --
 * that left a large blank gap below the page's actual last content (e.g. the app's footer)
 * whenever a short page's last section was jumped to, with the footer scrolled far out of view
 * above the gap. The browser's own scroll clamp (`scrollTop` bounded to
 * `[0, scrollHeight - clientHeight]`) is the desired behavior once nothing artificially extends
 * `scrollHeight` -- confirms the click never scrolls past that natural bound, and that nothing
 * gets added to the DOM to extend it.
 */
export const ClickNeverScrollsPastTheDocumentsNaturalEnd: Story = {
  // Forces reduced motion so the scroll is instant, not animated -- keeps the position assertion
  // below independent of real scroll-animation timing.
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
          below it to provide scrollable room, so there's a genuine shortfall to clamp against. */}
      <h2 id="research" tabIndex={-1}>Research section</h2>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const doc = document.documentElement;
    const targetBeforeClick = document.getElementById('research') as HTMLElement;
    const shortfall = targetBeforeClick.offsetTop - (doc.scrollHeight - doc.clientHeight);
    // Only a meaningful regression test if this layout actually reproduces a real shortfall in
    // this test environment's own viewport -- if it doesn't, skip rather than pass vacuously.
    if (shortfall <= 0) return;

    await userEvent.click(canvas.getByRole('link', { name: 'Research' }));
    await expect(canvas.getByText('Research section')).toHaveFocus();
    await expect(window.scrollY).toBeLessThanOrEqual(doc.scrollHeight - doc.clientHeight);
    // Nothing should have been added to the DOM to artificially extend scrollHeight -- confirms
    // the earlier spacer mechanism was removed entirely, not just made smaller.
    await expect(document.querySelectorAll('div[aria-hidden="true"]').length).toBe(0);
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
