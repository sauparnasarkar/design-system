import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'display1', 'display2',
        'headline1', 'headline2', 'headline3', 'headline4', 'headline5', 'headline6', 'headline7', 'headline8',
        'body1', 'body2', 'body3-long', 'body3-short', 'body4',
        'label1', 'label2', 'label3',
      ],
    },
    color: {
      control: 'select',
      options: [undefined, 'standard', 'strong', 'weak', 'info', 'positive', 'negative', 'notice', 'neutral'],
    },
    weight: { control: 'select', options: [undefined, 'regular', 'semi', 'bold', 'heavy'] },
    align: { control: 'select', options: [undefined, 'left', 'center', 'right', 'justify'] },
  },
  args: {
    children: 'Global Credit Outlook 2026 - Mid-Year Update',
    variant: 'headline5',
  },
};
export default meta;
type Story = StoryObj<typeof Typography>;

export const Playground: Story = {};
