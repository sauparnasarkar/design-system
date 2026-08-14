import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PromptBar } from './PromptBar';

const meta: Meta<typeof PromptBar> = {
  title: 'Components/PromptBar',
  component: PromptBar,
  args: {
    value: '',
    variant: 'landing',
    onChange: fn(),
    onSubmit: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof PromptBar>;

function PromptBarDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState(args.value);
  return (
    <PromptBar
      {...args}
      value={value}
      onChange={(v) => {
        setValue(v);
        args.onChange(v);
      }}
      onSubmit={args.onSubmit}
    />
  );
}

// Simulates a real request: submitting flips `loading` on, then off again shortly after --
// the scenario the refocus-after-loading effect exists for.
function RefocusDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  return (
    <PromptBar
      {...args}
      value={value}
      loading={loading}
      onChange={setValue}
      onSubmit={(v) => {
        args.onSubmit(v);
        setLoading(true);
        setTimeout(() => setLoading(false), 50);
      }}
    />
  );
}

export const Playground: Story = {
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });

    // Landing autofocuses on mount.
    await expect(textarea).toHaveFocus();
    await expect(container).not.toHaveAttribute('aria-busy');

    await userEvent.type(textarea, 'Hello world');
    await expect(textarea).toHaveValue('Hello world');

    await userEvent.keyboard('{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('Hello world');
  },
};

export const Docked: Story = {
  args: { variant: 'docked', disabled: true },
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });
    const sendButton = canvas.getByRole('button', { name: 'Send' });

    // Docked never autofocuses, unlike landing.
    await expect(textarea).not.toHaveFocus();

    // disabled (not loading) gets its own dimmed visual, distinct from the loading state.
    await expect(textarea).toBeDisabled();
    await expect(sendButton).toBeDisabled();
    await expect(getComputedStyle(container).opacity).toBe('0.6');
    await expect(getComputedStyle(container).cursor).toBe('not-allowed');
  },
};

export const ShiftEnterInsertsNewline: Story = {
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' }) as HTMLTextAreaElement;

    await userEvent.type(textarea, 'line one');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(textarea, 'line two');

    await expect(textarea.value.includes('\n')).toBe(true);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const EmptyValueDoesNotSubmit: Story = {
  args: { value: '   ' },
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });
    const sendButton = canvas.getByRole('button', { name: 'Send' });

    await expect(sendButton).toBeDisabled();

    await userEvent.click(textarea);
    await userEvent.keyboard('{Enter}');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: { value: 'What changed in Q2?', loading: true },
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });
    const sendButton = canvas.getByRole('button', { name: 'Send' });

    await expect(container).toHaveAttribute('aria-busy', 'true');
    await expect(textarea).toBeDisabled();
    await expect(sendButton).toBeDisabled();
  },
};

export const RefocusAfterLoading: Story = {
  args: { variant: 'docked' },
  render: (args) => <RefocusDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });

    // Docked doesn't autofocus, so focus it manually first -- mirrors a user clicking back
    // into the bar for a follow-up question.
    await userEvent.click(textarea);
    await expect(textarea).toHaveFocus();

    await userEvent.type(textarea, 'Follow-up question');
    await userEvent.keyboard('{Enter}');

    // Going into `loading` disables (and therefore blurs) the textarea.
    await waitFor(() => expect(container).toHaveAttribute('aria-busy', 'true'));

    // Once loading resolves, focus returns without the user having to click back in.
    await waitFor(() => expect(container).not.toHaveAttribute('aria-busy'));
    await waitFor(() => expect(textarea).toHaveFocus());
  },
};

export const AutoGrowCapsAtFourLines: Story = {
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' }) as HTMLTextAreaElement;

    for (let i = 1; i <= 6; i++) {
      await userEvent.type(textarea, `Line ${i}`);
      if (i < 6) await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    }

    // Growth capped at MAX_LINES -- internal scroll takes over rather than growing further.
    await expect(textarea.style.overflowY).toBe('auto');
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <button type="button" aria-label="Filters" style={{ border: 'none', background: 'none' }}>
        F
      </button>
    ),
  },
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const filtersButton = canvas.getByRole('button', { name: 'Filters' });
    const sendButton = canvas.getByRole('button', { name: 'Send' });

    await expect(filtersButton).toBeInTheDocument();
    // The `actions` slot sits to the left of the send button.
    const position = filtersButton.compareDocumentPosition(sendButton);
    await expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};
