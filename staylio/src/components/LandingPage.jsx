import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from './Particles';
import Hero from './Hero';
import WhyChooseUs from './WhyChooseUs';
import CitiesSection from './CitiesSection';
import Footer from './Footer';
import SphereGallery from './SphereGallery';
import hotelService from '../services/hotelService';

import HotelCard from './HotelCard';

const LandingPage = () => {
  const navigate = useNavigate();
  const [verifiedHotels, setVerifiedHotels] = useState([]);

  // Helper to get image URL safely
  const getHotelImage = (hotel) => {
    if (hotel.images && hotel.images.length > 0) {
      const primary = hotel.images.find(img => img.isPrimary);
      return primary ? primary.imageUrl : hotel.images[0].imageUrl;
    }
    if (hotel.allPhotoUrls) {
      // Handle comma-separated string from backend
      const urls = hotel.allPhotoUrls.split(',');
      return urls[0].trim();
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  };

  useEffect(() => {
    const fetchVerifiedHotels = async () => {
      try {
        const data = await hotelService.getLandingPageHotels();
        setVerifiedHotels(data);
      } catch (error) {
        console.error("Failed to fetch verified hotels", error);
      }
    };
    fetchVerifiedHotels();
  }, []);

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

      {/* Content Overlay */}
      <div className="relative z-10">

        {/* Animated Hero */}
        <Hero />

        {/* Why Choose Section */}
        <WhyChooseUs />

        {/* Top Verified Hotels Section with Sphere Gallery */}
        {verifiedHotels.length > 0 && (
          <section className="py-20 px-4 w-full relative overflow-hidden">
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-glow">Top 7 Verified Stays</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Explore our premium selection of verified properties for your perfect getaway.</p>
            </div>

            <div className="h-[800px] w-full relative">
              <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
              </div>
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <SphereGallery
                  images={verifiedHotels.slice(0, 7).map(hotel => ({
                    id: hotel.id,
                    src: getHotelImage(hotel),
                    alt: hotel.name
                  }))}
                />
              </div>
            </div>

            <div className="text-center mt-8 relative z-10">
              <button
                onClick={() => navigate('/hotels')}
                className="btn-primary text-lg px-8 py-3 rounded-full"
              >
                View All Hotels
              </button>
            </div>
          </section>
        )}

        {/* Cities Section */}
        <CitiesSection />



        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-modern inline-block">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of travelers who trust Staylio for their perfect stay
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/hotels')}
                  className="btn-secondary text-lg"
                >
                  Browse Hotels
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary text-lg"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;