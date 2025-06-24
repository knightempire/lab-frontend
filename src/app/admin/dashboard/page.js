"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Activity, Clock } from "lucide-react";
import { useInView } from "react-intersection-observer";

import StatsCard from "../../../components/StatsCard";
import InventoryRadarChart from "../../../components/admin_graphs/InventoryRadarChart";
import Calendar from "../../../components/dashboard-calendar";
import MonthlyRequestLineChart from "../../../components/admin_graphs/RequestCountLineChart";
import RequestStatusChart from "../../../components/admin_graphs/RequestStatusBreakdown";
import LowStockItemsTable from "../../../components/admin_graphs/LowStockTable";
import TopComponentsBarChart from "../../../components/admin_graphs/TopComponentBarChart";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total_requests: 0,
    active_requests: 0,
    pending_requests: 0,
  });

  const [statusBreakdown, setStatusBreakdown] = useState({
    accepted: 0,
    closed: 0,
    reissued: 0,
    rejected: 0,
    returned: 0,
  });

  const [lowStockData, setLowStockData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [inventoryData, setInventoryData] = useState({
    in_stock: 0,
    on_hold: 0,
    yet_to_return: 0,
  });
  const [MonthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        // Verify admin
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok || !data.user?.isAdmin || !data.user?.isActive) {
          router.push("/auth/login");
          return;
        }

        // Fetch request stats
        const statsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/request-stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const statsData = await statsRes.json();

        if (statsRes.ok) {
          setStats({
            total_requests: statsData.totalRequests,
            active_requests: statsData.activeRequests,
            pending_requests: statsData.pendingRequests,
          });

          const breakdown = {
            accepted: 0,
            closed: 0,
            reissued: 0,
            rejected: 0,
            returned: 0,
          };

          statsData.statusBreakdown.forEach((item) => {
            const key = item.status.toLowerCase();
            if (key === "approved") breakdown.accepted = item.count;
            else if (key === "reissued") breakdown.reissued = item.count;
            else if (key === "closed") breakdown.closed = item.count;
            else if (key === "rejected") breakdown.rejected = item.count;
            else if (key === "returned") breakdown.returned = item.count;
          });

          setStatusBreakdown(breakdown);
        }

        // Fetch low stock and top components
        const stockRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/components-stock`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const stockData = await stockRes.json();

        if (stockRes.ok) {
          setLowStockData(
            (stockData.lowStockItems || []).map((item) => ({
              product_name: item.product_name,
              in_stock: item.inStock,
            }))
          );
          setBarData(
            (stockData.topComponents || []).map((item) => ({
              component: item.productName,
              count: item.totalRequested,
            }))
          );
        }

        // Fetch inventory and monthly request count
        const invRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/inventory-and-request-count`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const invData = await invRes.json();

        if (invRes.ok) {
          // Map inventory distribution
          setInventoryData({
            in_stock: invData.inventoryDistribution.inStock || 0,
            on_hold: invData.inventoryDistribution.damaged || 0,
            yet_to_return: invData.inventoryDistribution.yetToGive || 0,
          });

          // Map monthly request count
          setMonthlyData(
            (invData.requestCountByMonth || []).map((item) => ({
              month: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                item.month - 1
              ]} ${item.year}`,
              count: item.count,
            }))
          );
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        router.push("/auth/login");
      }
    };

    fetchDashboardData();
  }, [router]);

  const events = [
    {
      date: "24/06/2025",
      status: "Issue Date",
      id: "req-s-20012",
    },
    {
      date: "24/06/2025",
      status: "Returning Date",
      id: "req-s-20014",
    },
    {
      date: "24/06/2025",
      status: "Issue Date",
      id: "req-s-20015",
    },
    {
      date: "25/06/2025",
      status: "Issue Date",
      id: "req-s-20012",
    },
    {
      date: "28/06/2025",
      status: "Returning Date",
      id: "req-s-20014",
    },
    {
      date: "1/06/2025",
      status: "Issue Date",
      id: "req-s-20015",
    },
    {
      date: "4/06/2025",
      status: "Issue Date",
      id: "req-s-20012",
    },
    {
      date: "14/06/2025",
      status: "Returning Date",
      id: "req-s-20014",
    },
    {
      date: "15/06/2025",
      status: "Issue Date",
      id: "req-s-20015",
    },
    {
      date: "20/06/2025",
      status: "Issue Date",
      id: "req-s-20012",
    },
    {
      date: "6/06/2025",
      status: "Returning Date",
      id: "req-s-20014",
    },
    {
      date: "9/06/2025",
      status: "Issue Date",
      id: "req-s-20015",
    },
  ];

  const overdueItems = [
    { reqid: "req-s-20001", duedate: "15/06/2025" },
    { reqid: "req-s-20005", duedate: "10/06/2025" },
    { reqid: "req-s-20008", duedate: "12/06/2025" },
    { reqid: "req-s-20011", duedate: "13/06/2025" },
  ];

  // Intersection observers for each chart
  const { ref: statusChartRef, inView: statusChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: radarChartRef, inView: radarChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: lineChartRef, inView: lineChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: barChartRef, inView: barChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: lowStockRef, inView: lowStockInView } = useInView({ triggerOnce: true, threshold: 0.2 });

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

      <div className="bg-white rounded-xl shadow mb-10">
        <Calendar events={events} overdueItems={overdueItems} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col" ref={radarChartRef}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Overview</h2>
            {radarChartInView && <InventoryRadarChart data={inventoryData} />}
          </div>
          <div className="bg-white rounded-xl shadow flex flex-col" ref={statusChartRef}>
            <h2 className="text-xl font-semibold text-gray-800 pt-6 pl-6">Request Status</h2>
            {statusChartInView && <RequestStatusChart data={statusBreakdown} />}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col" ref={lineChartRef}>
          {lineChartInView && <MonthlyRequestLineChart data={MonthlyData} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col" ref={barChartRef}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Components</h2>
            {barChartInView && <TopComponentsBarChart data={barData} />}
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col" ref={lowStockRef}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Low Stock Items</h2>
            {lowStockInView && <LowStockItemsTable data={lowStockData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
