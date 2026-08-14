import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SidebarNav } from './SidebarNav';

const meta: Meta<typeof SidebarNav> = {
  title: 'Shell/SidebarNav',
  component: SidebarNav,
  parameters: { layout: 'fullscreen' },
  args: {
    items: [
      { id: 'home', label: 'Home', icon: 'home', active: true },
      { id: 'reports', label: 'Reports', icon: 'document' },
      { id: 'entities', label: 'Entities', icon: 'user' },
      { id: 'instruments', label: 'Instruments', icon: 'grid' },
      { id: 'methodologies', label: 'Methodologies', icon: 'document' },
      { id: 'whats-new', label: "What's New", icon: 'bell' },
    ],
    footerItems: [{ id: 'support', label: 'Customer Support', icon: 'info', hasFlyout: true }],
    open: undefined,
  },
};
export default meta;
type Story = StoryObj<typeof SidebarNav>;

export const Playground: Story = {};

export const BlueThemeNavigation: Story = {
  args: {
    items: [
      { id: 'home', label: 'Home', icon: 'home', active: true },
      { id: 'geo', label: 'Geographies', icon: 'grid', hasFlyout: true },
      { id: 'industries', label: 'Services & Industries', icon: 'grid', hasFlyout: true },
      { id: 'topics', label: 'Topics', icon: 'document', hasFlyout: true },
      { id: 'search', label: 'Advanced Search', icon: 'search' },
      { id: 'export', label: 'Bulk Data Export', icon: 'download' },
      { id: 'risk', label: 'Risk Indices', icon: 'warning', hasFlyout: true },
      { id: 'projects', label: 'Project Data', icon: 'grid', hasFlyout: true },
      { id: 'webinars', label: 'Webinars', icon: 'external' },
    ],
    footerItems: [{ id: 'support', label: 'Customer Support', icon: 'info', hasFlyout: true }],
  },
};

export const WithPersistentAction: Story = {
  args: {
    persistentAction: { icon: 'sparkle', label: 'Ask the Agent', onClick: fn(), active: false },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const actionButton = canvas.getByRole('button', { name: 'Ask the Agent' });

    // Visible and labeled while expanded (default open state on desktop).
    await expect(actionButton).toBeInTheDocument();
    await expect(canvas.getByText('Ask the Agent')).toBeInTheDocument();

    await userEvent.click(actionButton);
    await expect(args.persistentAction?.onClick).toHaveBeenCalledTimes(1);

    // Collapsing the rail must not remove the action -- it's meant to be reachable regardless
    // of expanded/collapsed state, unlike a regular nav item (which becomes icon-only here too,
    // but the point of this prop is that it's never gated behind `open` the way the whole nav
    // list effectively is when collapsed to icons).
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle Menu' }));
    await expect(canvas.getByRole('button', { name: 'Ask the Agent' })).toBeInTheDocument();
  },
};

export const PersistentActionActiveState: Story = {
  args: {
    persistentAction: { icon: 'sparkle', label: 'Ask the Agent', onClick: fn(), active: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const actionButton = canvas.getByRole('button', { name: 'Ask the Agent' });
    // Reuses the real sidebar-item-button--active class (same one a regular active nav item
    // gets), not a one-off style, so this is a real assertion on shared behavior, not just a
    // className string match.
    await expect(actionButton.className).toContain('__s9cmpx-sidebar-nav__sidebar-item-button--active');
  },
};

export const LabeledGroups: Story = {
  args: {
    items: undefined,
    groups: [
      {
        label: 'Exploration',
        items: [
          { id: 'overview', label: 'Overview', icon: 'home', active: true },
          { id: 'historical', label: 'Historical Trends', icon: 'grid' },
          { id: 'profile', label: 'Country Profile', icon: 'user' },
          { id: 'explorer', label: 'Data Explorer', icon: 'document' },
        ],
      },
      {
        label: 'Projection',
        items: [
          { id: 'forecasts', label: 'Forecasts', icon: 'grid' },
          { id: 'scenarios', label: 'Scenario Comparison', icon: 'document' },
        ],
      },
    ],
    footerItems: [{ id: 'about', label: 'About', icon: 'info' }],
  },
};
