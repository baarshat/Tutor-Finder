import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Trash2, Search } from "lucide-react";
import "./Tutors.css";
import "../superadmin/Dashboard.css";

const API_BASE = "http://localhost:8080";

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [documentModal, setDocumentModal] = useState({
    open: false,
    url: "",
    isPdf: false,
  });

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

  const isPdfDocument = (doc) => {
    if (!doc) return false;
    const trimmed = String(doc).trim();
    if (trimmed.startsWith("data:")) {
      return trimmed.toLowerCase().includes("application/pdf");
    }
    return trimmed.startsWith("JVBERi0");
  };

  const openDocumentModal = (doc) => {
    const href = getDocumentHref(doc);
    setDocumentModal({
      open: true,
      url: href,
      isPdf: isPdfDocument(doc),
    });
  };

  const closeDocumentModal = () => {
    setDocumentModal({ open: false, url: "", isPdf: false });
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
                        <button
                          type="button"
                          className="sa-icon-btn sa-icon-btn--green"
                          onClick={() => openDocumentModal(t.documentUrl)}
                          title="View document"
                          style={{ textDecoration: "none", padding: "0 10px" }}
                        >
                          View
                        </button>
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

      {documentModal.open && (
        <div
          className="sa-modal__overlay"
          onClick={closeDocumentModal}
          style={{ zIndex: 50 }}
        >
          <div
            className="sa-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "900px", width: "90%" }}
          >
            <h2 className="sa-modal__title">Tutor Document</h2>
            <div style={{ padding: "12px 0 20px" }}>
              {documentModal.isPdf ? (
                <iframe
                  title="Tutor document"
                  src={documentModal.url}
                  style={{ width: "100%", height: "70vh", border: "none" }}
                />
              ) : (
                <img
                  src={documentModal.url}
                  alt="Tutor document"
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />
              )}
            </div>
            <div className="sa-modal__actions">
              <button className="sa-modal__cancel" onClick={closeDocumentModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
