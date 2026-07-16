import type { Meta, StoryObj } from '@storybook/react-vite';
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
