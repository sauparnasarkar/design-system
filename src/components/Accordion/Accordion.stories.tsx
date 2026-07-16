import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const Playground: Story = {};
