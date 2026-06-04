import React, { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  MapPin,
  UploadCloud,
  CheckCircle2,
  Camera,
  Award,
  CreditCard,
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
  const [documents, setDocuments] = useState({
    profilePic: { base64: null, name: "" },
    certification: { base64: null, name: "" },
    nid: { base64: null, name: "" },
  });
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
        const status = String(tutorProfile?.status || "").toUpperCase();

        if (status === "VERIFIED") {
          setProfileStatus("VERIFIED");
          return;
        }

        if (status === "PENDING" && tutorProfile?.subscriptionActive) {
          setProfileStatus("PENDING");
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
    const { name, value } = e.target;
    let newValue = value;
    if (name === "experienceYears") {
      if (value === "") {
        newValue = "";
      } else {
        const parsed = parseInt(value, 10);
        newValue = isNaN(parsed) ? "" : String(Math.max(0, parsed));
      }
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleFileChange = (key, acceptImages = true) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = acceptImages
      ? ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
      : ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid file (PDF or Image).");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        `File size should not exceed 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
      );
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setDocuments((prev) => ({ ...prev, [key]: { base64: null, name: "" } }));
    };

    reader.onloadend = () => {
      try {
        const base64String = reader.result?.split(",")?.[1];
        if (base64String) {
          setDocuments((prev) => ({
            ...prev,
            [key]: { base64: base64String, name: file.name },
          }));
          setError("");
        } else {
          throw new Error("Failed to encode file");
        }
      } catch (err) {
        setError("Failed to process file. Please try again.");
        setDocuments((prev) => ({ ...prev, [key]: { base64: null, name: "" } }));
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

    if (!documents.profilePic.base64 || !documents.certification.base64 || !documents.nid.base64) {
      setError(
        "Please upload all three required documents: Profile Picture, Certification, and NID/Citizenship.",
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
        profilePicUrl: documents.profilePic.base64,
        certificationUrl: documents.certification.base64,
        nidUrl: documents.nid.base64,
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
              <input
                type="number"
                name="hourlyRate"
                required
                placeholder="Rs. 500"
                value={formData.hourlyRate}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experienceYears"
                required
                placeholder="2"
                min="1"
                step="1"
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

          <div className="input-group full-width">
            <label style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Required Documents *</label>
            <div className="document-uploads-grid">
              <div className="file-upload-group">
                <label><Camera size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />Profile Picture</label>
                <div className="file-upload-box">
                  <UploadCloud size={28} className="upload-icon" />
                  <p>Upload your photo</p>
                  <input
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    onChange={handleFileChange("profilePic")}
                  />
                  {documents.profilePic.name && (
                    <p className="file-name">
                      <CheckCircle2 size={16} /> {documents.profilePic.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="file-upload-group">
                <label><Award size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />Certification</label>
                <div className="file-upload-box">
                  <UploadCloud size={28} className="upload-icon" />
                  <p>Upload degree/certificate</p>
                  <input
                    type="file"
                    accept=".pdf, .png, .jpg, .jpeg"
                    onChange={handleFileChange("certification")}
                  />
                  {documents.certification.name && (
                    <p className="file-name">
                      <CheckCircle2 size={16} /> {documents.certification.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="file-upload-group">
                <label><CreditCard size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />NID / Citizenship</label>
                <div className="file-upload-box">
                  <UploadCloud size={28} className="upload-icon" />
                  <p>Upload NID or Citizenship</p>
                  <input
                    type="file"
                    accept=".pdf, .png, .jpg, .jpeg"
                    onChange={handleFileChange("nid")}
                  />
                  {documents.nid.name && (
                    <p className="file-name">
                      <CheckCircle2 size={16} /> {documents.nid.name}
                    </p>
                  )}
                </div>
              </div>
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
