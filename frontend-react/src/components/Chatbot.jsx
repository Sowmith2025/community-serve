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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 flex items-center justify-center z-50 ${isOpen ? 'hidden' : 'block'}`}
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 glass-panel flex flex-col z-50 overflow-hidden shadow-2xl border" style={{ height: '500px', maxHeight: '80vh', borderColor: 'rgba(124, 58, 237, 0.3)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-white" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-bold m-0 text-lg">Platform Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white self-end rounded-br-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 self-start rounded-bl-none border border-gray-200 dark:border-gray-700'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 self-start max-w-[80%] rounded-lg rounded-bl-none p-3 text-sm flex items-center gap-2 border border-gray-200 dark:border-gray-700">
                <Loader size={16} className="animate-spin text-primary" /> 
                <span>Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="p-2 bg-primary text-white rounded-md disabled:opacity-50 hover:bg-indigo-600 transition-colors flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
