import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from './Tile';

const meta: Meta<typeof Tile> = {
  title: 'Components/Tile',
  component: Tile,
  argTypes: {
    size: { control: 'select', options: ['none', 'small', 'medium', 'default'] },
  },
  args: {
    size: 'default',
    secondary: false,
    interactive: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof Tile>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Tile {...args}>
        <div>
          <div className="sy-headline7">3M</div>
          <div className="sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>Data Points</div>
        </div>
      </Tile>
    </div>
  ),
};

export const StatRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, maxWidth: 560 }}>
      {[['3M', 'Data Points'], ['116k', 'Records'], ['938', 'Fields']].map(([v, l]) => (
        <Tile key={l} secondary interactive>
          <div>
            <div className="sy-headline5">{v}</div>
            <div className="sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>{l}</div>
          </div>
        </Tile>
      ))}
    </div>
  ),
};
