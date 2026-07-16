import type { Meta, StoryObj } from '@storybook/react-vite';
import { News } from './News';

const meta: Meta<typeof News> = {
  title: 'Components/News',
  component: News,
  args: {
    title: 'Global Credit Outlook 2026 - Mid-Year Update',
    description:
      'Global credit conditions have weakened after the US-Iran war oil shock, yet overall resilience persists across most rated portfolios. Sovereign and corporate outlooks reflect higher inflation and squeezed real wages.',
    status: ['Syena Primary', 'Outlook', 'Cross-Sector', 'Global', '26 Jun 2026'],
    imageSrc: 'https://picsum.photos/seed/syena/280/280',
    descriptionLines: 3,
  },
};
export default meta;
type Story = StoryObj<typeof News>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <News {...args} onClick={() => {}} />
    </div>
  ),
};

export const HeadlinesOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        ['Global Economic Outlook - June 2026', '04 Jun 2026'],
        ['Global Sovereigns Mid-Year Outlook 2026', '08 Jun 2026'],
        ["Emerging Market Sovereigns' Use of Total Return Swaps Raises Risks", '19 Jun 2026'],
      ].map(([t, d]) => (
        <News key={t} title={t} status={['Syena Primary', 'Special Report', d]} onClick={() => {}} />
      ))}
    </div>
  ),
};
