import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactModule } from './ContactModule';
import { ContactItem } from '../ContactItem/ContactItem';
import { Button } from '../Button/Button';

const ANALYSTS = [
  ['Ana Martinez', 'Senior Director, EMEA Corporates'],
  ['James Okoye', 'Director, Sovereigns'],
  ['Mei Chen', 'Associate Director, APAC Banks'],
  ['Tom Becker', 'Senior Analyst, Structured Finance'],
  ['Sara Haddad', 'Director, MENA Infrastructure'],
];

const meta: Meta<typeof ContactModule> = {
  title: 'Components/ContactModule',
  component: ContactModule,
  args: {
    title: 'Analytical Contacts',
    perPage: 3,
  },
};
export default meta;
type Story = StoryObj<typeof ContactModule>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <ContactModule {...args} action={<Button variant="secondary" size="s" iconLeft="mail" fullWidth>Message the team</Button>}>
        {ANALYSTS.map(([name, role]) => (
          <ContactItem
            key={name}
            headline={name}
            subHeader={role}
            actions={[{ icon: 'mail', label: 'Email', href: '#' }, { icon: 'phone', label: 'Call', href: '#' }]}
          />
        ))}
      </ContactModule>
    </div>
  ),
};
