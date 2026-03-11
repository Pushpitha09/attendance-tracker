import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/faculty-dashboard"
          element={<FacultyDashboard students={students} setStudents={setStudents} />}
        />
        <Route
          path="/student-dashboard"
          element={<StudentDashboard students={students} />}
        />
      </Routes>
    </Router>
  );
}

export default App;