import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../api';
import './Dashboard.css';

function StudentDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      const res = await getStudents();
      const found = res.data.find(s => s.email === loggedInUser.email);
      if(found) setStudent(found);
    } catch(err) {
      console.log('Error fetching student:', err);
    }
  };

  const getStatus = (attendance) => {
    if(attendance >= 75) return 'eligible';
    if(attendance >= 60) return 'warning';
    return 'not-eligible';
  };

  const getStatusText = (attendance) => {
    if(attendance >= 75) return 'Eligible';
    if(attendance >= 60) return 'Warning';
    return 'Not Eligible';
  };

  if(!student) {
    return (
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">RGMCET</div>
            <p>Student Portal</p>
          </div>
          <div className="sidebar-footer">
            <div className="nav-item logout" onClick={() => navigate('/')}>Logout</div>
          </div>
        </div>
        <div className="main-content">
          <p className="no-data">Your profile is not set up yet. Please contact your faculty!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">RGMCET</div>
          <p>Student Portal</p>
        </div>

        <nav className="sidebar-nav">
          <div
            className={activePage === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('dashboard')}>
            Dashboard
          </div>
          <div
            className={activePage === 'attendance' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('attendance')}>
            My Attendance
          </div>
          <div
            className={activePage === 'marks' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('marks')}>
            My Marks
          </div>
          <div
            className={activePage === 'eligibility' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('eligibility')}>
            Eligibility
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={() => navigate('/')}>
            Logout
          </div>
        </div>
      </div>

      <div className="main-content">

        <div className="header">
          <div>
            <h2>Welcome, {student.name}!</h2>
            <p>Friday, March 14, 2026</p>
          </div>
          <div className="header-profile">{student.roll_no}</div>
        </div>

        {activePage === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-info">
                  <h3>{student.attendance_percentage}%</h3>
                  <p>My Attendance</p>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-info">
                  <h3>{student.mid1}/20</h3>
                  <p>Mid 1 Marks</p>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-info">
                  <h3>{student.mid2}/20</h3>
                  <p>Mid 2 Marks</p>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-info">
                  <h3>
                    <span className={`status ${getStatus(student.attendance_percentage)}`}>
                      {getStatusText(student.attendance_percentage)}
                    </span>
                  </h3>
                  <p>Eligibility</p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h3>My Profile</h3>
              <div className="profile-card">
                <div className="profile-row">
                  <span className="profile-label">Name</span>
                  <span className="profile-value">{student.name}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Roll No</span>
                  <span className="profile-value">{student.roll_no}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Email</span>
                  <span className="profile-value">{student.email}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Department</span>
                  <span className="profile-value">Computer Science and Engineering</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">College</span>
                  <span className="profile-value">RGMCET, Nandyal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === 'attendance' && (
          <div className="recent-section">
            <h3>My Attendance</h3>
            <div className="attendance-summary">
              <div className="att-card">
                <h4>{student.attendance_percentage}%</h4>
                <p>Overall Attendance</p>
              </div>
              <div className="att-card">
                <h4>48</h4>
                <p>Classes Held</p>
              </div>
              <div className="att-card">
                <h4>{Math.round(48 * student.attendance_percentage / 100)}</h4>
                <p>Classes Attended</p>
              </div>
              <div className="att-card">
                <h4>{48 - Math.round(48 * student.attendance_percentage / 100)}</h4>
                <p>Classes Missed</p>
              </div>
            </div>
          </div>
        )}

        {activePage === 'marks' && (
          <div className="recent-section">
            <h3>My Internal Marks</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Mid 1 (20)</th>
                    <th>Mid 2 (20)</th>
                    <th>Assignment (10)</th>
                    <th>Total (50)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Overall</td>
                    <td>{student.mid1}</td>
                    <td>{student.mid2}</td>
                    <td>{student.assignment}</td>
                    <td>{Number(student.mid1) + Number(student.mid2) + Number(student.assignment)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePage === 'eligibility' && (
          <div className="recent-section">
            <h3>Eligibility Status</h3>
            <div className="eligibility-card">
              <div className="elig-status">
                <div className={`elig-badge ${getStatus(student.attendance_percentage)}`}>
                  {getStatusText(student.attendance_percentage)}
                </div>
                <p>Based on your attendance of {student.attendance_percentage}%</p>
              </div>

              <div className="elig-details">
                <div className="elig-row">
                  <span>Required Attendance</span>
                  <span className="elig-value">75%</span>
                </div>
                <div className="elig-row">
                  <span>Your Attendance</span>
                  <span className="elig-value">{student.attendance_percentage}%</span>
                </div>
                <div className="elig-row">
                  <span>Shortage</span>
                  <span className="elig-value">
                    {student.attendance_percentage >= 75 ? 'None' : (75 - student.attendance_percentage) + '%'}
                  </span>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-label">
                  <span>Attendance Progress</span>
                  <span>{student.attendance_percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getStatus(student.attendance_percentage)}`}
                    style={{width: student.attendance_percentage + '%'}}>
                  </div>
                </div>
                <div className="progress-marker">
                  <span>0%</span>
                  <span>75% Required</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentDashboard;