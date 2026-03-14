import { useNavigate } from 'react-router-dom';

const CitiesSection = () => {
  const navigate = useNavigate();

  const cities = [
    {
      name: 'Mumbai',
      country: 'India',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
      hotels: '500+',
      description: 'The City of Dreams',
      gradient: 'from-orange-600/90 to-red-600/90',
    },
    {
      name: 'Pune',
      country: 'India',
      image: 'https://images.unsplash.com/photo-1707617645764-08862c06fd7f?q=80&w=1211&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      hotels: '350+',
      description: 'Oxford of the East',
      gradient: 'from-purple-600/90 to-pink-600/90',
    },
    {
      name: 'Nagpur',
      country: 'India',
      image: 'https://www.luxurytrailsofindia.com/wp-content/uploads/2016/12/nagpurmaharashtraindia-1.jpg',
      hotels: '150+',
      description: 'Orange City',
      gradient: 'from-orange-500/90 to-yellow-500/90',
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-modern inline-block">
            Explore Top Cities
          </h2>
          <p className="text-xl text-[#B8C4E6] max-w-2xl mx-auto">
            Discover the most sought-after destinations with premium accommodations
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city, index) => (
            <div
              key={index}
              onClick={() => navigate(`/hotels?city=${encodeURIComponent(city.name)}`)}
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gradient Overlay - Strong contrast for text visibility */}
              <div className={`absolute inset-0 bg-gradient-to-t ${city.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>

              {/* Additional dark overlay at bottom for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">

                {/* City Name */}
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {city.name}
                </h3>

                {/* Description */}
                <p className="text-lg text-white mb-4">
                  {city.description}
                </p>

                {/* Explore Button */}
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="text-lg">Explore</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/hotels')}
            className="btn-primary text-lg"
          >
            <span className="flex items-center gap-2">
              View All Destinations
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
