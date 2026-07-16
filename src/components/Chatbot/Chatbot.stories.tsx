import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chatbot, type ChatMessage } from './Chatbot';

const MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    text: 'Hi! I can help you find research, ratings, and entity data. What are you looking for?',
    timestamp: '09:14',
  },
  {
    id: '2',
    role: 'user',
    text: 'What is the current outlook for EMEA corporates?',
    timestamp: '09:15',
  },
  {
    id: '3',
    role: 'assistant',
    text: 'The mid-year update maintains a deteriorating outlook for EMEA corporates, driven by the oil shock lifting inflation and squeezing real wages. Rating headroom remains adequate for most investment-grade issuers.',
    timestamp: '09:15',
    withFeedback: true,
    suggestedQuestions: [
      'Show the latest EMEA corporates outlook report',
      'Which sectors have negative outlooks?',
    ],
  },
];

const meta: Meta<typeof Chatbot> = {
  title: 'Components/Chatbot',
  component: Chatbot,
  args: {
    title: 'Syena AI',
    messages: MESSAGES,
    placeholder: 'Ask about research, entities, or ratings…',
    height: 480,
  },
};
export default meta;
type Story = StoryObj<typeof Chatbot>;

export const Playground: Story = {
  render: (args) => {
    const [messages, setMessages] = React.useState(args.messages);
    return (
      <div style={{ maxWidth: 420 }}>
        <Chatbot
          {...args}
          messages={messages}
          onSend={(text) =>
            setMessages((m) => [...m, { id: String(m.length + 1), role: 'user', text, timestamp: 'now' }])
          }
          onQuestionClick={(q) =>
            setMessages((m) => [...m, { id: String(m.length + 1), role: 'user', text: q, timestamp: 'now' }])
          }
        />
      </div>
    );
  },
};
