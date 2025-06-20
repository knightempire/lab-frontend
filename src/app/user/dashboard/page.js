"use client"

import { useState } from "react"
import { Package, Activity, Clock } from "lucide-react"
import StatsCard from "../../../components/StatsCard"
import Calendar from "../../../components/dashboard-calendar"
export default function DashboardPage() {
  const [stats] = useState({
    total_requests: 120,
    active_requests: 34,
    pending_requests: 7
  })

  const events = [
      {
        date: '24/06/2025',
        status: 'Issue Date',
        id: 'req-s-20012',
      },
      {
        date: '24/06/2025',
        status: 'Returning Date',
        id: 'req-s-20014',
      },
      {
        date: '24/06/2025',
        status: 'Issue Date',
        id: 'req-s-20015',
      },
      {
        date: '25/06/2025',
        status: 'Issue Date',
        id: 'req-s-20012',
      },
      {
        date: '28/06/2025',
        status: 'Returning Date',
        id: 'req-s-20014',
      },
      {
        date: '1/06/2025',
        status: 'Issue Date',
        id: 'req-s-20015',
      },
      {
        date: '4/06/2025',
        status: 'Issue Date',
        id: 'req-s-20012',
      },
      {
        date: '14/06/2025',
        status: 'Returning Date',
        id: 'req-s-20014',
      },
      {
        date: '15/06/2025',
        status: 'Issue Date',
        id: 'req-s-20015',
      },
      {
        date: '20/06/2025',
        status: 'Issue Date',
        id: 'req-s-20012',
      },
      {
        date: '6/06/2025',
        status: 'Returning Date',
        id: 'req-s-20014',
      },
      {
        date: '9/06/2025',
        status: 'Issue Date',
        id: 'req-s-20015',
      },
    ];
  
    // Sample overdue data
    const overdueItems = [
      {
        reqid: 'req-s-20001',
        duedate: '15/06/2025'
      },
      {
        reqid: 'req-s-20005',
        duedate: '10/06/2025'
      },
      {
        reqid: 'req-s-20008',
        duedate: '12/06/2025'
      },
      {
        reqid: 'req-s-20011',
        duedate: '13/06/2025'
      }
    ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatsCard
          title="Total Requests"
          value={stats.total_requests}
          tooltip="All requests ever made"
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Active Requests"
          value={stats.active_requests}
          tooltip="Issued items not yet returned"
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pending_requests}
          tooltip="Requests not yet accepted or processed"
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow mb-10">
        <Calendar 
          events={events}
          overdueItems={overdueItems}
        />
      </div>
   </div>
  )
}