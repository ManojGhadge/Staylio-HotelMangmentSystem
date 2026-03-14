import React from "react";

export function DotBackground({ children }) {
    return (
        <div className="relative min-h-screen w-full bg-[#060010]">
            <div
                className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#404040_1px,transparent_1px)]"
            />
            {/* Radial gradient for the container to give a faded look */}
            <div className="pointer-events-none absolute inset-0 bg-[#060010] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

export default DotBackground;
