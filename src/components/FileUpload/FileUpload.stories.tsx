import type { Meta, StoryObj } from '@storybook/react-vite';
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
};
