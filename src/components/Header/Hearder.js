import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import logoImg from '../../assets/logo.png'; // Đổi thành logo của bạn nếu có
import './Hearder.scss';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getProfile } from '../../auth/authAPI';


const CommonHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getProfile();
        console.error(res);
        setUser(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    }
    fetchProfile()
  }, [])
  return (
    <header className="common-header">
      <div className="common-header__logo">
        <img src={logoImg} alt="logo" />
        <span>Tài Liệu Hust</span>
      </div>
      <nav className="common-header__menu">
        <Link to="/dashboard">Trang chủ</Link>
        <a href="/docs" style={{ pointerEvents: 'none', color: 'gray' }}>Tài liệu</a>
        <a href="/schools" style={{ pointerEvents: 'none', color: 'gray' }}>Trường</a>
        <a href="/faculties" style={{ pointerEvents: 'none', color: 'gray' }}>Khoa</a>
        <a href="/subjects" style={{ pointerEvents: 'none', color: 'gray' }}>Môn học</a>
      </nav>
      <div className="common-header__user" onClick={() => navigate('/userprofile')}>
        <FaUserCircle size={32} />
        {user ? (
          <span className="common-header__username">Xin chào, <b>{user.username}</b></span>
        ) : (
          <span className="common-header__username">Use</span>
        )
        }
        <FaChevronDown />
      </div>
    </header>
  )
};

export default CommonHeader;