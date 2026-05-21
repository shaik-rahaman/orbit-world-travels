'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, AlertCircle } from 'lucide-react';
import { useSendChatMessage } from '@/hooks/useApi';
import { ChatMessage } from '@/types';

// Format results based on module type for readable display
function formatResults(items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) return 'No results found.';

  // Group results by module
  const grouped: { [key: string]: any[] } = {};
  items.forEach((item) => {
    const module = item.module?.toLowerCase() || 'unknown';
    if (!grouped[module]) grouped[module] = [];
    grouped[module].push(item);
  });

  const formattedGroups: string[] = [];
  let idx = 1;

  // Format each module group
  if (grouped['visa']) {
    const rows = grouped['visa'].map((item: any) => {
      const d = item.details || item;
      const cost = d.sellingPrice ? `₹${d.sellingPrice.toLocaleString('en-IN')}` : 'N/A';
      return `${idx++}. ${d.applicantName || 'Unknown'} - ${d.country || 'Unknown'}\n   Status: ${d.status || 'N/A'} | Visa: ${d.visaType || 'N/A'} | Cost: ${cost}`;
    }).join('\n');
    formattedGroups.push(`📋 Visa (${grouped['visa'].length}):\n${rows}`);
  }

  if (grouped['flight']) {
    const rows = grouped['flight'].map((item: any) => {
      const d = item.details || item;
      const cost = d.sellingPrice ? `₹${d.sellingPrice.toLocaleString('en-IN')}` : 'N/A';
      return `${idx++}. ${d.airline || 'Unknown'} ${d.flightNumber || ''} (${d.pnr || 'N/A'})\n   Passenger: ${d.passengerName || 'Unknown'} | ${d.sector || 'N/A'} | Cost: ${cost}`;
    }).join('\n');
    formattedGroups.push(`✈️ Flight (${grouped['flight'].length}):\n${rows}`);
  }

  if (grouped['hotel']) {
    const rows = grouped['hotel'].map((item: any) => {
      const d = item.details || item;
      const cost = d.sellingPrice ? `₹${d.sellingPrice.toLocaleString('en-IN')}` : 'N/A';
      return `${idx++}. ${d.hotelName || 'Unknown'} - ${d.city || 'Unknown'}\n   Guest: ${d.guestName || 'Unknown'} | Room: ${d.roomType || 'N/A'} | Cost: ${cost}`;
    }).join('\n');
    formattedGroups.push(`🏨 Hotel (${grouped['hotel'].length}):\n${rows}`);
  }

  if (grouped['insurance']) {
    const rows = grouped['insurance'].map((item: any) => {
      const d = item.details || item;
      const cost = d.sellingPrice ? `₹${d.sellingPrice.toLocaleString('en-IN')}` : 'N/A';
      return `${idx++}. ${d.holderName || d.policyHolderName || 'Unknown'} (${d.policyNumber || 'N/A'})\n   Type: ${d.policyType || d.insuranceType || 'N/A'} | Coverage: ${d.coverageAmount || 0} | Cost: ${cost}`;
    }).join('\n');
    formattedGroups.push(`🛡️ Insurance (${grouped['insurance'].length}):\n${rows}`);
  }

  if (grouped['invoice']) {
    const rows = grouped['invoice'].map((item: any) => {
      const d = item.details || item;
      const amount = d.totalAmount ? `₹${d.totalAmount.toLocaleString('en-IN')}` : 'N/A';
      return `${idx++}. Invoice ${d.invoiceNumber || 'N/A'}\n   Status: ${d.status || 'N/A'} | Amount: ${amount}`;
    }).join('\n');
    formattedGroups.push(`💰 Invoice (${grouped['invoice'].length}):\n${rows}`);
  }

  if (grouped['client']) {
    const rows = grouped['client'].map((item: any) => {
      const d = item.details || item;
      const email = d.email ? ` | ${d.email}` : '';
      return `${idx++}. ${d.name || 'Unknown'}${email}\n   City: ${d.city || 'N/A'} | Country: ${d.country || 'N/A'}`;
    }).join('\n');
    formattedGroups.push(`🏢 Client (${grouped['client'].length}):\n${rows}`);
  }

  // Fallback for any unknown types
  if (grouped['unknown']) {
    const rows = grouped['unknown'].map((item: any) => {
      const d = item.details || item;
      return `${idx++}. ${d.title || item.title || 'Record'}`;
    }).join('\n');
    formattedGroups.push(`📊 Other (${grouped['unknown'].length}):\n${rows}`);
  }

  return formattedGroups.length > 0 ? formattedGroups.join('\n\n') : 'No results found.';
}

