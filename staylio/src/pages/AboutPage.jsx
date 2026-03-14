import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {

    const features = [
        {
            icon: (
                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'Trusted Platform',
            description: 'All properties are verified and hosts are thoroughly vetted for your safety and peace of mind.'
        },
        {
            icon: (
                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            title: 'Best Price Guarantee',
            description: 'We ensure you get the best deals with our price matching policy and exclusive discounts.'
        },
        {
            icon: (
                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: '24/7 Support',
            description: 'Our dedicated support team is available round the clock to assist you with any queries.'
        },
        {
            icon: (
                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            title: 'Personalized Experience',
            description: 'AI-powered recommendations and personalized suggestions based on your preferences.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#060010]">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
                            About <span className="text-white">Staylio</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed drop-shadow-md">
                            Connecting travelers with exceptional stays across India, making every journey memorable and every stay extraordinary.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.href = '/hotels'}
                                className="btn-magic text-lg"
                            >
                                Explore Hotels
                            </button>
                            <button
                                onClick={() => window.location.href = '/contact'}
                                className="btn-outline-magic text-lg"
                            >
                                Get in Touch
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-20 bg-[#060010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="mb-6">
                                <span className="inline-block bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 text-sm font-semibold px-4 py-2 rounded-full mb-4 shadow-lg">
                                    Our Story
                                </span>
                                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                                    Revolutionizing Travel Experiences
                                </h2>
                            </div>
                            <div className="space-y-6">
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    Founded in 2023, Staylio emerged from a simple vision: to make quality accommodations accessible to everyone, everywhere. We bridge the gap between travelers seeking authentic experiences and hosts offering exceptional properties.
                                </p>
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    Our platform connects guests with verified hotels, boutique stays, and unique accommodations across India. From luxury resorts in Goa to heritage hotels in Rajasthan, we curate experiences that go beyond just a place to sleep.
                                </p>
                                <div className="bg-[#0f172a]/50 border-l-4 border-[#a855f7] p-6 rounded-r-lg backdrop-blur-sm">
                                    <p className="text-lg text-gray-300 font-medium leading-relaxed">
                                        "We're committed to making travel planning effortless and stays unforgettable for every traveler."
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-[#8400ff]/20">
                                <img
                                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Luxury Hotel Room"
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#060010]/60 to-transparent"></div>
                            </div>


                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-[#060010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                            Our Purpose
                        </span>
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Mission & Vision
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Driving the future of hospitality through innovation, trust, and exceptional service.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bento-card p-10">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-[#0f172a] border border-[#8400ff]/30 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                                    <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-white">Our Mission</h3>
                            </div>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                To democratize travel by providing a trusted platform that connects travelers with quality accommodations,
                                ensuring every journey is comfortable, affordable, and memorable. We strive to empower local hosts while
                                delivering exceptional value to our guests.
                            </p>
                        </div>

                        <div className="bento-card p-10">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-[#0f172a] border border-[#8400ff]/30 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                                    <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-white">Our Vision</h3>
                            </div>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                To become India's most trusted and innovative hospitality platform, setting new standards for customer
                                experience and operational excellence. We envision a future where every traveler finds their perfect stay
                                with just a few clicks.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-[#060010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                            Our Advantages
                        </span>
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Why Choose Staylio?
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            We're committed to providing you with the best booking experience through our core values and services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bento-card group text-center p-8 hover:bg-[#0f172a]/80 transition-colors duration-300">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 bg-[#0f172a] border border-[#8400ff]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:border-[#a855f7]">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            {/* <section className="py-16 bg-[#060010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Our Impact in Numbers
                        </h2>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                            See how we're making a difference in the travel and hospitality industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bento-card p-8 text-center">
                            <div className="w-16 h-16 bg-[#0f172a] border border-[#8400ff]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">50K+</div>
                            <div className="text-gray-400">Happy Guests</div>
                        </div>

                        <div className="bento-card p-8 text-center">
                            <div className="w-16 h-16 bg-[#0f172a] border border-[#8400ff]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">1,000+</div>
                            <div className="text-gray-400">Properties</div>
                        </div>

                        <div className="bento-card p-8 text-center">
                            <div className="w-16 h-16 bg-[#0f172a] border border-[#8400ff]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">150+</div>
                            <div className="text-gray-400">Cities</div>
                        </div>

                        <div className="bento-card p-8 text-center">
                            <div className="w-16 h-16 bg-[#0f172a] border border-[#8400ff]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">4.8/5</div>
                            <div className="text-gray-400">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* Call to Action Section */}
            <section className="py-20 bg-[#060010] relative overflow-hidden border-t border-[#8400ff]/20">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                            Join thousands of travelers who trust Staylio for their accommodation needs. Book your perfect stay today and experience the difference.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => window.location.href = '/hotels'}
                                className="btn-magic text-lg"
                            >
                                Browse Hotels
                            </button>
                            <button
                                onClick={() => window.location.href = '/contact'}
                                className="btn-outline-magic text-lg"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
