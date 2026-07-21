import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { NestedMultiSelect } from './NestedMultiSelect';

const GROUPS = [
  {
    value: 'emea',
    label: 'EMEA',
    children: [
      { value: 'uk', label: 'United Kingdom' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
      { value: 'sa', label: 'Saudi Arabia' },
    ],
  },
  {
    value: 'apac',
    label: 'APAC',
    children: [
      { value: 'cn', label: 'China (Mainland)' },
      { value: 'jp', label: 'Japan' },
      { value: 'vn', label: 'Vietnam' },
    ],
  },
  {
    value: 'americas',
    label: 'Americas',
    children: [
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' },
      { value: 'mx', label: 'Mexico', disabled: true },
    ],
  },
];

const meta: Meta<typeof NestedMultiSelect> = {
  title: 'Components/NestedMultiSelect',
  component: NestedMultiSelect,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    groups: GROUPS,
    label: 'Geography',
    placeholder: 'Filter by geography',
    size: 'medium',
    error: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof NestedMultiSelect>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 440 }}>
      <NestedMultiSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox');
    await userEvent.click(control);

    // Lands on the first group row (EMEA), collapsed, on open.
    const emea = canvas.getByRole('treeitem', { name: /EMEA/ });
    await expect(control).toHaveAttribute('aria-activedescendant', emea.id);
    await expect(emea).toHaveAttribute('aria-expanded', 'false');

    // ArrowRight on a collapsed group expands it in place (activedescendant stays put).
    await userEvent.keyboard('{ArrowRight}');
    await expect(emea).toHaveAttribute('aria-expanded', 'true');
    await expect(control).toHaveAttribute('aria-activedescendant', emea.id);

    // ArrowRight again, now that it's expanded, moves into its first child.
    await userEvent.keyboard('{ArrowRight}');
    const uk = canvas.getByRole('treeitem', { name: 'United Kingdom' });
    await expect(control).toHaveAttribute('aria-activedescendant', uk.id);

    // Enter toggles the highlighted child into the selection without closing the tree.
    await userEvent.keyboard('{Enter}');
    await expect(uk).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tree')).toBeInTheDocument();

    // ArrowLeft from a child moves back up to its parent group…
    await userEvent.keyboard('{ArrowLeft}');
    await expect(control).toHaveAttribute('aria-activedescendant', emea.id);
    // …and ArrowLeft again, now on an expanded group, collapses it.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(emea).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('treeitem', { name: 'United Kingdom' })).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('tree')).not.toBeInTheDocument();
  },
};
