import React, { useEffect, useState } from "react";
import { Trash2, Search } from "lucide-react";
import "./Tutors.css";
import "../superadmin/Dashboard.css";

const API_BASE = "http://localhost:8080";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/students`, { headers })
      .then((res) => res.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = (id) => {
    if (
      !window.confirm("Are you sure you want to delete this student profile?")
    )
      return;
    fetch(`${API_BASE}/api/students/${id}`, { method: "DELETE", headers })
      .then(() => fetchStudents())
      .catch(console.error);
  };

  const filtered = students.filter(
    (s) =>
      (s.userName || s.user?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.userEmail || s.user?.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-section-title" style={{ fontSize: "1.5rem" }}>
            Students
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
                <th>Phone</th>
                <th>Grade Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="sa-table-empty">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="sa-table-empty">
                    No students found
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{s.userName || s.user?.name || "—"}</strong>
                    </td>
                    <td>{s.userEmail || s.user?.email || "—"}</td>
                    <td>{s.userPhone || s.user?.phone || "—"}</td>
                    <td>{s.currentClass || s.gradeLevel || "—"}</td>
                    <td>
                      <div className="sa-action-icons">
                        <button
                          className="sa-icon-btn sa-icon-btn--red"
                          title="Delete"
                          onClick={() => handleDelete(s.id)}
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
