import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, Trash2, HelpCircle, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIDoubtSolver() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  };

  useEffect(() => {
    // Use a small timeout to ensure DOM has updated
    const timer = setTimeout(() => {
      scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
      
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: "I'm currently in demo mode on Netlify and my API key is not configured. To enable AI responses, please set the VITE_GEMINI_API_KEY environment variable in your Netlify dashboard.",
          timestamp: new Date()
        }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelName = "gemini-3.1-pro-preview";
      
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: "You are an expert educational assistant for Indian competitive exams (SSC, Banking, Railway, UPSC). Solve students' doubts clearly and concisely. For math/reasoning, provide step-by-step solutions. Use Markdown for formatting (bold, lists, etc.). Be encouraging.",
        }
      });

      const result = await chat.sendMessage({ message: input });
      const aiContent = result.text || "I'm sorry, I couldn't process that. Please try again.";

      const aiMessage: Message = {
        role: 'ai',
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        role: 'ai',
        content: "Sorry, I'm having trouble connecting right now. Please check your internet or try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] md:h-[80vh] flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">AI Doubt Solver</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" /> Expert Exam Assistant
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 scroll-smooth"
          style={{ overflowAnchor: 'none' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 lg:space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <HelpCircle className="w-8 h-8 lg:w-10 lg:h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg lg:text-xl font-black text-slate-900">Ask your doubt!</h3>
                <p className="text-slate-500 font-medium text-sm lg:text-base">Type any question related to SSC, Banking, Railway, or UPSC, and I'll help you solve it step-by-step.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {["Solve: 25% of 400 + 15% of 200", "Explain the concept of Syllogism", "Who was the first Governor General of India?"].map(q => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs lg:text-sm text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all text-left border border-slate-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 lg:gap-3 max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 lg:p-4 rounded-2xl text-xs lg:text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.role === 'ai' ? (
                        <div className="prose prose-sm max-w-none prose-slate">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                      <p className={`text-[9px] lg:text-[10px] mt-2 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 lg:gap-3 max-w-[90%] lg:max-w-[80%]">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-3 lg:p-4 rounded-2xl rounded-tl-none border border-slate-100">
                  <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 animate-spin" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
          <div className="relative flex items-center gap-2 lg:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your doubt here..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 text-white p-3 lg:p-4 rounded-xl lg:rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
          <p className="text-[9px] lg:text-[10px] text-slate-400 text-center mt-3 lg:mt-4 font-bold uppercase tracking-widest">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
