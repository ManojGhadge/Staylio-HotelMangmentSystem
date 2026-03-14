import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testHostRegistration = async () => {
    setLoading(true);
    try {
      const testData = {
        ownerName: 'Test Host Owner',
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890',
        password: 'testpass123',
        companyName: 'Test Hotel Company',
        businessAddress: '123 Test Street, Test City, TC 12345',
        kycDocumentUrl: 'https://example.com/kyc.pdf',
        payoutDetails: 'Bank Account: 1234567890'
      };

      const response = await fetch('http://localhost:8080/api/auth/signup-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();

      if (result.success) {
        addResult('Host Registration', true, `Host registered successfully with ID: ${result.hostId}`);
      } else {
        addResult('Host Registration', false, result.message);
      }
    } catch (error) {
      addResult('Host Registration', false, error.message);
    }
    setLoading(false);
  };

  const testHostLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123'
        })
      });

      const result = await response.json();

      if (result.success) {
        addResult('Host Login', true, `Login successful for ${result.user.name}`);
      } else {
        addResult('Host Login', false, result.message);
      }
    } catch (error) {
      addResult('Host Login', false, error.message);
    }
    setLoading(false);
  };

  const testGetPendingHosts = async () => {
    setLoading(true);
    try {
      // Try admin endpoint first
      let response = await fetch('http://localhost:8080/api/admin/hosts/pending');
      let hosts;

      if (response.ok) {
        hosts = await response.json();
        addResult('Get Pending Hosts (Admin)', true, `Found ${hosts.length} pending hosts`);
      } else {
        // Try alternative endpoint
        response = await fetch('http://localhost:8080/api/hosts/pending');
        if (response.ok) {
          hosts = await response.json();
          addResult('Get Pending Hosts (Direct)', true, `Found ${hosts.length} pending hosts`);
        } else {
          addResult('Get Pending Hosts', false, `Both endpoints failed. Status: ${response.status}`);
        }
      }
    } catch (error) {
      addResult('Get Pending Hosts', false, error.message);
    }
    setLoading(false);
  };

  const testGetAllHosts = async () => {
    setLoading(true);
    try {
      // Try admin endpoint first
      let response = await fetch('http://localhost:8080/api/admin/hosts');
      let hosts;

      if (response.ok) {
        hosts = await response.json();
        addResult('Get All Hosts (Admin)', true, `Found ${hosts.length} total hosts`);
      } else {
        // Try alternative endpoint
        response = await fetch('http://localhost:8080/api/hosts');
        if (response.ok) {
          hosts = await response.json();
          addResult('Get All Hosts (Direct)', true, `Found ${hosts.length} total hosts`);
        } else {
          addResult('Get All Hosts', false, `Both endpoints failed. Status: ${response.status}`);
        }
      }
    } catch (error) {
      addResult('Get All Hosts', false, error.message);
    }
    setLoading(false);
  };

  const testApproveHost = async () => {
    setLoading(true);
    try {
      // First get a pending host
      const hostsResponse = await fetch('http://localhost:8080/api/hosts/pending');
      const hosts = await hostsResponse.json();

      if (hosts.length === 0) {
        addResult('Approve Host', false, 'No pending hosts found to approve');
        setLoading(false);
        return;
      }

      const hostId = hosts[0].id;
      const response = await fetch(`http://localhost:8080/api/admin/hosts/${hostId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        addResult('Approve Host', true, `Host ${hostId} approved successfully`);
      } else {
        addResult('Approve Host', false, result.message);
      }
    } catch (error) {
      addResult('Approve Host', false, error.message);
    }
    setLoading(false);
  };

  const testRejectHost = async () => {
    setLoading(true);
    try {
      // First get a pending host
      const hostsResponse = await fetch('http://localhost:8080/api/hosts/pending');
      const hosts = await hostsResponse.json();

      if (hosts.length === 0) {
        addResult('Reject Host', false, 'No pending hosts found to reject');
        setLoading(false);
        return;
      }

      const hostId = hosts[0].id;
      const response = await fetch(`http://localhost:8080/api/admin/hosts/${hostId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Test rejection' })
      });

      const result = await response.json();

      if (result.success) {
        addResult('Reject Host', true, `Host ${hostId} rejected successfully`);
      } else {
        addResult('Reject Host', false, result.message);
      }
    } catch (error) {
      addResult('Reject Host', false, error.message);
    }
    setLoading(false);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/hosts');
      if (response.ok) {
        addResult('Backend Connection', true, `Backend is running on port 8080`);
      } else {
        addResult('Backend Connection', false, `Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      addResult('Backend Connection', false, `Cannot connect to backend: ${error.message}`);
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    clearResults();
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testHostRegistration();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetAllHosts();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetPendingHosts();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bento-card p-6 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6">Authentication API Test Page</h1>

        {user && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-400">Current User:</h3>
            <p className="text-blue-300">{user.name} ({user.email}) - Role: {user.role}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testHostRegistration}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Test Host Registration
          </button>

          <button
            onClick={testHostLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Test Host Login
          </button>

          <button
            onClick={testGetPendingHosts}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            Test Get Pending Hosts
          </button>

          <button
            onClick={testGetAllHosts}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Test Get All Hosts
          </button>

          <button
            onClick={testApproveHost}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Test Approve Host
          </button>

          <button
            onClick={testRejectHost}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Test Reject Host
          </button>

          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Test Backend Connection
          </button>

          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            Run All Tests
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Test Results</h2>
          <button
            onClick={clearResults}
            className="bg-white/10 text-gray-300 px-3 py-1 rounded text-sm hover:bg-white/20 transition-colors"
          >
            Clear Results
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test results yet. Click a test button to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${result.success
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : 'bg-red-500/10 border-red-500 text-red-400'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{result.test}:</span>
                    <span className="ml-2 text-gray-300">{result.message}</span>
                  </div>
                  <span className="text-xs opacity-75 text-gray-500">{result.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bento-card p-6 border border-white/10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8400ff] mx-auto"></div>
              <p className="mt-2 text-center text-white">Running test...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTestPage;