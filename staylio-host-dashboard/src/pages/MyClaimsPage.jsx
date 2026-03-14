import { useState, useEffect } from 'react';
import { hotelClaimAPI } from '../services/api';
import { FileText, Clock, CheckCircle, XCircle, Building2, Calendar } from 'lucide-react';

const MyClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const hostId = JSON.parse(localStorage.getItem('staylio_user') || '{}').id;

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await hotelClaimAPI.getClaimsByHost(hostId);
      if (response.data.success) {
        const sortedClaims = response.data.data.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setClaims(sortedClaims);
      }
    } catch (error) {
      console.error('Error loading claims:', error);
      alert('Failed to load claims');
    } finally {
      setLoading(false);
    }
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
      PENDING_APPROVAL: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Hotel Claims</h1>
        <p className="text-gray-400">Track the status of your hotel ownership claims</p>
      </div>

      {/* Filter Tabs */}
      <div className="bento-card p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status
                ? 'btn-magic text-white'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
            >
              {status === 'ALL' ? 'All Claims' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bento-card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Claims Found</h3>
          <p className="text-gray-400">
            {filter === 'ALL'
              ? "You haven't submitted any hotel claims yet"
              : `No ${getStatusText(filter).toLowerCase()} claims`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="bento-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-[#8400ff]/10 rounded-lg border border-[#8400ff]/20">
                    <Building2 className="w-6 h-6 text-[#a855f7]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Hotel ID: {claim.hotelId}
                    </h3>
                    {claim.businessName && (
                      <p className="text-gray-400 mb-2">{claim.businessName}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(claim.status)}`}>
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted: {new Date(claim.createdAt).toLocaleDateString()}</span>
                  </div>
                  {claim.reviewedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Reviewed: {new Date(claim.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Claim Reason</h4>
                  <p className="text-gray-400 text-sm">{claim.claimReason}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Association Details</h4>
                  <p className="text-gray-400 text-sm">{claim.associationDetails}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Contact Details</h4>
                <p className="text-gray-400 text-sm">{claim.contactDetails}</p>
              </div>

              {claim.documentUrls && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Supporting Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {claim.documentUrls.split(',').map((url, index) => (
                      <a
                        key={index}
                        href={url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a855f7] hover:text-[#c084fc] text-sm underline"
                      >
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {claim.governmentIdUrl && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Government ID</h4>
                  <a
                    href={claim.governmentIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a855f7] hover:text-[#c084fc] text-sm underline"
                  >
                    View Document
                  </a>
                </div>
              )}

              {claim.additionalProof && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Additional Proof</h4>
                  <p className="text-gray-400 text-sm">{claim.additionalProof}</p>
                </div>
              )}

              {claim.status === 'REJECTED' && claim.rejectionMessage && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-400 mb-1">Rejection Reason</h4>
                  <p className="text-red-300 text-sm">{claim.rejectionMessage}</p>
                </div>
              )}

              {claim.status === 'APPROVED' && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">
                    ✓ Your claim has been approved! You now have access to manage this hotel.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaimsPage;
