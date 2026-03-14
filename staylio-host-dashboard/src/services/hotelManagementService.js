import { hotelAPI } from './api';

let currentUser = null;

export const setUser = (user) => {
    currentUser = user;
};

export const fetchHotels = async () => {
    try {
        let response;
        if (currentUser?.role === 'admin') {
            response = await hotelAPI.getAllHotels();
        } else if (currentUser?.role === 'host') {
            if (currentUser.hostname) {
                response = await hotelAPI.getHotelsByHostname(currentUser.hostname);
            } else if (currentUser.id) {
                response = await hotelAPI.getHotelsByHostId(currentUser.id);
            } else {
                return { success: false, message: 'Host information missing' };
            }
        } else {
            return { success: false, message: 'Unauthorized role' };
        }

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error fetching hotels:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Failed to fetch hotels' 
        };
    }
};

export const createHotel = async (hotelData) => {
    try {
        const response = await hotelAPI.createHotel(hotelData);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error creating hotel:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Failed to create hotel' 
        };
    }
};

export const updateHotel = async (id, hotelData) => {
    try {
        const response = await hotelAPI.updateHotel(id, hotelData);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error updating hotel:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Failed to update hotel' 
        };
    }
};

export const deleteHotel = async (id) => {
    try {
        const response = await hotelAPI.deleteHotel(id);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error deleting hotel:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Failed to delete hotel' 
        };
    }
};

export const canEditHotel = (hotel) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'host') {
        return hotel.hostname === currentUser.hostname || hotel.hostId === currentUser.id;
    }
    return false;
};

export const canDeleteHotel = (hotel) => {
    return canEditHotel(hotel);
};

const hotelManagementService = {
    setUser,
    fetchHotels,
    createHotel,
    updateHotel,
    deleteHotel,
    canEditHotel,
    canDeleteHotel
};

export default hotelManagementService;
