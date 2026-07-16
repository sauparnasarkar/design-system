import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactItem } from './ContactItem';

const meta: Meta<typeof ContactItem> = {
  title: 'Components/ContactItem',
  component: ContactItem,
  args: {
    headline: 'Ana Martinez',
    subHeader: 'Senior Director, EMEA Corporates',
    actions: [
      { icon: 'mail', label: 'Email', href: 'mailto:ana.martinez@example.com' },
      { icon: 'phone', label: 'Call', href: 'tel:+442012345678' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof ContactItem>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 200 }}>
      <ContactItem {...args} />
    </div>
  ),
};

export const AnalystRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, maxWidth: 720 }}>
      <ContactItem
        headline="Ana Martinez"
        subHeader="Senior Director, EMEA Corporates"
        actions={[{ icon: 'mail', label: 'Email', href: '#' }, { icon: 'phone', label: 'Call', href: '#' }]}
      />
      <ContactItem
        headline="James Okoye"
        subHeader="Director, Sovereigns"
        actions={[{ icon: 'mail', label: 'Email', href: '#' }]}
        footerText="+44 20 1234 5678"
      />
      <ContactItem
        headline="Mei Chen"
        subHeader="Associate Director, APAC Banks"
        photoSrc="https://picsum.photos/seed/analyst/224/224"
        actions={[{ icon: 'mail', label: 'Email', href: '#' }, { icon: 'phone', label: 'Call', href: '#' }]}
      />
    </div>
  ),
};
