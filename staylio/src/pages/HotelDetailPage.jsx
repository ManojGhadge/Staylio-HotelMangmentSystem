
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

const RoutingMachine = ({ userLocation, hotelLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (!userLocation || !hotelLocation) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(hotelLocation.lat, hotelLocation.lng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#6FA1EC', weight: 4 }]
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            createMarker: function () { return null; }
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, userLocation, hotelLocation]);

    return null;
};

// Fix for default marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

import { useParams, useNavigate } from 'react-router-dom';
import hotelService from '../services/hotelService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import ReviewSystem from '../components/ReviewSystem';
import { useAuth } from '../context/AuthContext';

const HotelDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAuthenticated = !!user;

    const [hotel, setHotel] = useState(null);
    const [hotelImages, setHotelImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                setLoading(true);
                // Fetch hotel details
                const hotelData = await hotelService.getHotelById(id);
                setHotel(hotelData);

                // Fetch hotel images from the API
                try {
                    const imagesData = await hotelService.getHotelImages(id);
                    if (imagesData && imagesData.length > 0) {
                        setHotelImages(imagesData);
                    }
                } catch (imgError) {
                    console.error('Error fetching hotel images:', imgError);
                    // If API fails, fall back to hotel data images
                }

                // Fetch reviews
                try {
                    const reviewsData = await hotelService.getHotelReviews(id);
                    setReviews(reviewsData || []);
                } catch (reviewError) {
                    console.error('Error fetching reviews:', reviewError);
                    setReviews([]);
                }
            } catch (err) {
                setError('Failed to load hotel details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotelData();
    }, [id]);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                const response = await hotelService.getHotelRooms(id);
                if (response.success) {
                    setRooms(response.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadRooms();
        loadRooms();
    }, [id]);

    const [canReview, setCanReview] = useState(false);
    const [eligibilityMessage, setEligibilityMessage] = useState("");

    useEffect(() => {
        const checkEligibility = async () => {
            if (isAuthenticated && user?.id && id) {
                try {
                    const result = await hotelService.checkReviewEligibility(id, user.id);
                    setCanReview(result.canReview);
                    if (!result.canReview) {
                        if (result.reason === "COMPLETED_STAY_REQUIRED") {
                            setEligibilityMessage("You can only review a hotel after completing your stay.");
                        } else {
                            setEligibilityMessage("You are not eligible to review this hotel.");
                        }
                    }
                } catch (err) {
                    console.error("Error checking review eligibility", err);
                    setCanReview(false);
                }
            }
        };
        checkEligibility();
    }, [id, isAuthenticated, user]);

    const handleReviewSubmit = async (reviewData) => {
        try {
            const newReview = await hotelService.addHotelReview({
                ...reviewData,
                hotelId: id,
                userId: user.id
            });
            setReviews(prev => [newReview, ...prev]);
        } catch (error) {
            console.error("Failed to submit review:", error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060010] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-[#060010] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-white mb-4">Error Loading Hotel</h2>
                <p className="text-gray-300 mb-6">{error || 'Hotel not found'}</p>
                <button
                    onClick={() => navigate('/hotels')}
                    className="px-4 py-2 bg-[#8400ff] text-white rounded-lg hover:bg-[#7e22ce]"
                >
                    Back to Hotels
                </button>
            </div>
        );
    }

    const getImages = () => {
        // First priority: Use images from API endpoint
        if (hotelImages && hotelImages.length > 0) {
            return hotelImages.map(img => img.imageUrl || img.url || img);
        }

        // Second priority: Use images from hotel data
        if (hotel.images && hotel.images.length > 0) {
            return hotel.images.map(img => img.imageUrl);
        }

        // Third priority: Use allPhotoUrls
        if (hotel.allPhotoUrls) {
            return hotel.allPhotoUrls.split(',').map(url => url.trim());
        }

        // Fallback image
        return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];
    };

    const images = getImages();

    if (showAllPhotos) {
        return (
            <div className="fixed inset-0 bg-[#060010] z-50 overflow-y-auto animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#060010] py-4 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white">Photos of {hotel.name}</h2>
                        <button
                            onClick={() => setShowAllPhotos(false)}
                            className="px-6 py-2 bg-[#0f172a]/50 rounded-full hover:bg-white/10 font-medium transition-colors flex items-center gap-2 text-white"
                        >
                            <span>✕</span> Close
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative h-64">
                                <img
                                    src={img}
                                    alt={`${hotel.name} view ${idx + 1}`}
                                    className="w-full h-full object-cover rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060010]">
            <style>{`
                .leaflet-routing-container {
                    display: none !important;
                }
            `}</style>
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/hotels')}
                        className="text-[#a855f7] hover:text-[#c084fc] mb-4 flex items-center font-medium"
                    >
                        ← Back to Hotels
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{hotel.name}</h1>
                            <p className="text-gray-300 flex items-center mt-2">
                                <span className="mr-2">📍</span> {hotel.city}, {hotel.country}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 bg-[#0f172a]/50 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                            <lord-icon
                                src="https://cdn.lordicon.com/edplgash.json"
                                trigger="hover"
                                colors="primary:#eab308,secondary:#facc15"
                                style={{ width: '28px', height: '28px' }}
                            ></lord-icon>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg leading-none">
                                    {hotel.rating > 0 ? hotel.rating.toFixed(1) : 'New'}
                                </span>
                                {hotel.reviewCount > 0 && (
                                    <span className="text-slate-400 text-xs">{hotel.reviewCount} reviews</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 h-96 rounded-xl overflow-hidden">
                    <div className="h-full">
                        <img
                            src={images[0]}
                            alt={hotel.name}
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                            onClick={() => setShowAllPhotos(true)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 h-full">
                        {images.slice(1, 5).map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${hotel.name} ${index + 2}`}
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                onClick={() => setShowAllPhotos(true)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => setShowAllPhotos(true)}
                        className="absolute bottom-4 right-4 bg-[#0f172a]/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg font-semibold text-sm hover:bg-[#0f172a] text-white transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Show all photos
                    </button>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-[#0f172a]/50 rounded-xl shadow-sm p-6 border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-4">About this hotel</h2>
                            <p className="text-gray-300 leading-relaxed">
                                {hotel.description || 'Experience luxury and comfort at its finest. This hotel offers top-notch amenities and services to ensure a memorable stay.'}
                            </p>
                        </div>

                        {/* Location Map */}
                        {hotel.latitude && hotel.longitude && (
                            <div className="bg-[#0f172a]/50 rounded-xl shadow-sm p-6 border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">Location & Directions</h2>
                                    <div className="flex gap-2">
                                        {userLocation && (
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hotel.latitude},${hotel.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#a855f7] hover:bg-[#9333ea] text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                            >
                                                Open in Google Maps ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-white/10 z-0 relative">
                                    <MapContainer
                                        center={[hotel.latitude, hotel.longitude]}
                                        zoom={15}
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[hotel.latitude, hotel.longitude]} icon={RedIcon}>
                                            <Tooltip direction="top" offset={[0, -35]} opacity={1} permanent className="font-bold text-sm">
                                                Hotel
                                            </Tooltip>
                                            <Popup>
                                                <div className="text-gray-900 font-semibold">{hotel.name}</div>
                                                <div className="text-gray-600 text-sm">{hotel.address}</div>
                                            </Popup>
                                        </Marker>

                                        {userLocation && (
                                            <>
                                                <Marker position={[userLocation.lat, userLocation.lng]}>
                                                    <Tooltip direction="top" offset={[0, -35]} opacity={1} permanent className="font-bold text-sm">
                                                        You
                                                    </Tooltip>
                                                    <Popup>You are here</Popup>
                                                </Marker>
                                                <RoutingMachine
                                                    userLocation={userLocation}
                                                    hotelLocation={{ lat: hotel.latitude, lng: hotel.longitude }}
                                                />
                                            </>
                                        )}
                                    </MapContainer>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Sidebar removed */}
                </div>

                <div className="mt-12">
                    {rooms.length > 0 && (
                        <div className="rooms-section mb-12">
                            <h2 className="text-2xl font-bold text-white mb-6">Available Rooms</h2>
                            <div className="grid gap-4">
                                {rooms.map(room => (
                                    <div key={room.id} className="bg-[#0f172a]/50 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4">
                                        <img src={room.imageUrl} alt={room.roomType} className="w-full md:w-48 h-48 md:h-32 object-cover rounded-lg" />
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white">{room.roomType}</h3>
                                            <p className="text-gray-400 text-sm mt-1">{room.description}</p>

                                            {room.roomCount <= 10 && (
                                                <p className="text-yellow-500 text-sm font-semibold mt-1 flex items-center gap-1">
                                                    <span>⚠</span> Few rooms left: {room.roomCount}
                                                </p>
                                            )}

                                            <div className="mt-2 text-sm text-gray-300">
                                                {room.amenities && (
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {room.amenities.split(',').map((amenity, idx) => (
                                                            <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs text-gray-300">
                                                                {amenity.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <span>👥 Max Guests: {room.maxGuests}</span>
                                                    <span>•</span>
                                                    <span>🛏️ {room.category}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <span className="text-2xl font-bold text-[#a855f7]">₹{room.pricePerNight}</span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setShowBookingModal(true);
                                                    }}
                                                    className="bg-[#a855f7] hover:bg-[#9333ea] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <ReviewSystem
                        reviews={reviews}
                        onSubmitReview={handleReviewSubmit}
                        isAuthenticated={isAuthenticated}
                        title={`Reviews for ${hotel.name}`}
                        canReview={canReview}
                        eligibilityMessage={eligibilityMessage}
                    />
                </div>
            </div>

            <Footer />

            {showBookingModal && (
                <BookingModal
                    hotel={hotel}
                    room={selectedRoom}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedRoom(null);
                    }}
                />
            )}
        </div>
    );
};

export default HotelDetailPage;

