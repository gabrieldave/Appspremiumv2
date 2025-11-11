import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { LogOut, TrendingUp, Download, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Trading Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Status</h2>
              <SubscriptionStatus />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Trading Signals</h3>
                    <p className="text-gray-600">Access premium VIP signals</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Download className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Downloads</h3>
                    <p className="text-gray-600">Latest trading tools</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/pricing"
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Plans
                </Link>
                <button className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Support
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Community</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Join our exclusive trading community for tips, strategies, and market insights.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}