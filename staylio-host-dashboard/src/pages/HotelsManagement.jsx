import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hotelAPI } from '../services/api';
import hotelManagementService from '../services/hotelManagementService';
import {
    Search,
    Building2,
    MapPin,
    Star,
    Eye,
    DollarSign,
    Users,
    Plus,
    X,
    Edit,
    Trash2,
    MoreVertical,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

// Create Hotel Modal Component
const CreateHotelModal = ({ onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        price: '',
        rating: '',
        city: '',
        reviews: '',
        hostname: user?.hostname || '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Hotel name is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.rating || formData.rating < 0 || formData.rating > 5) {
            newErrors.rating = 'Rating must be between 0 and 5';
        }
        if (formData.reviews && formData.reviews < 0) {
            newErrors.reviews = 'Reviews count cannot be negative';
        }
        if (formData.image && formData.image.trim()) {
            const imageUrl = formData.image.trim().toLowerCase();
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                newErrors.image = 'Image URL must be a valid HTTP/HTTPS URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Set user context in service
            hotelManagementService.setUser(user);

            // Convert string values to appropriate types
            const hotelData = {
                ...formData,
                price: parseInt(formData.price),
                rating: parseFloat(formData.rating),
                reviews: parseInt(formData.reviews) || 0,
            };

            const result = await hotelManagementService.createHotel(hotelData);

            if (result.success) {
                onSuccess();
                alert('Hotel created successfully!');
            } else {
                alert(`Failed to create hotel: ${result.message}`);
            }
        } catch (error) {
            console.error('Error creating hotel:', error);
            alert('An unexpected error occurred while creating the hotel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bento-card max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Add New Hotel</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Hotel Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`input-magic w-full ${errors.name ? 'border-red-500/50' : ''}`}
                                    placeholder="Enter hotel name"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={`input-magic w-full ${errors.city ? 'border-red-500/50' : ''}`}
                                    placeholder="Enter city"
                                />
                                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Image URL *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className={`input-magic w-full ${errors.image ? 'border-red-500/50' : ''}`}
                                placeholder="https://example.com/hotel-image.jpg"
                            />
                            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Price per Night *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className={`input-magic w-full ${errors.price ? 'border-red-500/50' : ''}`}
                                    placeholder="2999"
                                />
                                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Rating *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className={`input-magic w-full ${errors.rating ? 'border-red-500/50' : ''}`}
                                    placeholder="4.5"
                                />
                                {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Number of Reviews
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.reviews}
                                    onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                                    className={`input-magic w-full ${errors.reviews ? 'border-red-500/50' : ''}`}
                                    placeholder="150"
                                />
                                {errors.reviews && <p className="text-red-400 text-xs mt-1">{errors.reviews}</p>}
                            </div>
                        </div>

                        {user?.role === 'admin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Hostname
                                </label>
                                <input
                                    type="text"
                                    value={formData.hostname}
                                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                                    className="input-magic w-full"
                                    placeholder="Enter hostname"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-magic text-white px-6 py-2 rounded-lg">
                            {loading ? 'Creating...' : 'Create Hotel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// View Hotel Details Modal Component
const ViewHotelModal = ({ hotel, onClose, onEdit, onDelete, user }) => {
    const canEdit = hotelManagementService.canEditHotel(hotel);
    const canDelete = hotelManagementService.canDeleteHotel(hotel);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bento-card max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">{hotel.name}</h2>
                        <div className="flex items-center space-x-2">
                            {canEdit && (
                                <button
                                    onClick={() => onEdit(hotel)}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Edit Hotel"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(hotel)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Hotel"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Hotel Image */}
                        <div>
                            <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden border border-white/10">
                                <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                    }}
                                />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm font-semibold text-white">{hotel.rating}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hotel Details */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Hotel Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-300">{hotel.city}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-300">Hotel ID: {hotel.id}</span>
                                    </div>
                                    {hotel.hostname && (
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-300">Hostname: {hotel.hostname}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pricing & Reviews */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Pricing & Reviews</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-400">₹{(hotel.price || 0).toLocaleString()}</div>
                                        <div className="text-sm text-blue-300">per night</div>
                                    </div>
                                    <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-400">{(hotel.reviews || 0).toLocaleString()}</div>
                                        <div className="text-sm text-green-300">total reviews</div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                                        <div className="text-xl font-bold text-purple-400">{Math.floor(Math.random() * 30 + 60)}%</div>
                                        <div className="text-sm text-purple-300">occupancy rate</div>
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                                        <div className="text-xl font-bold text-yellow-400">₹{Math.floor((hotel.price || 0) * (hotel.reviews || 0) * 0.1).toLocaleString()}</div>
                                        <div className="text-sm text-yellow-300">estimated revenue</div>
                                    </div>
                                </div>
                            </div>

                            {/* Host Information */}
                            {hotel.host && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Host Information</h3>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-white">{hotel.host.ownerName}</div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${hotel.host.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                hotel.host.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                }`}>
                                                {hotel.host.status === 'APPROVED' ? 'Verified Host' :
                                                    hotel.host.status === 'REJECTED' ? 'Rejected' : 'Pending Approval'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400">{hotel.host.companyName}</div>
                                        <div className="text-sm text-gray-500">{hotel.host.email}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Edit Hotel Modal Component
const EditHotelModal = ({ hotel, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        name: hotel?.name || '',
        image: hotel?.image || '',
        price: hotel?.price?.toString() || '',
        rating: hotel?.rating?.toString() || '',
        city: hotel?.city || '',
        reviews: hotel?.reviews?.toString() || '',
        hostname: hotel?.hostname || user?.hostname || '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Hotel name is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.rating || formData.rating < 0 || formData.rating > 5) {
            newErrors.rating = 'Rating must be between 0 and 5';
        }
        if (formData.reviews && formData.reviews < 0) {
            newErrors.reviews = 'Reviews count cannot be negative';
        }
        if (formData.image && formData.image.trim()) {
            const imageUrl = formData.image.trim().toLowerCase();
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                newErrors.image = 'Image URL must be a valid HTTP/HTTPS URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Set user context in service
            hotelManagementService.setUser(user);

            // Convert string values to appropriate types
            const hotelData = {
                ...formData,
                price: parseInt(formData.price),
                rating: parseFloat(formData.rating),
                reviews: parseInt(formData.reviews) || 0,
            };

            const result = await hotelManagementService.updateHotel(hotel.id, hotelData);

            if (result.success) {
                onSuccess();
                alert('Hotel updated successfully!');
            } else {
                alert(`Failed to update hotel: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating hotel:', error);
            alert('An unexpected error occurred while updating the hotel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bento-card max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Edit Hotel</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Hotel Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`input-magic w-full ${errors.name ? 'border-red-500/50' : ''}`}
                                    placeholder="Enter hotel name"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={`input-magic w-full ${errors.city ? 'border-red-500/50' : ''}`}
                                    placeholder="Enter city"
                                />
                                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Image URL *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className={`input-magic w-full ${errors.image ? 'border-red-500/50' : ''}`}
                                placeholder="https://example.com/hotel-image.jpg"
                            />
                            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Price per Night *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className={`input-magic w-full ${errors.price ? 'border-red-500/50' : ''}`}
                                    placeholder="2999"
                                />
                                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Rating *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className={`input-magic w-full ${errors.rating ? 'border-red-500/50' : ''}`}
                                    placeholder="4.5"
                                />
                                {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Number of Reviews
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.reviews}
                                    onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                                    className={`input-magic w-full ${errors.reviews ? 'border-red-500/50' : ''}`}
                                    placeholder="150"
                                />
                                {errors.reviews && <p className="text-red-400 text-xs mt-1">{errors.reviews}</p>}
                            </div>
                        </div>

                        {user?.role === 'admin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Hostname
                                </label>
                                <input
                                    type="text"
                                    value={formData.hostname}
                                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                                    className="input-magic w-full"
                                    placeholder="Enter hostname"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-magic text-white px-6 py-2 rounded-lg">
                            {loading ? 'Updating...' : 'Update Hotel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Hotel Card Component
const HotelCard = ({ hotel, onViewHotel, onEditHotel, onDeleteHotel, user }) => {
    const canEdit = hotelManagementService.canEditHotel(hotel);
    const canDelete = hotelManagementService.canDeleteHotel(hotel);

    return (
        <div className="bento-card hover:shadow-lg hover:shadow-[#8400ff]/10 transition-all duration-300 group overflow-hidden border border-white/10">
            {/* Hotel Image */}
            <div className="relative h-48 mb-4 overflow-hidden">
                <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
                    <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-semibold text-white">{hotel.rating}</span>
                    </div>
                </div>
            </div>

            {/* Hotel Info */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">{hotel.name}</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{hotel.city}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold text-[#a855f7]">
                            ₹{(hotel.price || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-300">
                            {(hotel.reviews || 0).toLocaleString()} reviews
                        </div>
                        <div className="text-xs text-gray-500">verified</div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="pt-3 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-sm font-medium text-gray-400">Occupancy</div>
                            <div className="text-xs text-green-400 font-medium">
                                {Math.floor(Math.random() * 30 + 60)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-400">Revenue</div>
                            <div className="text-xs text-blue-400 font-medium">
                                ₹{Math.floor((hotel.price || 0) * (hotel.reviews || 0) * 0.1).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Host Info */}
                {hotel.host && (
                    <div className="pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-500 mb-1">Managed by</div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-white">{hotel.host.ownerName}</div>
                                <div className="text-xs text-gray-500">{hotel.host.companyName}</div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${hotel.host.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                hotel.host.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                {hotel.host.status === 'APPROVED' ? 'Verified' :
                                    hotel.host.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Hostname Display */}
                {hotel.hostname && (
                    <div className="pt-2 border-t border-white/10">
                        <div className="text-xs text-gray-500">Hostname: {hotel.hostname}</div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                    <button
                        onClick={() => onViewHotel(hotel)}
                        className="flex-1 btn-magic text-sm py-2 flex items-center justify-center space-x-2 text-white rounded-lg"
                    >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => onEditHotel(hotel)}
                            className="px-3 py-2 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-colors"
                            title="Edit Hotel"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDeleteHotel(hotel)}
                            className="px-3 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-colors"
                            title="Delete Hotel"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const HotelsManagement = () => {
    const { user } = useAuth();
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        filterHotels();
    }, [hotels, searchTerm]);

    const fetchHotels = async () => {
        try {
            setLoading(true);

            // Set user context in service
            hotelManagementService.setUser(user);

            // Fetch hotels using the management service
            const result = await hotelManagementService.fetchHotels();

            if (result.success) {
                setHotels(result.data);
            } else {
                console.error('Error fetching hotels:', result.message);
                setHotels([]);
                // Show error message to user
                alert(`Failed to fetch hotels: ${result.message}`);
            }
        } catch (error) {
            console.error('Error fetching hotels:', error);
            setHotels([]);
            alert('An unexpected error occurred while fetching hotels');
        } finally {
            setLoading(false);
        }
    };

    const filterHotels = () => {
        const filtered = hotelManagementService.filterHotels(hotels, searchTerm);
        setFilteredHotels(filtered);
    };

    const handleViewHotel = (hotel) => {
        setSelectedHotel(hotel);
        setShowViewModal(true);
    };

    const handleEditHotel = (hotel) => {
        setSelectedHotel(hotel);
        setShowEditModal(true);
    };

    const handleDeleteHotel = async (hotel) => {
        if (!confirm(`Are you sure you want to delete "${hotel.name}"?\n\nThis action cannot be undone.`)) return;

        try {
            setActionLoading(hotel.id);

            // Set user context in service
            hotelManagementService.setUser(user);

            // Delete hotel using the management service
            const result = await hotelManagementService.deleteHotel(hotel.id);

            if (result.success) {
                await fetchHotels();
                alert('Hotel deleted successfully!');
            } else {
                alert(`Failed to delete hotel: ${result.message}`);
            }
        } catch (error) {
            console.error('Error deleting hotel:', error);
            alert('An unexpected error occurred while deleting the hotel');
        } finally {
            setActionLoading(null);
        }
    };

    const calculateStats = () => {
        const totalRevenue = hotels.reduce((sum, hotel) => sum + ((hotel.price || 0) * (hotel.reviews || 0) * 0.1), 0);
        const averageRating = hotels.length > 0
            ? hotels.reduce((sum, hotel) => sum + hotel.rating, 0) / hotels.length
            : 0;
        const totalReviews = hotels.reduce((sum, hotel) => sum + hotel.reviews, 0);

        return {
            totalHotels: hotels.length,
            totalRevenue: Math.round(totalRevenue),
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
        };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8400ff]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {user?.role === 'host' ? 'My Hotels' : 'Hotels Management'}
                    </h1>
                    <p className="text-gray-400">
                        {user?.role === 'host'
                            ? 'Manage your hotel listings and performance'
                            : 'Monitor and manage all hotels on the platform'
                        }
                    </p>
                </div>
                {(user?.role === 'host' || user?.role === 'admin') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-magic flex items-center space-x-2 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Hotel</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bento-card p-4 border border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search hotels by name or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-magic w-full pl-10 py-2 rounded-lg"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bento-card p-4 border border-white/10">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                            <Building2 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-400">
                                {user?.role === 'host' ? 'My Hotels' : 'Total Hotels'}
                            </p>
                            <p className="text-lg font-semibold text-white">{stats.totalHotels}</p>
                        </div>
                    </div>
                </div>
                <div className="bento-card p-4 border border-white/10">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                            <DollarSign className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-400">Est. Revenue</p>
                            <p className="text-lg font-semibold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bento-card p-4 border border-white/10">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                            <Star className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-400">Avg Rating</p>
                            <p className="text-lg font-semibold text-white">{stats.averageRating}/5</p>
                        </div>
                    </div>
                </div>
                <div className="bento-card p-4 border border-white/10">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <Users className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-400">Total Reviews</p>
                            <p className="text-lg font-semibold text-white">{stats.totalReviews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hotels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                    <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        onViewHotel={handleViewHotel}
                        onEditHotel={handleEditHotel}
                        onDeleteHotel={handleDeleteHotel}
                        user={user}
                    />
                ))}
            </div>

            {filteredHotels.length === 0 && (
                <div className="text-center py-12 bento-card border border-white/10">
                    <Building2 className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-white">No hotels found</h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {searchTerm
                            ? 'Try adjusting your search criteria.'
                            : user?.role === 'host'
                                ? 'Get started by adding your first hotel.'
                                : 'No hotels are currently registered on the platform.'
                        }
                    </p>
                </div>
            )}

            {/* Create Hotel Modal */}
            {showCreateModal && (
                <CreateHotelModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchHotels();
                    }}
                    user={user}
                />
            )}

            {/* View Hotel Modal */}
            {showViewModal && selectedHotel && (
                <ViewHotelModal
                    hotel={selectedHotel}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedHotel(null);
                    }}
                    onEdit={(hotel) => {
                        setShowViewModal(false);
                        handleEditHotel(hotel);
                    }}
                    onDelete={(hotel) => {
                        setShowViewModal(false);
                        handleDeleteHotel(hotel);
                    }}
                    user={user}
                />
            )}

            {/* Edit Hotel Modal */}
            {showEditModal && selectedHotel && (
                <EditHotelModal
                    hotel={selectedHotel}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedHotel(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedHotel(null);
                        fetchHotels();
                    }}
                    user={user}
                />
            )}
        </div>
    );
};

export default HotelsManagement;
