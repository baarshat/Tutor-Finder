import React, { useState, useEffect } from "react";
import { User, Shield, Camera, UploadCloud, Info, CheckCircle2, AlertTriangle, Languages, BookOpen, Clock } from "lucide-react";
import { toast } from "react-toastify";
import "./SettingsPage.css";

const API_BASE = "http://localhost:8080/api";

const languageOptions = [
  "English", "Nepali", "Spanish", "French", "German", "Chinese", "Hindi", "Japanese"
];

const tutorModes = [
  "Online Only", "In-Person Only", "Hybrid (Both Online & In-Person)"
];

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePicUrl: "",
  });

  // Tutor Specific State
  const [tutorData, setTutorData] = useState({
    nativeLanguage: "",
    tutorMode: "",
    languagesKnown: "",
    introduction: "",
    qualifications: "", // Where did you graduate
    experienceYears: "",
    experienceDescription: "",
    subjects: "",
    location: "",
    hourlyRate: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Word Count Helper
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getAuthToken = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return "";
      const u = JSON.parse(stored);
      return u.token || u.accessToken || u.jwtToken || localStorage.getItem("token") || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        toast.error("Please log in first.");
        setLoading(false);
        return;
      }
      const parsedUser = JSON.parse(stored);
      const userId = parsedUser.userId || parsedUser.id;
      const token = getAuthToken();

      // Fetch User details
      const userRes = await fetch(`${API_BASE}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!userRes.ok) throw new Error("Failed to load user info");
      
      const userData = await userRes.json();
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        profilePicUrl: userData.profilePicUrl || "",
      });

      // If tutor, fetch Tutor Profile
      if (userData.role === "TUTOR") {
        const tutorRes = await fetch(`${API_BASE}/tutors/user/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (tutorRes.ok) {
          const tProfile = await tutorRes.json();
          setTutorProfile(tProfile);
          setTutorData({
            nativeLanguage: tProfile.nativeLanguage || "",
            tutorMode: tProfile.tutorMode || "",
            languagesKnown: tProfile.languagesKnown || "",
            introduction: tProfile.introduction || "",
            qualifications: tProfile.qualifications || "",
            experienceYears: tProfile.experienceYears || "",
            experienceDescription: tProfile.experienceDescription || "",
            subjects: tProfile.subjects || "",
            location: tProfile.location || "",
            hourlyRate: tProfile.hourlyRate || "",
          });
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfileData(prev => ({ ...prev, profilePicUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getAuthToken();
      const userId = user.id;

      // 1. Update Base User Info
      const userRes = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.message || "Failed to update user profile");
      }

      const updatedUser = await userRes.json();
      
      // Update local storage so navbar and app states reflect the new data immediately
      const localStorageUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorageUser.name = updatedUser.name;
      localStorageUser.email = updatedUser.email;
      localStorageUser.phone = updatedUser.phone;
      localStorageUser.profilePicUrl = updatedUser.profilePicUrl;
      localStorage.setItem("user", JSON.stringify(localStorageUser));
      setUser(updatedUser);

      // 2. Update Tutor Specific Info if applicable
      if (user.role === "TUTOR" && tutorProfile) {
        const payload = {
          ...tutorProfile,
          nativeLanguage: tutorData.nativeLanguage,
          tutorMode: tutorData.tutorMode,
          languagesKnown: tutorData.languagesKnown,
          introduction: tutorData.introduction,
          qualifications: tutorData.qualifications,
          experienceYears: parseInt(tutorData.experienceYears, 10) || 0,
          experienceDescription: tutorData.experienceDescription,
          subjects: tutorData.subjects,
          location: tutorData.location,
          hourlyRate: parseFloat(tutorData.hourlyRate) || 0,
        };

        const tutorRes = await fetch(`${API_BASE}/tutors/${tutorProfile.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!tutorRes.ok) {
          throw new Error("Failed to update tutor details");
        }

        const updatedTutor = await tutorRes.json();
        setTutorProfile(updatedTutor);
      }

      toast.success("Profile saved and updated successfully!");
      // Dispatch storage event to notify other components (like Navbar)
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setSaving(true);
    try {
      const token = getAuthToken();
      const userId = user.id;

      const res = await fetch(`${API_BASE}/users/${userId}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Incorrect current password");
      }

      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings page...</p>
      </div>
    );
  }

  const wordCount = getWordCount(tutorData.introduction);
  const isIntroValid = wordCount >= 300;

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container">
        
        {/* Settings Header */}
        <div className="settings-header-banner">
          <h1>Account Settings</h1>
          <p>Update your personal information, tutor profiles, and manage security settings.</p>
        </div>

        <div className="settings-layout">
          
          {/* Sidebar Nav */}
          <aside className="settings-sidebar">
            <button
              className={`sidebar-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} />
              <span>Personal Information</span>
            </button>
            <button
              className={`sidebar-nav-item ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={18} />
              <span>Password & Security</span>
            </button>
          </aside>

          {/* Main Form Content */}
          <main className="settings-content-card">
            
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="settings-form">
                
                {/* Profile Photo Upload Section */}
                <div className="settings-section">
                  <h2>Profile Photo</h2>
                  <div className="profile-photo-uploader">
                    <div className="profile-preview-wrapper">
                      {profileData.profilePicUrl ? (
                        <img src={profileData.profilePicUrl} alt="Profile" className="profile-img-preview" />
                      ) : (
                        <div className="profile-initials-fallback">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label htmlFor="photo-file" className="photo-edit-badge">
                        <Camera size={16} />
                      </label>
                      <input 
                        type="file" 
                        id="photo-file" 
                        accept="image/*" 
                        onChange={handleProfilePicChange} 
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="uploader-info-box">
                      <div className="file-dropzone-ui">
                        <UploadCloud size={24} className="dropzone-icon" />
                        <p><strong>Click to upload</strong> or drag and drop</p>
                        <span>JPG, PNG or GIF (max. 5MB)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProfilePicChange} 
                          className="dropzone-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="settings-divider" />

                {/* Core Account Details */}
                <div className="settings-section">
                  <h2>General Information</h2>
                  <div className="settings-form-grid">
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileData.name}
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="input-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        required
                        value={profileData.email}
                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="e.g. john@example.com"
                      />
                    </div>

                    <div className="input-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={profileData.phone}
                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Tutor Specific Details */}
                {user?.role === "TUTOR" && (
                  <>
                    <hr className="settings-divider" />
                    <div className="settings-section">
                      <h2>Tutor Profile & Availability Info</h2>
                      
                      <div className="settings-form-grid">
                        <div className="input-group">
                          <label>Native Language *</label>
                          <select
                            required
                            value={tutorData.nativeLanguage}
                            onChange={e => setTutorData({ ...tutorData, nativeLanguage: e.target.value })}
                          >
                            <option value="">Select a native language</option>
                            {languageOptions.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="input-group">
                          <label>Tutor Mode *</label>
                          <select
                            required
                            value={tutorData.tutorMode}
                            onChange={e => setTutorData({ ...tutorData, tutorMode: e.target.value })}
                          >
                            <option value="">Select tutor mode</option>
                            {tutorModes.map(mode => (
                              <option key={mode} value={mode}>{mode}</option>
                            ))}
                          </select>
                        </div>

                        <div className="input-group">
                          <label>Languages I Know *</label>
                          <input
                            type="text"
                            required
                            value={tutorData.languagesKnown}
                            onChange={e => setTutorData({ ...tutorData, languagesKnown: e.target.value })}
                            placeholder="e.g. English, Nepali, Spanish"
                          />
                        </div>

                        <div className="input-group">
                          <label>Where did you graduate? *</label>
                          <input
                            type="text"
                            required
                            value={tutorData.qualifications}
                            onChange={e => setTutorData({ ...tutorData, qualifications: e.target.value })}
                            placeholder="e.g. Tribhuvan University, BSc Computer Science"
                          />
                        </div>

                        <div className="input-group">
                          <label>Experience (Years) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={tutorData.experienceYears}
                            onChange={e => setTutorData({ ...tutorData, experienceYears: e.target.value })}
                            placeholder="e.g. 5"
                          />
                        </div>

                        <div className="input-group">
                          <label>Subjects Taught *</label>
                          <input
                            type="text"
                            required
                            value={tutorData.subjects}
                            onChange={e => setTutorData({ ...tutorData, subjects: e.target.value })}
                            placeholder="e.g. Mathematics, Science"
                          />
                        </div>

                        <div className="input-group">
                          <label>Primary Location *</label>
                          <input
                            type="text"
                            required
                            value={tutorData.location}
                            onChange={e => setTutorData({ ...tutorData, location: e.target.value })}
                            placeholder="e.g. Kathmandu"
                          />
                        </div>

                        <div className="input-group">
                          <label>Hourly Rate (Rs.) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={tutorData.hourlyRate}
                            onChange={e => setTutorData({ ...tutorData, hourlyRate: e.target.value })}
                            placeholder="e.g. 700"
                          />
                        </div>
                      </div>

                      {/* Experience Description */}
                      <div className="input-group full-width" style={{ marginTop: "1rem" }}>
                        <label>What experience do you have? *</label>
                        <textarea
                          required
                          rows={4}
                          value={tutorData.experienceDescription}
                          onChange={e => setTutorData({ ...tutorData, experienceDescription: e.target.value })}
                          placeholder="Describe your teaching experience, methodologies, and accomplishments..."
                        />
                      </div>

                      {/* Brief Introduction simulated editor */}
                      <div className="input-group full-width" style={{ marginTop: "1.5rem" }}>
                        <label>A brief introduction *</label>
                        <div className="simulated-editor-container">
                          
                          {/* Rich Text controls */}
                          <div className="editor-toolbar">
                            <button type="button" className="toolbar-btn font-bold-style">B</button>
                            <button type="button" className="toolbar-btn font-italic-style">I</button>
                            <button type="button" className="toolbar-btn font-underline-style">U</button>
                            <span className="toolbar-separator">|</span>
                            <button type="button" className="toolbar-btn">List</button>
                            <button type="button" className="toolbar-btn">Num</button>
                            <button type="button" className="toolbar-btn">Link</button>
                            <span className="toolbar-separator">|</span>
                            <button type="button" className="toolbar-btn">Undo</button>
                            <button type="button" className="toolbar-btn">Redo</button>
                            <button type="button" className="toolbar-btn">Clear</button>
                            
                            <button type="button" className="ai-write-btn" onClick={() => {
                              toast.info("AI Write helper feature coming soon!");
                            }}>
                              ✨ Write with AI
                            </button>
                          </div>

                          <textarea
                            required
                            rows={8}
                            className="editor-textarea"
                            value={tutorData.introduction}
                            onChange={e => setTutorData({ ...tutorData, introduction: e.target.value })}
                            placeholder="Add your introduction (Minimum 300 words required)..."
                          />
                        </div>

                        <div className="word-count-status-row">
                          <span className={`word-count-indicator ${isIntroValid ? "valid" : "invalid"}`}>
                            {isIntroValid ? (
                              <><CheckCircle2 size={14} /> Meets minimum word requirement</>
                            ) : (
                              <><AlertTriangle size={14} /> Minimum 300 words required.</>
                            )}
                          </span>
                          <span className="word-count-badge">Words: {wordCount}/300</span>
                        </div>
                      </div>

                    </div>
                  </>
                )}

                {/* Submit Row */}
                <div className="settings-submit-footer">
                  <p>Save & update the latest changes to the live profile</p>
                  <button 
                    type="submit" 
                    className="primary-settings-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving Changes..." : "Save & Update"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="settings-form">
                <div className="settings-section">
                  <h2>Change Password</h2>
                  <p className="section-desc">Ensure your account is using a secure, strong password to protect your information.</p>
                  
                  <div className="settings-password-inputs">
                    <div className="input-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.oldPassword}
                        onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="input-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password (min. 6 characters)"
                      />
                    </div>

                    <div className="input-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-submit-footer">
                  <p>Security credentials update will take effect immediately</p>
                  <button 
                    type="submit" 
                    className="primary-settings-btn"
                    disabled={saving}
                  >
                    {saving ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
