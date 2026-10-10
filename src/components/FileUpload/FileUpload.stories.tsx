import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  args: {
    label: 'Drag and drop your portfolio file, or click to browse',
    hint: 'XLSX or CSV, up to 10 MB',
    disabled: false,
    loading: false,
    multiple: false,
    accept: '.xlsx,.csv',
  },
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <FileUpload {...args} />
    </div>
  ),
  args: { onFiles: fn() },
  play: async ({ args, canvasElement }) => {
    const zone = within(canvasElement).getByRole('button');
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a,b'], 'portfolio.csv', { type: 'text/csv' });
    // Picking via the hidden input reports the files.
    await userEvent.upload(input, file);
    await waitFor(() => expect(args.onFiles).toHaveBeenCalledTimes(1));
    await expect((args.onFiles as ReturnType<typeof fn>).mock.calls[0][0][0].name).toBe('portfolio.csv');
    // Dropping reports them too, and drag-over/leave toggles the highlight class.
    const dt = new DataTransfer();
    dt.items.add(file);
    zone.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    await waitFor(() => expect(zone).toHaveClass('__s9cmpx-file-upload--drag-active'));
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    await waitFor(() => expect(args.onFiles).toHaveBeenCalledTimes(2));
    await expect(zone).not.toHaveClass('__s9cmpx-file-upload--drag-active');
  },
};

export const DisabledIgnoresDrops: Story = {
  args: { disabled: true, onFiles: fn() },
  render: (args) => <FileUpload {...args} />,
  play: async ({ args, canvasElement }) => {
    const zone = within(canvasElement).getByRole('button');
    await expect(zone).toHaveAttribute('aria-disabled', 'true');
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'x.csv'));
    zone.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    await expect(zone).not.toHaveClass('__s9cmpx-file-upload--drag-active');
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};

export const LoadingIgnoresDrops: Story = {
  args: { loading: true, onFiles: fn() },
  render: (args) => <FileUpload {...args} />,
  play: async ({ args, canvasElement }) => {
    const zone = within(canvasElement).getByRole('button');
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'x.csv'));
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};
