import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="mini-chart">
      {data.map((item) => (
        <div key={item.label} className="mini-chart-item">
          <div
            className="mini-chart-bar"
            style={{ height: `${Math.max((item.value / max) * 180, 8)}px` }}
            title={`${item.label}: ${item.value}`}
          />
          <div className="mini-chart-value">{item.value}</div>
          <div className="mini-chart-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      const res = await apiRequest("/api/dashboard/summary");
      setSummary(res);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const cards = [
    { title: "Role", value: user?.role || "-" },
    { title: "Zone ID", value: user?.zone_id ?? "-" },
    { title: "Branch ID", value: user?.branch_id ?? "-" },
    { title: "Status", value: "Active" }
  ];

  return (
    <div>
      <div className="card-grid">
        {cards.map((card) => (
          <div className="card stat-card" key={card.title}>
            <div className="stat-title">{card.title}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      {summary ? (
        <>
          <div className="card-grid">
            <div className="card stat-card">
              <div className="stat-title">Tech Ref Leads</div>
              <div className="stat-value">{summary.cards.techRefCount}</div>
            </div>

            <div className="card stat-card">
              <div className="stat-title">L2 Records</div>
              <div className="stat-value">{summary.cards.l2Count}</div>
            </div>

            <div className="card stat-card">
              <div className="stat-title">New Connections</div>
              <div className="stat-value">{summary.cards.newConnCount}</div>
            </div>

            <div className="card stat-card">
              <div className="stat-title">Reactivations</div>
              <div className="stat-value">{summary.cards.reactCount}</div>
            </div>

            <div className="card stat-card">
              <div className="stat-title">Upsell Records</div>
              <div className="stat-value">{summary.cards.upsellCount}</div>
            </div>

            <div className="card stat-card">
              <div className="stat-title">Open Tasks</div>
              <div className="stat-value">{summary.cards.openTasks}</div>
            </div>
          </div>

          <div className="page-grid">
            <div className="card">
              <h3>Activity Overview</h3>
              <MiniBarChart data={summary.chart} />
            </div>

            <div className="card">
              <h3>Amount Summary</h3>
              <div className="amount-list">
                <div className="amount-row">
                  <span>New Connection Amount</span>
                  <strong>{summary.amounts.newConnAmount}</strong>
                </div>
                <div className="amount-row">
                  <span>Reactivation Amount</span>
                  <strong>{summary.amounts.reactAmount}</strong>
                </div>
                <div className="amount-row">
                  <span>Upsell Current Total</span>
                  <strong>{summary.amounts.upsellCurrent}</strong>
                </div>
                <div className="amount-row">
                  <span>Upsell Changed Total</span>
                  <strong>{summary.amounts.upsellChanged}</strong>
                </div>
                <div className="amount-row">
                  <span>Upsell Gain</span>
                  <strong>{summary.amounts.upsellGain}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <p>Loading dashboard...</p>
        </div>
      )}
    </div>
  );
}