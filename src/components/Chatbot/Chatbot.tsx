import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  /** Follow-up question links shown under an assistant bubble */
  suggestedQuestions?: string[];
  /** Show thumbs feedback row under an assistant bubble */
  withFeedback?: boolean;
}

export interface ChatbotProps {
  /** Panel title — no default, since this is consumer branding, not the design system's own. */
  title: React.ReactNode;
  messages: ChatMessage[];
  onSend?: (text: string) => void;
  onQuestionClick?: (question: string) => void;
  placeholder?: string;
  /** Panel height */
  height?: number;
  className?: string;
}

/** Chat panel (`__s9cmpx-chatbot`) — an AI-assistant-style chat panel. */
export function Chatbot({
  title,
  messages,
  onSend,
  onQuestionClick,
  placeholder = 'Ask a question…',
  height = 480,
  className,
}: ChatbotProps) {
  const [draft, setDraft] = React.useState('');
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend?.(text);
    setDraft('');
  };

  return (
    <div
      className={cx('__s9cmpx-chatbot', className)}
      style={{ display: 'flex', flexDirection: 'column', height, border: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 3, background: 'var(--__s9cmpx-static-background-standard, #fff)' }}
    >
      <div className="__s9cmpx-chatbot__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))' }}>
        <span className="__s9cmpx-chatbot__header-left __s9cmpx-headline7">{title}</span>
        <span className="__s9cmpx-chatbot__header-right __s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>Beta</span>
      </div>
      <div ref={listRef} className="__s9cmpx-chatbot__list-content" style={{ flex: 1, gap: 16, padding: 16 }}>
        <div className="__s9cmpx-chatbot__list-content-margin-trap" />
        {messages.map((m) => (
          <div
            key={m.id}
            className="__s9cmpx-chatbot__message"
            style={{ flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{ maxWidth: '85%' }}>
              <div
                className={cx(
                  '__s9cmpx-chatbot__bubble',
                  m.role === 'user' && '__s9cmpx-chatbot__bubble--user',
                  m.role === 'assistant' && Boolean(m.suggestedQuestions?.length) && '__s9cmpx-chatbot__bubble--with-extra-section',
                )}
              >
                <span className="__s9cmpx-chatbot__text __s9cmpx-body3-long">{m.text}</span>
              </div>
              {m.role === 'assistant' && m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                <div className="__s9cmpx-chatbot__extra-section" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px', borderRadius: '0 0 10px 10px' }}>
                  {m.suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="__s9cmpx-chatbot__question-link __s9cmpx-link __s9cmpx-link--blue __s9cmpx-link2"
                      onClick={() => onQuestionClick?.(q)}
                      style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {m.role === 'assistant' && m.withFeedback && (
                <div className="__s9cmpx-chatbot__feedback" style={{ marginTop: 4 }}>
                  <button type="button" className="__s9cmpx-chatbot__feedback-icon" aria-label="Helpful" style={{ background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 2 }}>
                    <Icon name="check" size={14} />
                  </button>
                  <button type="button" className="__s9cmpx-chatbot__feedback-icon" aria-label="Not helpful" style={{ background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 2 }}>
                    <Icon name="close" size={14} />
                  </button>
                </div>
              )}
              {m.timestamp && (
                <div className={cx('__s9cmpx-chatbot__timestamp', m.role === 'user' && '__s9cmpx-chatbot__timestamp--user', '__s9cmpx-label3')} style={{ color: 'var(--__s9cmpx-static-text-weak)', marginTop: 4, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="__s9cmpx-chatbot__input" style={{ padding: 12, borderTop: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))', position: 'relative' }}>
        <textarea
          className="__s9cmpx-chatbot__input-field __s9cmpx-input__input __s9cmpx-body3-short"
          rows={2}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          style={{ width: '100%', borderRadius: 3, padding: '8px 60px 8px 10px' }}
        />
        <button
          type="button"
          className="__s9cmpx-chatbot__input-send-button __s9cmpx-button __s9cmpx-button--primary __s9cmpx-button--s"
          onClick={send}
          disabled={!draft.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
