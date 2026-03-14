import { useState } from 'react';

const HotelDetailModal = ({ hotel, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageUrls = () => {
    // Use imageUrls array from backend (parsed from hotels_image table)
    if (hotel.imageUrls && hotel.imageUrls.length > 0) {
      return hotel.imageUrls;
    }

    // Fallback to allPhotoUrls
    if (hotel.allPhotoUrls) {
      const urls = hotel.allPhotoUrls.split(',').map(url => url.trim()).filter(url => url);
      if (urls.length > 0) {
        return urls;
      }
    }

    // Fallback to images array
    if (hotel.images && hotel.images.length > 0) {
      return hotel.images.map((img) => img.imageUrl);
    }

    return []; // No images available
  };

  const images = getImageUrls();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getAmenitiesList = () => {
    if (!hotel.amenities) return [];
    return hotel.amenities.split(',').map((a) => a.trim());
  };

  const getRoomTypesList = () => {
    if (!hotel.roomTypes) return [];
    return hotel.roomTypes.split(',').map((r) => r.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Image Gallery */}
          <div className="relative h-64 md:h-80 bg-slate-200">

            {images.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <TiltedCard
                  imageSrc={images[currentImageIndex]}
                  captionText={hotel.name}
                  containerHeight="100%"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  showTooltip={true}
                  showMobileWarning={false}
                  rotateAmplitude={4}
                  scaleOnHover={1.05}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-6xl">🏨</span>
              </div>
            )}

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>


          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                      ? 'border-white ring-2 ring-white/50 scale-105'
                      : 'border-white/30 hover:border-white/60'
                      }`}
                  >
                    <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {/* Title and Rating */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-slate-800">{hotel.name}</h2>
                {hotel.isFeatured && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <div className="flex items-center text-slate-600 mb-2">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{hotel.address}, {hotel.city}, {hotel.state}, {hotel.country} {hotel.zipCode}</span>
              </div>
              {hotel.propertyType && (
                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {hotel.propertyType}
                </span>
              )}
            </div>
            <div className="text-right ml-6">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                ₹{hotel.pricePerNight}
              </div>
              <div className="text-sm text-slate-500">per night</div>
              {hotel.rating > 0 && (
                <div className="mt-3 flex items-center justify-end bg-blue-600 text-white px-3 py-2 rounded-lg">
                  <lord-icon
                    src="https://cdn.lordicon.com/edplgash.json"
                    trigger="hover"
                    colors="primary:#ffffff,secondary:#fbbf24"
                    style={{ width: '20px', height: '20px', marginRight: '4px' }}
                  ></lord-icon>
                  <span className="font-bold">{hotel.rating.toFixed(1)}</span>
                  <span className="ml-1 text-sm">({hotel.reviewCount})</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-3">About this property</h3>
              <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
            </div>
          )}

          {/* Property Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-slate-50 rounded-2xl">
            <div className="text-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-slate-800">{hotel.bedrooms}</div>
              <div className="text-sm text-slate-600">Bedrooms</div>
            </div>
            <div className="text-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-slate-800">{hotel.bathrooms}</div>
              <div className="text-sm text-slate-600">Bathrooms</div>
            </div>
            <div className="text-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-slate-800">{hotel.maxGuests}</div>
              <div className="text-sm text-slate-600">Max Guests</div>
            </div>
            <div className="text-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-slate-800">{hotel.totalRooms}</div>
              <div className="text-sm text-slate-600">Total Rooms</div>
            </div>
          </div>

          {/* Amenities */}
          {hotel.amenities && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getAmenitiesList().map((amenity, index) => (
                  <div key={index} className="flex items-center bg-slate-50 px-4 py-3 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-700 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room Types */}
          {hotel.roomTypes && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Room Types</h3>
              <div className="flex flex-wrap gap-2">
                {getRoomTypesList().map((roomType, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                    {roomType}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Check-in/Check-out */}
          {(hotel.checkInTime || hotel.checkOutTime) && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              {hotel.checkInTime && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-sm text-green-700 font-medium mb-1">Check-in</div>
                  <div className="text-lg font-bold text-green-900">{hotel.checkInTime}</div>
                </div>
              )}
              {hotel.checkOutTime && (
                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="text-sm text-red-700 font-medium mb-1">Check-out</div>
                  <div className="text-lg font-bold text-red-900">{hotel.checkOutTime}</div>
                </div>
              )}
            </div>
          )}

          {/* Policies */}
          {(hotel.cancellationPolicy || hotel.houseRules) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Policies</h3>
              {hotel.cancellationPolicy && (
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Cancellation Policy</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{hotel.cancellationPolicy}</p>
                </div>
              )}
              {hotel.houseRules && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">House Rules</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{hotel.houseRules}</p>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium">Availability</div>
                <div className="text-lg font-bold text-blue-900">
                  {hotel.availableRooms} of {hotel.totalRooms} rooms available
                </div>
              </div>
              {hotel.availableRooms > 0 && hotel.availableRooms <= 3 && (
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Only {hotel.availableRooms} left!
                </span>
              )}
            </div>
          </div>

          {/* Map Section */}
          {hotel.latitude && hotel.longitude && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Location</h3>
              <div className="bg-slate-100 rounded-xl overflow-hidden h-64">
                <iframe
                  title="Hotel Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}&hl=es;z=14&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                <span className="font-medium">Coordinates:</span> {hotel.latitude.toFixed(6)}, {hotel.longitude.toFixed(6)}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-4">
            <button className="flex-1 bg-blue-600 text-white py-3 md:py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-base md:text-lg shadow-lg hover:shadow-xl">
              Book Now
            </button>
            <button className="px-4 md:px-6 py-3 md:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailModal;
