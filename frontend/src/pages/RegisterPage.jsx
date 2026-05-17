import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import './RegisterPage.css';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    Name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address.';
        }
        break;
      case 'password':
        const hasUppercase = /[A-Z]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        if (value.length < 8) {
          error = 'Password must be at least 8 characters long.';
        } else if (!hasUppercase) {
          error = 'Password must contain at least one uppercase letter.';
        } else if (!hasSpecialChar) {
          error = 'Password must contain at least one special character.';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = 'Passwords do not match.';
        }
        break;
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) {
          error = 'Phone number must be exactly 10 digits.';
        }
        break;
      default:
        if (!value && ['firstName', 'lastName'].includes(name)) {
          error = 'This field is required.';
        }
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.Name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setServerError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setServerError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="register-page">
        <div className="auth-header">
          <h2>Create your account</h2>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="Name">Name</label>
              <input 
                type="text" 
                id="Name" 
                placeholder="Name" 
                value={formData.Name}
                onChange={handleChange}
                className={errors.Name ? 'input-error' : ''}
                required 
              />
              {errors.Name && <span className="error-text">{errors.Name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Email address" 
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              required 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone number</label>
            <input 
              type="text" 
              id="phone" 
              placeholder="Enter phone number" 
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
              required 
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="password-input-wrapper">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                id="confirmPassword" 
                placeholder="Confirm password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="role-selection">
            <span className="role-label">Role</span>
            <div className="role-options">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="role" 
                  value="tutor" 
                  checked={role === 'tutor'}
                  onChange={() => setRole('tutor')}
                />
                <span className="radio-custom"></span>
                I'm a tutor
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                />
                <span className="radio-custom"></span>
                I'm a student
              </label>
            </div>
          </div>
          
          <div className="form-options terms-option">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>I accept <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a></span>
            </label>
          </div>
          
          {serverError && <div className="alert alert-error mb-2">{serverError}</div>}
          {successMessage && <div className="alert alert-success mb-2">{successMessage}</div>}

          <button type="submit" className="primary-btn full-width mt-2" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
