// src/pages/Dashboard.jsx
import React from 'react';
import { 
  Users, 
  Ticket, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value="1,248"
          icon={<Ticket className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Open Tickets"
          value="89"
          icon={<AlertCircle className="w-6 h-6" />}
          color="yellow"
          trend="+5"
        />
        <StatCard
          title="Resolved Today"
          value="42"
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          trend="+8"
        />
        <StatCard
          title="Avg. Response Time"
          value="2h 14m"
          icon={<Clock className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Recent Activity + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Tickets</h2>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${ticket.priority === 'High' ? 'bg-red-500' : ticket.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-sm text-gray-500">#{ticket.id} • {ticket.assignee}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-indigo-600 font-medium hover:text-indigo-700">
            View all tickets →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <ActionButton icon={<Ticket />} label="Create New Ticket" href="/new-takits" />
            <ActionButton icon={<Users />} label="View Team" href="/tickets" />
            <ActionButton icon={<TrendingUp />} label="View Reports" href="/settings" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ title, value, icon, color, trend }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend} from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Button
const ActionButton = ({ icon, label, href }) => (
  <a
    href={href}
    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition group"
  >
    <div className="p-2 bg-white rounded-lg group-hover:shadow">
      {React.cloneElement(icon, { className: "w-5 h-5 text-gray-600 group-hover:text-indigo-600" })}
    </div>
    <span className="font-medium">{label}</span>
  </a>
);

// Sample Data
const recentTickets = [
  { id: 'TK-1201', title: 'Login page not loading', assignee: 'Sarah Chen', status: 'Open', priority: 'High' },
  { id: 'TK-1198', title: 'Add dark mode toggle', assignee: 'Mike Ross', status: 'In Progress', priority: 'Medium' },
  { id: 'TK-1195', title: 'Fix mobile menu bug', assignee: 'You', status: 'Resolved', priority: 'Low' },
];

export default Dashboard;