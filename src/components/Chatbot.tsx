import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

interface ChatbotProps {
  currentCity: string;
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function Chatbot({ currentCity, isOpen, onClose, userName }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hi ${userName || 'there'}! I'm GlamBot 💖. I can help you find premium haircut salons, luxury spa retreats, or stunning nail art right here in ${currentCity}. How can I pamper you today?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
    };

    // Update messages local state first
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          userContext: {
            city: currentCity,
            name: userName,
          },
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || "I apologize, I lost connection to the main salon server. Please try asking again!",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I ran into a slight network issue. Can you please check back in a moment?',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage(textToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] sm:max-w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[520px] overflow-hidden" id="chatbot-frame">
      {/* Header */}
      <div className="bg-linear-to-r from-pink-500 to-rose-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm shadow-inner">
              🤖
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-pink-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-sans text-xs font-bold leading-none">GlamBot Assistant</span>
              <Sparkles className="h-3 w-3 text-amber-200 fill-amber-200" />
            </div>
            <span className="text-[10px] text-pink-100 leading-none">AI Booking Consultant</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          id="close-chatbot-btn"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isUser ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isUser ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isUser ? <User className="h-3.5 w-3.5" /> : '🤖'}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                  isUser
                    ? 'bg-pink-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-xs border border-gray-100'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="self-start flex items-start gap-2.5 max-w-[80%]">
            <div className="h-7 w-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs shrink-0">
              🤖
            </div>
            <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-pink-500 animate-spin" />
              <span className="text-[10px] font-sans font-semibold text-gray-400">GlamBot is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions shortcuts */}
      <div className="px-4 py-2 border-t border-gray-100 bg-white flex flex-wrap gap-1.5" id="chat-quick-hints">
        {[
          'Find a Haircut in Mumbai',
          'Bridal Makeup offers',
          'Is there a flat spa discount?',
          'How do I earn loyalty points?',
        ].map((hint, i) => (
          <button
            key={i}
            onClick={() => sendMessage(hint)}
            className="px-2 py-1 bg-gray-50 hover:bg-pink-50 border border-gray-100 hover:border-pink-200 text-[10px] font-medium text-gray-600 hover:text-pink-700 rounded-full transition-all text-left"
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask GlamBot anything..."
          className="flex-1 bg-gray-50 text-xs text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-pink-500 focus:bg-white"
        />
        <button
          type="submit"
          className="h-10 w-10 shrink-0 bg-pink-500 hover:bg-pink-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-pink-100 transition-all hover:scale-105"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
