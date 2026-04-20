/**
 * Error Tracking Utility
 * Gửi các lỗi từ frontend lên backend để lưu trữ
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) 
  ? import.meta.env.VITE_BACKEND_URL 
  : 'http://localhost:5000';

export const logErrorToBackend = async (page, message, additionalInfo = {}) => {
  try {
    const errorData = {
      page,
      message,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...additionalInfo
    };

    const response = await fetch(`${API_BASE}/api/error_tracking/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
      credentials: 'include'
    });

    if (response.ok) {
      console.log("✅ Lỗi đã được ghi nhận trên server");
    } else {
      console.error("❌ Không thể ghi nhận lỗi trên server");
    }
  } catch (err) {
    console.error("⚠️ Lỗi khi gửi error log:", err);
  }
};

// Hàm wrapper cho try-catch thông thường
export const handleError = (page, error, friendlyMessage) => {
  console.error(error);
  logErrorToBackend(page, friendlyMessage || error.message, {
    errorType: error.name,
    stack: error.stack
  });
};
