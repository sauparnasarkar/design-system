import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardCarousel } from './CardCarousel';
import { MediaObject } from '../MediaObject/MediaObject';
import { Tag } from '../Tag/Tag';

const TOOLS = [
  ['Scorecards', "Landing page for Syena's web-based scorecards.", 'Tools'],
  ['Syena U.S. Distressed and Default Monitor', 'Monthly Digest of Migrating, Defaulted and Distressed Credits', 'Data'],
  ['European Corporates Distressed', 'Monthly Digest of Migrating, Defaulted and Distressed Credits', 'Data'],
  ['2025 Transition and Default Studies', 'View historical changes to ratings across geographies.', 'Data'],
  ['Corporates Recovery Tool', 'Guide for applying the Corporates Recovery Ratings.', 'Tools'],
  ['Global Government-Related Entities', 'GRE Data Comparator', 'Data'],
  ['Sensitivity Monitor', 'Leverage-based rating trends for a portfolio of issuers.', 'Tools'],
];

const meta: Meta<typeof CardCarousel> = {
  title: 'Components/CardCarousel',
  component: CardCarousel,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof CardCarousel>;

export const RelatedToolsAndData: Story = {
  render: () => (
    <CardCarousel title="Related Tools & Data" subtitle={`${TOOLS.length} results`} perPage={5}>
      {TOOLS.map(([title, desc, tag], i) => (
        <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <MediaObject
            title={title}
            meta={desc}
            imageSrc={`https://picsum.photos/seed/tool${i}/440/248`}
            vertical
            figureSize={220}
            onClick={() => {}}
          />
          <Tag size="small" color={tag === 'Data' ? 'red' : 'blue'}>{tag}</Tag>
        </div>
      ))}
    </CardCarousel>
  ),
};
