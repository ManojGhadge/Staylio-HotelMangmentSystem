import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { roomAPI } from '../services/api';

const RoomForm = ({ hotelId, hostId, room, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        roomType: '',
        category: 'Standard',
        pricePerNight: '',
        maxGuests: '',
        roomCount: '1',
        imageUrl: '',
        amenities: '',
        description: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreviewError, setImagePreviewError] = useState(false);

    useEffect(() => {
        if (room) {
            setFormData({
                roomType: room.roomType || '',
                category: room.category || 'Standard',
                pricePerNight: room.pricePerNight || '',
                maxGuests: room.maxGuests || '',
                roomCount: room.roomCount || '1',
                imageUrl: room.imageUrl || '',
                amenities: room.amenities || '',
                description: room.description || '',
                isActive: room.isActive !== undefined ? room.isActive : true
            });
        }
    }, [room]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'imageUrl') {
            setImagePreviewError(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                pricePerNight: parseFloat(formData.pricePerNight),
                maxGuests: parseInt(formData.maxGuests),
                roomCount: parseInt(formData.roomCount)
            };

            if (room) {
                await roomAPI.updateRoom(hotelId, room.id, payload, hostId);
            } else {
                await roomAPI.createRoom(hotelId, payload, hostId);
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving room:', err);
            setError(err.response?.data?.message || 'Failed to save room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bento-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f172a] z-10">
                    <h2 className="text-xl font-bold text-white">
                        {room ? 'Edit Room' : 'Add New Room'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Room Type *</label>
                            <input
                                type="text"
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Deluxe King"
                                className="input-magic w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="input-magic w-full"
                            >
                                <option value="Standard">Standard</option>
                                <option value="Deluxe">Deluxe</option>
                                <option value="Suite">Suite</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Economy">Economy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Price per Night (₹) *</label>
                            <input
                                type="number"
                                name="pricePerNight"
                                value={formData.pricePerNight}
                                onChange={handleChange}
                                required
                                min="0.01"
                                step="0.01"
                                className="input-magic w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Max Guests *</label>
                            <input
                                type="number"
                                name="maxGuests"
                                value={formData.maxGuests}
                                onChange={handleChange}
                                required
                                min="1"
                                className="input-magic w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Room Count (Inventory) *</label>
                            <input
                                type="number"
                                name="roomCount"
                                value={formData.roomCount}
                                onChange={handleChange}
                                required
                                min="1"
                                className="input-magic w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Image URL *</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://example.com/image.jpg"
                                    className="input-magic w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter a direct link to an image (JPG, PNG, WEBP)</p>
                            </div>
                            <div className="w-24 h-24 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {formData.imageUrl && !imagePreviewError ? (
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setImagePreviewError(true)}
                                    />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-600" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amenities</label>
                        <input
                            type="text"
                            name="amenities"
                            value={formData.amenities}
                            onChange={handleChange}
                            placeholder="e.g. WiFi, AC, TV, Balcony (comma separated)"
                            className="input-magic w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="input-magic w-full resize-none"
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#8400ff] border-gray-600 rounded focus:ring-[#8400ff] bg-gray-800"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-300">Available for booking</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors font-medium border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-magic text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Room'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomForm;
