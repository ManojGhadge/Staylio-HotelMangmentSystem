import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hostAPI } from '../services/api';
import {
    User,
    Mail,
    Phone,
    Building2,
    Calendar,
    Shield,
    Edit2,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    FileText,
    CreditCard,
    Server,
} from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            if (!user?.id) {
                setMessage({
                    type: 'error',
                    text: 'User ID not found. Please log in again.'
                });
                setLoading(false);
                return;
            }

            const response = await hostAPI.getHostProfile(user.id);
            const profileData = response.data.data;

            setProfile(profileData);
            setEditedProfile(profileData);
        } catch (error) {
            console.error('Error fetching profile:', error);

            // Check if it's a network error (backend not running)
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || error.code === 'ECONNREFUSED') {
                setMessage({
                    type: 'error',
                    text: '⚠️ Cannot connect to server. Please make sure the backend is running on port 8080.'
                });
            } else if (error.response?.status === 404) {
                setMessage({
                    type: 'error',
                    text: 'Profile not found. Please contact support.'
                });
            } else if (error.response?.status === 403) {
                setMessage({
                    type: 'error',
                    text: 'Access denied. Your account may not be approved yet.'
                });
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to load profile. Please try again later.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...profile });
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            const response = await hostAPI.updateHostProfile(user.id, editedProfile);

            setProfile(response.data.data);
            setEditedProfile(response.data.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getStatusBadge = (status) => {
        const badges = {
            APPROVED: { color: 'bg-green-500/20 text-green-400 border border-green-500/30', icon: CheckCircle, text: 'Approved' },
            PENDING_APPROVAL: { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: AlertCircle, text: 'Pending Approval' },
            REJECTED: { color: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: X, text: 'Rejected' },
        };

        const badge = badges[status] || badges.PENDING_APPROVAL;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${badge.color}`}>
                <Icon className="h-4 w-4 mr-1" />
                {badge.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff] mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading profile...</p>
            </div>
        );
    }

    // Show error state if profile failed to load
    if (message.type === 'error' && !profile) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                    <p className="text-gray-400 mt-1">Manage your account information</p>
                </div>

                <div className="bento-card text-center py-12">
                    <Server className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Profile</h3>
                    <p className="text-red-400 mb-6">{message.text}</p>

                    <div className="bg-white/5 rounded-lg p-6 max-w-2xl mx-auto text-left border border-white/10">
                        <h4 className="font-semibold text-white mb-3">To fix this issue:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                            <li>Make sure your Spring Boot backend is running</li>
                            <li>Check that it's running on port 8080</li>
                            <li>Verify the database connection is working</li>
                            <li>Check the console for any backend errors</li>
                        </ol>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Start the backend with:</p>
                            <code className="block bg-black/50 text-green-400 p-3 rounded text-sm border border-white/10">
                                cd staylio-backend && mvn spring-boot:run
                            </code>
                        </div>
                    </div>

                    <button
                        onClick={fetchProfile}
                        className="btn-magic mt-6 text-white px-6 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                    <p className="text-gray-400 mt-1">Manage your account information</p>
                </div>

                {profile && !isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="btn-magic text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                    </button>
                ) : profile && isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-2"
                            disabled={saving}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-magic text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            disabled={saving}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : null}
            </div>

            {/* Message Alert */}
            {message.text && profile && (
                <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                    <div className="flex items-center">
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                            <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        {message.text}
                    </div>
                </div>
            )}

            {/* Profile Content */}
            {profile && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Summary */}
                    <div className="lg:col-span-1">
                        <div className="bento-card text-center p-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#8400ff] to-[#6366f1] rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold border-4 border-[#0f172a]">
                                {profile?.ownerName?.charAt(0)?.toUpperCase() || 'H'}
                            </div>
                            <h2 className="text-xl font-bold text-white mt-4">{profile?.ownerName || 'N/A'}</h2>
                            <p className="text-gray-400 mt-1">{profile?.email || 'N/A'}</p>
                            <div className="mt-4">
                                {getStatusBadge(profile?.status)}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-left">
                                <div className="flex items-center text-sm text-gray-400">
                                    <Calendar className="h-4 w-4 mr-2 text-[#a855f7]" />
                                    Joined {formatDate(profile?.createdAt)}
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                    <Shield className="h-4 w-4 mr-2 text-[#a855f7]" />
                                    Host Account
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bento-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2 text-[#a855f7]" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Owner Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.ownerName || ''}
                                            onChange={(e) => handleChange('ownerName', e.target.value)}
                                            className="input-magic w-full px-3 py-2 rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-white">{profile?.ownerName || 'N/A'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Email Address
                                        <span className="text-xs text-gray-500 ml-2">(Read-only)</span>
                                    </label>
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                        <p className="text-white">{profile?.email || 'N/A'}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedProfile.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="input-magic w-full px-3 py-2 rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-white">{profile?.phone || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="bento-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Building2 className="h-5 w-5 mr-2 text-[#a855f7]" />
                                Business Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Company Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.companyName || ''}
                                            onChange={(e) => handleChange('companyName', e.target.value)}
                                            className="input-magic w-full px-3 py-2 rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-white">{profile?.companyName || 'N/A'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Business Address
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.businessAddress || ''}
                                            onChange={(e) => handleChange('businessAddress', e.target.value)}
                                            rows={3}
                                            className="input-magic w-full px-3 py-2 rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-white">{profile?.businessAddress || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bento-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-[#a855f7]" />
                                Additional Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        KYC Document URL
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={editedProfile.kycDocumentUrl || ''}
                                            onChange={(e) => handleChange('kycDocumentUrl', e.target.value)}
                                            placeholder="https://example.com/document.pdf"
                                            className="input-magic w-full px-3 py-2 rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-white">
                                            {profile?.kycDocumentUrl ? (
                                                <a href={profile.kycDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline hover:text-[#c084fc]">
                                                    View Document
                                                </a>
                                            ) : 'N/A'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Payout Details
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.payoutDetails || ''}
                                            onChange={(e) => handleChange('payoutDetails', e.target.value)}
                                            rows={3}
                                            placeholder="Bank account details, payment gateway info, etc."
                                            className="input-magic w-full px-3 py-2 rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-white whitespace-pre-wrap">{profile?.payoutDetails || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
