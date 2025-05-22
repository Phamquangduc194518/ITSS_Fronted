// src/components/Register/Register.js
import React, { useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { handleRegisterAPI } from '../../auth/authAPI';
import './Register.scss';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await handleRegisterAPI(username, email, password);
      console.log('Đăng ký thành công:', res.data);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Đăng ký tài khoản</h2>

        {error && <div className="form-error">{error}</div>}

        <label className="register-label">Tên đăng nhập</label>
        <input
          className="register-input"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Nguyễn Văn A"
          required
        />

        <label className="register-label">Email</label>
        <input
          className="register-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label className="register-label">Mật khẩu</label>
        <div className="register-pass-group">
          <input
            className="register-input"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <span
            className="register-eye"
            onClick={() => setShowPass(v => !v)}
            tabIndex={0}
            role="button"
            aria-label="Show/Hide password"
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          className="register-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Đang xử lý…' : 'Đăng ký'}
        </button>

        <p className="switch-auth">
          Đã có tài khoản?{' '}
          <span className="link" onClick={() => navigate('/login')}>
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}
