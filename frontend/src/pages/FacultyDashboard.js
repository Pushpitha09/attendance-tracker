import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function FacultyDashboard({ students, setStudents }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const [newStudent, setNewStudent] = useState({
    rollNo: '',
    name: '',
    email: '',
    attendance: 0,
    mid1: 0,
    mid2: 0,
    assignment: 0
  });

  const handleAddStudent = () => {
    if(newStudent.rollNo === '' || newStudent.name === '') {
      alert('Please enter Roll No and Name!');
      return;
    }
    setStudents([...students, newStudent]);
    setNewStudent({ rollNo: '', name: '', email: '', attendance: 0, mid1: 0, mid2: 0, assignment: 0 });
    setShowAddForm(false);
  };

  const handleDeleteStudent = (index) => {
    const updated = students.filter((_, i) => i !== index);
    setStudents(updated);
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

  return (
    <div className="dashboard-container">

      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">RGMCET</div>
          <p>Faculty Portal</p>
        </div>

        <nav className="sidebar-nav">
          <div
            className={activePage === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('dashboard')}>
            Dashboard
          </div>
          <div
            className={activePage === 'students' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('students')}>
            Students
          </div>
          <div
            className={activePage === 'attendance' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('attendance')}>
            Mark Attendance
          </div>
          <div
            className={activePage === 'marks' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('marks')}>
            Internal Marks
          </div>
          <div
            className={activePage === 'reports' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('reports')}>
            Reports
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
            <h2>Welcome, Professor!</h2>
            <p>Wednesday, March 11, 2026</p>
          </div>
          <div className="header-profile">Faculty</div>
        </div>

        {activePage === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-info">
                  <h3>{students.length}</h3>
                  <p>Total Students</p>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-info">
                  <h3>
                    {students.length > 0
                      ? Math.round(students.reduce((sum, s) => sum + Number(s.attendance), 0) / students.length) + '%'
                      : '0%'}
                  </h3>
                  <p>Avg Attendance</p>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-info">
                  <h3>{students.filter(s => s.attendance < 75).length}</h3>
                  <p>Low Attendance</p>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-info">
                  <h3>{students.filter(s => s.attendance >= 75).length}</h3>
                  <p>Eligible Students</p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h3>Overview</h3>
              {students.length === 0 ? (
                <p className="no-data">No students added yet. Go to Students tab to add students.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Attendance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={i}>
                        <td>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td>{s.attendance}%</td>
                        <td>
                          <span className={`status ${getStatus(s.attendance)}`}>
                            {getStatusText(s.attendance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activePage === 'students' && (
          <div className="recent-section">
            <div className="section-header">
              <h3>Student List</h3>
              <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Student'}
              </button>
            </div>

            {showAddForm && (
              <div className="add-form">
                <h4>Add New Student</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Roll No</label>
                    <input
                      type="text"
                      placeholder="eg. 23091A05F8"
                      className="form-input"
                      value={newStudent.rollNo}
                      onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="eg. R. Pushpitha"
                      className="form-input"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="eg. student@gmail.com"
                      className="form-input"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Attendance %</label>
                    <input
                      type="number"
                      placeholder="eg. 85"
                      className="form-input"
                      value={newStudent.attendance}
                      onChange={(e) => setNewStudent({...newStudent, attendance: e.target.value})}
                    />
                  </div>
                </div>
                <button className="submit-btn" onClick={handleAddStudent}>Add Student</button>
              </div>
            )}

            {students.length === 0 ? (
              <p className="no-data">No students yet. Click Add Student to get started!</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Attendance</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={i}>
                        <td>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.attendance}%</td>
                        <td>
                          <span className={`status ${getStatus(s.attendance)}`}>
                            {getStatusText(s.attendance)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteStudent(i)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activePage === 'attendance' && (
          <div className="recent-section">
            <h3>Mark Attendance</h3>
            <div className="attendance-controls">
              <input type="date" className="date-input"/>
              <select className="subject-select">
                <option>Select Subject</option>
                <option>Data Structures</option>
                <option>DBMS</option>
                <option>Web Technologies</option>
              </select>
            </div>
            {students.length === 0 ? (
              <p className="no-data">No students added yet. Go to Students tab first!</p>
            ) : (
              <div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Present</th>
                        <th>Absent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={i}>
                          <td>{s.rollNo}</td>
                          <td>{s.name}</td>
                          <td><input type="radio" name={`att${i}`} value="present"/></td>
                          <td><input type="radio" name={`att${i}`} value="absent"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="submit-btn">Submit Attendance</button>
              </div>
            )}
          </div>
        )}

        {activePage === 'marks' && (
          <div className="recent-section">
            <h3>Internal Marks</h3>
            {students.length === 0 ? (
              <p className="no-data">No students added yet. Go to Students tab first!</p>
            ) : (
              <div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Mid 1</th>
                        <th>Mid 2</th>
                        <th>Assignment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={i}>
                          <td>{s.rollNo}</td>
                          <td>{s.name}</td>
                          <td><input type="number" className="marks-input" placeholder="0"/></td>
                          <td><input type="number" className="marks-input" placeholder="0"/></td>
                          <td><input type="number" className="marks-input" placeholder="0"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="submit-btn">Save Marks</button>
              </div>
            )}
          </div>
        )}

        {activePage === 'reports' && (
          <div className="recent-section">
            <h3>Attendance Reports</h3>
            <div className="report-cards">
              <div className="report-card">
                <h4>Monthly Report</h4>
                <p>March 2026</p>
                <button className="download-btn">Download</button>
              </div>
              <div className="report-card">
                <h4>Low Attendance</h4>
                <p>{students.filter(s => s.attendance < 75).length} Students Below 75%</p>
                <button className="download-btn">Download</button>
              </div>
              <div className="report-card">
                <h4>Full Report</h4>
                <p>All {students.length} Students</p>
                <button className="download-btn">Download</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FacultyDashboard;