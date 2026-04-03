import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, getEvents, submitRSVP, getStudentRSVP } from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

function StudentDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [rsvpCounts, setRsvpCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
    fetchEvents();
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

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch(err) {
      console.log('Error fetching events:', err);
    }
  };

  const fetchRSVPStatus = async (eventId, studentId) => {
    try {
      const res = await getStudentRSVP(eventId, studentId);
      if(res.data) {
        setRsvpStatus(prev => ({...prev, [eventId]: res.data.status}));
      }
    } catch(err) {
      console.log('Error fetching RSVP:', err);
    }
  };

  useEffect(() => {
    if(student && events.length > 0) {
      events.forEach(event => {
        fetchRSVPStatus(event.id, student.id);
      });
    }
  }, [student, events]);

  const handleRSVP = async (eventId, status) => {
    if(!student) return;
    try {
      await submitRSVP({ event_id: eventId, student_id: student.id, status: status });
      setRsvpStatus(prev => ({...prev, [eventId]: status}));
      alert(status === 'attending' ? 'You are attending this event!' : 'You marked as not attending!');
    } catch(err) {
      alert('Error submitting RSVP!');
    }
  };

  const getDaysLeft = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diff = Math.ceil((event - today) / (1000 * 60 * 60 * 24));
    if(diff < 0) return 'Past Event';
    if(diff === 0) return 'Today!';
    return diff + ' days left';
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

  const downloadAttendanceReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Student Attendance Report', 14, 20);
    doc.setFontSize(12);
    doc.text('RGMCET - Department of CSE', 14, 30);
    doc.text('Date: ' + new Date().toLocaleDateString(), 14, 38);
    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Details']],
      body: [
        ['Name', student.name],
        ['Roll No', student.roll_no],
        ['Email', student.email],
        ['Attendance Percentage', student.attendance_percentage + '%'],
        ['Status', getStatusText(student.attendance_percentage)],
        ['Required Attendance', '75%'],
        ['Shortage', student.attendance_percentage >= 75 ? 'None' : (75 - student.attendance_percentage) + '%']
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [26, 115, 232] }
    });
    doc.save(student.name + '_Attendance_Report.pdf');
  };

  const downloadMarksReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Student Marks Report', 14, 20);
    doc.setFontSize(12);
    doc.text('RGMCET - Department of CSE', 14, 30);
    doc.text('Date: ' + new Date().toLocaleDateString(), 14, 38);
    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Details']],
      body: [
        ['Name', student.name],
        ['Roll No', student.roll_no],
        ['Email', student.email]
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [26, 115, 232] }
    });
    autoTable(doc, {
      head: [['Subject', 'Mid 1 (20)', 'Mid 2 (20)', 'Assignment (10)', 'Total (50)']],
      body: [
        ['Overall', student.mid1, student.mid2, student.assignment,
          Number(student.mid1) + Number(student.mid2) + Number(student.assignment)]
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [26, 115, 232] }
    });
    doc.save(student.name + '_Marks_Report.pdf');
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
          <div
            className={activePage === 'events' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('events')}>
            Events
          </div>
          <div
            className={activePage === 'reports' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('reports')}>
            Reports
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={() => navigate('/')}>Logout</div>
        </div>
      </div>

      <div className="main-content">

        <div className="header">
          <div>
            <h2>Welcome, {student.name}!</h2>
            <p>Saturday, April 03, 2026</p>
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

            {events.length > 0 && (
              <div className="recent-section" style={{marginTop: '20px'}}>
                <h3>Upcoming Events</h3>
                <div className="events-grid">
                  {events.slice(0, 2).map((event, i) => (
                    <div className="event-card" key={i}>
                      {event.poster_url && (
                        <img
                          src={'http://localhost:5000/uploads/' + event.poster_url}
                          alt={event.title}
                          className="event-poster"
                        />
                      )}
                      <div className="event-info">
                        <h4>{event.title}</h4>
                        <p className="event-date">Date: {new Date(event.event_date).toDateString()}</p>
                        <p className={`event-countdown ${new Date(event.event_date) < new Date() ? 'past' : 'upcoming'}`}>
                          {getDaysLeft(event.event_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {activePage === 'events' && (
          <div className="recent-section">
            <h3>Events</h3>
            {events.length === 0 ? (
              <p className="no-data">No events announced yet. Check back later!</p>
            ) : (
              <div className="events-grid">
                {events.map((event, i) => (
                  <div className="event-card" key={i}>
                    {event.poster_url && (
                      <img
                        src={'http://localhost:5000/uploads/' + event.poster_url}
                        alt={event.title}
                        className="event-poster"
                      />
                    )}
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      <p className="event-desc">{event.description}</p>
                      <p className="event-date">Date: {new Date(event.event_date).toDateString()}</p>
                      <p className={`event-countdown ${new Date(event.event_date) < new Date() ? 'past' : 'upcoming'}`}>
                        {getDaysLeft(event.event_date)}
                      </p>

                      <div className="rsvp-buttons">
                        <button
                          className={`rsvp-btn ${rsvpStatus[event.id] === 'attending' ? 'active-attending' : 'attending'}`}
                          onClick={() => handleRSVP(event.id, 'attending')}>
                          Attending
                        </button>
                        <button
                          className={`rsvp-btn ${rsvpStatus[event.id] === 'not_attending' ? 'active-not-attending' : 'not-attending'}`}
                          onClick={() => handleRSVP(event.id, 'not_attending')}>
                          Not Attending
                        </button>
                      </div>
                      {rsvpStatus[event.id] && (
                        <p className="rsvp-count">
                          Your RSVP: {rsvpStatus[event.id] === 'attending' ? 'Attending' : 'Not Attending'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === 'reports' && (
          <div className="recent-section">
            <h3>My Reports</h3>
            <div className="report-cards">
              <div className="report-card">
                <h4>My Attendance Report</h4>
                <p>Current attendance: {student.attendance_percentage}%</p>
                <button className="download-btn" onClick={downloadAttendanceReport}>
                  Download PDF
                </button>
              </div>
              <div className="report-card">
                <h4>My Marks Report</h4>
                <p>Total: {Number(student.mid1) + Number(student.mid2) + Number(student.assignment)}/50</p>
                <button className="download-btn" onClick={downloadMarksReport}>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentDashboard;