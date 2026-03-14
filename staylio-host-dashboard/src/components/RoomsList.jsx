import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BedDouble, Users, IndianRupee } from 'lucide-react';
import { roomAPI } from '../services/api';
import RoomForm from './RoomForm';

const RoomsList = ({ hotelId, hostId }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await roomAPI.getRoomsByHotelId(hotelId);
            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hotelId) {
            fetchRooms();
        }
    }, [hotelId]);

    const handleDelete = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            try {
                await roomAPI.deleteRoom(hotelId, roomId, hostId);
                fetchRooms();
            } catch (err) {
                console.error('Error deleting room:', err);
                alert('Failed to delete room');
            }
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingRoom(null);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingRoom(null);
        fetchRooms();
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8400ff] mb-4"></div>
                Loading rooms...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Rooms & Inventory</h3>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 btn-magic text-white rounded-lg font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Room
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {rooms.length === 0 && !error ? (
                <div className="text-center py-12 bento-card border border-white/10 border-dashed">
                    <BedDouble className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No rooms added yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first room to start accepting bookings</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bento-card overflow-hidden group border border-white/10 hover:border-[#8400ff]/30 transition-all duration-300">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={room.imageUrl}
                                    alt={room.roomType}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-white border border-white/10">
                                    {room.category}
                                </div>
                                {!room.isActive && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-full">Unavailable</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-white line-clamp-1" title={room.roomType}>
                                        {room.roomType}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[#a855f7] font-bold text-sm">
                                        <IndianRupee className="w-3 h-3" />
                                        {room.pricePerNight}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>Max {room.maxGuests}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 font-medium ${room.roomCount === 0 ? 'text-red-500' :
                                        room.roomCount <= 10 ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                        <BedDouble className="w-4 h-4" />
                                        <span>
                                            {room.roomCount === 0 ? 'Sold Out' : `${room.roomCount} Left`}
                                        </span>
                                    </div>
                                    {room.amenities && (
                                        <div className="flex items-center gap-1 truncate max-w-[120px]" title={room.amenities}>
                                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                            <span className="truncate">{room.amenities.split(',')[0]}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-white/10">
                                    <button
                                        onClick={() => handleEdit(room)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room.id)}
                                        className="flex items-center justify-center p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                                        title="Delete Room"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <RoomForm
                    hotelId={hotelId}
                    hostId={hostId}
                    room={editingRoom}
                    onClose={() => setShowForm(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default RoomsList;
