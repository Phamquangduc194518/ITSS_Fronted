import React, { useEffect, useState } from 'react';
import { FaSearch, FaBookmark, FaEye } from 'react-icons/fa';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import { getdocumentOfHome, searchDocuments } from '../../auth/authAPI';

const tags = [
  'TÀI LIỆU BÁCH KHOA',
  'KHÓA HỌC',
  'PHẦN MỀM',
  'TÀI LIỆU NEU',
  'IELTS',
  'TOEIC',
];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getdocumentOfHome();
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Không tải được tài liệu');
    }
  };

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
  };

  const handleDocClick = (doc) => {
    navigate(`/documents/${doc.id}`, { state: { document: doc } });
  };

  const renderDocumentList = (docs) => (
    <div className="dash-docs-grid">
      {docs.map(doc => (
        <div
          className="dash-doc-card"
          key={doc.id}
          onClick={() => handleDocClick(doc)}
          style={{ cursor: 'pointer' }}
        >
          <div className="dash-doc-header">
            <span className="dash-doc-type">{doc.Course?.Department?.Faculty?.name || 'Unknown'}</span>
            <div className="dash-doc-actions">
              <button className="dash-doc-action" title="Xem trước">
                <FaEye />
              </button>
              <button className="dash-doc-action" title="Đánh dấu">
                <FaBookmark />
              </button>
            </div>
          </div>
          <div className="dash-doc-content">
            <h3 className="dash-doc-title">{doc.title}</h3>
            <p className="dash-doc-description">{doc.description || 'Chưa có mô tả'}</p>
          </div>
          <div className="dash-doc-footer">
            <span className="dash-doc-date">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
            <span className="dash-doc-views">
              {doc.views || 0} lượt xem
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <form className="dash-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === '') {
                setShowSearchResults(false);
                setSearchResults([]);
              }
            }}
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>
      </div>

      <div className="dash-content">
        {showSearchResults ? (
          <section className="dash-section">
            <h2>Kết quả tìm kiếm</h2>
            {loading ? (
              <div className="dash-loading">Đang tìm kiếm...</div>
            ) : error ? (
              <div className="dash-error">{error}</div>
            ) : searchResults.length === 0 ? (
              <div className="dash-no-results">Không tìm thấy kết quả phù hợp</div>
            ) : (
              renderDocumentList(searchResults)
            )}
          </section>
        ) : (
          <>
            <section className="dash-section">
              <h2>Tài liệu mới nhất</h2>
              {documents.length > 0 ? (
                renderDocumentList(documents.slice(0, 6))
              ) : (
                <div className="dash-no-results">Chưa có tài liệu nào</div>
              )}
            </section>

            <section className="dash-section">
              <h2>Tài liệu đã xem gần đây</h2>
              {documents.length > 0 ? (
                renderDocumentList(documents.slice(0, 4))
              ) : (
                <div className="dash-no-results">Chưa có tài liệu nào</div>
              )}
            </section>

            <section className="dash-section">
              <h2>Tài liệu đã đánh dấu</h2>
              {documents.length > 0 ? (
                renderDocumentList(documents.slice(0, 4))
              ) : (
                <div className="dash-no-results">Chưa có tài liệu nào</div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 