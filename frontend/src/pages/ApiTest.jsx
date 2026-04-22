import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ApiTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [userRole, setUserRole] = useState('patient'); // patient, doctor, assistant, admin

  const addResult = (testName, status, data, error = null) => {
    setResults(prev => [...prev, { testName, status, data, error, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Get all doctors
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctors`);
      addResult('GET /api/doctors', 'success', res.data);
    } catch (error) {
      addResult('GET /api/doctors', 'error', null, error.message);
    }

    // Test 2: Get all specialities
    try {
      const res = await axios.get(`${API_BASE_URL}/api/specialities`);
      addResult('GET /api/specialities', 'success', res.data);
    } catch (error) {
      addResult('GET /api/specialities', 'error', null, error.message);
    }

    // Test 3: Patient profile (requires patient-token)
    if (token && userRole === 'patient') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/patients/profile`, {
          headers: { 'patient-token': token }
        });
        addResult('GET /patients/profile', 'success', res.data);
      } catch (error) {
        addResult('GET /patients/profile', 'error', null, error.message);
      }
    }

    // Test 4: Patient appointments (requires patient-token)
    if (token && userRole === 'patient') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/patient`, {
          headers: { 'patient-token': token }
        });
        addResult('GET /api/appointments/patient', 'success', res.data);
      } catch (error) {
        addResult('GET /api/appointments/patient', 'error', null, error.message);
      }
    }

    // Test 5: Admin appointments (requires admin-token)
    if (token && userRole === 'admin') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/appointments`, {
          headers: { 'admin-token': token }
        });
        addResult('GET /api/admin/appointments', 'success', res.data);
      } catch (error) {
        addResult('GET /api/admin/appointments', 'error', null, error.message);
      }
    }

    // Test 6: Admin accounts (requires admin-token)
    if (token && userRole === 'admin') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/accounts`, {
          headers: { 'admin-token': token }
        });
        addResult('GET /api/admin/accounts', 'success', res.data);
      } catch (error) {
        addResult('GET /api/admin/accounts', 'error', null, error.message);
      }
    }

    // Test 7: Admin assistants (requires admin-token)
    if (token && userRole === 'admin') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/assistants/admin/assistants`, {
          headers: { 'admin-token': token }
        });
        addResult('GET /api/assistants/admin/assistants', 'success', res.data);
      } catch (error) {
        addResult('GET /api/assistants/admin/assistants', 'error', null, error.message);
      }
    }

    // Test 8: Assistant profile (requires assistant-token)
    if (token && userRole === 'assistant') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/assistants/profile`, {
          headers: { 'assistant-token': token }
        });
        addResult('GET /assistants/profile', 'success', res.data);
      } catch (error) {
        addResult('GET /assistants/profile', 'error', null, error.message);
      }
    }

    // Test 9: Doctor appointments (requires doctor-token)
    if (token && userRole === 'doctor') {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/doctors/1/appointments`, {
          headers: { 'doctor-token': token }
        });
        addResult('GET /api/doctors/:id/appointments', 'success', res.data);
      } catch (error) {
        addResult('GET /api/doctors/:id/appointments', 'error', null, error.message);
      }
    }

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Dashboard</h1>
        
        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Base URL</label>
              <input
                type="text"
                value={API_BASE_URL}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="assistant">Assistant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auth Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your token here"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results ({results.length})</h2>
          {results.length === 0 ? (
            <p className="text-gray-500">No results yet. Run tests to see results.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{result.testName}</h3>
                      <p className="text-sm text-gray-500">{result.timestamp}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  {result.error && (
                    <p className="mt-2 text-red-600 text-sm">Error: {result.error}</p>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">View Response Data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Select the user role you want to test with</li>
            <li>Paste the corresponding auth token from localStorage (patientToken, doctorToken, assistantToken, or adminToken)</li>
            <li>Click "Run All Tests" to execute all API calls</li>
            <li>Review the results to see which endpoints are working correctly</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded">
            <p className="text-sm font-medium">To get your token, open browser console and run:</p>
            <code className="text-xs">localStorage.getItem('patientToken')</code>
            <br />
            <code className="text-xs">localStorage.getItem('doctorToken')</code>
            <br />
            <code className="text-xs">localStorage.getItem('assistantToken')</code>
            <br />
            <code className="text-xs">localStorage.getItem('adminToken')</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
