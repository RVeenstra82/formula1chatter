import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import { useLanguage } from '../contexts/LanguageContext';

interface AdminAction {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  description: string;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email === 'rickveenstra@gmail.com' || user?.isAdmin === true; // Include test user

  const adminActions: AdminAction[] = [
    {
      name: 'Update Driver Photos',
      endpoint: '/api/admin/update-driver-photos',
      method: 'POST',
      description: 'Fetch latest driver profile pictures from OpenF1 API'
    },
    {
      name: 'Process Completed Races',
      endpoint: '/api/admin/process-completed-races',
      method: 'POST',
      description: 'Update race results and calculate prediction scores for completed races'
    },
    {
      name: 'Sync Race Data',
      endpoint: '/api/admin/sync-race-data',
      method: 'POST',
      description: 'Fetch latest race calendar and data from Jolpica API'
    },
    {
      name: 'Sync Driver Data',
      endpoint: '/api/admin/sync-driver-data',
      method: 'POST',
      description: 'Fetch latest driver and constructor data from Jolpica API'
    },
    {
      name: 'Get System Status',
      endpoint: '/api/admin/system-status',
      method: 'GET',
      description: 'View current system status and race statistics'
    }
  ];

  const executeAction = async (action: AdminAction) => {
    setLoading(action.name);
    setResults(prev => ({ ...prev, [action.name]: null }));

    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({ ...prev, [action.name]: { success: true, data } }));
        if (action.name === 'Get System Status') {
          setSystemStatus(data);
        }
      } else {
        setResults(prev => ({ ...prev, [action.name]: { success: false, error: data.error || 'Unknown error' } }));
      }
    } catch (error) {
      setResults(prev => ({ ...prev, [action.name]: { success: false, error: error instanceof Error ? error.message : 'Network error' } }));
    } finally {
      setLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-f1-red">F1</span> Chatter Admin Panel
          </h1>
          <p className="text-gray-600">Manage system operations and data synchronization</p>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Races</p>
                <p className="text-2xl font-bold text-blue-900">{systemStatus.totalRaces}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Completed Races</p>
                <p className="text-2xl font-bold text-green-900">{systemStatus.completedRaces}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Pending Races</p>
                <p className="text-2xl font-bold text-yellow-900">{systemStatus.pendingRaces}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Last Sync</p>
                <p className="text-lg font-semibold text-gray-900">{systemStatus.lastSync}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adminActions.map((action) => (
            <div key={action.name} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  action.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {action.method}
                </span>
              </div>
              
              <button
                onClick={() => executeAction(action)}
                disabled={loading === action.name}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  loading === action.name
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-f1-red text-white hover:bg-red-700'
                }`}
              >
                {loading === action.name ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Executing...
                  </div>
                ) : (
                  `Execute ${action.name}`
                )}
              </button>

              {/* Results */}
              {results[action.name] && (
                <div className={`mt-4 p-3 rounded-md ${
                  results[action.name].success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    results[action.name].success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {results[action.name].success ? 'Success' : 'Error'}
                  </p>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(results[action.name].data || results[action.name].error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
