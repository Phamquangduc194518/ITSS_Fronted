import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaStar, FaCloudUploadAlt, FaTrash, FaEdit, FaEye, FaDownload, FaSignOutAlt } from 'react-icons/fa';
import './UserProfile.scss';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/authSlice';
import { getDepartments, getProfile, getSchool, getCourses, createDocumentByUser, getDocumentByUser } from '../../auth/authAPI';
import { put } from '@vercel/blob';

const UserProfile = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    file: null,
    course_id: '',
    year_id: '',
    imgUrl: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [school, setSchool] = useState(null);
  const [khoa, setKhoa] = useState(null);
  const [courses, setCourses] = useState(null);
  const [myDocs, setMyDocs] = useState([]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getProfile();
        setUser(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    async function fetchMyDocs() {
      try {
        const res = await getDocumentByUser();
        setMyDocs(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy tài liệu của tôi:', err);
      }
    }
    fetchMyDocs();
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
        token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN,
      });
      console.log('File uploaded:', url);
      const payload = {
        title: form.title,
        description: form.description,
        file_path: url,
        course_id: parseInt(form.course_id) || null,
        year_id: parseInt(form.year_id) || null,
        imgUrl: form.imgUrl,
      };
      console.log('DỮ LIỆU GỬI LÊN:', payload);
      const saveRes = await createDocumentByUser(payload);
      if (saveRes.status !== 200 && saveRes.status !== 201) throw new Error('Lưu tài liệu thất bại');
      alert('Đăng tài liệu thành công!');
      setForm({
        title: '',
        description: '',
        file: null,
        course_id: '',
        year_id: '',
        imgUrl: '',
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
            <textarea
              name="description"
              placeholder="Mô tả ngắn về tài liệu"
              value={form.description}
              onChange={handleChange}
              rows={2}
              required
            />
            <input
              type="text"
              name="imgUrl"
              placeholder="Đường dẫn ảnh imgUrl (nếu có)"
              value={form.imgUrl}
              onChange={handleChange}
            />
            <select
              name="course_id"
              value={form.course_id}
              onChange={handleChange}
              required
              className="profile-select"
            >
              <option value="">Chọn môn học</option>
              {courses?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              name="year_id"
              placeholder="Năm học (ID hoặc nhập tay)"
              value={form.year_id}
              onChange={handleChange}
              required
            />
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              required
            />
            <button type="submit" className="profile-upload-btn" disabled={uploading}>
              <FaCloudUploadAlt /> {uploading ? 'Đang tải lên...' : 'Đăng tài liệu'}
            </button>
          </form>
        </section>

        {/* Danh sách tài liệu đã đăng */}
        <section className="profile-my-docs">
          <div className="profile-my-docs-title">Tài liệu bạn đã đăng</div>
          <div className="profile-my-docs-list">
            {myDocs.map((doc) => (
              <div className="profile-doc-card" key={doc.id}>
                {doc.imgUrl && (
                  <img src={doc.imgUrl} alt={doc.title} className="profile-doc-img" style={{width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8}} />
                )}
                <div className="profile-doc-title">{doc.title}</div>
                <div className="profile-doc-meta">
                  <span>Ngày đăng: {new Date(doc.createdAt).toLocaleDateString()}</span>
                  <span>Trạng thái: <b>{doc.status === 'approved' ? 'Đã duyệt' : doc.status === 'pending' ? 'Chờ duyệt' : doc.status}</b></span>
                </div>
                <div className="profile-doc-stats">
                  <span><FaEye /> {doc.views || 0}</span>
                  <span><FaDownload /> {doc.downloads || 0}</span>
                  <span><FaStar color="#fbc02d" /> {doc.rating > 0 ? doc.rating : 'Chưa có'}</span>
                </div>
                <div className="profile-doc-actions">
                  <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="profile-doc-view">Xem</a>
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