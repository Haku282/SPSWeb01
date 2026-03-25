import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';

const HistoryPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
      ? import.meta.env.VITE_BACKEND_URL
      : 'http://localhost:5000';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/history_activity`, { credentials: 'include' });
        if (res.status === 401) throw new Error('Chưa đăng nhập');
        if (res.status === 403) throw new Error('Bạn không có quyền xem lịch sử');
        if (!res.ok) throw new Error(`Lỗi API ${res.status}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE]);

  return (
    <div className="admin-body">
      <Sidebar toggleChat={() => setIsChatOpen(!isChatOpen)} activePage={'history'} />
      <div className="main-admin">
        <div className="header-row">
          <h1 className="page-title">Lịch sử đăng nhập</h1>
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Action</th>
                  <th>IP</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id || `${r.user_id}-${r.created_at}`}>
                    <td>{r.id}</td>
                    <td>{r.user_id}</td>
                    <td>{r.username}</td>
                    <td>{r.action}</td>
                    <td>{r.ip || '-'}</td>
                    <td>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Chatbot isOpen={isChatOpen} toggleChat={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};

export default HistoryPage;
