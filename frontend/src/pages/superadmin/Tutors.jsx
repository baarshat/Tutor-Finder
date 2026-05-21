import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Trash2, Search } from "lucide-react";
import "./Tutors.css";
import "../superadmin/Dashboard.css";

const API_BASE = "http://localhost:8080";

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchTutors = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/tutors`, { headers })
      .then((res) => res.json())
      .then((data) => {
        setTutors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTutors();
  }, []);


  const handleVerify = (id, current) => {
    fetch(`${API_BASE}/api/tutors/${id}/verify`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ verified: !current }),
    })
      .then(() => fetchTutors())
      .catch(console.error);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this tutor profile?"))
      return;
    fetch(`${API_BASE}/api/tutors/${id}`, { method: "DELETE", headers })
      .then(() => fetchTutors())
      .catch(console.error);
  };

  const handleViewDocument = (id) => {
    setDocumentModalTutorId(id);
  };

  const filtered = tutors.filter(
    (t) =>
      (t.userName || t.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (t.userEmail || t.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const formatSubjects = (subjects) => {
    if (Array.isArray(subjects)) {
      return subjects.join(", ");
    }
    return subjects || "—";
  };

  const getDocumentHref = (doc) => {
    if (!doc) return "";
    const trimmed = String(doc).trim();
    if (trimmed.startsWith("data:")) return trimmed;
    const mime = trimmed.startsWith("iVBOR")
      ? "image/png"
      : trimmed.startsWith("/9j/")
        ? "image/jpeg"
        : "application/pdf";
    return `data:${mime};base64,${trimmed}`;
  };

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-section-title" style={{ fontSize: "1.5rem" }}>
            Tutors
          </h1>
        </div>
        <div className="sa-search-bar">
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="sa-table-card" style={{ marginTop: "1.5rem" }}>
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
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="sa-table-empty">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="sa-table-empty">
                    No tutors found
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{t.userName || t.name || "—"}</strong>
                    </td>
                    <td>{t.userEmail || t.email || "—"}</td>
                    <td>{formatSubjects(t.subjects)}</td>
                    <td>Rs. {t.hourlyRate || "—"}</td>
                    <td>
                      {t.experienceYears ? `${t.experienceYears} yrs` : "—"}
                    </td>
                    <td>
                      <span
                        className={`sa-badge ${t.status === "VERIFIED" ? "sa-badge--green" : "sa-badge--amber"}`}
                      >
                        {t.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      {t.documentUrl ? (
                        <a
                          className="sa-icon-btn sa-icon-btn--green"
                          href={getDocumentHref(t.documentUrl)}
                          target="_blank"
                          rel="noreferrer"
                          title="View document"
                          style={{ textDecoration: "none", padding: "0 10px" }}
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div className="sa-action-icons">
                        <button
                          className={`sa-icon-btn ${t.status === "VERIFIED" ? "sa-icon-btn--amber" : "sa-icon-btn--green"}`}
                          title={
                            t.status === "VERIFIED"
                              ? "Revoke Verification"
                              : "Verify"
                          }
                          onClick={() =>
                            handleVerify(t.id, t.status === "VERIFIED")
                          }
                        >
                          {t.status === "VERIFIED" ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
