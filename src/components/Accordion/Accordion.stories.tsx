import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    iconPosition: { control: 'select', options: ['left', 'right'] },
    size: { control: 'select', options: ['s', 'l'] },
  },
  args: {
    iconPosition: 'right',
    size: 'l',
    multiple: false,
    items: [
      { id: '1', title: 'Sector', content: 'Corporates, Sovereigns, Financial Institutions, Structured Finance…' },
      { id: '2', title: 'Geography', content: 'Global, EMEA, APAC, Americas…' },
      { id: '3', title: 'Report Type', content: 'Outlook, Rating Action, Special Report, Criteria…' },
      { id: '4', title: 'Disabled Section', content: '—', disabled: true },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sector = canvas.getByRole('button', { name: 'Sector' });
    const geography = canvas.getByRole('button', { name: 'Geography' });
    await expect(sector).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(sector);
    await expect(sector).toHaveAttribute('aria-expanded', 'true');
    // Presence (not toBeVisible) — the panel has a CSS fade-in animation that starts at
    // opacity: 0, so asserting visibility immediately after the click races the animation.
    await expect(canvas.getByText(/Corporates, Sovereigns/)).toBeInTheDocument();

    // Single-open mode (multiple: false): opening a second item collapses the first.
    await userEvent.click(geography);
    await expect(geography).toHaveAttribute('aria-expanded', 'true');
    await expect(sector).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/Corporates, Sovereigns/)).not.toBeInTheDocument();

    await userEvent.click(geography);
    await expect(geography).toHaveAttribute('aria-expanded', 'false');
  },
};

export const MultipleOpen: Story = {
  args: { multiple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sector = canvas.getByRole('button', { name: 'Sector' });
    const geography = canvas.getByRole('button', { name: 'Geography' });

    await userEvent.click(sector);
    await userEvent.click(geography);
    // With multiple: true, opening a second item must not collapse the first.
    await expect(sector).toHaveAttribute('aria-expanded', 'true');
    await expect(geography).toHaveAttribute('aria-expanded', 'true');
  },
};

export const DisabledItemDoesNotToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledSection = canvas.getByRole('button', { name: 'Disabled Section' });
    await expect(disabledSection).toBeDisabled();
  },
};

/**
 * Controlled `openIds`/`onOpenChange` (SPEC.md §5.19) -- lets a parent force a panel open (e.g. a
 * same-page jump link landing on content inside a collapsed panel). Clicking still works exactly
 * as in the uncontrolled stories above; the difference is the parent owns the open-id array.
 */
export const Controlled: Story = {
  render: (args) => {
    const [openIds, setOpenIds] = React.useState<string[]>(['1']);
    return <Accordion {...args} openIds={openIds} onOpenChange={setOpenIds} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sector = canvas.getByRole('button', { name: 'Sector' });
    const geography = canvas.getByRole('button', { name: 'Geography' });

    // Starts open because the parent's initial state includes '1' -- proves external control,
    // not just that the component still works when these props happen to be omitted.
    await expect(sector).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(geography);
    await expect(geography).toHaveAttribute('aria-expanded', 'true');
    await expect(sector).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(geography);
    await expect(geography).toHaveAttribute('aria-expanded', 'false');
  },
};
