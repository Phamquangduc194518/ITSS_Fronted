import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaStar, FaCloudUploadAlt, FaTrash, FaEdit, FaEye, FaDownload, FaSignOutAlt } from 'react-icons/fa';
import './UserProfile.scss';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/authSlice';
import { getDepartments, getProfile, getSchool, getCourses } from '../../auth/authAPI';
import { put } from '@vercel/blob';

const myDocs = [
  {
    title: 'Tài liệu Python cơ bản',
    date: '2024-06-01',
    status: 'Đã duyệt',
    downloads: 320,
    views: 500,
    rating: 4.9,
    file: '/doc1.pdf',
  },
  {
    title: 'Đề cương Kinh tế vi mô',
    date: '2024-05-28',
    status: 'Chờ duyệt',
    downloads: 12,
    views: 40,
    rating: 0,
    file: '/doc2.pdf',
  },
  // ... thêm tài liệu
];
const UserProfile = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    file_path: '',
    course_id: '',
    year_id: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [school, setSchool] = useState(null);
  const [khoa, setKhoa] = useState(null);
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getProfile();
        setUser(res.data.data);
        // Set initial form values from user data
        setForm(prev => ({
          ...prev,
          school: res.data.data.school,
          faculty: res.data.data.khoa,
          course: res.data.data.course
        }));
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    async function fetchSchool() {
      try {
        const res = await getSchool();
        setSchool(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin trường:', err);
      }
    }
    fetchSchool()
  }, [])

  useEffect(() => {
    async function fetchKhoa() {
      try {
        const res = await getDepartments();
        setKhoa(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin khoa:', err);
      }
    }
    fetchKhoa()
  }, [])

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await getCourses();
        setCourses(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin môn học:', err);
      }
    }
    fetchCourses()
  }, [])

  if (!user) return <div className="profile-loading">Đang tải thông tin người dùng...</div>;

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.file) return alert('Chọn file đã nhé!');

    setUploading(true);
    try {
    
      const arrayBuffer = await form.file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const blobPath = `docs/${Date.now()}-${form.file.name}`;

      const { url } = await put(blobPath, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log('File uploaded:', url);

      const saveRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          file_path: url,
          course_id: form.course_id,
          year_id: form.year_id,
        }),
      });
      if (!saveRes.ok) throw new Error('Lưu tài liệu thất bại');

      alert('Đăng tài liệu thành công!');
      setForm({
        title: '',
        school: '',
        faculty: '',
        subject: '',
        desc: '',
        tags: '',
        file: null,
      });
    } catch (err) {
      console.error(err);
      alert('Có lỗi: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-bg">
      <div className="profile-container">
        <section className="profile-info">
          <div className="profile-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" />
            ) : (
              <FaUserCircle size={80} />
            )}
          </div>
          <div className="profile-details">
            <div className="profile-header">
              <div className="profile-name">{user.username}</div>
              <button className="profile-logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-meta">
              <span>{user.school}</span> · <span>{user.khoa}</span>
            </div>
            <div className="profile-score">
              <FaStar color="#fbc02d" /> 3.0 / 5.0
              <span className="profile-score-desc"> (dựa trên đánh giá tài liệu)</span>
            </div>
            <div className="profile-stats">
              <span>📄 {user.totalDocs} tài liệu</span>
              <span>⬇️ {user.totalDownloads} lượt tải</span>
            </div>
          </div>
        </section>

        {/* Form đăng tài liệu */}
        <section className="profile-upload">
          <div className="profile-upload-title">
            <FaCloudUploadAlt /> Đăng tài liệu mới
          </div>
          <form className="profile-upload-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Tiêu đề tài liệu"
              value={form.title}
              onChange={handleChange}
              required
            />
            <select
              name="school"
              value={form.school}
              onChange={handleChange}
              required
              className="profile-select"
            >
              <option value="">Chọn trường</option>
              {school?.map(s => (
                <option key={s.id} value={s.name} selected={s.name === user?.school}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              name="faculty"
              value={form.faculty}
              onChange={handleChange}
              required
              className="profile-select"
            >
              <option value="">Chọn khoa</option>
              {khoa?.map(k => (
                <option key={k.id} value={k.name} selected={k.name === user?.khoa}>
                  {k.name}
                </option>
              ))}
            </select>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              required
              className="profile-select"
            >
              <option value="">Chọn môn học</option>
              {courses?.map(c => (
                <option key={c.id} value={c.name} selected={c.name === user?.course}>
                  {c.name}
                </option>
              ))}
            </select>
            <textarea
              name="desc"
              placeholder="Mô tả ngắn về tài liệu"
              value={form.desc}
              onChange={handleChange}
              rows={2}
            />
            <input
              type="text"
              name="tags"
              placeholder="Tag (cách nhau bởi dấu phẩy)"
              value={form.tags}
              onChange={handleChange}
            />
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              required
            />
            <button type="submit" className="profile-upload-btn">
              <FaCloudUploadAlt /> Đăng tài liệu
            </button>
          </form>
        </section>

        {/* Danh sách tài liệu đã đăng */}
        <section className="profile-my-docs">
          <div className="profile-my-docs-title">Tài liệu bạn đã đăng</div>
          <div className="profile-my-docs-list">
            {myDocs.map((doc, idx) => (
              <div className="profile-doc-card" key={idx}>
                <div className="profile-doc-title">{doc.title}</div>
                <div className="profile-doc-meta">
                  <span>Ngày đăng: {doc.date}</span>
                  <span>Trạng thái: <b>{doc.status}</b></span>
                </div>
                <div className="profile-doc-stats">
                  <span><FaEye /> {doc.views}</span>
                  <span><FaDownload /> {doc.downloads}</span>
                  <span><FaStar color="#fbc02d" /> {doc.rating > 0 ? doc.rating : 'Chưa có'}</span>
                </div>
                <div className="profile-doc-actions">
                  <a href={doc.file} target="_blank" rel="noopener noreferrer" className="profile-doc-view">Xem</a>
                  <button className="profile-doc-edit"><FaEdit /></button>
                  <button className="profile-doc-delete"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;