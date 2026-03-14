import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User } from 'lucide-react';
import HotelCard from './HotelCard';
import { sendChatQuery } from '../../services/chatbotService';

const ChatbotWindow = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hi there! I\'m your StayLio hotel booking assistant. How can I help you find the perfect stay today? 🏨✨'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Assuming userId is 1 or fetched from context. Passing 1 for now if no auth.
            const userId = localStorage.getItem('userId') || 1;
            const response = await sendChatQuery(userMsg.text, userId);

            const botMsg = {
                type: 'bot',
                text: response.answer,
                hotels: response.suggestedHotels
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg = { type: 'bot', text: "I'm having trouble connecting to the server. Please try again later." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-24 right-6 w-80 h-[450px] z-50 bg-[#0f172a] text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#8400ff]/20"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#8400ff] to-[#a855f7] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white">StayLio Assistant</h3>
                                <p className="text-xs text-purple-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-white">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#060010]/80" ref={scrollRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-1' : 'order-2'}`}>

                                    {/* Text Bubble */}
                                    <div
                                        className={`p-3 text-sm rounded-2xl shadow-sm ${msg.type === 'user'
                                            ? 'bg-[#8400ff] text-white rounded-br-none'
                                            : 'bg-[#1e293b] text-gray-100 rounded-bl-none border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Hotel Cards Carousel / Grid */}
                                    {msg.hotels && msg.hotels.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {msg.hotels.map(hotel => (
                                                <HotelCard key={hotel.id} hotel={hotel} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Time / Status (Optional) */}
                                </div>

                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'ml-2 bg-[#8400ff]/20 text-[#8400ff] order-2' : 'mr-2 bg-[#1e293b] text-[#a855f7] order-1 border border-white/10'
                                    }`}>
                                    {msg.type === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start items-center">
                                <div className="w-8 h-8 rounded-full bg-[#1e293b] text-[#a855f7] mr-2 flex items-center justify-center border border-white/10">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-[#1e293b] p-3 rounded-2xl rounded-bl-none shadow-sm border border-white/5">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#0f172a] border-t border-white/10">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about hotels, prices, location..."
                                className="w-full bg-[#060010] text-gray-100 placeholder-gray-500 rounded-full py-3 px-5 pr-12 text-sm focus:outline-none focus:border-[#8400ff] focus:ring-1 focus:ring-[#8400ff] transition-all border border-white/5"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-[#8400ff] text-white rounded-full hover:bg-[#7000d6] disabled:opacity-50 disabled:hover:bg-[#8400ff] transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-500">Powered by StayLio AI Brain • Llama 3</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatbotWindow;