export function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'hybrid' | 'semantic' | 'keyword'>('hybrid');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Orbit AI. I can help you query your travel data. Try asking me things like "Show all pending visas" or "What are my Q1 sales?"',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: sendMessage, isPending } = useSendChatMessage();

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatbot_messages');
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error('Failed to load chat history:', e);
        }
      }
    }
  }, []);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    console.log('[Chat] Sending message:', { query: userInput, searchMode, timestamp: new Date().toISOString() });

    sendMessage({ question: userInput, searchMode }, {
      onSuccess: (response) => {
        // Focus input back after response
        setTimeout(() => inputRef.current?.focus(), 100);
        console.log('[Chat] Response received:', { response, timestamp: new Date().toISOString() });
        // Normalize the ApiResponse payload
        // apiClient returns ApiResponse<T> as `response`
        let content = 'Unable to process your request.';
        let items: any[] | undefined;

        const payload = response?.data ?? response; // support both shapes

        console.log('[Chat] Processing payload:', { payload, timestamp: new Date().toISOString() });

        if (payload) {
          if (typeof payload === 'string') {
            content = payload;
          } else if (payload.answer) {
            content = payload.answer;
            if (Array.isArray(payload.data)) items = payload.data;
          } else if (payload.data) {
            // payload.data might be string, array, or nested object
            if (typeof payload.data === 'string') {
              content = payload.data;
            } else if (Array.isArray(payload.data)) {
              items = payload.data;
              content = payload.answer || `Found ${items?.length ?? 0} results.`;
            } else if (payload.data.answer) {
              content = payload.data.answer;
              if (Array.isArray(payload.data.data)) items = payload.data.data;
            } else if (payload.message) {
              content = payload.message;
            } else if (payload.response) {
              content = payload.response;
            }
          } else if (payload.message) {
            content = payload.message;
          }
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // If structured data was returned, append a formatted preview
        if (Array.isArray(items) && items.length > 0) {
          const formatted = formatResults(items.slice(0, 10));
          const dataMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: formatted,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, dataMessage]);
        }
      },
      onError: (error: any) => {
        console.error('[Chat] Error:', { error, timestamp: new Date().toISOString() });
        const errorMsg = error.response?.data?.error?.message 
          || error.message 
          || 'Sorry, I encountered an error. Please try again.';
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all z-40"
          title="Open chatbot"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-40 border border-indigo-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <h3 className="font-semibold">Orbit AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-700 p-1 rounded transition-colors"
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-indigo-50 text-gray-900 border border-indigo-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">
                    {msg.content.startsWith('Error:') ? (
                      <span className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        {msg.content}
                      </span>
                    ) : (
                      msg.content
                    )}
                  </p>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-indigo-50 text-gray-900 px-4 py-3 rounded-lg border border-indigo-200 rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Search Mode Toggle */}
          <div className="flex gap-2 pb-2 px-4 border-b border-indigo-200 bg-indigo-50">
            <button
              onClick={() => setSearchMode('hybrid')}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                searchMode === 'hybrid'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
              title="Hybrid: 60% semantic + 40% keyword"
            >
              🔀 Hybrid
            </button>
            <button
              onClick={() => setSearchMode('semantic')}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                searchMode === 'semantic'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
              title="Semantic: TF-IDF similarity matching"
            >
              🧠 Semantic
            </button>
            <button
              onClick={() => setSearchMode('keyword')}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                searchMode === 'keyword'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
              title="Keyword: Traditional text matching"
            >
              🔤 Keyword
            </button>
          </div>

          {/* Input */}
          <div className="border-t border-indigo-200 p-4 flex gap-2 bg-indigo-50">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me something..."
              className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 text-gray-900 placeholder-gray-500 bg-white hover:border-indigo-400 transition-colors"
              disabled={isPending}
              aria-label="Chat message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isPending || !input.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
