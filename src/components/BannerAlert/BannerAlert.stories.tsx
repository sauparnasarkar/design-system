import type { Meta, StoryObj } from '@storybook/react-vite';
import { BannerAlert } from './BannerAlert';

const meta: Meta<typeof BannerAlert> = {
  title: 'Components/BannerAlert',
  component: BannerAlert,
  argTypes: {
    variant: { control: 'select', options: ['info', 'neutral', 'success', 'warning', 'error'] },
  },
  args: {
    children: 'Compendium of Rating Actions Following Publication of Updated Bank Rating Criteria',
    variant: 'info',
    withBorder: false,
  },
};
export default meta;
type Story = StoryObj<typeof BannerAlert>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['info', 'neutral', 'success', 'warning', 'error'] as const).map((v) => (
        <BannerAlert key={v} variant={v} onClose={() => {}}>
          {v.charAt(0).toUpperCase() + v.slice(1)} banner message shown across the top of the page.
        </BannerAlert>
      ))}
    </div>
  ),
};
