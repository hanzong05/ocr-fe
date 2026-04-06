"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import { fetchDocuments } from "@/lib/api";
import { LcrRecord } from "@/lib/types";

export default function DashboardPage() {
  const { isLoggedIn, notify } = useApp();
  const router = useRouter();
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const [documents, setDocuments] = useState<LcrRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    donutLabels: [] as string[],
    donutColors: [] as string[],
  });

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadDocuments = async () => {
      try {
        const docs = await fetchDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        notify("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [isLoggedIn, notify]);

  useEffect(() => {
    if (!isLoggedIn || loading || !documents.length) return;

    let donutChart: any, barChart: any, lineChart: any;

    const loadCharts = async () => {
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);

      // Calculate dynamic data for donut chart (records by type)
      const typeCounts = documents.reduce(
        (acc, doc) => {
          acc[doc.typeName] = (acc[doc.typeName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const donutLabels = Object.keys(typeCounts);
      const donutData = Object.values(typeCounts);
      const donutColors = [
        "#3b82f6",
        "#8b5cf6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
      ];

      setChartData({
        donutLabels,
        donutColors: donutColors.slice(0, donutLabels.length),
      });

      // Donut Chart
      if (donutRef.current) {
        donutChart = new Chart(donutRef.current, {
          type: "doughnut",
          data: {
            labels: donutLabels,
            datasets: [
              {
                data: donutData,
                backgroundColor: donutColors.slice(0, donutLabels.length),
                borderWidth: 2,
                borderColor: "transparent",
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: "60%",
          },
        });
      }

      // Calculate dynamic data for bar chart (records by status)
      const statusCounts = documents.reduce(
        (acc, doc) => {
          acc[doc.status] = (acc[doc.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const barLabels = Object.keys(statusCounts);
      const barData = Object.values(statusCounts);

      // Bar Chart
      if (barRef.current) {
        barChart = new Chart(barRef.current, {
          type: "bar",
          data: {
            labels: barLabels,
            datasets: [
              {
                data: barData,
                backgroundColor: barLabels.map((status) =>
                  status === "Pending"
                    ? "#f59e0b"
                    : status === "Approved"
                      ? "#10b981"
                      : status === "Rejected"
                        ? "#ef4444"
                        : "#6b7280",
                ),
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 10 } },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(0,0,0,0.06)" },
                ticks: { stepSize: 10 },
              },
            },
          },
        });
      }

      // Calculate monthly trend (simplified - group by month)
      const monthlyData = documents.reduce(
        (acc, doc) => {
          const date = new Date(doc.upload_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          acc[monthKey] = (acc[monthKey] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const sortedMonths = Object.keys(monthlyData).sort();
      const lineLabels = sortedMonths.map((month) => {
        const [year, monthNum] = month.split("-");
        return `${new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      });
      const lineData = sortedMonths.map((month) => monthlyData[month]);

      // Line Chart
      if (lineRef.current) {
        lineChart = new Chart(lineRef.current, {
          type: "line",
          data: {
            labels: lineLabels,
            datasets: [
              {
                data: lineData,
                borderColor: "#10b981",
                backgroundColor: "rgba(16,185,129,0.15)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#10b981",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(0,0,0,0.06)" },
              },
            },
          },
        });
      }
    };

    loadCharts();

    return () => {
      donutChart?.destroy();
      barChart?.destroy();
      lineChart?.destroy();
    };
  }, [isLoggedIn, loading, documents]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f5f5f5",
        }}
      >
        <Notification />
        <Header />
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, color: "#888", marginBottom: 16 }}>
              Loading dashboard data...
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #f0f0f0",
                borderTop: "4px solid #10b981",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            ></div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate dynamic statistics
  const totalRecords = documents.length;
  const pending = documents.filter((doc) => doc.status === "Pending").length;
  const approved = documents.filter((doc) => doc.status === "Approved").length;
  const rejected = documents.filter((doc) => doc.status === "Rejected").length;

  const stats = {
    totalRecords,
    pending,
    approved,
    rejected,
  };

  const recentActivity = documents
    .sort(
      (a, b) =>
        new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime(),
    )
    .slice(0, 6)
    .map((doc) => ({
      id: `DOC-${doc.doc_id}`,
      name: doc.name,
      type: doc.typeName,
      status: doc.status === "Pending" ? "Pending" : "",
      date: new Date(doc.upload_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    padding: "16px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f5",
      }}
    >
      <Notification />
      <Header />
      <main style={{ flex: 1, padding: 24 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: "-0.5px",
                }}
              >
                DASHBOARD
              </h1>
              <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                Live overview of civil registry records and activity.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Refresh Dashboard
            </button>
          </div>

          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Total Records",
                value: stats.totalRecords,
                color: "#2563eb",
              },
              { label: "Pending", value: stats.pending, color: "#f59e0b" },
              { label: "Approved", value: stats.approved, color: "#10b981" },
              { label: "Rejected", value: stats.rejected, color: "#ef4444" },
            ].map((s) => (
              <div key={s.label} style={cardStyle}>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 32, fontWeight: 700, color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* Donut Chart */}
            <div style={cardStyle}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 14,
                }}
              >
                Records by Type
              </p>
              <div style={{ position: "relative", height: 200 }}>
                <canvas ref={donutRef} />
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {chartData.donutLabels
                  .map((label, index) => ({
                    color: chartData.donutColors[index] || "#6b7280",
                    label,
                  }))
                  .map((l) => (
                    <div
                      key={l.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        color: "#666",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: l.color,
                        }}
                      />
                      {l.label}
                    </div>
                  ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div style={cardStyle}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 14,
                }}
              >
                Records by Status
              </p>
              <div style={{ position: "relative", height: 200 }}>
                <canvas ref={barRef} />
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                marginBottom: 14,
              }}
            >
              Monthly Record Trend
            </p>
            <div style={{ position: "relative", height: 200 }}>
              <canvas ref={lineRef} />
            </div>
          </div>

          {/* Recent Activity */}
          <div style={cardStyle}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                marginBottom: 16,
              }}
            >
              Recent Activity
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {["ID", "Name", "Type", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        color: "#888",
                        fontWeight: 600,
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.id}>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f9f9f9",
                        color: "#555",
                      }}
                    >
                      {row.id}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f9f9f9",
                        color: "#2563eb",
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f9f9f9",
                        color: "#333",
                      }}
                    >
                      {row.type}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f9f9f9",
                      }}
                    >
                      {row.status && (
                        <span
                          style={{
                            background: "#f59e0b",
                            color: "white",
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {row.status}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f9f9f9",
                        color: "#555",
                      }}
                    >
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
