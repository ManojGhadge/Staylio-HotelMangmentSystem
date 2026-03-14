import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Optimized spring values for smoother, faster animation
const springValues = {
  damping: 20,
  stiffness: 150,
  mass: 0.5
};

// Faster spring for tooltip
const tooltipSpring = {
  damping: 25,
  stiffness: 300,
  mass: 0.1
};

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false
}) {
  const ref = useRef(null);

  // Motion values for smooth animation
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, springValues);
  const rotateY = useSpring(rotateYValue, springValues);
  const scale = useSpring(1, springValues);

  // Tooltip motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useSpring(0, tooltipSpring);

  // Optimized mouse handler with useCallback
  const handleMouse = useCallback((e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    // Calculate rotation with amplitude
    let rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    let rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    // Clamp rotation to ±45 degrees
    const maxRotation = 45;
    rotationX = Math.max(-maxRotation, Math.min(maxRotation, rotationX));
    rotationY = Math.max(-maxRotation, Math.min(maxRotation, rotationY));

    // Update rotation values
    rotateXValue.set(rotationX);
    rotateYValue.set(rotationY);

    // Update tooltip position
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }, [rotateAmplitude, rotateXValue, rotateYValue, x, y]);

  const handleMouseEnter = useCallback(() => {
    scale.set(scaleOnHover);
    opacity.set(1);
  }, [scale, scaleOnHover, opacity]);

  const handleMouseLeave = useCallback(() => {
    opacity.set(0);
    scale.set(1);
    rotateXValue.set(0);
    rotateYValue.set(0);
  }, [opacity, scale, rotateXValue, rotateYValue]);

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}
      <motion.div
        className="relative [transform-style:preserve-3d] will-change-transform"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale
        }}
      >
        <img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)] select-none"
          style={{
            width: imageWidth,
            height: imageHeight
          }}
          draggable="false"
        />
        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>
      {showTooltip && captionText && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[12px] text-[#2d2d2d] z-[3] hidden sm:block shadow-lg will-change-transform"
          style={{
            x,
            y,
            opacity
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
