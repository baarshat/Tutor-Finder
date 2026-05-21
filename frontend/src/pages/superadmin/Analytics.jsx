import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "../superadmin/Dashboard.css";

const API_BASE = "http://localhost:8080";
const COLORS = ["#83B822", "#5722B8"];

export default function Analytics() {
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);

  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/tutors`, { headers })
      .then((r) => r.json())
      .then((d) => setTutors(Array.isArray(d) ? d : []))
      .catch(console.error);
    fetch(`${API_BASE}/api/students`, { headers })
      .then((r) => r.json())
      .then((d) => setStudents(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const normalizeSubjects = (subjects) => {
    if (Array.isArray(subjects)) {
      return subjects;
    }
    if (typeof subjects === "string") {
      return subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Subjects distribution
  const subjectCounts = {};
  tutors.forEach((t) => {
    normalizeSubjects(t.subjects).forEach((subject) => {
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
  });
  const subjectData = Object.entries(subjectCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Tutor verification breakdown
  const verificationData = [
    { name: "Verified", value: tutors.filter((t) => t.verified).length },
    { name: "Pending", value: tutors.filter((t) => !t.verified).length },
  ];

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-section-title" style={{ fontSize: "1.5rem" }}>
            Analytics
          </h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="sa-stats-grid" style={{ marginTop: "1.5rem" }}>
        <div className="sa-stat">
          <p className="sa-stat__label">Total Tutors</p>
          <p className="sa-stat__value" style={{ color: "#83B822" }}>
            {tutors.length}
          </p>
        </div>
        <div className="sa-stat">
          <p className="sa-stat__label">Verified</p>
          <p className="sa-stat__value" style={{ color: "#5722B8" }}>
            {tutors.filter((t) => t.verified).length}
          </p>
        </div>
        <div className="sa-stat">
          <p className="sa-stat__label">Pending</p>
          <p className="sa-stat__value" style={{ color: "#f59e0b" }}>
            {tutors.filter((t) => !t.verified).length}
          </p>
        </div>
        <div className="sa-stat">
          <p className="sa-stat__label">Total Students</p>
          <p className="sa-stat__value">{students.length}</p>
        </div>
      </div>

      <div className="sa-divider" />

      <div className="sa-charts-grid">
        <section className="sa-chart-card">
          <p className="sa-kicker">Distribution</p>
          <h2 className="sa-section-title">Top Subjects Taught</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={subjectData}
              margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#83B822" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="sa-chart-card">
          <p className="sa-kicker">Tutor Status</p>
          <h2 className="sa-section-title">Verification Breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={verificationData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {verificationData.map((entry, idx) => (
                  <Bar
                    key={idx}
                    dataKey="value"
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
