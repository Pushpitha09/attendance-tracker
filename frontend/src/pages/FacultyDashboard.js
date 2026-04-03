import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, addStudent, deleteStudent, getSubjects, addSubject, deleteSubject, markAttendance, updateStudent, sendWarningEmails, sendSummaryEmails, getEvents, addEvent, deleteEvent, getRSVP } from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

function FacultyDashboard({ students, setStudents }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});
  const [events, setEvents] = useState([]);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    poster: null
  });
  const navigate = useNavigate();
  const [newStudent, setNewStudent] = useState({
    roll_no: '',
    name: '',
    email: '',
    attendance_percentage: 0,
    mid1: 0,
    mid2: 0,
    assignment: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
    fetchEvents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch(err) {
      console.log('Error fetching students:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch(err) {
      console.log('Error fetching subjects:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
      res.data.forEach(async (event) => {
        try {
          const rsvpRes = await getRSVP(event.id);
          setRsvpCounts(prev => ({...prev, [event.id]: rsvpRes.data.attending}));
        } catch(err) {
          console.log('Error fetching RSVP count:', err);
        }
      });
    } catch(err) {
      console.log('Error fetching events:', err);
    }
  };

  const handleAddStudent = async () => {
    if(newStudent.roll_no === '' || newStudent.name === '') {
      alert('Please enter Roll No and Name!');
      return;
    }
    setLoading(true);
    try {
      await addStudent(newStudent);
      await fetchStudents();
      setNewStudent({ roll_no: '', name: '', email: '', attendance_percentage: 0, mid1: 0, mid2: 0, assignment: 0 });
      setShowAddForm(false);
      alert('Student added successfully!');
    } catch(err) {
      alert('Error adding student!');
    }
    setLoading(false);
  };

  const handleDeleteStudent = async (id) => {
    if(!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      await fetchStudents();
      alert('Student deleted successfully!');
    } catch(err) {
      alert('Error deleting student!');
    }
  };

  const handleAddSubject = async () => {
    if(!newSubject) { alert('Please enter subject name!'); return; }
    try {
      await addSubject({ name: newSubject });
      await fetchSubjects();
      setNewSubject('');
      setShowAddSubject(false);
      alert('Subject added successfully!');
    } catch(err) {
      alert('Error adding subject!');
    }
  };

  const handleDeleteSubject = async (id) => {
    if(!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await deleteSubject(id);
      await fetchSubjects();
      alert('Subject deleted successfully!');
    } catch(err) {
      alert('Error deleting subject!');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({...attendanceData, [studentId]: status});
  };

  const handleSubmitAttendance = async () => {
    if(!selectedDate) { alert('Please select a date!'); return; }
    if(!selectedSubject) { alert('Please select a subject!'); return; }
    try {
      for(const s of students) {
        const status = attendanceData[s.id] || 'absent';
        await markAttendance({
          student_id: s.id,
          date: selectedDate,
          subject: selectedSubject,
          status: status
        });
      }
      alert('Attendance submitted successfully!');
      setAttendanceData({});
    } catch(err) {
      alert('Error submitting attendance!');
    }
  };

  const handleMarksChange = (studentId, field, value) => {
    setMarksData({
      ...marksData,
      [studentId]: {
        ...marksData[studentId],
        [field]: value
      }
    });
  };

  const handleSaveMarks = async () => {
    try {
      for(const s of students) {
        const marks = marksData[s.id];
        if(marks) {
          await updateStudent(s.id, {
            attendance_percentage: s.attendance_percentage,
            mid1: marks.mid1 !== undefined ? marks.mid1 : s.mid1,
            mid2: marks.mid2 !== undefined ? marks.mid2 : s.mid2,
            assignment: marks.assignment !== undefined ? marks.assignment : s.assignment
          });
        }
      }
      await fetchStudents();
      alert('Marks saved successfully!');
      setMarksData({});
    } catch(err) {
      alert('Error saving marks!');
    }
  };

  const handleAddEvent = async () => {
    if(!newEvent.title) { alert('Please enter event title!'); return; }
    if(!newEvent.event_date) { alert('Please select event date!'); return; }
    if(!newEvent.description) { alert('Please enter event description!'); return; }

    setEventLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('event_date', newEvent.event_date);
      if(newEvent.poster) formData.append('poster', newEvent.poster);

      await addEvent(formData);
      await fetchEvents();
      setNewEvent({ title: '', description: '', event_date: '', poster: null });
      setShowAddEvent(false);
      alert('Event added and notifications sent to all students!');
    } catch(err) {
      alert('Error adding event!');
    }
    setEventLoading(false);
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      await fetchEvents();
      alert('Event deleted successfully!');
    } catch(err) {
      alert('Error deleting event!');
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

  const downloadFullReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Student Attendance Report', 14, 20);
    doc.setFontSize(12);
    doc.text('RGMCET - Department of CSE', 14, 30);
    doc.text('Date: ' + new Date().toLocaleDateString(), 14, 38);
    autoTable(doc, {
      startY: 45,
      head: [['Roll No', 'Name', 'Email', 'Attendance %', 'Status']],
      body: students.map(s => [
        s.roll_no, s.name, s.email, s.attendance_percentage + '%',
        s.attendance_percentage >= 75 ? 'Eligible' : s.attendance_percentage >= 60 ? 'Warning' : 'Not Eligible'
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [26, 115, 232] }
    });
    doc.save('Full_Attendance_Report.pdf');
  };

  const downloadLowAttendanceReport = () => {
    const doc = new jsPDF();
    const lowStudents = students.filter(s => s.attendance_percentage < 75);
    doc.setFontSize(18);
    doc.text('Low Attendance Report', 14, 20);
    doc.setFontSize(12);
    doc.text('RGMCET - Department of CSE', 14, 30);
    doc.text('Students Below 75% Attendance', 14, 38);
    doc.text('Date: ' + new Date().toLocaleDateString(), 14, 46);
    autoTable(doc, {
      startY: 53,
      head: [['Roll No', 'Name', 'Email', 'Attendance %', 'Status']],
      body: lowStudents.map(s => [
        s.roll_no, s.name, s.email, s.attendance_percentage + '%',
        s.attendance_percentage >= 60 ? 'Warning' : 'Not Eligible'
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [234, 67, 53] }
    });
    doc.save('Low_Attendance_Report.pdf');
  };

  const downloadMarksReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Internal Marks Report', 14, 20);
    doc.setFontSize(12);
    doc.text('RGMCET - Department of CSE', 14, 30);
    doc.text('Date: ' + new Date().toLocaleDateString(), 14, 38);
    autoTable(doc, {
      startY: 45,
      head: [['Roll No', 'Name', 'Mid 1', 'Mid 2', 'Assignment', 'Total']],
      body: students.map(s => [
        s.roll_no, s.name, s.mid1, s.mid2, s.assignment,
        Number(s.mid1) + Number(s.mid2) + Number(s.assignment)
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [26, 115, 232] }
    });
    doc.save('Marks_Report.pdf');
  };

  const handleSendWarningEmails = async () => {
    if(!window.confirm('Send warning emails to all students below 75%?')) return;
    try {
      const res = await sendWarningEmails();
      alert(res.data.message);
    } catch(err) {
      alert('Error sending emails!');
    }
  };

  const handleSendSummaryEmails = async () => {
    if(!window.confirm('Send monthly summary emails to all students?')) return;
    try {
      const res = await sendSummaryEmails();
      alert(res.data.message);
    } catch(err) {
      alert('Error sending emails!');
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

  return (
    <div className="dashboard-container">

      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">RGMCET</div>
          <p>Faculty Portal</p>
        </div>

        <nav className="sidebar-nav">
          <div className={activePage === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('dashboard')}>Dashboard</div>
          <div className={activePage === 'students' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('students')}>Students</div>
          <div className={activePage === 'subjects' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('subjects')}>Subjects</div>
          <div className={activePage === 'attendance' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('attendance')}>Mark Attendance</div>
          <div className={activePage === 'marks' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('marks')}>Internal Marks</div>
          <div className={activePage === 'events' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('events')}>Events</div>
          <div className={activePage === 'reports' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('reports')}>Reports</div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={() => navigate('/')}>Logout</div>
        </div>
      </div>

      <div className="main-content">

        <div className="header">
          <div>
            <h2>Welcome, Professor!</h2>
            <p>Saturday, April 03, 2026</p>
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
                  <h3>{students.length > 0 ? Math.round(students.reduce((sum, s) => sum + Number(s.attendance_percentage), 0) / students.length) + '%' : '0%'}</h3>
                  <p>Avg Attendance</p>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-info">
                  <h3>{students.filter(s => s.attendance_percentage < 75).length}</h3>
                  <p>Low Attendance</p>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-info">
                  <h3>{events.length}</h3>
                  <p>Total Events</p>
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
                        <td>{s.roll_no}</td>
                        <td>{s.name}</td>
                        <td>{s.attendance_percentage}%</td>
                        <td>
                          <span className={`status ${getStatus(s.attendance_percentage)}`}>
                            {getStatusText(s.attendance_percentage)}
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
                    <input type="text" placeholder="eg. 23091A05F8" className="form-input" value={newStudent.roll_no} onChange={(e) => setNewStudent({...newStudent, roll_no: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="eg. R. Pushpitha" className="form-input" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="eg. student@gmail.com" className="form-input" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Attendance %</label>
                    <input type="number" placeholder="eg. 85" className="form-input" value={newStudent.attendance_percentage} onChange={(e) => setNewStudent({...newStudent, attendance_percentage: e.target.value})}/>
                  </div>
                </div>
                <button className="submit-btn" onClick={handleAddStudent} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
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
                        <td>{s.roll_no}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.attendance_percentage}%</td>
                        <td><span className={`status ${getStatus(s.attendance_percentage)}`}>{getStatusText(s.attendance_percentage)}</span></td>
                        <td><button className="delete-btn" onClick={() => handleDeleteStudent(s.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activePage === 'subjects' && (
          <div className="recent-section">
            <div className="section-header">
              <h3>Subjects</h3>
              <button className="add-btn" onClick={() => setShowAddSubject(!showAddSubject)}>
                {showAddSubject ? 'Cancel' : '+ Add Subject'}
              </button>
            </div>

            {showAddSubject && (
              <div className="add-form">
                <h4>Add New Subject</h4>
                <div className="form-group">
                  <label>Subject Name</label>
                  <input type="text" placeholder="eg. Data Structures" className="form-input" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}/>
                </div>
                <button className="submit-btn" onClick={handleAddSubject}>Add Subject</button>
              </div>
            )}

            {subjects.length === 0 ? (
              <p className="no-data">No subjects yet. Click Add Subject to get started!</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Added On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, i) => (
                      <tr key={i}>
                        <td>{s.name}</td>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td><button className="delete-btn" onClick={() => handleDeleteSubject(s.id)}>Delete</button></td>
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
              <input type="date" className="date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
              <select className="subject-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">Select Subject</option>
                {subjects.map((s, i) => (<option key={i} value={s.name}>{s.name}</option>))}
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
                          <td>{s.roll_no}</td>
                          <td>{s.name}</td>
                          <td><input type="radio" name={`att${s.id}`} value="present" onChange={() => handleAttendanceChange(s.id, 'present')}/></td>
                          <td><input type="radio" name={`att${s.id}`} value="absent" onChange={() => handleAttendanceChange(s.id, 'absent')}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="submit-btn" onClick={handleSubmitAttendance}>Submit Attendance</button>
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
                          <td>{s.roll_no}</td>
                          <td>{s.name}</td>
                          <td><input type="number" className="marks-input" defaultValue={s.mid1} onChange={(e) => handleMarksChange(s.id, 'mid1', e.target.value)}/></td>
                          <td><input type="number" className="marks-input" defaultValue={s.mid2} onChange={(e) => handleMarksChange(s.id, 'mid2', e.target.value)}/></td>
                          <td><input type="number" className="marks-input" defaultValue={s.assignment} onChange={(e) => handleMarksChange(s.id, 'assignment', e.target.value)}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="submit-btn" onClick={handleSaveMarks}>Save Marks</button>
              </div>
            )}
          </div>
        )}

        {activePage === 'events' && (
          <div className="recent-section">
            <div className="section-header">
              <h3>Events</h3>
              <button className="add-btn" onClick={() => setShowAddEvent(!showAddEvent)}>
                {showAddEvent ? 'Cancel' : '+ Add Event'}
              </button>
            </div>

            {showAddEvent && (
              <div className="add-form">
                <h4>Add New Event</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Event Title</label>
                    <input type="text" placeholder="eg. Hackathon 2026" className="form-input" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Event Date</label>
                    <input type="date" className="form-input" value={newEvent.event_date} onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="eg. Annual coding hackathon" className="form-input" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label>Event Poster</label>
                    <input type="file" accept="image/*" className="form-input" onChange={(e) => setNewEvent({...newEvent, poster: e.target.files[0]})}/>
                  </div>
                </div>
                <button className="submit-btn" onClick={handleAddEvent} disabled={eventLoading}>
                  {eventLoading ? 'Adding & Sending Emails...' : 'Add Event & Notify Students'}
                </button>
              </div>
            )}

            {events.length === 0 ? (
              <p className="no-data">No events yet. Click Add Event to get started!</p>
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
                      <div className="rsvp-count-box">
                        <span className="rsvp-attending">{rsvpCounts[event.id] || 0} students attending</span>
                        <span className="rsvp-not-attending">{students.length - (rsvpCounts[event.id] || 0)} not responded</span>
                      </div>
                      <button className="delete-btn" style={{marginTop: '10px'}} onClick={() => handleDeleteEvent(event.id)}>Delete Event</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === 'reports' && (
          <div className="recent-section">
            <h3>Attendance Reports</h3>
            <div className="report-cards">
              <div className="report-card">
                <h4>Full Report</h4>
                <p>All {students.length} Students</p>
                <button className="download-btn" onClick={downloadFullReport}>Download PDF</button>
              </div>
              <div className="report-card">
                <h4>Low Attendance</h4>
                <p>{students.filter(s => s.attendance_percentage < 75).length} Students Below 75%</p>
                <button className="download-btn" onClick={downloadLowAttendanceReport}>Download PDF</button>
              </div>
              <div className="report-card">
                <h4>Marks Report</h4>
                <p>Internal Marks for All Students</p>
                <button className="download-btn" onClick={downloadMarksReport}>Download PDF</button>
              </div>
            </div>

            <h3 style={{marginTop: '30px'}}>Email Notifications</h3>
            <div className="report-cards">
              <div className="report-card">
                <h4>Low Attendance Warning</h4>
                <p>Send warning to {students.filter(s => s.attendance_percentage < 75).length} students below 75%</p>
                <button className="download-btn" style={{background: '#ea4335'}} onClick={handleSendWarningEmails}>Send Warning Emails</button>
              </div>
              <div className="report-card">
                <h4>Monthly Summary</h4>
                <p>Send summary to all {students.length} students</p>
                <button className="download-btn" style={{background: '#34a853'}} onClick={handleSendSummaryEmails}>Send Summary Emails</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FacultyDashboard;