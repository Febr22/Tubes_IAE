import React, { useState } from 'react';
import {
  Home,
  Settings,
  User,
  ShoppingBag,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  CreditCard,
  Package,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-indigo-600">UserDash</span>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 text-indigo-700 bg-indigo-50 rounded-xl transition-colors">
            <Home className="w-5 h-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
            <User className="w-5 h-5 mr-3" />
            <span className="font-medium">Profile</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
            <ShoppingBag className="w-5 h-5 mr-3" />
            <span className="font-medium">Orders</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        {/* Upgrade Card */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <h4 className="font-semibold mb-1">Pro Plan</h4>
            <p className="text-sm text-indigo-100 mb-3">Upgrade for more features!</p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-700 focus:outline-none lg:hidden mr-4">
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 cursor-pointer">
              <span className="text-sm font-semibold text-indigo-700">JD</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">

            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, John! 👋</h1>
                <p className="text-slate-500 mt-1">Here is what's happening with your account today.</p>
              </div>
              <button className="hidden sm:flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
                <Activity className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
                    <h3 className="text-2xl font-bold text-slate-900">$2,450.00</h3>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium flex items-center">
                    +12.5%
                  </span>
                  <span className="text-slate-400 ml-2">from last month</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Active Orders</p>
                    <h3 className="text-2xl font-bold text-slate-900">14</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-500 font-medium flex items-center">
                    3 processing
                  </span>
                  <span className="text-slate-400 ml-2">right now</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Store Credit</p>
                    <h3 className="text-2xl font-bold text-slate-900">$120.50</h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-500 font-medium flex items-center">
                    Available to use
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Account Tier</p>
                    <h3 className="text-2xl font-bold text-slate-900">Premium</h3>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-amber-500 font-medium flex items-center">
                    Renewing soon
                  </span>
                  <span className="text-slate-400 ml-2">in 12 days</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm">
                      <th className="px-6 py-4 font-medium">Transaction ID</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                            <ShoppingBag className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-900">#ORD-0012</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">Oct 24, 2026</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">$124.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                            <ShoppingBag className="w-4 h-4 text-slate-600" />
                          </div>
                          <span className="font-medium text-slate-900">#ORD-0011</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">Oct 21, 2026</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">$89.50</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                            <Activity className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="font-medium text-slate-900">#SUB-0089</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">Oct 15, 2026</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">$29.99</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
