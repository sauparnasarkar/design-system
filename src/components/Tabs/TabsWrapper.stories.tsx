import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabsWrapper } from './TabsWrapper';

const MANY_TABS = [
  'Overview', 'Issuers', 'Research', 'Ratings Research', 'Insights', 'Economics',
  'Corporates', 'Sovereigns', 'Financial Institutions', 'Structured Finance',
  'U.S. Public Finance', 'Infrastructure', 'International Public Finance',
  'Insurance', 'Funds',
].map((label) => ({ id: label.toLowerCase().replace(/\W+/g, '-'), label }));

const meta: Meta<typeof TabsWrapper> = {
  title: 'Components/TabsWrapper',
  component: TabsWrapper,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'chips'] },
    size: { control: 'select', options: ['small', 'large'] },
  },
  args: {
    items: MANY_TABS,
    variant: 'primary',
    size: 'large',
    scrollStep: 240,
  },
};
export default meta;
type Story = StoryObj<typeof TabsWrapper>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <TabsWrapper {...args} />
    </div>
  ),
};
