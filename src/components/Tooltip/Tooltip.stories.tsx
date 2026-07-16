import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    variant: { control: 'select', options: ['dark', 'light', 'alert', 'warning', 'hint'] },
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
  },
  args: {
    label: 'Long-Term Issuer Default Rating',
    variant: 'dark',
    placement: 'top',
  },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}>
      <Tooltip {...args}>
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ padding: 80, display: 'flex', gap: 24, justifyContent: 'center' }}>
      {(['dark', 'light', 'alert', 'warning', 'hint'] as const).map((v) => (
        <Tooltip
          key={v}
          variant={v}
          header="IDR"
          label="Long-Term Issuer Default Rating"
          description="As of 04 Jun 2026"
        >
          <Button variant="secondary" size="s">{v}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};
