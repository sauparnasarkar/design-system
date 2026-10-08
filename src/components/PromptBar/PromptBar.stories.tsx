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
    // The dimming is on the field (not the root), so content below the field is not dimmed with it.
    const field = canvasElement.querySelector('.__s9cmpx-prompt-bar__field') as HTMLElement;
    await expect(getComputedStyle(field).opacity).toBe('0.6');
    await expect(getComputedStyle(field).cursor).toBe('not-allowed');
    await expect(getComputedStyle(container).opacity).toBe('1');
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

// Simulates a real request: submitting flips `loading` on, then off again shortly after --
// the scenario a since-removed auto-refocus effect used to hook into (SPEC.md "Corrections
// applied" #23 in the consuming climate-emissions-analysis-project repo). Includes
// expandedContent specifically to prove the fix: a response landing must not pop the panel
// back open, since focus re-entering the bar is also the panel's own show trigger.
function LoadingWithExpandedContentDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  return (
    <div>
      <PromptBar
        {...args}
        value={value}
        loading={loading}
        onChange={setValue}
        onSubmit={(v) => {
          args.onSubmit(v);
          setLoading(true);
        }}
        expandedContent={<div>Starter prompts</div>}
      />
      {loading && (
        <button type="button" onClick={() => setLoading(false)}>
          Resolve loading
        </button>
      )}
    </div>
  );
}

export const NoRefocusOrExpandAfterLoading: Story = {
  args: { variant: 'docked' },
  render: (args) => <LoadingWithExpandedContentDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const panel = canvasElement.querySelector('.__s9cmpx-prompt-bar__expanded-panel') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });
    const sendButton = canvas.getByRole('button', { name: 'Send' });

    // Docked doesn't autofocus, so focus it manually first -- mirrors a user clicking back
    // into the bar for a follow-up question.
    await userEvent.click(textarea);
    await expect(textarea).toHaveFocus();

    await userEvent.type(textarea, 'Follow-up question');
    await userEvent.click(sendButton);

    // Going into `loading` disables (and therefore blurs) the textarea, which also collapses
    // the panel via the separate `loading`-turning-true effect (unaffected by this fix).
    await waitFor(() => expect(container).toHaveAttribute('aria-busy', 'true'));
    await expect(panel).toHaveAttribute('data-expanded', 'false');

    // Once loading resolves, neither focus nor the panel should come back on their own --
    // the user is left exactly where the response rendering left them, not yanked back into
    // the bar with the starter grid popped open underneath the answer.
    await userEvent.click(canvas.getByRole('button', { name: 'Resolve loading' }));
    await waitFor(() => expect(container).not.toHaveAttribute('aria-busy'));
    await expect(textarea).not.toHaveFocus();
    await expect(panel).toHaveAttribute('data-expanded', 'false');
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


// --- Ask-page redesign (PLAN.md "PromptBar redesign for the Ask page") ------------------------------

const fieldOf = (root: HTMLElement) => root.querySelector('.__s9cmpx-prompt-bar__field') as HTMLElement;

export const FocusRingWrapsTheField: Story = {
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = fieldOf(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });

    // Landing autofocuses: the ring is on the whole field, and the inner input draws no rectangle of its own.
    await expect(textarea).toHaveFocus();
    await expect(getComputedStyle(field).boxShadow).not.toBe('none');
    await expect(getComputedStyle(textarea).outlineStyle).toBe('none');
    await expect(getComputedStyle(textarea).boxShadow).toBe('none');

    // Blur removes the ring (a focus indicator, not a permanent decoration).
    textarea.blur();
    await waitFor(() => expect(getComputedStyle(field).boxShadow).toBe('none'));
  },
};

export const SendButtonIs40ByFortyAndDisabledNotHiddenWhenEmpty: Story = {
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const send = within(canvasElement).getByRole('button', { name: 'Send' });
    const box = send.getBoundingClientRect();
    await expect([Math.round(box.width), Math.round(box.height)]).toEqual([40, 40]);
    await expect(send).toBeDisabled(); // empty: disabled, still in the layout
    await expect(send).toBeVisible();
  },
};

function HintBelowDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState(args.value);
  return (
    <PromptBar
      {...args}
      value={value}
      onChange={setValue}
      hint="Enter to send · Shift + Enter for a new line"
      belowContent={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['Historical trends', 'Climate outcomes', 'Forecasts'].map((label) => (
            <div key={label} data-testid="column">
              <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
              <button type="button" style={{ width: '100%', textAlign: 'left', padding: '14px 16px', minHeight: 84 }}>
                A starter prompt for {label.toLowerCase()} →
              </button>
            </div>
          ))}
        </div>
      }
    />
  );
}

