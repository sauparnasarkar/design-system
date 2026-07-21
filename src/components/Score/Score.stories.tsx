import type { Meta, StoryObj } from '@storybook/react-vite';
import { Score } from './Score';

const meta: Meta<typeof Score> = {
  title: 'Components/Score',
  component: Score,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large', 'auto'] },
    value: { control: { type: 'range', min: 0, max: 5, step: 1 } },
  },
  args: {
    value: 2,
    max: 5,
    size: 'medium',
    vertical: false,
    showNumbers: true,
  },
};
export default meta;
type Story = StoryObj<typeof Score>;

export const Playground: Story = {};

export const AllValues: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 320 }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <div key={v}>
          <div className="__s9cmpx-label3" style={{ marginBottom: 4, color: 'var(--__s9cmpx-static-text-weak)' }}>
            ESG Entity Score: {v}
          </div>
          <Score value={v} />
        </div>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  args: { vertical: true, value: 3 },
};
