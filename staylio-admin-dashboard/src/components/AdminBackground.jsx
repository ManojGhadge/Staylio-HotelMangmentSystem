import React from 'react';
import DotGrid from './DotGrid';

const AdminBackground = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full bg-[#0b1121] overflow-hidden">
            {/* DotGrid Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <DotGrid
                    dotSize={6}
                    gap={25}
                    baseColor="#1e293b"
                    activeColor="#4f46e5"
                    proximity={120}
                    shockRadius={150}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div>

            {/* Abstract Gradient Orbs for vibe */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }} />

            {/* Content */}
            <div className="relative z-10 h-full pointer-events-auto">
                {children}
            </div>
        </div>
    );
};



export default AdminBackground;
