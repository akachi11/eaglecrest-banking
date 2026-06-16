import React, { useEffect, useRef, useState } from 'react';
import { getChatbotReply } from '../../lib/chatbot';
import { CHAT_GREETING, CHAT_SUGGESTIONS } from '../../lib/chatbotKnowledge';
import { SUPPORT_EMAIL } from '../../lib/supportConfig';

// Set to true to re-enable the live chat widget
const LIVE_CHAT_ENABLED = false;

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const createMessage = (sender: ChatMessage['sender'], text: string): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  text,
});

export const LiveChat: React.FC = () => {
  if (!LIVE_CHAT_ENABLED) return null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([createMessage('bot', CHAT_GREETING)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, createMessage('user', trimmed)]);
    setInput('');
    setIsTyping(true);

    // Simulate a short "thinking" delay so it feels like live chat.
    window.setTimeout(() => {
      const reply = getChatbotReply(trimmed);
      setMessages((prev) => [...prev, createMessage('bot', reply)]);
      setIsTyping(false);
    }, 500 + Math.random() * 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close live chat' : 'Open live chat'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-[#0f0f0f] shadow-lg shadow-black/40 transition-transform duration-150 hover:bg-gold-light active:scale-95"
      >
        <i className={`ti ${open ? 'ti-x' : 'ti-message-circle-2'} text-2xl`} aria-hidden="true" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border border-border bg-bg-card shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-border bg-bg-elevated px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold">
              <i className="ti ti-headset text-base" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">EverestSave Assistant</p>
              <p className="text-[11px] text-text-secondary">Usually replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gold text-[#0f0f0f]'
                      : 'bg-bg-elevated text-text-primary border border-border'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-elevated px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
                </div>
              </div>
            )}

            {/* Quick suggestions, only shown before the user sends anything */}
            {messages.length === 1 && !isTyping && (
              <div className="flex flex-col gap-1.5 pt-1">
                {CHAT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-md border border-border-strong px-3 py-1.5 text-left text-[12px] text-gold transition-colors duration-150 hover:bg-gold/[0.08]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-border px-3 py-1.5">
            <p className="text-[10px] text-text-muted">
              Can&apos;t find an answer? Email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gold hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold text-[#0f0f0f] transition-opacity duration-150 hover:bg-gold-light disabled:opacity-40"
            >
              <i className="ti ti-send text-base" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
