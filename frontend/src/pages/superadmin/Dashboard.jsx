import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080';
const COLORS = ['#83B822', '#5722B8', '#f59e0b', '#ef4444'];

const Kicker = ({ children }) => <p className="sa-kicker">{children}</p>;
const SectionTitle = ({ children }) => <h2 className="sa-section-title">{children}</h2>;
const Divider = () => <div className="sa-divider" />;

const Stat = ({ label, value, hint, accent }) => (
  <div className="sa-stat">
    <p className="sa-stat__label">{label}</p>
    <p className="sa-stat__value" style={accent ? { color: accent } : {}}>{value}</p>
    {hint && <p className="sa-stat__hint">{hint}</p>}
  </div>
);

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalTutors: 0, totalStudents: 0, verifiedTutors: 0, pendingTutors: 0 });
  const [recentTutors, setRecentTutors] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);

  const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    // Fetch tutors
    fetch(`${API_BASE}/api/tutors`, { headers })
      .then(res => res.json())
      .then(data => {
        const tutors = Array.isArray(data) ? data : [];
        setStats(prev => ({
          ...prev,
          totalTutors: tutors.length,
          verifiedTutors: tutors.filter(t => t.verified).length,
          pendingTutors: tutors.filter(t => !t.verified).length,
        }));
        setRecentTutors(tutors.slice(-5).reverse());
      })
      .catch(console.error);

    // Fetch students
    fetch(`${API_BASE}/api/students`, { headers })
      .then(res => res.json())
      .then(data => {
        const students = Array.isArray(data) ? data : [];
        setStats(prev => ({ ...prev, totalStudents: students.length }));
        setRecentStudents(students.slice(-5).reverse());
      })
      .catch(console.error);
  }, []);

  const pieData = [
    { name: 'Verified Tutors', value: stats.verifiedTutors },
    { name: 'Pending Tutors', value: stats.pendingTutors },
    { name: 'Students', value: stats.totalStudents },
  ];

  return (
    <div className="sa-dashboard">
      {/* Stats */}
      <section className="sa-stats-grid">
        <Stat label="Total Tutors" value={stats.totalTutors} hint="All registered" accent="#83B822" />
        <Stat label="Verified Tutors" value={stats.verifiedTutors} hint="Approved" accent="#5722B8" />
        <Stat label="Pending Verification" value={stats.pendingTutors} hint="Awaiting review" accent="#f59e0b" />
        <Stat label="Total Students" value={stats.totalStudents} hint="Registered" />
      </section>

      <Divider />

      {/* Charts Grid */}
      <div className="sa-charts-grid">
        <section className="sa-chart-card">
          <Kicker>Distribution</Kicker>
          <SectionTitle>Platform Overview</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={3}>
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="sa-chart-legend">
            {pieData.map((entry, idx) => (
              <div key={idx} className="sa-legend-item">
                <span className="sa-legend-dot" style={{ background: COLORS[idx] }} />
                <span>{entry.name}</span>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="sa-quick-actions">
          <Kicker>Quick Access</Kicker>
          <SectionTitle>Actions</SectionTitle>
          <div className="sa-action-list">
            <button className="sa-action-btn" onClick={() => navigate('/superadmin/tutors')}>
              👩‍🏫 Manage Tutors
            </button>
            <button className="sa-action-btn" onClick={() => navigate('/superadmin/students')}>
              🎓 Manage Students
            </button>
            <button className="sa-action-btn" onClick={() => navigate('/superadmin/subjects')}>
              📚 Manage Subjects
            </button>
            <button className="sa-action-btn" onClick={() => navigate('/superadmin/analytics')}>
              📊 View Analytics
            </button>
          </div>
        </section>
      </div>

      <Divider />

      {/* Recent Tables */}
      <div className="sa-tables-grid">
        <section className="sa-table-card">
          <Kicker>Recent Activity</Kicker>
          <SectionTitle>Recently Registered Tutors</SectionTitle>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subjects</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTutors.length > 0 ? recentTutors.map((t, idx) => (
                  <tr key={idx}>
                    <td>{t.user?.name || '—'}</td>
                    <td>{(t.subjects || []).join(', ') || '—'}</td>
                    <td>
                      <span className={`sa-badge ${t.verified ? 'sa-badge--green' : 'sa-badge--amber'}`}>
                        {t.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="sa-table-empty">No tutors found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sa-table-card">
          <Kicker>Recent Activity</Kicker>
          <SectionTitle>Recently Registered Students</SectionTitle>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length > 0 ? recentStudents.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.user?.name || '—'}</td>
                    <td>{s.gradeLevel || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="2" className="sa-table-empty">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
