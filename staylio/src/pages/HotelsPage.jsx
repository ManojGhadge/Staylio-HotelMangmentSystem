import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import hotelService from '../services/hotelService';
import TiltedCard from '../components/TiltedCard';
import Particles from '../components/Particles';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HotelsPage = () => {
    const [searchParams] = useSearchParams();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('city') || '');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const data = await hotelService.getAllHotels();
                setHotels(data);
            } catch (err) {
                setError('Failed to load hotels');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getHotelImage = (hotel) => {
        if (hotel.imageUrls) {
            // Check if imageUrls is a string
            if (typeof hotel.imageUrls === 'string' && hotel.imageUrls.length > 0) {
                const urls = hotel.imageUrls.split(',').map(url => url.trim());
                return urls[0];
            }
            // Check if imageUrls is an array
            if (Array.isArray(hotel.imageUrls) && hotel.imageUrls.length > 0) {
                return hotel.imageUrls[0];
            }
        }
        // Fallback image
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
    };

    return (
        <div className="min-h-screen bg-[#060010] relative">
            {/* Particles Background */}
            <div className="fixed inset-0 z-0">
                <Particles
                    particleColors={['#8400ff', '#a855f7', '#d8b4fe']}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    particleHoverFactor={1}
                    alphaParticles={false}
                    disableRotation={false}
                />
            </div>

            <Navbar />

            {/* Content Overlay */}
            <div className="relative z-10 pt-24 pb-12 px-8 sm:px-12 lg:px-16 max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Find Your Perfect Stay</h1>
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search hotels, cities"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-10 rounded-xl border border-white/10 bg-[#0f172a]/50 backdrop-blur-md text-white placeholder-gray-400 focus:ring-2 focus:ring-[#8400ff] focus:border-transparent outline-none shadow-lg"
                        />
                        <svg
                            className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* City Filters */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {['All', 'Mumbai', 'Pune', 'Nagpur'].map((city) => (
                            <button
                                key={city}
                                onClick={() => setSearchTerm(city === 'All' ? '' : city)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${(city === 'All' && searchTerm === '') || searchTerm.toLowerCase() === city.toLowerCase()
                                    ? 'bg-[#8400ff] text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-white/5'
                                    }`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-slate-800/60 backdrop-blur-md rounded-xl h-80 animate-pulse shadow-lg border border-slate-700"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-400 bg-red-900/20 backdrop-blur-md rounded-xl border border-red-800">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHotels.map((hotel) => (
                            <div
                                key={hotel.id}
                                className="cursor-pointer group"
                                onClick={() => navigate(`/hotels/${hotel.id}`)}
                            >
                                <TiltedCard
                                    imageSrc={getHotelImage(hotel)}
                                    altText={hotel.name}
                                    captionText={hotel.name}
                                    containerHeight="300px"
                                    containerWidth="100%"
                                    imageHeight="300px"
                                    imageWidth="100%"
                                    rotateAmplitude={4}
                                    scaleOnHover={1.02}
                                    showMobileWarning={false}
                                    showTooltip={true}
                                    displayOverlayContent={!hotel.hotelOwnerId}
                                    overlayContent={
                                        hotel.hotelOwnerId ? null : (
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-md text-xs font-bold shadow-lg border border-white/10 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                Unclaimed
                                            </div>
                                        )
                                    }
                                />
                                {/* Hotel Info Below Card */}
                                <div className="mt-4 text-center">
                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#a855f7] transition-colors">
                                        {hotel.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-2">
                                        {hotel.city}, {hotel.country}
                                    </p>
                                    <div className="flex items-center justify-center gap-1 text-sm">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/edplgash.json"
                                            trigger="hover"
                                            colors="primary:#eab308,secondary:#facc15"
                                            style={{ width: '18px', height: '18px' }}
                                        ></lord-icon>
                                        <span className="text-white font-medium">
                                            {hotel.rating > 0 ? hotel.rating.toFixed(1) : 'New'}
                                        </span>
                                        {hotel.reviewCount > 0 && (
                                            <span className="text-slate-500 ml-1">({hotel.reviewCount})</span>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && filteredHotels.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        No hotels found matching your search.
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default HotelsPage;
