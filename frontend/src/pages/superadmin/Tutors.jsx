import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Trash2, Search } from 'lucide-react';
import './Tutors.css';
import '../superadmin/Dashboard.css';

const API_BASE = 'http://localhost:8080';

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchTutors = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/tutors`, { headers })
      .then(res => res.json())
      .then(data => { setTutors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTutors(); }, []);

  const handleVerify = (id, current) => {
    fetch(`${API_BASE}/api/tutors/${id}/verify`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ verified: !current }),
    }).then(() => fetchTutors()).catch(console.error);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this tutor profile?')) return;
    fetch(`${API_BASE}/api/tutors/${id}`, { method: 'DELETE', headers })
      .then(() => fetchTutors())
      .catch(console.error);
  };

  const filtered = tutors.filter(t =>
    (t.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <div>
          <p className="sa-kicker">Management</p>
          <h1 className="sa-section-title" style={{ fontSize: '1.5rem' }}>Tutors</h1>
        </div>
        <div className="sa-search-bar">
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="sa-table-card" style={{ marginTop: '1.5rem' }}>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subjects</th>
                <th>Hourly Rate</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="sa-table-empty">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="sa-table-empty">No tutors found</td></tr>
              ) : filtered.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.user?.name || '—'}</strong></td>
                  <td>{t.user?.email || '—'}</td>
                  <td>{(t.subjects || []).join(', ') || '—'}</td>
                  <td>Rs. {t.hourlyRate || '—'}</td>
                  <td>{t.experienceYears ? `${t.experienceYears} yrs` : '—'}</td>
                  <td>
                    <span className={`sa-badge ${t.verified ? 'sa-badge--green' : 'sa-badge--amber'}`}>
                      {t.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="sa-action-icons">
                      <button
                        className={`sa-icon-btn ${t.verified ? 'sa-icon-btn--amber' : 'sa-icon-btn--green'}`}
                        title={t.verified ? 'Revoke Verification' : 'Verify'}
                        onClick={() => handleVerify(t.id, t.verified)}
                      >
                        {t.verified ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button
                        className="sa-icon-btn sa-icon-btn--red"
                        title="Delete"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
