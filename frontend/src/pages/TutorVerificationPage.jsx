import React, { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  MapPin,
  DollarSign,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import "./TutorVerificationPage.css";

export default function TutorVerificationPage() {
  const [formData, setFormData] = useState({
    qualifications: "",
    subjects: "",
    hourlyRate: "",
    experienceYears: "",
    location: "",
    serviceArea: "",
    mapLocation: "",
  });
  const [documentBase64, setDocumentBase64] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileStatus, setProfileStatus] = useState("LOADING");
  const submitLockRef = useRef(false);

  const getAuthToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return (
        user.token ||
        user.accessToken ||
        user.jwtToken ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwtToken") ||
        ""
      );
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const loadProfileStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.userId || user.id;
        if (!userId) {
          setProfileStatus("READY");
          return;
        }

        const token = getAuthToken();
        const res = await fetch(
          `http://localhost:8080/api/tutors/user/${userId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (!res.ok) {
          setProfileStatus("READY");
          return;
        }

        const tutorProfile = await res.json();
        if (tutorProfile?.status) {
          setProfileStatus(String(tutorProfile.status).toUpperCase());
          return;
        }

        setProfileStatus(
          tutorProfile?.subscriptionActive ? "PENDING" : "READY",
        );
      } catch {
        setProfileStatus("READY");
      }
    };

    loadProfileStatus();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid file (PDF or Image).");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        `File size should not exceed 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
      );
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setDocumentBase64(null);
      setFileName("");
    };

    reader.onloadend = () => {
      try {
        const base64String = reader.result?.split(",")?.[1];
        if (base64String) {
          setDocumentBase64(base64String);
          setError("");
        } else {
          throw new Error("Failed to encode file");
        }
      } catch (err) {
        setError("Failed to process file. Please try again.");
        setDocumentBase64(null);
        setFileName("");
      }
    };

    reader.readAsDataURL(file);
  };

  const initiatePayment = async (e) => {
    e.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;

    if (!documentBase64) {
      setError(
        "Please upload your qualification document (e.g. Citizenship, Degree).",
      );
      submitLockRef.current = false;
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();

      const payload = {
        qualifications: formData.qualifications?.trim(),
        subjects: formData.subjects?.trim(),
        hourlyRate: parseFloat(formData.hourlyRate),
        experienceYears: parseInt(formData.experienceYears, 10),
        location: formData.location?.trim(),
        serviceArea: formData.serviceArea?.trim(),
        mapLocation: formData.mapLocation?.trim(),
        documentUrl: documentBase64,
        amount: 500, // fixed verification fee for example
      };

      // Validate required fields
      if (!payload.qualifications || !payload.subjects || !payload.location) {
        setError("Please fill in all required fields.");
        setLoading(false);
        submitLockRef.current = false;
        return;
      }

      if (isNaN(payload.hourlyRate) || payload.hourlyRate <= 0) {
        setError("Please enter a valid hourly rate.");
        setLoading(false);
        submitLockRef.current = false;
        return;
      }

      if (isNaN(payload.experienceYears) || payload.experienceYears < 0) {
        setError("Please enter valid experience years.");
        setLoading(false);
        submitLockRef.current = false;
        return;
      }

      const res = await fetch("http://localhost:8080/api/payments/initiate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        throw new Error(
          errorData.message || `Payment initiation failed: ${res.status}`,
        );
      }

      const eSewaData = await res.json();

      if (!eSewaData || !eSewaData.esewa_url) {
        throw new Error("Invalid eSewa response");
      }

      // dynamically create form to post to eSewa
      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", eSewaData.esewa_url);

      const fields = [
        "amount",
        "tax_amount",
        "total_amount",
        "transaction_uuid",
        "product_code",
        "product_service_charge",
        "product_delivery_charge",
        "success_url",
        "failure_url",
        "signed_field_names",
        "signature",
      ];

      fields.forEach((field) => {
        if (eSewaData[field] !== undefined) {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", field);
          input.setAttribute("value", eSewaData[field]);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);
    } catch (err) {
      console.error("Payment initiation error:", err);
      const message = String(err?.message || "");
      if (message.includes("409")) {
        setError(
          "The eSewa session is already active for this browser. Please refresh the page, wait a moment, and try again once.",
        );
      } else {
        setError(
          err?.message || "Failed to initiate payment. Please try again later.",
        );
      }
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  if (profileStatus === "LOADING") {
    return (
      <div className="verification-container">
        <div
          className="verification-card"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileStatus === "PENDING") {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <div className="verification-header">
            <CheckCircle2
              size={64}
              className="verification-icon"
              style={{ color: "#28a745" }}
            />
            <h1>Application Under Review</h1>
            <p>
              Your verification payment was successful and your profile is
              currently under review by our team.
            </p>
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "#6c757d", marginBottom: "10px" }}>
              We will notify you once your account has been approved. Usually
              this takes 24-48 hours.
            </p>
            <p style={{ fontWeight: "bold", color: "#495057" }}>
              Thank you for your patience!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <ShieldAlert size={48} className="verification-icon" />
          <h1>Complete Your Profile</h1>
          <p>
            You must verify your identity and pay a one-time verification fee of
            Rs. 500 to activate your Tutor account.
          </p>
        </div>

        {error && <div className="verification-error">{error}</div>}

        <form onSubmit={initiatePayment} className="verification-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Highest Qualification</label>
              <input
                type="text"
                name="qualifications"
                required
                placeholder="e.g. BSc. Computer Science"
                value={formData.qualifications}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label>Subjects Taught</label>
              <input
                type="text"
                name="subjects"
                required
                placeholder="e.g. Math, Physics"
                value={formData.subjects}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label>Hourly Rate (Rs.)</label>
              <div className="input-icon-wrapper">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  name="hourlyRate"
                  required
                  placeholder="500"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experienceYears"
                required
                placeholder="2"
                value={formData.experienceYears}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label>Primary Location</label>
              <div className="input-icon-wrapper">
                <MapPin size={18} className="input-icon" />
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Kathmandu"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Service Area</label>
              <input
                type="text"
                name="serviceArea"
                placeholder="e.g. Lalitpur, Bhaktapur"
                value={formData.serviceArea}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="input-group full-width">
            <label>Google Map Link (Embed/Share URL)</label>
            <input
              type="url"
              name="mapLocation"
              placeholder="https://maps.google.com/..."
              value={formData.mapLocation}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group full-width file-upload-group">
            <label>Verification Document (Citizenship or Degree) *</label>
            <div className="file-upload-box">
              <UploadCloud size={32} className="upload-icon" />
              <p>Drag and drop or click to upload</p>
              <input
                type="file"
                accept=".pdf, .png, .jpg, .jpeg"
                onChange={handleFileChange}
                required
              />
              {fileName && (
                <p className="file-name">
                  <CheckCircle2 size={16} /> {fileName}
                </p>
              )}
            </div>
          </div>

          <div className="submit-section">
            <button type="submit" className="esewa-btn" disabled={loading}>
              {loading ? "Processing..." : "Pay Rs. 500 with eSewa"}
            </button>
            <p className="secure-text">Secure payment gateway</p>
          </div>
        </form>
      </div>
    </div>
  );
}
