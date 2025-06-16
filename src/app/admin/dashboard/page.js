"use client"

import { useState } from "react"
import { Package, Activity, Clock } from "lucide-react"
import StatsCard from "../../../components/StatsCard"
import InventoryRadarChart from "../../../components/admin_graphs/InventoryRadarChart"

export default function DashboardPage() {
  const [stats] = useState({
    total_requests: 120,
    active_requests: 34,
    pending_requests: 7
  })

  const inventoryData = {
    in_stock: 230,
    on_hold: 57,
    yet_to_return: 42
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Dashboard Overview
      </h1>

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

      {/* Inventory Radar Chart Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Overview</h2>
        <InventoryRadarChart data={inventoryData} />
      </div>
    </div>
  )
}