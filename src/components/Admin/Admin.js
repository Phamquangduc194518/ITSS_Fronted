// AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import { FaUserShield, FaPlus, FaCloudUploadAlt, FaUsers, FaFileAlt, FaCheckCircle, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import './Admin.scss';
import { logout } from '../../auth/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getAllUsers, deleteUser,
  getFaculties as getSchools, createFaculty as createSchool,
  getDepartments, createDepartment,
  getCourses, createCourse,
  getDocuments, updateDocumentByAdmin
} from '../../auth/authAPI';

const TABS = [
  { key: 'school', label: 'Tạo trường', icon: <FaPlus /> },
  { key: 'faculty', label: 'Tạo khoa', icon: <FaPlus /> },
  { key: 'subject', label: 'Tạo môn', icon: <FaPlus /> },
  { key: 'users', label: 'Quản lý user', icon: <FaUsers /> },
  { key: 'pending', label: 'Chờ duyệt tài liệu', icon: <FaFileAlt /> },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('school');
  const [schools, setSchools] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolImage, setNewSchoolImage] = useState('');
  const [newFaculty, setNewFaculty] = useState({ name: '', faculty_id: '' });
  const [newCourse, setNewCourse] = useState({
    name: '',
    imgUrl: '',
    code: '',
    department_id: ''
  });

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  useEffect(() => {
    async function fetchData() {
      const resSchools = await getSchools();
      const resFaculties = await getDepartments();
      const resCourses = await getCourses();
      const resUsers = await getAllUsers();
      const resDocs = await getDocuments();

      setSchools(resSchools.data.data);
      setFaculties(resFaculties.data.data);
      setCourses(resCourses.data.data);
      setUsers(resUsers.data.data);
      setDocuments(resDocs.data.data.filter(doc => doc.status === 'pending'));
    }
    fetchData();
  }, []);

  const handleAddSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolImage.trim()) return;
    try {
      const res = await createSchool({ name: newSchoolName, imageUrl: newSchoolImage });
      setSchools(prev => [...prev, res.data.data]);
      setNewSchoolName('');
      setNewSchoolImage('');
      alert('Đã thêm trường!');
    } catch (err) {
      console.error(err);
      alert('Thêm trường thất bại');
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.faculty_id) return;
    try {
      const payload = {
        name: newFaculty.name,
        faculty_id: Number(newFaculty.faculty_id)
      };
      const res = await createDepartment(payload);
      setFaculties(prev => [...prev, res.data.data]);
      setNewFaculty({ name: '', faculty_id: '' });
      alert('Đã thêm khoa!');
    } catch (err) {
      console.error(err);
      alert('Thêm khoa thất bại');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.code || !newCourse.imgUrl || !newCourse.department_id) return;
    console.log('📤 Dữ liệu gửi đến API (createCourse):', newCourse);
    try {
      const res = await createCourse(newCourse);
      setCourses(prev => [...prev, res.data.data]);
      setNewCourse({ name: '', imgUrl: '', code: '', department_id: '' });
      alert('Đã thêm môn học!');
    } catch (err) {
      console.error(err);
      alert('Thêm môn học thất bại');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('Đã xóa người dùng thành công!');
      } catch (err) {
        console.error(err);
        alert('Xóa người dùng thất bại');
      }
    }
  };

  const handleApproveDocument = async (docId) => {
    try {
      await updateDocumentByAdmin(docId, { status: 'approved' });
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      alert('Đã duyệt tài liệu thành công!');
    } catch (err) {
      console.error(err);
      alert('Duyệt tài liệu thất bại');
    }
  };

  const handleRejectDocument = async (docId) => {
    try {
      await updateDocumentByAdmin(docId, { status: 'rejected' });
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      alert('Đã từ chối tài liệu!');
    } catch (err) {
      console.error(err);
      alert('Từ chối tài liệu thất bại');
    }
  };

  const handlePreviewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentPreview(true);
  };

  return (
    <div className="adminpanel-bg">
      <header className="adminpanel-header">
        <div className="adminpanel-logo">
          <FaUserShield size={32} />
          <span>Admin Panel</span>
        </div>
        <nav className="adminpanel-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`adminpanel-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <div className="adminpanel-user">
          <button className="login-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>

      <main className="adminpanel-content">
        {activeTab === 'school' && (
          <section className="adminpanel-section">
            <h2>Tạo trường mới</h2>
            <form className="adminpanel-form" onSubmit={handleAddSchool}>
              <div className="form-group">
                <label htmlFor="schoolName">Tên trường</label>
                <input
                  id="schoolName"
                  type="text"
                  placeholder="Nhập tên trường"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="schoolImage">Link ảnh trường</label>
                <input
                  id="schoolImage"
                  type="url"
                  placeholder="Nhập link ảnh trường"
                  value={newSchoolImage}
                  onChange={(e) => setNewSchoolImage(e.target.value)}
                />
                {newSchoolImage && (
                  <div className="image-preview">
                    <img src={newSchoolImage} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              <button type="submit"><FaPlus /> Thêm trường</button>
            </form>
            <div className="adminpanel-list">
              <h3>Danh sách trường</h3>
              <ul>
                {schools.map(s => (
                  <li key={s.id} className="school-item">
                    {s.imageUrl && <img src={s.imageUrl} alt={s.name} />}
                    <span>{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'faculty' && (
          <section className="adminpanel-section">
            <h2>Tạo khoa mới</h2>
            <form className="adminpanel-form" onSubmit={handleAddFaculty}>
              <input type="text" placeholder="Tên khoa" value={newFaculty.name} onChange={e => setNewFaculty(f => ({ ...f, name: e.target.value }))} />
              <select value={newFaculty.faculty_id} onChange={e => setNewFaculty(f => ({ ...f, faculty_id: e.target.value }))}>
                <option value="">Chọn trường</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button type="submit"><FaPlus /> Thêm khoa</button>
            </form>
            <div className="adminpanel-list faculty-list">
              <h3>Danh sách khoa</h3>
              <ul>
                {faculties.map(f => (
                  <li key={f.id} className="faculty-item">
                    <span className="faculty-name">{f.name}</span>
                    <span className="faculty-school">{f.school}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'subject' && (
          <section className="adminpanel-section">
            <h2>Tạo môn học mới</h2>
            <form className="adminpanel-form" onSubmit={handleAddCourse}>
              <div className="form-group">
                <label htmlFor="courseName">Tên môn học</label>
                <input
                  id="courseName"
                  type="text"
                  placeholder="Nhập tên môn học"
                  value={newCourse.name}
                  onChange={e => setNewCourse(c => ({ ...c, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="courseImage">Link ảnh môn học</label>
                <input
                  id="courseImage"
                  type="url"
                  placeholder="Nhập link ảnh môn học"
                  value={newCourse.imgUrl}
                  onChange={e => setNewCourse(c => ({ ...c, imgUrl: e.target.value }))}
                />
                {newCourse.imgUrl && (
                  <div className="image-preview">
                    <img src={newCourse.imgUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="courseCode">Mã môn học</label>
                <input
                  id="courseCode"
                  type="text"
                  placeholder="Nhập mã môn học (tùy chọn)"
                  value={newCourse.code}
                  onChange={e => setNewCourse(c => ({ ...c, code: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="courseDepartment">Khoa</label>
                <select
                  id="courseDepartment"
                  value={newCourse.department_id}
                  onChange={e => setNewCourse(c => ({ ...c, department_id: e.target.value }))}
                >
                  <option value="">Chọn khoa</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.school})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit"><FaPlus /> Thêm môn học</button>
            </form>
            <div className="adminpanel-list">
              <h3>Danh sách môn học</h3>
              <ul>
                {courses.map(c => (
                  <li key={c.id} className="course-item">
                    {c.imgUrl && <img src={c.imgUrl} alt={c.name} />}
                    <div className="course-info">
                      <span className="course-name">{c.name}</span>
                      {c.code && <span className="course-code">{c.code}</span>}
                      <span className="course-department">{c.Department?.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="adminpanel-section">
            <h2>Quản lý người dùng</h2>
            <div className="adminpanel-list">
              <div className="users-grid">
                {users.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                      <p className="user-role">{user.role}</p>
                    </div>
                    <button
                      className="delete-user-btn"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FaTrash /> Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'pending' && (
          <section className="adminpanel-section">
            <h2>Tài liệu chờ duyệt</h2>
            <div className="adminpanel-list">
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-info">
                      <h3>{doc.title}</h3>
                      <p className="document-meta">
                        <span>Người đăng: {doc.uploader?.name}</span>
                        <span>Ngày đăng: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </p>
                      <p className="document-description">{doc.description}</p>
                    </div>
                    <div className="document-actions">
                      <button
                        className="preview-btn"
                        onClick={() => handlePreviewDocument(doc)}
                      >
                        <FaEye /> Xem trước
                      </button>
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveDocument(doc.id)}
                      >
                        <FaCheckCircle /> Duyệt
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleRejectDocument(doc.id)}
                      >
                        <FaTimes /> Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showDocumentPreview && selectedDocument && (
          <div className="document-preview-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedDocument.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDocumentPreview(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <iframe
                  src={selectedDocument.file_path}
                  title="Document Preview"
                  width="100%"
                  height="600px"
                />
              </div>
              <div className="modal-footer">
                <button
                  className="approve-btn"
                  onClick={() => {
                    handleApproveDocument(selectedDocument.id);
                    setShowDocumentPreview(false);
                  }}
                >
                  <FaCheckCircle /> Duyệt
                </button>
                <button
                  className="reject-btn"
                  onClick={() => {
                    handleRejectDocument(selectedDocument.id);
                    setShowDocumentPreview(false);
                  }}
                >
                  <FaTimes /> Từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}