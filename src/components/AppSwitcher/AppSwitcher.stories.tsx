import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AppSwitcher } from './AppSwitcher';
import syenaMark from '../../assets/logos/syena-mark.png';

// `.click()`, `userEvent.click()`, AND a plain `dispatchEvent(new MouseEvent('click', ...))`
// all turned out to trigger a REAL anchor navigation in this real-browser (not jsdom) test
// runner when the click isn't prevented -- and a bare `#fragment` href changes the CURRENT
// page's own location.hash, which collides with Storybook's own hash-based routing of which
// story is displayed. Confirmed live, isolated one dispatch at a time: any of the three crashed
// the whole test run ("Browser connection was closed... was the page closed unexpectedly") the
// moment a click's default action wasn't prevented and the hash actually changed -- dispatch
// method didn't matter, only whether the click ended up prevented.
//
// `dispatchClick` reads the real `event.defaultPrevented` the component's own handler produced
// (used by the noPermission regression below, where the fix means it's already always
// prevented -- confirmed safe). `dispatchClickWithoutNavigating` additionally adds its OWN
// capture-phase preventDefault before dispatching, for a click whose real navigation this test
// doesn't care about one way or the other (the "allowed" tile below, which correctly does NOT
// call preventDefault on its own) -- masks `defaultPrevented` itself, so never use it where the
// test's own point is to check whether the component prevented default.
function dispatchClick(el: HTMLElement): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
}

function dispatchClickWithoutNavigating(el: HTMLElement): MouseEvent {
  const suppressNavigation = (e: Event) => e.preventDefault();
  el.addEventListener('click', suppressNavigation, { capture: true, once: true });
  return dispatchClick(el);
}

const meta: Meta<typeof AppSwitcher> = {
  title: 'Shell/AppSwitcher',
  component: AppSwitcher,
  args: {
    apps: [
      { id: 'default', markSrc: syenaMark, wordmark: 'Syena', name: 'Syena Primary' },
      { id: 'green', markSrc: syenaMark, wordmark: 'Syena', accent: 'Green', accentColor: '#0f5c5c', name: 'Syena Green' },
      { id: 'blue', markSrc: syenaMark, wordmark: 'Syena', accent: 'Blue', accentColor: 'var(--__s9cmpx-color-blue-600, #1c5ece)', name: 'Syena Blue' },
      // href set deliberately (unlike a bare noPermission tile with no href) -- this is the
      // exact shape two rounds of Copilot review on this component's own PR flagged real gaps
      // in: first, the click handler only called preventDefault when href was MISSING; then,
      // even after that was fixed, the anchor's own href attribute still carried this real URL,
      // reachable via "open in new tab"/"copy link address"/middle-click -- none of which ever
      // fire a 'click' event at all, so no onClick-based fix alone could ever close that gap.
      { id: 'connect', markSrc: syenaMark, wordmark: 'Syena', name: 'Syena Premium', noPermission: true, href: '#restricted' },
    ],
    message: 'You do not have access to Apps shown in gray. Contact Syena Systems for access.',
    tileSize: 'default',
  },
};
export default meta;
type Story = StoryObj<typeof AppSwitcher>;

export const Playground: Story = {
  render: (args) => <AppSwitcher {...args} onClose={() => {}} />,
  play: async ({ canvasElement, args }) => {
    // Regression guard for design-system#1: AppSwitcher used to hardcode the old
    // LogoProduct enum into AppSwitcherApp; it must now render each app's own
    // per-app markSrc/wordmark/name via the generic Logo props, not a shared default.
    const tiles = canvasElement.querySelectorAll('.__s9cmpx-app-launcher-tile');
    await expect(tiles).toHaveLength(args.apps!.length);
    for (const app of args.apps!) {
      await expect(canvasElement).toHaveTextContent(app.name);
    }
    const images = canvasElement.querySelectorAll('.__s9cmpx-app-launcher-tile img');
    await expect(images).toHaveLength(args.apps!.length);

    // Regression guard for both Copilot-flagged noPermission+href gaps above. Selected by the
    // no-permission class, not by its own configured href -- the real fix means that href is
    // never actually rendered on the tile at all, so selecting by it would find nothing.
    const noPermissionTile = canvasElement.querySelector('.__s9cmpx-app-launcher-tile--no-permission') as HTMLAnchorElement;
    // The href-exposure gap: the rendered anchor must never carry the app's own real href,
    // regardless of what was configured -- this is what actually closes "open in new tab"/
    // "copy link address"/middle-click, none of which a click-handler fix alone can reach.
    await expect(noPermissionTile.getAttribute('href')).toBe('#');
    // The earlier, already-fixed click-handler gap: still verified directly (defense in depth,
    // and this handler is also what stops a bare '#' from jumping the page to its own top).
    const clickEvent = dispatchClick(noPermissionTile);
    await expect(clickEvent.defaultPrevented).toBe(true);
  },
};

export const NoPermissionBlocksNavigation: Story = {
  args: {
    apps: [
      { id: 'allowed', markSrc: syenaMark, name: 'Allowed App', href: '#allowed' },
      { id: 'restricted', markSrc: syenaMark, name: 'Restricted App', href: '#restricted', noPermission: true },
    ],
    onAppClick: fn(),
  },
  render: (args) => <AppSwitcher {...args} onClose={() => {}} />,
  play: async ({ canvasElement, args }) => {
    const onAppClick = args.onAppClick!;

    // Selected by the no-permission class (see the Playground story's own comment above for
    // why, not by its own configured href).
    const restrictedTile = canvasElement.querySelector('.__s9cmpx-app-launcher-tile--no-permission') as HTMLAnchorElement;
    await expect(restrictedTile.getAttribute('href')).toBe('#');
    const restrictedClickEvent = dispatchClick(restrictedTile);
    await expect(restrictedClickEvent.defaultPrevented).toBe(true);
    await expect(onAppClick).not.toHaveBeenCalled();

    // The allowed tile correctly keeps its real href and does NOT call preventDefault on its
    // own real click -- this test only cares whether onAppClick fired with the right id, not
    // the navigation itself, so it uses dispatchClickWithoutNavigating to keep that real
    // navigation from ever reaching the browser (see that helper's own comment above for why).
    const allowedTile = canvasElement.querySelector('a[href="#allowed"]') as HTMLAnchorElement;
    dispatchClickWithoutNavigating(allowedTile);
    await expect(onAppClick).toHaveBeenCalledWith('allowed');
  },
};
