import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './Home.scss'
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { getdocumentOfHome, searchDocuments } from '../../auth/authAPI';


const tags = [
  'TÀI LIỆU BÁCH KHOA',
  'KHÓA HỌC',
  'PHẦN MỀM',
  'TÀI LIỆU NEU',
  'IELTS',
  'TOEIC',
];

const menuItems = [
  'TÀI LIỆU ĐẠI HỌC',
  'TÀI LIỆU NGOẠI NGỮ',
  'TÀI LIỆU CHUYÊN NGÀNH',
  'KHÓA HỌC',
];

const Home = () => {
  const [search, setSearch] = useState('');
  const [featuredDocs, setFeaturedDocs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await getdocumentOfHome();
        setFeaturedDocs(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError('Không tải được tài liệu');
      }
    }
    fetchDocs();
  }, [])

  const handleSearch = async (e) => {
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
  }

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="header__left">
          <img src={logoImg} alt="logo" className="header__logo" />
          <span className="header__title">TÀI LIỆU HUST</span>
        </div>
        <nav className="header__menu">
          {menuItems.map((item, idx) => (
            <div className="menu-item" key={idx}>{item}</div>
          ))}
        </nav>
        <div className="header__auth">
          <button className="login-btn" onClick={() => navigate('/login')}>Đăng nhập</button>
          <button className="register-btn" onClick={() => navigate('/register')}>Đăng ký</button>
        </div>
      </header>

      <main className="main-content">
        <div className="greeting">
          Chào Bạn <span role="img" aria-label="wave">👋</span>, <b>bạn muốn tìm gì?</b>
        </div>
        <div className="tags">
          {tags.map((tag, idx) => (
            <button className="tag-btn" key={idx}># {tag}</button>
          ))}
        </div>
        <div className="search-row">
          <div className="search-label"></div>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value === '') {
                  setShowSearchResults(false);
                  setSearchResults([]);
                }
              }}
            />
            <button type="submit" aria-label="Tìm kiếm">
              <FaSearch />
              <span className="search-btn-text">TÌM KIẾM</span>
            </button>
          </form>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <section className="search-results-section">
            <div className="section-title">🔍 Kết quả tìm kiếm</div>
            {loading ? (
              <div className="loading-message">Đang tìm kiếm...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : searchResults.length === 0 ? (
              <div className="no-results-message">Không tìm thấy kết quả phù hợp</div>
            ) : (
              <div className="docs-list">
                {searchResults.map(doc => (
                  <Link
                    to={`/documents/${doc.id}`}
                    state={{ document: doc }}
                    className="doc-card"
                    key={doc.id}
                  >
                    <div className="doc-type">{doc.Course.Department.Faculty.name}</div>
                    <div className="doc-title">{doc.title}</div>
                    <div className="doc-date">{new Date(doc.createdAt).toLocaleDateString()}</div>
                    <button className="readmore">READ MORE</button>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Documents */}
        <section className="featured-docs-section">
          <div className="section-title">⭐ Tài liệu nổi bật</div>
          <div className="docs-list">
            {featuredDocs?.map(doc => (
              <Link
                to={`/documents/${doc.id}`}
                className="doc-card"
                key={doc.id}
              >
                <div className="doc-type">{doc.Course?.Department?.Faculty?.name ?? 'Unknown'}</div>
                <div className="doc-title">{doc.title}</div>
                <div className="doc-date">{new Date(doc.createdAt).toLocaleDateString()}</div>
                <button className="readmore">READ MORE</button>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;