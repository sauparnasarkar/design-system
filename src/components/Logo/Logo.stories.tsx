import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';
import syenaMark from '../../assets/logos/syena-mark.png';

// Logo takes its brand mark/wordmark as props (no built-in default) so any consumer —
// including a white-label one — can pass their own. These stories demonstrate usage
// with Syena's own mark/wordmark, passed explicitly like any other consumer would.
const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    height: { control: { type: 'range', min: 16, max: 64, step: 4 } },
  },
  args: {
    markSrc: syenaMark,
    wordmark: 'Syena',
    height: 28,
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Playground: Story = {};

const ACCENTS: Array<{ label: string; accent?: string; accentColor?: string }> = [
  { label: 'default' },
  { label: 'green', accent: 'Green', accentColor: 'var(--__s9cmpx-color-teal-600, #187272)' },
  { label: 'blue', accent: 'Blue', accentColor: 'var(--__s9cmpx-color-blue-600, #1c5ece)' },
  { label: 'analytics', accent: 'Analytics', accentColor: '#1d84a3' },
];

export const AllAccents: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {ACCENTS.map(({ label, accent, accentColor }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="__s9cmpx-label3" style={{ width: 90, color: 'var(--__s9cmpx-static-text-weak)' }}>{label}</span>
          <Logo markSrc={syenaMark} wordmark="Syena" accent={accent} accentColor={accentColor} />
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="__s9cmpx-label3" style={{ width: 90, color: 'var(--__s9cmpx-static-text-weak)' }}>large</span>
        <Logo markSrc={syenaMark} wordmark="Syena" height={48} />
      </div>
    </div>
  ),
};
