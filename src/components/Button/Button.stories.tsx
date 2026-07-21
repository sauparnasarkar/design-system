import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'ghost-blue', 'special', 'warning'] },
    size: { control: 'select', options: ['xs', 's', 'm', 'l', 'xl'] },
    iconLeft: { control: 'select', options: [undefined, 'download', 'search', 'check', 'external'] },
    iconRight: { control: 'select', options: [undefined, 'chevron-down', 'chevron-right', 'external'] },
  },
  args: {
    children: 'View Report',
    variant: 'primary',
    size: 'm',
    disabled: false,
    isLoading: false,
    fullWidth: false,
    fullRadius: false,
    iconOnly: false,
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['primary', 'secondary', 'ghost', 'ghost-blue', 'special', 'warning'] as const).map((v) => (
        <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="__s9cmpx-label3" style={{ width: 90, color: 'var(--__s9cmpx-static-text-weak)' }}>{v}</span>
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((s) => (
            <Button key={s} variant={v} size={s}>Download</Button>
          ))}
          <Button variant={v} disabled>Disabled</Button>
          <Button variant={v} iconLeft="download">With icon</Button>
          <Button variant={v} iconLeft="download" iconOnly aria-label="Download" />
        </div>
      ))}
    </div>
  ),
};
