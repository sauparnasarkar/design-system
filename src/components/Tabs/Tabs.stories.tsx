import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs } from './Tabs';

const SECTOR_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'issuers', label: 'Issuers' },
  { id: 'research', label: 'Research' },
  { id: 'ratings', label: 'Ratings Research' },
  { id: 'insights', label: 'Insights' },
];

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'chips'] },
    size: { control: 'select', options: ['small', 'large'] },
  },
  args: {
    items: SECTOR_TABS,
    variant: 'primary',
    size: 'large',
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const issuers = canvas.getByRole('tab', { name: 'Issuers' });
    const insights = canvas.getByRole('tab', { name: 'Insights' });

    // Roving tabindex: only the active tab is in the Tab order.
    await expect(overview).toHaveAttribute('tabindex', '0');
    await expect(issuers).toHaveAttribute('tabindex', '-1');

    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(issuers).toHaveFocus();
    await expect(issuers).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('tabindex', '-1');

    await userEvent.keyboard('{End}');
    await expect(insights).toHaveFocus();
    await expect(insights).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Home}');
    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute('aria-selected', 'true');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['primary', 'secondary', 'tertiary', 'chips'] as const).map((v) => (
        <div key={v}>
          <div className="__s9cmpx-label3" style={{ marginBottom: 8, color: 'var(--__s9cmpx-static-text-weak)' }}>{v}</div>
          <Tabs items={SECTOR_TABS} variant={v} />
        </div>
      ))}
    </div>
  ),
};
