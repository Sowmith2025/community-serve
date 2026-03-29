import { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { AuthContext } from './AuthContext';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
      {/* Navbar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-link flex items-center gap-2"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <MessageCircle size={18} /> Chat
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel flex" style={{ position: 'fixed', width: '350px', flexDirection: 'column', zIndex: 50, top: '80px', right: '24px', height: '500px', maxHeight: 'calc(100vh - 100px)', borderColor: 'rgba(124, 58, 237, 0.3)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Header */}
          <div className="flex justify-between items-center" style={{ padding: '1rem', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white' }}>
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Platform Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)' }}>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    maxWidth: '85%',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '0.75rem',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    background: isUser ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.08)',
                    color: 'white',
                    borderBottomRightRadius: isUser ? 0 : '0.75rem',
                    borderBottomLeftRadius: isUser ? '0.75rem' : 0,
                    border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {msg.content}
                </div>
              );
            })}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', borderRadius: '0.75rem', borderBottomLeftRadius: 0, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite', color: '#a5b4fc' }} /> 
                <span style={{ color: '#a5b4fc' }}>Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'var(--surface)', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.65rem 0.85rem', fontSize: '0.9rem', color: 'white', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              style={{ padding: '0.65rem', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', borderRadius: '0.5rem', cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', opacity: (isLoading || !input.trim()) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'white' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
