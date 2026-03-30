import { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { AuthContext } from './auth-context';
import { sendChatMessage } from '../services/gemini';

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! How can I help you with community service today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  // If user is not logged in, or if we want it to be available for guests, we can pass 'guest'
  const userRole = user?.role || 'guest';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(newMessages, userRole);
      setMessages([...newMessages, { role: 'assistant', content: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-link chatbot-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
      >
        <MessageCircle size={18} />
        <span>Chat</span>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="chatbot-backdrop"
            aria-label="Close chat assistant"
            onClick={() => setIsOpen(false)}
          />
          <section
            id="chatbot-panel"
            ref={panelRef}
            className="chatbot-panel"
            aria-label="Community service assistant"
          >
            <div className="chatbot-header">
              <div className="chatbot-header-copy">
                <span className="chatbot-badge">AI assistant</span>
                <div className="chatbot-title-row">
                  <MessageCircle size={20} />
                  <h3>Platform Assistant</h3>
                </div>
                <p>Ask about events, volunteering, or how to get started.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-close"
                type="button"
                aria-label="Close chat assistant"
              >
                <X size={20} />
              </button>
            </div>

            <div className="chatbot-messages" aria-live="polite">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`chatbot-bubble ${isUser ? 'chatbot-bubble-user' : 'chatbot-bubble-assistant'}`}
                  >
                    {msg.content}
                  </div>
                );
              })}
              {isLoading && (
                <div className="chatbot-bubble chatbot-bubble-assistant chatbot-status">
                  <Loader size={16} className="spin" />
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chatbot-form">
              <label className="chatbot-input-wrap" htmlFor="chatbot-input">
                <input
                  id="chatbot-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  maxLength={400}
                  autoComplete="off"
                />
              </label>
              <button
                type="submit"
                className="btn-primary chatbot-send"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        </>
      )}
    </>
  );
}
