import React, { useEffect, useState } from "react";
import "../superadmin/Dashboard.css";
import "./Tutors.css";

const API_BASE = "http://localhost:8080";

export default function History() {
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState("tutors");

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

  const formatSubjects = (subjects) => {
    if (Array.isArray(subjects)) {
      return subjects.join(", ");
    }
    return subjects || "—";
  };

  return (
    <div className="sa-page">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-section-title" style={{ fontSize: "1.5rem" }}>
            History
          </h1>
        </div>
      </div>

      <div className="sa-tab-bar">
        <button
          className={`sa-tab ${tab === "tutors" ? "sa-tab--active" : ""}`}
          onClick={() => setTab("tutors")}
        >
          Tutors ({tutors.length})
        </button>
        <button
          className={`sa-tab ${tab === "students" ? "sa-tab--active" : ""}`}
          onClick={() => setTab("students")}
        >
          Students ({students.length})
        </button>
      </div>

      <div className="sa-table-card" style={{ marginTop: "1rem" }}>
        <div className="sa-table-wrap">
          {tab === "tutors" && (
            <table className="sa-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subjects</th>
                  <th>Rate/hr</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {tutors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="sa-table-empty">
                      No tutor records
                    </td>
                  </tr>
                ) : (
                  tutors.map((t, idx) => (
                    <tr key={idx}>
                      <td className="sa-text-muted">{idx + 1}</td>
                      <td>
                        <strong>{t.userName || t.user?.name || "—"}</strong>
                      </td>
                      <td>{t.userEmail || t.user?.email || "—"}</td>
                      <td>{formatSubjects(t.subjects)}</td>
                      <td>Rs. {t.hourlyRate || "—"}</td>
                      <td>
                        <span
                          className={`sa-badge ${t.verified ? "sa-badge--green" : "sa-badge--amber"}`}
                        >
                          {t.verified ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          {tab === "students" && (
            <table className="sa-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="sa-table-empty">
                      No student records
                    </td>
                  </tr>
                ) : (
                  students.map((s, idx) => (
                    <tr key={idx}>
                      <td className="sa-text-muted">{idx + 1}</td>
                      <td>
                        <strong>{s.userName || s.user?.name || "—"}</strong>
                      </td>
                      <td>{s.userEmail || s.user?.email || "—"}</td>
                      <td>{s.userPhone || s.user?.phone || "—"}</td>
                      <td>{s.currentClass || s.gradeLevel || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
