import api from '../services/axios';

const handleLoginAPI = (email, password) => {
  return api.post('/api/user/login', { email: email, password: password });
};

const handleRegisterAPI = (username, email, password) => {
  return api.post('/api/user/register', { username: username, email: email, password: password });
}

const getdocumentOfHome = () => {
  return api.get('/api/user/documents');
}

const getDocumentById = (id) => {
  return api.get(`/api/user/documents/${id}`);
}

const getSchool = () => {
  return api.get('/api/admin/faculties');
}

const getKhoa = () => {
  return api.get('/api/admin/departments');
}

const getProfile = () => {
  return api.get('/api/user/getProfile');
}

const searchDocuments = (keyword) => {
  return api.get('/api/user/documents/search', {
    params: { keyword }
  })
};

const getCourse = () =>{
  return api.get('/api/user/courses');
}
const getAllUsers = () => api.get('/api/admin/users');
const deleteUser = (id) => api.delete(`/api/admin/users/${id}`);

const getFaculties = () => api.get('/api/admin/faculties');
const createFaculty = (data) => api.post('/api/admin/faculties', data);
const updateFaculty = (id, data) => api.patch(`/api/admin/faculties/${id}`, data);
const deleteFaculty = (id) => api.delete(`/api/admin/faculties/${id}`);

const getDepartments = () => api.get('/api/admin/departments');
const createDepartment = (data) => api.post('/api/admin/departments', data);
const updateDepartment = (id, data) => api.patch(`/api/admin/departments/${id}`, data);
const deleteDepartment = (id) => api.delete(`/api/admin/departments/${id}`);

const getCourses = () => api.get('/api/admin/courses');
const createCourse = (data) => api.post('/api/admin/courses', data);
const updateCourse = (id, data) => api.patch(`/api/admin/courses/${id}`, data);
const deleteCourse = (id) => api.delete(`/api/admin/courses/${id}`);

const getDocuments = () => api.get('/api/admin/documents');
const getDocument = (id) => api.get(`/api/admin/documents/${id}`);
const createDocumentByAdmin = (data) => api.post('/api/admin/documents', data);
const updateDocumentByAdmin = (id, data) => api.patch(`/api/admin/documents/${id}`, data);
const deleteDocumentByAdmin = (id) => api.delete(`/api/admin/documents/${id}`);
const createDocumentByUser = (data) => api.post('/api/user/documents', data);

export {
  handleLoginAPI,
  handleRegisterAPI,
  getdocumentOfHome,
  getDocumentById,
  getSchool,
  getKhoa,
  getProfile,
  getAllUsers,
  deleteUser,
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createDocumentByAdmin,
  updateDocumentByAdmin,
  getDocument,
  deleteDocumentByAdmin,
  getDocuments,
  searchDocuments,
  createDocumentByUser,
  getCourse

}