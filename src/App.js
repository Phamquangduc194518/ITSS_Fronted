import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Home from "./components/pages/Home";
import Login from "./components/Login/Login";
import Dashboard from "./components/HomePage/Dashboard";
import UserProfile from "./components/User/UserProfile";
import CommonHeader from "./components/Header/Hearder";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./components/Admin/Admin"
import Register from "./components/Login/Register";
import DocumentDetail  from './components/DocumentDetail/DocumentDetail';

function App() {
  return (
  <BrowserRouter>
  <Routes>
    <Route path="/"        element={<Home />} />
    <Route path="/documents/:id" element={<DocumentDetail />} />
    <Route path="/login"   element={<Login />} />
    <Route path="/register"  element={<Register />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
            <CommonHeader/>
            <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/userprofile"
      element={
        <ProtectedRoute>
            <CommonHeader/>
            <UserProfile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>

  );
}

export default App;
