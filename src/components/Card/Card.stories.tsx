import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader } from './Card';
import { Button } from '../Button/Button';
import { Tag } from '../Tag/Tag';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    padding: { control: 'select', options: ['medium', 'large', 'mixed', 'inner-card'] },
  },
  args: {
    withBorder: true,
    withShadow: false,
    fullHeight: false,
    padding: 'medium',
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Card
        {...args}
        header={
          <CardHeader
            title="Recent Research"
            supportText="Updated 5 minutes ago"
            actions={<Button variant="secondary" size="s" iconLeft="download">Download Selected</Button>}
          />
        }
      >
        <p className="sy-body3-long">
          Global credit conditions have weakened after the oil shock, yet overall resilience
          persists across most rated portfolios.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Tag size="small">Outlook</Tag>
          <Tag size="small">Cross-Sector</Tag>
          <Tag size="small">Global</Tag>
        </div>
      </Card>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Card
        withShadow
        header={<CardHeader title="Primary Market Review" size="small" />}
        footer={<Button variant="ghost-blue" size="s" iconRight="chevron-right">View All</Button>}
      >
        <p className="sy-body3-long">
          High-level research reports on labelled bonds published within a few hours of announcement.
        </p>
      </Card>
    </div>
  ),
};
