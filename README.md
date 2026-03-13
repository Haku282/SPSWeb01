# SmartPharmaSystemVersion01

Hệ thống quản lý dược phẩm gồm:
- Frontend React (Vite)
- Backend Node.js/Express (Auth + Product API)
- AI Service FastAPI (FEFO recommendation)
- MySQL (Docker)

## 1. Kiến trúc và cổng dịch vụ
- Frontend: `http://localhost:3000`
- Backend (Auth/API): `http://localhost:5000`
- AI Service (FEFO): `http://localhost:8000`
- MySQL host: `localhost:3307` (map vào container `3306`)

Luồng chính:
- `Login/Register` gọi Backend `:5000`
- Dashboard FEFO gọi AI Service `:8000`
- AI Service đọc dữ liệu lô từ DB rồi trả thứ tự xuất kho FEFO

## 2. Chạy nhanh bằng Docker (khuyến nghị)
Yêu cầu:
- Docker Desktop đang chạy

Lệnh chạy:
```bash
docker compose up --build -d
```

Kiểm tra:
```bash
docker compose ps
```

Dừng hệ thống:
```bash
docker compose down
```

Xóa cả volume DB (reset dữ liệu):
```bash
docker compose down -v
```

### Quick Demo Script (1 minute)
Chay nhanh tu dau:
```bash
docker compose down -v
docker compose up --build -d
docker compose ps
```

Kiem tra nhanh API sau khi container da `Up`:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/inventory-recommendation/from-db
```

Mo UI:
- `http://localhost:3000`
- Dang ky tai khoan moi tai `/register`, sau do dang nhap tai `/login`

## 3. Chạy thủ công không Docker
### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend/spsver1
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 4. FEFO AI API
### `POST /api/v1/inventory-recommendation`
Input:
```json
{
	"items": [
		{
			"lot_id": "L001",
			"product_id": 1,
			"product_name": "Paracetamol 500mg",
			"batch_no": "BATCH-01",
			"quantity": 100,
			"expiry_date": "2026-03-21"
		}
	]
}
```

Output:
- Sắp xếp FEFO (hạn gần nhất trước)
- Có `days_to_expiry` và `risk_level`

### `GET /api/v1/inventory-lots`
- Đọc lô hàng từ bảng `product` (đang hoạt động, còn hàng, có hạn dùng)

### `GET /api/v1/inventory-recommendation/from-db`
- Đọc trực tiếp từ DB rồi trả danh sách FEFO

Risk level:
- `EXPIRED`: `< 0`
- `HIGH`: `0..30`
- `MEDIUM`: `31..90`
- `LOW`: `> 90`

## 5. CORS và bảo mật demo
- AI Service chỉ cho phép origin: `http://localhost:3000`
- Backend CORS dùng biến `FRONTEND_ORIGIN` (mặc định `http://localhost:3000`)

## 6. Cấu hình môi trường
### AI Service
- File mẫu: `ai-service/.env.example`
- Biến chính:
	- `DATABASE_URL`
	- `CORS_ORIGIN`

### Backend
- File mẫu: `backend/.env.example`
- Biến chính:
	- `PORT`
	- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`
	- `SESSION_SECRET`
	- `FRONTEND_ORIGIN`

## 7. Dữ liệu khởi tạo DB
- Script: `docker/mysql/init/01_schema.sql`
- Tạo các bảng tối thiểu cho demo:
	- `user`
	- `product`
- Seed dữ liệu mẫu cho FEFO dashboard

Luu y: Neu DB volume da ton tai tu truoc, script init chi chay luc khoi tao DB moi.
Neu can reset de chay lai init script:
```bash
docker compose down -v
docker compose up --build -d
```

## 8. Lỗi thường gặp
### `failed to connect to dockerDesktopLinuxEngine`
- Docker Desktop chưa mở. Hãy mở Docker Desktop rồi chạy lại compose.

### `bind: ... 3306 already in use`
- Dự án đã map DB sang `3307:3306` để tránh xung đột host `3306`.

### `POST /api/auth/login 404` trên AI logs
- Frontend gửi nhầm auth qua `:8000`.
- Bản hiện tại đã tách đúng:
	- Auth: `:5000`
	- FEFO AI: `:8000`

### Backend báo thiếu bảng `user`
- Chưa init DB schema. Chạy lại mục reset DB hoặc apply script SQL thủ công.

