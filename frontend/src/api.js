import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const loginUser = (data) => API.post('/auth/login', data);
export const signupUser = (data) => API.post('/auth/signup', data);
export const getStudents = () => API.get('/students');
export const addStudent = (data) => API.post('/students/add', data);
export const deleteStudent = (id) => API.delete('/students/delete/' + id);
export const updateStudent = (id, data) => API.put('/students/update/' + id, data);
export const markAttendance = (data) => API.post('/attendance/mark', data);
export const getAttendance = (id) => API.get('/attendance/' + id);
export const getSubjects = () => API.get('/subjects');
export const addSubject = (data) => API.post('/subjects/add', data);
export const deleteSubject = (id) => API.delete('/subjects/delete/' + id);
