import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import studentAnimation from '../student.json';
import { loginUser, signupUser } from '../api';
import '../App.css';

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if(!role) { setError('Please select a role!'); return; }
    if(!email) { setError('Please enter email!'); return; }
    if(!password) { setError('Please enter password!'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if(role === 'faculty') navigate('/faculty-dashboard');
      else navigate('/student-dashboard');
    } catch(err) {
      setError(err.response?.data?.message || 'Login failed!');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if(!name) { setError('Please enter your name!'); return; }
    if(!role) { setError('Please select a role!'); return; }
    if(!email) { setError('Please enter email!'); return; }
    if(!password) { setError('Please enter password!'); return; }
    if(password.length < 6) { setError('Password must be at least 6 characters!'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signupUser({ name, email, password, role });
      setSuccess('Account created successfully! Please login.');
      setIsSignUp(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
    } catch(err) {
      setError(err.response?.data?.message || 'Signup failed!');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">

      <div className="left-panel">
        <div className="top-badge">RGMCET - Student Attendance Tracker</div>

        <div className="login-box">
          <div className="avatar">U</div>
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back!'}</h2>
          <p className="college-name">RGMCET - Dept. of CSE</p>
          <p className="subtitle">{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          {isSignUp && (
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Login As</label>
            <select
              className="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="login-btn"
            onClick={isSignUp ? handleSignUp : handleLogin}
            disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}
          </button>

          <p className="toggle-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <span
              className="toggle-link"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}>
              {isSignUp ? ' Login' : ' Sign Up'}
            </span>
          </p>

          <p className="footer-text">Student Attendance Tracker 2026</p>
        </div>

        <div className="bottom-stats">
          <div className="stat-badge">
            <h4>500+</h4>
            <p>Students</p>
          </div>
          <div className="stat-badge">
            <h4>98%</h4>
            <p>Accuracy</p>
          </div>
          <div className="stat-badge">
            <h4>24/7</h4>
            <p>Access</p>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="animation-container">
          <h2 className="anim-title">Student Attendance Tracker</h2>
          <p className="anim-subtitle">Automated. Smart. Reliable.</p>

          <Lottie
            animationData={studentAnimation}
            loop={true}
            style={{ width: 420, height: 380 }}
          />

          <div className="features-row">
            <div className="feat">Attendance</div>
            <div className="feat">Reports</div>
            <div className="feat">Emails</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;