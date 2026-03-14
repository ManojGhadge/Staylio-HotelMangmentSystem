import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { hotelClaimAPI, hostAPI, hotelAPI } from '../services/api';
import { FileText, CheckCircle, XCircle, Clock, Building2, User, Calendar, ExternalLink } from 'lucide-react';

const HotelClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [hosts, setHosts] = useState({});
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_APPROVAL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [claimsRes, hostsRes, hotelsRes] = await Promise.all([
        hotelClaimAPI.getAllClaims(),
        hostAPI.getAllHosts(),
        hotelAPI.getAllHotels(),
      ]);

      if (claimsRes.data.success) {
        setClaims(claimsRes.data.data);
      }

      // Create lookup maps
      const hostsMap = {};
      const hotelsMap = {};

      if (hostsRes.data.success || hostsRes.data) {
        const hostsList = hostsRes.data.success ? hostsRes.data.data : hostsRes.data;
        hostsList.forEach(host => {
          hostsMap[host.id] = host;
        });
      }

      if (hotelsRes.data.success || hotelsRes.data) {
        const hotelsList = hotelsRes.data.success ? hotelsRes.data.data : hotelsRes.data;
        hotelsList.forEach(hotel => {
          hotelsMap[hotel.id] = hotel;
        });
      }

      setHosts(hostsMap);
      setHotels(hotelsMap);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load claims data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to approve this claim? The hotel will be assigned to this host.')) {
      return;
    }

    try {
      console.log('Approving claim ID:', claimId);
      const response = await hotelClaimAPI.approveClaim(claimId);
      console.log('Approve response:', response);

      if (response.data.success) {
        alert('Claim approved successfully!');
        await loadData(); // Reload data after approval
      } else {
        alert(response.data.message || 'Failed to approve claim');
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Failed to approve claim. Please check console for details.';

      alert(`Error: ${errorMessage}\n\nCheck browser console for more details.`);
    }
  };

  const handleRejectClaim = async () => {
    if (!rejectionMessage.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await hotelClaimAPI.rejectClaim(selectedClaim.id, rejectionMessage);
      if (response.data.success) {
        alert('Claim rejected successfully');
        setShowRejectModal(false);
        setSelectedClaim(null);
        setRejectionMessage('');
        loadData();
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert(error.response?.data?.message || 'Failed to reject claim');
    }
  };

  const openRejectModal = (claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING_APPROVAL: 'Pending Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return texts[status] || status;
  };

  const filteredClaims = filter === 'ALL'
    ? claims
    : claims.filter(claim => claim.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Hotel Claim Requests</h1>
          <p className="text-gray-600 mt-1">Review and manage hotel ownership claims</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex gap-2 flex-wrap">
          {['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {status === 'ALL' ? 'All Claims' : getStatusText(status)}
              <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                {status === 'ALL' ? claims.length : claims.filter(c => c.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Claims List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Claims Found</h3>
          <p className="text-gray-600">
            {filter === 'ALL'
              ? "No hotel claims have been submitted yet"
              : `No ${getStatusText(filter).toLowerCase()} claims`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim, index) => {
            const host = hosts[claim.hostId];
            const hotel = hotels[claim.hotelId];

            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white-900 mb-1">
                        {hotel ? hotel.name : `Hotel ID: ${claim.hotelId}`}
                      </h3>
                      {hotel && (
                        <p className="text-gray-600 text-sm mb-2">
                          {hotel.city}, {hotel.state ? hotel.state + ', ' : ''}{hotel.country}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(claim.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(claim.status)}`}>
                          {getStatusText(claim.status)}
                        </span>
                      </div>
                      {claim.businessName && (
                        <p className="text-gray-700 font-medium">Business: {claim.businessName}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                    </div>
                    {claim.reviewedAt && (
                      <div className="flex items-center gap-1 text-xs">
                        <span>Reviewed: {new Date(claim.reviewedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Host Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Host Information</h4>
                  </div>
                  {host ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-600 ml-2 font-medium">{host.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-600 ml-2 font-medium">{host.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-600 ml-2 font-medium">{host.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <span className="text-gray-600 ml-2 font-medium">{host.companyName}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Host ID: {claim.hostId}</p>
                  )}
                </div>

                {/* Claim Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Claim Reason</h4>
                    <p className="text-gray-600 text-sm">{claim.claimReason}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Association Details</h4>
                    <p className="text-gray-600 text-sm">{claim.associationDetails}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Contact Details</h4>
                  <p className="text-gray-600 text-sm">{claim.contactDetails}</p>
                </div>

                {/* Documents */}
                {(claim.documentUrls || claim.governmentIdUrl) && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Documents</h4>
                    <div className="space-y-2">
                      {claim.documentUrls && (
                        <div>
                          <span className="text-sm text-gray-600">Supporting Documents:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {claim.documentUrls.split(',').map((url, index) => (
                              <a
                                key={index}
                                href={url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Document {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {claim.governmentIdUrl && (
                        <div>
                          <span className="text-sm text-gray-600">Government ID:</span>
                          <a
                            href={claim.governmentIdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {claim.additionalProof && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Additional Proof</h4>
                    <p className="text-gray-600 text-sm">{claim.additionalProof}</p>
                  </div>
                )}

                {/* Rejection Message */}
                {claim.status === 'REJECTED' && claim.rejectionMessage && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</h4>
                    <p className="text-red-700 text-sm">{claim.rejectionMessage}</p>
                  </div>
                )}

                {/* Actions */}
                {claim.status === 'PENDING_APPROVAL' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApproveClaim(claim.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Claim
                    </button>
                    <button
                      onClick={() => openRejectModal(claim)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Claim
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Claim</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this claim. This message will be visible to the host.
            </p>
            <textarea
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleRejectClaim}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedClaim(null);
                  setRejectionMessage('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HotelClaimsPage;
