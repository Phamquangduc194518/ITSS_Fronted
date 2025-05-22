import React, { useEffect, useState } from 'react';
import { FaSearch, FaUserCircle, FaBookmark, FaFilter, FaChevronDown } from 'react-icons/fa';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import { getdocumentOfHome, getKhoa, getSchool, searchDocuments } from '../../auth/authAPI';
import { Link } from 'react-router-dom';


const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ school: '', khoa: '', course: '' });
  const [schools, setSchools] = useState([]);
  const [khoa, setKhoa] = useState([]);
  const [docs, setDocs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);


  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await getSchool();
        setSchools(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu trường:', err);
      }
    }

    fetchSchools();
  }, []);

  useEffect(() => {
    async function fetchKhoa() {
      try {
        const res = await getKhoa();
        setKhoa(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu khoa:', err);
      }
    }

    fetchKhoa();
  }, []);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await getdocumentOfHome();
        setDocs(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Không tải được tài liệu');
      }
    }
    fetchDocs();
  }, [])

  const handleSearch = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await searchDocuments(search.trim());
      setSearchResults(res.data.data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error(err);
      setError('Không tìm thấy tài liệu hoặc server lỗi');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = docs.filter(doc =>
    (!filter.school || doc.Course?.Department?.Faculty?.name === filter.school) &&
    (!filter.khoa || doc.Course?.Department?.name === filter.khoa) &&
    (!filter.course || doc.Course?.name === filter.course)
  );

  return (
    <div className="dashboard-bg">
      <section className="dash-search-section">
        <form className="dash-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, môn học, trường, khoa..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value === '') {
                setShowSearchResults(false);
                setSearchResults([]);
              }
            }}
          />
          <button type="submit"><FaSearch /></button>
        </form>
        <div className="dash-filters">
          <div>
            <FaFilter /> Bộ lọc:
          </div>
          <select value={filter.school} onChange={e => setFilter(f => ({ ...f, school: e.target.value }))}>
            <option value="">Tất cả trường</option>
            {schools.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
          </select>
          <select value={filter.khoa} onChange={e => setFilter(f => ({ ...f, khoa: e.target.value }))}>
            <option value="">Tất cả khoa</option>
            {khoa.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
          <select value={filter.course} onChange={e => setFilter(f => ({ ...f, course: e.target.value }))}>
            <option value="">Tất cả môn</option>
            {docs.map(docs => <option key={docs.Course?.id} value={docs.Course?.name}>{docs.Course?.name}</option>)}
          </select>
        </div>
      </section>
      {showSearchResults && (
        <section className="dash-section">
          <div className="dash-section-title">🔍 Kết quả tìm kiếm</div>
          {loading ? (
            <div className="dash-loading">Đang tìm kiếm...</div>
          ) : error ? (
            <div className="dash-error">{error}</div>
          ) : searchResults.length === 0 ? (
            <div className="dash-no-results">Không tìm thấy kết quả phù hợp</div>
          ) : (
            <div className="dash-docs-list">
              {searchResults.map((doc) => (
                <Link to={`/documents/${doc.id}`} className="dash-doc-card" key={doc.id}>
                  <img src={doc.Course.imgUrl} alt="cover" className="dash-doc-cover" />
                  <div className="dash-doc-info">
                    <div className="dash-doc-title">{doc.title}</div>
                    <div className="dash-doc-meta">
                      <span>{doc.Course.name}</span> · <span>{doc.Course.Department.name}</span> · <span>{doc.Course.Department.Faculty.name}</span>
                    </div>
                    <div className="dash-doc-date">{doc.createdAt}</div>
                    <div className="dash-doc-actions">
                      <button className="dash-doc-view">Xem nhanh</button>
                      <button className="dash-doc-bookmark"><FaBookmark /></button>
                    </div>
                  </div>
                  {doc.isNew && <span className="dash-doc-new">Mới</span>}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="dash-section">
        <div className="dash-section-title">📄 Tài liệu mới nhất</div>
        <div className="dash-docs-list">
          {filteredDocs.map((doc) => (
            <Link to={`/documents/${doc.id}`} className="dash-doc-card" key={doc.id}>
              <img src={doc.Course.imgUrl} alt="cover" className="dash-doc-cover" />
              <div className="dash-doc-info">
                <div className="dash-doc-title">{doc.title}</div>
                <div className="dash-doc-meta">
                  <span>{doc.Course.name}</span> · <span>{doc.Course.Department.name}</span> · <span>{doc.Course.Department.Faculty.name}</span>
                </div>
                <div className="dash-doc-date">{doc.createdAt}</div>
                <div className="dash-doc-actions">
                  <span className="dash-doc-view">Xem nhanh</span>
                  <span className="dash-doc-bookmark"><FaBookmark /></span>
                </div>
              </div>
              {doc.isNew && <span className="dash-doc-new">Mới</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-title">🏫 Các trường</div>
        <div className="dash-schools-list">
          {schools.map((school) => (
            <div className="dash-school-card" key={school.id}>
              <img src={school.imageUrl} alt={school.name} />
              <div className="dash-school-name">{school.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-title">🏢 Các khoa</div>
        <div className="dash-faculties-list">
          {khoa.map((khoa) => (
            <div className="dash-faculty-card" key={khoa.id}>
              <div className="dash-faculty-name">{khoa.name}</div>
              <div className="dash-faculty-school">{khoa.Faculty.name}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="dash-section">
        <div className="dash-section-title">📚 Các môn học</div>
        <div className="dash-subjects-list">
          {docs.map((docs) => (
            <div className="dash-subject-card" key={docs.Course.id}>
              <div className="dash-subject-name">{docs.Course.name}</div>
              <div className="dash-subject-faculty">{docs.Course.Department.name}</div>
              <div className="dash-subject-school">{docs.Course.Department.Faculty.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;