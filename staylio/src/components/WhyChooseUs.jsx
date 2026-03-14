import React from 'react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="#8400ff" stroke="#a855f7" strokeWidth="2" fillOpacity="0.2" />
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" stroke="#d8b4fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Best Price Guarantee',
      description: 'Best prices available on our platform'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#8400ff" fillOpacity="0.2" />
        </svg>
      ),
      title: 'Verified Stays',
      description: 'All hotels are reviewed and approved by the admin.'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#a855f7" strokeWidth="2" fill="#8400ff" fillOpacity="0.2" />
          <path d="M12 7v5l3 3" stroke="#d8b4fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.5" fill="#d8b4fe" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Our dedicated support is available anytime.'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#8400ff" fillOpacity="0.5" stroke="#a855f7" strokeWidth="2" />
        </svg>
      ),
      title: 'Instant Booking',
      description: 'Book instantly with immediate confirmation.'
    }
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white inline-block">
            Why Choose Staylio?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're committed to making your travel experience seamless and memorable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group transform hover:-translate-y-2 transition-all duration-300"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'slideUp 0.6s ease-out forwards'
              }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-[0_0_20px_#8400ff] transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 border border-[#8400ff]/30 group-hover:border-[#a855f7]">
                  {feature.icon}
                </div>
                <div className="absolute inset-0 bg-[#8400ff]/20 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
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
  );
};

export default WhyChooseUs;