import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './Section';
import { Tile } from '../Tile/Tile';

const meta: Meta<typeof Section> = {
  title: 'Components/Section',
  component: Section,
  argTypes: {
    gap: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    padding: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    horizontalAlign: { control: 'select', options: [undefined, 'start', 'center', 'end'] },
  },
  args: { row: true, gap: 'md', padding: 'md', fluid: false },
};
export default meta;
type Story = StoryObj<typeof Section>;

export const Playground: Story = {
  render: (args) => (
    <Section {...args}>
      {['3M Data Points', '116k Records', '938 Fields'].map((t) => (
        <Tile key={t} secondary>
          <span className="__s9cmpx-label2">{t}</span>
        </Tile>
      ))}
    </Section>
  ),
};
