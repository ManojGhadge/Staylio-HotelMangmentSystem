import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';

const HotelCard = ({ hotel }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[#1e293b] rounded-xl shadow-md overflow-hidden border border-white/10 my-2 cursor-pointer hover:shadow-xl hover:border-[#8400ff]/30 transition-all"
            onClick={() => navigate(`/hotels/${hotel.id}`)}
        >
            <div className="h-32 w-full relative">
                <img
                    src={hotel.imageUrl || (hotel.imageUrls && hotel.imageUrls[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-orange-400 border border-white/10">
                    <lord-icon
                        src="https://cdn.lordicon.com/edplgash.json"
                        trigger="hover"
                        colors="primary:#fb923c,secondary:#fb923c"
                        style={{ width: '12px', height: '12px' }}
                    ></lord-icon>
                    {hotel.rating}
                </div>
            </div>
            <div className="p-3">
                <h4 className="font-bold text-white truncate">{hotel.name}</h4>
                <div className="flex items-center text-gray-400 text-xs mt-1">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate">{hotel.city}</span>
                </div>
                <div className="flex justify-end items-end mt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hotels/${hotel.id}`);
                        }}
                        className="bg-[#8400ff] hover:bg-[#7000d6] text-white text-xs px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-[#8400ff]/20"
                    >
                        Book
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default HotelCard;
