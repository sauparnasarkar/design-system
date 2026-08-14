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

function ExpandedContentDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState(args.value);
  return (
    <PromptBar
      {...args}
      value={value}
      onChange={setValue}
      expandedContent={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <button type="button" onClick={() => args.onSubmit('Suggested prompt one')}>
            Suggested prompt one
          </button>
          <button type="button" onClick={() => args.onSubmit('Suggested prompt two')}>
            Suggested prompt two
          </button>
        </div>
      }
    />
  );
}

export const WithExpandedContent: Story = {
  args: { variant: 'docked' },
  render: (args) => <ExpandedContentDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector('.__s9cmpx-prompt-bar__expanded-panel') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });

    // Collapsed until the bar gains focus -- docked never autofocuses.
    await expect(panel).toHaveAttribute('data-expanded', 'false');

    await userEvent.click(textarea);
    await expect(panel).toHaveAttribute('data-expanded', 'true');

    // Clicking a tile inside the panel must register its own click, not just collapse the panel
    // out from under it -- the tile receiving focus (not the panel losing it) is what the blur
    // handler's relatedTarget check relies on.
    const tileOne = canvas.getByRole('button', { name: 'Suggested prompt one' });
    await userEvent.click(tileOne);
    await expect(args.onSubmit).toHaveBeenCalledWith('Suggested prompt one');

    // Clicking away from the bar entirely collapses it.
    await userEvent.click(textarea);
    await expect(panel).toHaveAttribute('data-expanded', 'true');
    await userEvent.click(canvasElement.ownerDocument.body);
    await expect(panel).toHaveAttribute('data-expanded', 'false');
  },
};

export const ExpandedContentCollapsesOnSubmit: Story = {
  args: { variant: 'docked', value: 'Ask something' },
  render: (args) => <ExpandedContentDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector('.__s9cmpx-prompt-bar__expanded-panel') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' }) as HTMLTextAreaElement;

    await userEvent.click(textarea);
    await expect(panel).toHaveAttribute('data-expanded', 'true');

    // Enter-key submission never blurs the textarea -- collapse must not depend on the blur
    // handler for this path, only the explicit setExpanded(false) inside trySubmit.
    await userEvent.keyboard('{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('Ask something');
    await expect(panel).toHaveAttribute('data-expanded', 'false');
  },
};

// Simulates an instant-submit starter tile inside expandedContent: its onClick calls some
// caller-owned submit function directly (setting `loading`), never going through PromptBar's own
// trySubmit at all -- the scenario the `loading`-driven collapse effect exists for, as opposed to
// ExpandedContentDemo's tiles above, which do go through trySubmit via args.onSubmit.
function ExternalSubmitDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  return (
    <PromptBar
      {...args}
      value={value}
      loading={loading}
      onChange={setValue}
      expandedContent={
        <button
          type="button"
          onClick={() => {
            args.onSubmit('Instant-submit tile');
            setLoading(true);
          }}
        >
          Instant-submit tile
        </button>
      }
    />
  );
}

export const ExpandedContentCollapsesOnExternalSubmit: Story = {
  args: { variant: 'docked' },
  render: (args) => <ExternalSubmitDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector('.__s9cmpx-prompt-bar__expanded-panel') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });

    await userEvent.click(textarea);
    await expect(panel).toHaveAttribute('data-expanded', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Instant-submit tile' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('Instant-submit tile');
    // The click's own onClick never touches PromptBar's trySubmit -- only the `loading` prop
    // turning true (set by this demo's own handler, standing in for the real app's submit hook)
    // is what collapses the panel here.
    await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'false'));
  },
};

// Simulates a caller prefilling `value` from a suggestion (e.g. a tile inside expandedContent)
// and then imperatively focusing the textarea so the user can immediately edit it -- the ref API
// this component didn't previously expose at all (see the forwardRef comment above PromptBar).
function RefFocusDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState('');
  const ref = React.useRef<HTMLTextAreaElement>(null);
  return (
    <div>
      <button type="button" onClick={() => { setValue('Prefilled from a suggestion'); ref.current?.focus(); }}>
        Prefill
      </button>
      <PromptBar {...args} ref={ref} value={value} onChange={setValue} />
    </div>
  );
}

export const RefExposesTextareaFocus: Story = {
  args: { variant: 'docked' },
  render: (args) => <RefFocusDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });

    await expect(textarea).not.toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Prefill' }));
    await expect(textarea).toHaveValue('Prefilled from a suggestion');
    await expect(textarea).toHaveFocus();
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
