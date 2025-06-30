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
import LowStockList from "../../../components/admin_graphs/LowStockList";
import TopComponentsBarChart from "../../../components/admin_graphs/TopComponentBarChart";
import LoadingScreen from "../../../components/loading/loadingscreen";
import { apiRequest } from '../../../utils/apiRequest';

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
    damaged: 0,
    yet_to_return: 0,
  });
  const [MonthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 480);
    };

    checkScreenSize(); // Initial check

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Verify admin
        const verifyRes = await apiRequest(`/verify-token`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.user?.isAdmin || !verifyData.user?.isActive) {
          router.push("/auth/login");
          return;
        }

        // 2. Fetch request stats
        const statsRes = await apiRequest(`/dashboard/request-stats`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
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

        // 3. Fetch low stock and top components
        const stockRes = await apiRequest(`/dashboard/components-stock`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const stockData = await stockRes.json();
        if (stockRes.ok) {
          setLowStockData(
            (stockData.lowStockItems || []).map((item) => ({
              product_name: item.product_name,
              in_stock: item.inStock,
            }))
          );
          setBarData(stockData.topComponents || []);
        }

        // 4. Fetch inventory and monthly request count
        const invRes = await apiRequest(`/dashboard/inventory-and-request-count`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const invData = await invRes.json();
        if (invRes.ok) {
          setInventoryData({
            in_stock: invData.inventoryDistribution.inStock || 0,
            on_hold: invData.inventoryDistribution.onHold || 0,
            damaged: invData.inventoryDistribution.damaged || 0,
            yet_to_return: invData.inventoryDistribution.yetToReturn || 0,
          });

          setMonthlyData(
            (invData.requestCountByMonth || []).map((item) => ({
              month: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                item.month - 1
              ]} ${item.year}`,
              count: item.count,
            }))
          );
        }

        // 5. Fetch calendar data
        const calendarRes = await apiRequest(`/dashboard/admin-reminder`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const calendarData = await calendarRes.json();
        if (calendarRes.ok) {
          const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
          todayIST.setHours(0, 0, 0, 0);

          const isSameOrBeforeTodayIST = (dateStr) => {
            const d = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            d.setHours(0, 0, 0, 0);
            return d <= todayIST;
          };

          const mappedEvents = (calendarData.collectionDate || []).map((item) => ({
            date: new Date(item.date).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }),
            status:
              item.requestStatus === "returned"
                ? "Returned"
                : "Issue Date",
            id: item.requestId,
            collectedDate: item.collectedDate,
            requestStatus: item.requestStatus,
            isCollected: item.isCollected,
            color: undefined,
          }));

          const allReturns = (calendarData.returns || []).map(item => {
            let color;
            if (item.isReturned) {
              color = "bg-violet-500";
            } else if (isPastDayIST(item.date)) {
              color = "bg-red-500";
            }
            return {
              date: new Date(item.date).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }),
              status: item.isReturned
                ? "Returned"
                : (isPastDayIST(item.date) ? "Overdue Return" : "Upcoming Return"),
              id: item.requestId,
              returnedDate: item.returnedDate,
              requestStatus: item.requestStatus,
              isReturned: item.isReturned,
              color: color,
            };
          });

          setEvents([...mappedEvents, ...allReturns]);

          setOverdueItems(
            (calendarData.returns || [])
              .filter(item => !item.isReturned && isPastDayIST(item.date))
              .map(item => ({
                reqid: item.requestId,
                duedate: new Date(item.date).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }),
                requestStatus: item.requestStatus,
                returnedDate: item.returnedDate,
              }))
          );
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [router]);

  const { ref: statusChartRef, inView: statusChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: radarChartRef, inView: radarChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: lineChartRef, inView: lineChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: barChartRef, inView: barChartInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: lowStockRef, inView: lowStockInView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const handleCalendarViewMore = (item, type) => {
    if (type === "collection") {
      if (
        (!item.collectedDate || item.collectedDate === null) &&
        isPastDayIST(item.date)
      ) {
        router.push(`/admin/return?requestId=${item.id || item.requestId}`);
        return;
      }
      if (
        (item.requestStatus?.toLowerCase() === "approved" || item.requestStatus?.toLowerCase() === "accepted") &&
        (!item.collectedDate || item.collectedDate === null)
      ) {
        router.push(`/admin/review?requestId=${item.id || item.requestId}`);
      } else {
        router.push(`/admin/return?requestId=${item.id || item.requestId}`);
      }
    }
    else if (type === "return") {
      if (
        (item.requestStatus?.toLowerCase() === "approved" || item.requestStatus?.toLowerCase() === "accepted") &&
        (!item.returnedDate || item.returnedDate === null)
      ) {
        router.push(`/admin/review?requestId=${item.reqid || item.requestId}`);
      } else {
        router.push(`/admin/return?requestId=${item.reqid || item.requestId}`);
      }
    }
  };

  const isPastDayIST = (dateStr) => {
    const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    todayIST.setHours(0, 0, 0, 0);
    const d = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    d.setHours(0, 0, 0, 0);
    return d < todayIST;
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className={`${isSmallScreen ? "max-w-7xl" : ""} mx-auto px-4 py-6`}>
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

      <div className="bg-white rounded-xl  mb-10">
        <Calendar
          events={events}
          overdueItems={overdueItems}
          onViewMore={handleCalendarViewMore}
        />
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
            {lowStockInView && <LowStockList data={lowStockData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
