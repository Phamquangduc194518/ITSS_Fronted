import React, { useState, useEffect } from 'react';           // thêm useEffect
import { login } from '../../auth/authSlice';
import { FaGooglePlusG, FaFacebookF, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.scss';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from 'react-router-dom';

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { loading, error, token, user } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const location = useLocation();
  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/dashboard');
  useEffect(() => {
    if (token && user) {
      navigate(from, { replace: true });
    }
  }, [token, user, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[Login] submitting with', { email, password });
    dispatch(login({ email, password }));
  }
  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-title">Đăng Nhập</div>
        <div className="login-label">Email</div>
        <div className="login-pass-group">
        <input
          className="login-input"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        </div>
        <div className="login-label">Mật Khẩu</div>
        <div className="login-pass-group">
          <input
            className="login-input"
            type={showPass ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
          />
          <span
            className="login-eye"
            onClick={() => setShowPass(v => !v)}
            tabIndex={0}
            role="button"
            aria-label="Show/Hide password"
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button className="login-btn" type="submit">Đăng Nhập</button>
        <div className="login-or">Hoặc Đăng Nhập Với:</div>
        <div className="login-socials">
          <button type="button" className="login-social"><FaGooglePlusG /></button>
          <button type="button" className="login-social"><FaFacebookF /></button>
          <button type="button" className="login-social"><FaApple /></button>
        </div>
      </form>
    </div>
  );
};

export default Login;