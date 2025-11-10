import React, { useState } from 'react';
import { Search, Filter, Clock, AlertCircle, CheckCircle, XCircle, Calendar, User, Tag } from 'lucide-react';

const Ticket = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Sample Ticket Data
  const tickets = [
    {
      id: "TKT-001",
      title: "Login page not loading",
      status: "open",
      priority: "high",
      assignee: "Sanket Yewale",
      created: "2 hours ago",
      due: "Tomorrow",
      tags: ["bug", "urgent"]
    },
    {
      id: "TKT-002",
      title: "Add dark mode",
      status: "in-progress",
      priority: "medium",
      assignee: "John Doe",
      created: "1 day ago",
      due: "3 days",
      tags: ["feature"]
    },
    {
      id: "TKT-003",
      title: "Database timeout error",
      status: "resolved",
      priority: "critical",
      assignee: "Admin",
      created: "3 days ago",
      due: "Done",
      tags: ["server", "fixed"]
    },
    {
      id: "TKT-004",
      title: "Update user profile UI",
      status: "closed",
      priority: "low",
      assignee: "Designer",
      created: "1 week ago",
      due: "Done",
      tags: ["ui", "done"]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "open": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "in-progress": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "resolved": return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "closed": return <XCircle className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Tag className="w-8 h-8 text-orange-600" />
                My Tickets
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all your support tickets</p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              + New Ticket
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <span className="text-sm font-semibold text-gray-600 uppercase">
                      {ticket.status.replace("-", " ")}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {ticket.title}
                </h3>

                {/* ID */}
                <p className="text-sm text-gray-500 mb-4 font-mono">
                  #{ticket.id}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ticket.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">{ticket.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{ticket.due}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6" />
            <p className="text-xl text-gray-600">No tickets found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticket;