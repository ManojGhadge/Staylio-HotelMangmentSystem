import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, Filter, CheckCircle, XCircle, Eye, Mail, Phone, X, FileText, Edit, Trash2 } from 'lucide-react';
import { adminAPI, hotelAPI } from '../services/api';

const HostsManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHost, setEditingHost] = useState(null);
  const [hostHotels, setHostHotels] = useState([]);
  const [editFormData, setEditFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    companyName: '',
    businessAddress: '',
  });

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllHosts();
      setHosts(response.data);
    } catch (error) {
      console.error('Error fetching hosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hostId) => {
    if (window.confirm('Are you sure you want to approve this host?')) {
      try {
        await adminAPI.approveHost(hostId);
        fetchHosts();
      } catch (error) {
        console.error('Error approving host:', error);
        alert('Failed to approve host');
      }
    }
  };

  const handleReject = async (hostId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await adminAPI.rejectHost(hostId, reason);
        fetchHosts();
      } catch (error) {
        console.error('Error rejecting host:', error);
        alert('Failed to reject host');
      }
    }
  };

  const handleViewDetails = async (host) => {
    setSelectedHost(host);
    setShowDetailModal(true);

    // Fetch hotels for this host
    try {
      const response = await hotelAPI.getHotelsByHost(host.id);
      setHostHotels(response.data);
    } catch (error) {
      console.error('Error fetching host hotels:', error);
      setHostHotels([]);
    }
  };

  const handleEdit = (host) => {
    setEditingHost(host);
    setEditFormData({
      ownerName: host.ownerName || '',
      email: host.email || '',
      phone: host.phone || '',
      companyName: host.companyName || '',
      businessAddress: host.businessAddress || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.updateHost(editingHost.id, editFormData);
      if (response.data.success) {
        alert('Host updated successfully!');
        fetchHosts();
        setShowEditModal(false);
        setEditingHost(null);
      }
    } catch (error) {
      console.error('Error updating host:', error);
      alert(error.response?.data?.message || 'Failed to update host');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (hostId) => {
    if (window.confirm('Are you sure you want to delete this host? This action cannot be undone.')) {
      try {
        const response = await adminAPI.deleteHost(hostId);
        if (response.data.success) {
          alert('Host deleted successfully!');
          fetchHosts();
        }
      } catch (error) {
        console.error('Error deleting host:', error);
        alert(error.response?.data?.message || 'Failed to delete host');
      }
    }
  };

  const filteredHosts = hosts.filter(host => {
    const matchesSearch = (host.ownerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (host.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || host.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Hosts Management</h1>
          <p className="text-slate-400 mt-1">Manage and approve host registrations</p>
        </div>
      </motion.div>



      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="host-search" className="block mb-2.5 text-sm font-medium text-white sr-only">
                Search Hosts
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="search"
                  id="host-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full p-3 ps-10 bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500 transition-all duration-200"
                  placeholder="Search hosts by name or email..."
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-xs px-3 py-1.5 transition-all duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
              {searchTerm && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-slate-400"
                >
                  Found <span className="font-semibold text-blue-400">{filteredHosts.length}</span> host{filteredHosts.length !== 1 ? 's' : ''}
                </motion.p>
              )}
            </form>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap items-start lg:items-center">
            {['all', 'APPROVED', 'PENDING_APPROVAL'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-[#0f172a]/50 text-slate-400 hover:bg-[#1e293b] hover:text-white border border-white/5'
                  }`}
              >
                {status === 'all' ? 'All' : status === 'APPROVED' ? 'Approved' : 'Pending'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hosts Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredHosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Building2 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Hosts Found</h3>
          <p className="text-slate-400">No hosts match your search criteria</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-table-container"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead>
                <tr>
                  <th className="admin-table-header">Host</th>
                  <th className="admin-table-header">Contact</th>
                  <th className="admin-table-header">Company</th>
                  <th className="admin-table-header">Status</th>
                  <th className="admin-table-header">Joined</th>
                  <th className="admin-table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHosts.map((host, index) => (
                  <motion.tr
                    key={host.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="admin-table-row"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {host.ownerName?.charAt(0) || 'H'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{host.ownerName}</div>
                          <div className="text-sm text-slate-500">ID: {host.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-slate-500" />
                        {host.email}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-1 text-slate-500" />
                        {host.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{host.companyName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${host.status === 'APPROVED'
                        ? 'badge-success'
                        : host.status === 'REJECTED'
                          ? 'badge-danger'
                          : 'badge-warning'
                        }`}>
                        {host.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {host.createdAt ? new Date(host.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(host)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {host.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleApprove(host.id)}
                              className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(host.id)}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(host)}
                          className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(host.id)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Host Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Host Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Owner Name</label>
                    <p className="text-white font-medium text-lg">{selectedHost.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Company Name</label>
                    <p className="text-white font-medium text-lg">{selectedHost.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Email</label>
                    <p className="text-white">{selectedHost.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Phone</label>
                    <p className="text-white">{selectedHost.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Status</label>
                    <p className={`font-semibold ${selectedHost.status === 'APPROVED' ? 'text-green-400' :
                      selectedHost.status === 'REJECTED' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                      {selectedHost.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Joined Date</label>
                    <p className="text-white">
                      {selectedHost.createdAt ? new Date(selectedHost.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Business Address */}
                <div>
                  <label className="text-sm font-medium text-slate-400">Business Address</label>
                  <p className="text-white">{selectedHost.businessAddress || 'N/A'}</p>
                </div>

                {/* KYC Document */}
                {selectedHost.kycDocumentUrl && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">KYC Document</label>
                    <a
                      href={selectedHost.kycDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Document
                    </a>
                  </div>
                )}

                {/* Payout Details */}
                {selectedHost.payoutDetails && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">Payout Details</label>
                    <p className="text-white">{selectedHost.payoutDetails}</p>
                  </div>
                )}

                {/* Hotels */}
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Hotels ({hostHotels.length})</label>
                  {hostHotels.length > 0 ? (
                    <div className="space-y-2">
                      {hostHotels.map(hotel => (
                        <div key={hotel.id} className="p-3 bg-[#0f172a]/50 rounded-lg border border-white/5">
                          <p className="font-medium text-white">{hotel.name}</p>
                          <p className="text-sm text-slate-400">{hotel.city}, {hotel.country}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No hotels claimed yet</p>
                  )}
                </div>

                {/* Actions */}
                {selectedHost.status === 'PENDING_APPROVAL' && (
                  <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        handleApprove(selectedHost.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 btn-success flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Host
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedHost.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 btn-danger flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Host
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Host Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Edit Host</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={editFormData.ownerName}
                    onChange={handleEditInputChange}
                    required
                    className="input-field"
                    placeholder="Enter owner name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                    className="input-field"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    required
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={editFormData.companyName}
                    onChange={handleEditInputChange}
                    required
                    className="input-field"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    name="businessAddress"
                    value={editFormData.businessAddress}
                    onChange={handleEditInputChange}
                    required
                    rows="3"
                    className="input-field"
                    placeholder="Enter business address"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Update Host
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 text-green-400 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]} border-l-4`}>
      <p className="text-sm text-slate-300 mb-1 font-medium">{title}</p>
      <p className="text-3xl font-bold text-white shadow-sm">
        {value}
      </p>
    </div>
  );
};

export default HostsManagementPage;