export const HintAndBelowContentSitOutsideTheField: Story = {
  render: (args) => <HintBelowDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = fieldOf(canvasElement);
    const hint = canvas.getByText('Enter to send · Shift + Enter for a new line');
    const columns = canvas.getAllByTestId('column');

    await expect(hint).toBeVisible();
    await expect(field.contains(hint)).toBe(false);
    for (const c of columns) await expect(field.contains(c)).toBe(false);
    // Order in the page: field, then hint, then the prompts.
    await expect(field.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(hint.compareDocumentPosition(columns[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

function PinnedDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState(args.value);
  return (
    <div style={{ height: 320, overflowY: 'auto', background: 'var(--__s9cmpx-static-background-weak)' }} data-testid="scroller">
      <div style={{ height: 800, padding: 16 }}>Page content that scrolls under the pinned bar.</div>
      <PromptBar
        {...args}
        value={value}
        onChange={setValue}
        placeholder="Ask a follow-up…"
        aboveContent={
          <div data-testid="chips" style={{ display: 'flex', gap: 8 }}>
            <button type="button">How has global CO₂ tracked warming since 1850?</button>
            <button type="button">What are the 2040 forecasts?</button>
          </div>
        }
      />
    </div>
  );
}

export const PinnedDockedSticksToTheBottomWithChipsAbove: Story = {
  args: { variant: 'docked', pinned: true },
  render: (args) => <PinnedDemo {...args} />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const scroller = within(canvasElement).getByTestId('scroller');
    const chips = within(canvasElement).getByTestId('chips');
    const field = fieldOf(canvasElement);

    const cs = getComputedStyle(root);
    await expect(cs.position).toBe('sticky');
    await expect(cs.bottom).toBe('0px');
    await expect(cs.borderTopWidth).toBe('1px');
    // Chips are above the field, inside the pinned bar.
    await expect(root.contains(chips)).toBe(true);
    await expect(chips.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // It is actually pinned: with the content scrolled to the top, the bar's bottom edge is at the
    // scroller's bottom edge (its natural position is 800px down, far below the 320px viewport).
    scroller.scrollTop = 0;
    await waitFor(() => expect(Math.round(root.getBoundingClientRect().bottom)).toBe(Math.round(scroller.getBoundingClientRect().bottom)));
  },
};

export const PinnedIsIgnoredOnTheLandingVariant: Story = {
  args: { variant: 'landing', pinned: true },
  render: (args) => <PromptBarDemo {...args} />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    await expect(getComputedStyle(root).position).not.toBe('sticky');
  },
};

export const EnterStillSubmitsWithTheNewSlots: Story = {
  render: (args) => <HintBelowDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const textarea = within(canvasElement).getByRole('textbox', { name: 'Ask a question' });
    await userEvent.type(textarea, 'Show the relationship{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('Show the relationship');
  },
};


// --- Copilot review of #109 ----------------------------------------------------------------------------

function ExpandedPlusSlotsDemo(args: React.ComponentProps<typeof PromptBar>) {
  const [value, setValue] = React.useState(args.value);
  return (
    <div>
      <button type="button" data-testid="outside">Outside the bar</button>
      <PromptBar
        {...args}
        value={value}
        onChange={setValue}
        expandedContent={<button type="button">Suggested prompt one</button>}
        aboveContent={<button type="button" data-testid="chip">A follow-up chip</button>}
        belowContent={<button type="button" data-testid="below">A starter prompt</button>}
      />
    </div>
  );
}

// The expandedContent focus contract is "shown while focus is anywhere inside the bar, hidden once it
// leaves the bar entirely" -- and the bar now has more inside it (above/below slots). Focus handling must
// therefore live on the WRAPPER, not on the bordered field (the ring stays on the field via :focus-within).
export const FocusInsideAnySlotKeepsTheExpandedPanelOpen: Story = {
  args: { variant: 'docked' },
  render: (args) => <ExpandedPlusSlotsDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector('.__s9cmpx-prompt-bar__expanded-panel') as HTMLElement;
    const textarea = canvas.getByRole('textbox', { name: 'Ask a question' });
    const chip = canvas.getByTestId('chip');
    const below = canvas.getByTestId('below');

    await userEvent.click(textarea);
    await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'true'));

    // Focus moves from the field to a chip ABOVE it: still inside the bar, so the panel stays open.
    await userEvent.click(chip);
    await expect(chip).toHaveFocus();
    await expect(panel).toHaveAttribute('data-expanded', 'true');

    // ...and to content BELOW the field: same.
    await userEvent.click(below);
    await expect(below).toHaveFocus();
    await expect(panel).toHaveAttribute('data-expanded', 'true');

    // Leaving the bar entirely collapses it.
    await userEvent.click(canvas.getByTestId('outside'));
    await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'false'));

    // Focus entering through a slot (not the textarea) opens it, like focus entering anywhere else in the bar.
    chip.focus();
    await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'true'));
  },
};

export const DisabledDimsTheFieldNotTheSlots: Story = {
  args: { disabled: true },
  render: (args) => <HintBelowDemo {...args} />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.__s9cmpx-prompt-bar') as HTMLElement;
    const field = fieldOf(canvasElement);
    // opacity is not inherited, so a child's own computed opacity says nothing about its ancestor being
    // dimmed -- assert on the elements that carry it: the field is dimmed, the wrapper (which holds the hint
    // and the prompts below) is not. A regression that moved the dimming back to the wrapper fails here.
    await expect(getComputedStyle(field).opacity).toBe('0.6');
    await expect(getComputedStyle(root).opacity).toBe('1');
    await expect(getComputedStyle(field).cursor).toBe('not-allowed');
  },
};

