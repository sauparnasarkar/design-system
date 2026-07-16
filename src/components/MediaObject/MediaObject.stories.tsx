import type { Meta, StoryObj } from '@storybook/react-vite';
import { MediaObject } from './MediaObject';

const meta: Meta<typeof MediaObject> = {
  title: 'Components/MediaObject',
  component: MediaObject,
  args: {
    title: 'Global Credit Outlook 2026 — Mid-Year Webinar',
    meta: 'Webinar • 42 min • 26 Jun 2026',
    imageSrc: 'https://picsum.photos/seed/webinar/440/248',
    tag: 'Webinar',
    withOverlay: false,
    vertical: false,
    figureSize: 220,
  },
};
export default meta;
type Story = StoryObj<typeof MediaObject>;

export const Playground: Story = {
  render: (args) => <MediaObject {...args} onClick={() => {}} />,
};

export const CardRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {[
        ['Syena on Vietnam 2026', 'Event • 12 Mar 2026', 'vietnam'],
        ['Gulf Transition & Sustainable Finance', 'Webinar • 38 min', 'gulf'],
        ['CLO Asset Manager Handbook', 'Podcast • 24 min', 'clo'],
      ].map(([t, m, seed]) => (
        <MediaObject
          key={t}
          title={t}
          meta={m}
          imageSrc={`https://picsum.photos/seed/${seed}/440/248`}
          tag={String(m).split(' • ')[0]}
          vertical
          onClick={() => {}}
        />
      ))}
    </div>
  ),
};
