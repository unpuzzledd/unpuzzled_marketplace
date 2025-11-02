import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { AdminAcademyManagement } from './AdminAcademyManagement';
import { AdminLocationManagement } from './AdminLocationManagement';
import { AdminSkillManagement } from './AdminSkillManagement';
import { AdminApprovalWorkflows } from './AdminApprovalWorkflows';
import { AdminPhotoApproval } from './AdminPhotoApproval';

interface AdminDashboardProps {
  onDataUpdate?: () => void;
}

type DashboardTab = 'overview' | 'academies' | 'locations' | 'skills' | 'approvals' | 'photos';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onDataUpdate
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, activitiesData] = await Promise.all([
        AdminApi.getDashboardStats(),
        AdminApi.getRecentActivities(10)
      ]);
      setStats(statsData);
      setRecentActivities(activitiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = () => {
    loadDashboardData();
    onDataUpdate?.();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'academies', label: 'Academies', icon: '🏫' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'approvals', label: 'Approvals', icon: '✅' },
    { id: 'photos', label: 'Photos', icon: '📸' }
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage academies, locations, skills, and approvals</p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">🏫</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Academies</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalAcademies}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold">⏳</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Academies</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingAcademies}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">✅</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Academies</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeAcademies}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold">🚫</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Suspended Academies</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.suspendedAcademies}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">📸</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Photos</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingPhotos}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">🎯</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Skills</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingSkills}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-semibold">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Admins</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalAdmins}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">📍</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Locations</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalSkills}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                      No recent activities
                    </div>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              activity.status === 'active' ? 'bg-green-100 text-green-800' :
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Academies Tab */}
          {activeTab === 'academies' && (
            <AdminAcademyManagement onAcademyUpdate={handleDataUpdate} />
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <AdminLocationManagement onLocationUpdate={handleDataUpdate} />
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <AdminSkillManagement onSkillUpdate={handleDataUpdate} />
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <AdminApprovalWorkflows onApprovalComplete={handleDataUpdate} />
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <AdminPhotoApproval onApprovalComplete={handleDataUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};
