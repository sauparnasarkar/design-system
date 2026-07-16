import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarNavFlyout } from './SidebarNavFlyout';

const meta: Meta<typeof SidebarNavFlyout> = {
  title: 'Shell/SidebarNavFlyout',
  component: SidebarNavFlyout,
  args: {
    title: 'Geographies',
    columns: [
      {
        title: 'Regions',
        items: [
          { id: 'glbl', label: 'Global' },
          { id: 'aspc', label: 'Asia-Pacific' },
          { id: 'eur', label: 'Europe' },
          { id: 'latam', label: 'Latin America' },
          { id: 'mena', label: 'Middle East & North Africa' },
          { id: 'ssa', label: 'Sub-Saharan Africa' },
        ],
      },
      {
        title: 'Popular',
        items: [
          { id: 'us', label: 'United States' },
          { id: 'cn', label: 'China (Mainland)' },
          { id: 'de', label: 'Germany' },
          { id: 'br', label: 'Brazil' },
        ],
      },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof SidebarNavFlyout>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <SidebarNavFlyout {...args} />
    </div>
  ),
};
