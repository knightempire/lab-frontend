"use client"

import { useState } from "react"
import { Package, Activity, Clock } from "lucide-react"
import StatsCard from "../../../components/StatsCard"
import InventoryRadarChart from "../../../components/admin_graphs/InventoryRadarChart"
import Calendar from "../../../components/dashboard-calendar"
import MonthlyRequestLineChart from "../../../components/admin_graphs/RequestCountLineChart"
import RequestStatusChart from "../../../components/admin_graphs/RequestStatusBreakdown"
import LowStockItemsTable from '../../../components/admin_graphs/LowStockTable'
import TopComponentsBarChart from "../../../components/admin_graphs/TopComponentBarChart"

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

  const inventoryData = {
    in_stock: 230,
    on_hold: 57,
    yet_to_return: 42
  };

  const MonthlyData = [
    // 2023
    { month: 'Jan 2023', count: 12 },
    { month: 'Feb 2023', count: 18 },
    { month: 'Mar 2023', count: 22 },
    { month: 'Apr 2023', count: 30 },
    { month: 'May 2023', count: 27 },
    { month: 'Jun 2023', count: 35 },
    { month: 'Jul 2023', count: 40 },
    { month: 'Aug 2023', count: 38 },
    { month: 'Sep 2023', count: 33 },
    { month: 'Oct 2023', count: 29 },
    { month: 'Nov 2023', count: 25 },
    { month: 'Dec 2023', count: 20 },

    // 2024
    { month: 'Jan 2024', count: 15 },
    { month: 'Feb 2024', count: 22 },
    { month: 'Mar 2024', count: 28 },
    { month: 'Apr 2024', count: 35 },
    { month: 'May 2024', count: 40 },
    { month: 'Jun 2024', count: 44 },
    { month: 'Jul 2024', count: 48 },
    { month: 'Aug 2024', count: 52 },
    { month: 'Sep 2024', count: 47 },
    { month: 'Oct 2024', count: 39 },
    { month: 'Nov 2024', count: 32 },
    { month: 'Dec 2024', count: 28 },

    // 2025
    { month: 'Jan 2025', count: 34 },
    { month: 'Feb 2025', count: 41 },
    { month: 'Mar 2025', count: 55 },
    { month: 'Apr 2025', count: 60 },
    { month: 'May 2025', count: 68 },
    { month: 'Jun 2025', count: 75 }
  ];

  const piechartdata = {
    accepted: 320,
    closed: 540,
    reissued: 65,
    rejected: 80
  };

   const [lowStockData] = useState([
    { product_name: "Pi", total_items: 10, in_stock:5 },
    { product_name: "Arduino Uno", total_items: 10, in_stock:3 },
    { product_name: "USB Type-C Cable", total_items: 10, in_stock:5 },
    { product_name: "Breadboard", total_items: 10, in_stock:2 },
    { product_name: "Resistor Pack", total_items: 10, in_stock:4 },
    { product_name: "LED Strip", total_items: 10, in_stock:1 },
    { product_name: "Jumper Wires", total_items: 10, in_stock:6 }
  ]);

  const BarData = [
    { component: "Raspberry Pi 4", count: 95 },
    { component: "ESP32", count: 88 },
    { component: "Arduino UNO", count: 76 },
    { component: "Jumper Wires", count: 60 },
    { component: "Breadboard", count: 55 },
    { component: "LCD Display", count: 52 },
    { component: "Relay Module", count: 47 },
    { component: "IR Sensor", count: 45 },
    { component: "L293D Motor Driver", count: 42 },
    { component: "Ultrasonic Sensor", count: 40 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

    {/* <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-100 border border-blue-100 shadow flex items-center gap-4">
      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-blue-100">
        <span className="text-3xl">👋</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Welcome back, Admin!</h2>
          <p className="text-base text-blue-700">
            Here&apos;s a quick overview of lab&apos;s inventory and requests.
          </p>
      </div>
    </div> */}

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

      <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Overview</h2>
          <InventoryRadarChart data={inventoryData} />
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Status</h2>
          <RequestStatusChart data={piechartdata} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 flex flex-col">
        <MonthlyRequestLineChart data={MonthlyData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Components</h2>
          <TopComponentsBarChart data={BarData} />
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Low Stock Items</h2>
          <LowStockItemsTable data={lowStockData} />
        </div>
      </div>
    </div>

    </div>
  )
}