import React from 'react';
import RightSideModel from './RightSideModel';

const Hero = () => {

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto my-3 px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Hero Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-heading text-modern mb-6 animate-fade-in">
              Find Your Perfect Stay - Anytime, Anywhere
            </h1>
            <p className="text-xl md:text-2xl text-[#B8C4E6] mb-8">
              Book your perfect accommodation effortlessly with Staylio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <a
                href="/register"
                className="btn-primary"
              >
                Get Started
              </a>
              <a
                href="/about"
                className="btn-secondary"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Side - 3D Hotel Model */}
          <div className="relative h-[400px] lg:h-[600px] hidden lg:block">
            <RightSideModel />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;