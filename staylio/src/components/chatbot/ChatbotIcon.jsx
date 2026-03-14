import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const ChatbotIcon = ({ onClick, isOpen }) => {
    return (
        <motion.button
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#8400ff] text-white shadow-lg shadow-[#8400ff]/30 hover:bg-[#7000d6] focus:outline-none flex items-center justify-center group border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Pulse effect */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#a855f7] opacity-75 animate-ping group-hover:animate-none"></span>

            <MessageCircle size={32} className="relative z-10" />
        </motion.button>
    );
};

export default ChatbotIcon;
