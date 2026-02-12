import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import type { AdminActionResult } from '../api/client';

interface AdminAction {
  name: string;
  apiFunction: () => Promise<AdminActionResult>;
  description: string;
}

interface ActionResult {
  success: boolean;
  data?: AdminActionResult;
  error?: string;
}

interface SystemStatus {
  totalRaces: number;
  completedRaces: number;
  pendingRaces: number;
  lastSync: string;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ActionResult | null>>({});
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.isAdmin === true;

  const adminActions: AdminAction[] = [
    {
      name: 'Update Driver Photos',
      apiFunction: api.updateDriverPhotos,
      description: 'Fetch latest driver profile pictures from OpenF1 API'
    },
    {
      name: 'Process Completed Races',
      apiFunction: api.processCompletedRaces,
      description: 'Update race results and calculate prediction scores for completed races'
    },
    {
      name: 'Sync Race Data',
      apiFunction: api.syncRaceData,
      description: 'Fetch latest race calendar and data from Jolpica API (skips if data exists)'
    },
    {
      name: 'Force Sync Race Data',
      apiFunction: api.forceSyncRaceData,
      description: 'Force sync race data by deleting existing data and fetching fresh data'
    },
    {
      name: 'Force Sync Weekend Schedules',
      apiFunction: api.forceSyncWeekendSchedules,
      description: 'Force sync weekend schedules (practice & qualifying times) for all races in current season'
    },
    {
      name: 'Sync Driver Data',
      apiFunction: api.syncDriverData,
      description: 'Fetch latest driver and constructor data from Jolpica API'
    },
    {
      name: 'Get System Status',
      apiFunction: api.getSystemStatus,
      description: 'View current system status and race statistics'
    }
  ];

  const executeAction = async (action: AdminAction) => {
    setLoading(action.name);
    setResults(prev => ({ ...prev, [action.name]: null }));

    try {
      const data = await action.apiFunction();
      
      setResults(prev => ({ ...prev, [action.name]: { success: true, data } }));
      if (action.name === 'Get System Status') {
        setSystemStatus(data as unknown as SystemStatus);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      setResults(prev => ({
        ...prev,
        [action.name]: {
          success: false,
          error: axiosError.response?.data?.error || axiosError.message || 'Unknown error'
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-f1-red">F1</span> Chatter Admin Panel
          </h1>
          <p className="text-slate-400">Manage system operations and data synchronization</p>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-950/50 p-4 rounded-lg">
                <p className="text-sm text-blue-400">Total Races</p>
                <p className="text-2xl font-bold text-white">{systemStatus.totalRaces}</p>
              </div>
              <div className="bg-green-950/50 p-4 rounded-lg">
                <p className="text-sm text-green-400">Completed Races</p>
                <p className="text-2xl font-bold text-white">{systemStatus.completedRaces}</p>
              </div>
              <div className="bg-yellow-950/50 p-4 rounded-lg">
                <p className="text-sm text-yellow-400">Pending Races</p>
                <p className="text-2xl font-bold text-white">{systemStatus.pendingRaces}</p>
              </div>
              <div className="bg-f1-bg p-4 rounded-lg">
                <p className="text-sm text-slate-400">Last Sync</p>
                <p className="text-lg font-semibold text-white">{systemStatus.lastSync}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adminActions.map((action) => (
            <div key={action.name} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{action.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                </div>
              </div>

              <button
                onClick={() => executeAction(action)}
                disabled={loading === action.name}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  loading === action.name
                    ? 'bg-f1-surface-elevated text-slate-500 cursor-not-allowed'
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
              {(() => {
                const result = results[action.name];
                if (!result) return null;
                return (
                  <div className={`mt-4 p-3 rounded-md ${
                    result.success
                      ? 'bg-green-950/50 border border-green-500/30'
                      : 'bg-red-950/50 border border-red-500/30'
                  }`}>
                    <p className={`text-sm font-medium ${
                      result.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.success ? 'Success' : 'Error'}
                    </p>
                    <pre className="text-xs mt-1 overflow-x-auto text-slate-300">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
