# 🎓 MXH_HSSV — Nền Tảng Mạng Xã Hội Học Thuật & Đời Sống Sinh Viên

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-purple.svg)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20Online-emerald.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **MXH_HSSV** là nền tảng mạng xã hội chuyên biệt cho sinh viên đại học, tích hợp xác thực danh tính qua email trường (`.edu` / SSO OAuth2), cơ chế ẩn danh có kiểm soát (**Controlled Anonymity**), tìm nhóm làm đồ án với bảng Mini-Kanban, đánh giá học phần & giảng viên, kho tài liệu học tập mở, chợ sinh viên & phòng trọ theo thói quen sinh hoạt, cùng hệ thống điểm uy tín **Academic Karma** mở khóa đặc quyền.

---

## 📑 Mục lục
1. [Kiến trúc & Công nghệ (Tech Stack)](#-kiến-trúc--công-nghệ-tech-stack)
2. [8 Module Nghiệp vụ Cốt lõi](#-8-module-nghiệp-vụ-cốt-lõi)
3. [Hướng dẫn Cài đặt & Chạy Thử](#-hướng-dẫn-cài-đặt--chạy-thử)
4. [Tài khoản Thử nghiệm & Cách Đăng nhập](#-tài-khoản-thử-nghiệm--cách-đăng-nhập)
5. [Cấu trúc Thư mục Dự án](#-cấu-trúc-thư-mục-dự-án)
6. [Cơ chế Bảo mật & Quy chuẩn An toàn](#-cơ-chế-bảo-mật--quy-chuẩn-an-toàn)

---

## 🛠️ Kiến trúc & Công nghệ (Tech Stack)

- **Backend**: Node.js + Express.js + TypeScript
  - Kiến trúc phân lớp chuẩn mực: `Routes` -> `Controller` -> `Service` -> `Repository` -> `Database`.
  - Xác thực & Phân quyền: JWT (Access Token 1 ngày + Refresh Token 7 ngày) + RBAC (`UNVERIFIED_USER`, `VERIFIED_STUDENT`, `MODERATOR`, `ADMIN`).
  - Validation dữ liệu chặt chẽ với logic sanitize nội dung XSS và trích xuất hashtag học phần tự động.
- **Database & Cloud**: Supabase Online PostgreSQL 16
  - **35 bảng dữ liệu** chuẩn hóa quan hệ (1NF - 3NF).
  - Kích hoạt **Row-Level Security (RLS)** trên 100% các bảng với **0 cảnh báo bảo mật**.
  - Tìm kiếm toàn văn (Full-Text Search) với PostgreSQL text search vector.
- **Frontend**: React 18 + TypeScript + Vite + Zustand
  - Quản lý trạng thái xác thực và hồ sơ người dùng qua Zustand store bền vững (LocalStorage sync).
  - Thiết kế giao diện hiện đại với Dark Mode, tối ưu trải nghiệm học thuật.
  - Hỗ trợ công thức toán học LaTeX (`$...$`), syntax highlighting code snippet và trình xem trực tiếp PDF Inline.

---

## 📦 8 Module Nghiệp vụ Cốt lõi

### 1. Identity & Student Verification (Định danh & Xác thực)
- Đăng ký và xác thực email trường đại học (`.edu` / `@sis.hust.edu.vn`, `@*.edu.vn`) qua mã OTP 6 chữ số.
- Đăng nhập 1-chạm qua cổng trường **School SSO OAuth2**.
- Tự động cấp huy hiệu **Verified Student** sau khi xác thực thành công.
- Quản lý Hồ sơ học thuật: MSSV, Khóa học, Khoa/Viện, Chuyên ngành, Kỹ năng chuyên môn & Ngoại ngữ.
- Cơ chế **Anonymous Handle (Ẩn danh có kiểm soát)**: Tự tạo biệt danh ngẫu nhiên để thảo luận trong các không gian nhạy cảm (hỏi đáp học tập, review giảng viên), hệ thống vẫn lưu ID thực ngầm phục vụ kiểm duyệt.

### 2. Academic Discussion & Feed (Bảng tin & Thảo luận học thuật)
- **3 Luồng tin theo ngữ cảnh (Contextual Feeds)**:
  - `Campus Feed`: Toàn trường (tin tức, đời sống, thông báo).
  - `Department Feed`: Phân luồng theo Khoa/Viện thảo luận kiến thức chuyên sâu.
  - `Course Feed`: Bảng tin gắn trực tiếp với từng mã học phần (ví dụ: `#IT3080`, `#MI1111`).
- Trình soạn thảo học thuật hỗ trợ công thức toán **LaTeX/KaTeX** và syntax highlighting mã nguồn.
- Tự động nhận diện hashtag học phần để gắn liên kết môn học.
- Hệ thống tương tác Q&A: `Upvote` / `Downvote` / `Helpful` và bình luận phân cấp đa tầng (Nested Comments).
- Tác giả câu hỏi có quyền chọn **Accepted Answer** (thưởng ngay `+15 Karma` cho người trả lời).

### 3. Study Group & Team Matching (Tìm nhóm & Quản lý đồ án)
- Đăng tin tuyển thành viên theo học phần, học kỳ, mục tiêu điểm số (`A+`, `A`, `B+`, `PASS`) và từng vị trí cụ thể (`Backend`, `Frontend`, `Embedded`, `Leader`...).
- Luồng nộp đơn ứng tuyển đính kèm tóm tắt hồ sơ/portfolio và Trưởng nhóm (`LEAD`) duyệt thành viên.
- Khi duyệt thành viên: Tự động thêm vào nhóm, tự động đóng tuyển khi đủ số lượng, tự động mở quyền vào phòng chat nhóm đồ án.
- **Không gian nhóm kín (Group Workspace)**:
  - Bảng công việc **Mini-Kanban 4 cột**: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
  - Phân công thành viên, đặt deadline và thưởng `+5 Karma` khi hoàn thành task đúng hạn.
  - Kho lưu trữ tài liệu nội bộ của nhóm đồ án.

### 4. Course Review & Peer Q&A (Đánh giá học phần & Hỏi đáp)
- Kho đánh giá học phần & giảng viên ẩn danh mặc định theo 4 tiêu chí định lượng (thang 1-5 sao):
  1. Độ khó môn học (`difficulty_score`)
  2. Khối lượng bài tập lớn / BTL (`workload_score`)
  3. Tính công bằng khi chấm điểm (`grading_fairness_score`)
  4. Chất lượng giảng dạy & tài liệu cần đọc (`teaching_quality_score`)
- Diễn đàn hỏi bài theo môn học tích hợp tìm kiếm toàn văn câu hỏi cũ và thông báo lỗi.

### 5. Document & Resource Hub (Kho tài liệu mở)
- Cấu trúc phân tầng chuẩn 4 cấp: `Khoa/Viện` -> `Môn học` -> `Kỳ học (VD: 2025.1)` -> `Loại tài liệu` (Đề thi giữa kỳ, Cuối kỳ, BTL, Slide bài giảng, Tóm tắt lý thuyết).
- Xem trước trực tiếp file PDF (**Inline PDF Preview**) ngay trên trình duyệt trước khi tải.
- Đánh giá độ tin cậy bằng Upvote/Downvote và phát hiện trùng lặp bằng mã băm SHA-256.

### 6. Campus Marketplace & Housing (Chợ sinh viên & Nhà trọ)
- **Thanh lý đồ dùng học tập**: Giáo trình cũ, máy tính cầm tay Casio, kit vi điều khiển / linh kiện thực hành, đồ dùng phòng trọ.
- Bộ lọc thông minh theo giá sinh viên, tình trạng đồ (`Mới 100%`, `Mới 90%`, `Dùng tốt`, `Hỏng nhẹ`) và môn học liên quan.
- Chế độ **Tặng miễn phí 0đ** cho khóa sau nhận thưởng `+5 Karma`.
- **Tìm bạn ở ghép & Trọ sinh viên**: Khớp theo ngân sách, khoảng cách tới trường và thói quen sinh hoạt (giờ giấc ngủ `EARLY_BIRD`/`NIGHT_OWL`, hút thuốc, nấu ăn, ưu tiên giới tính).
- **Quy tắc an toàn chống lừa đảo**: Bắt buộc hiển thị hồ sơ Verified Student thật, không hỗ trợ ẩn danh trên mục Chợ & Trọ.

### 7. Realtime Communication (Giao tiếp thời gian thực)
- **Direct Messaging (1-1)**: Nhắn tin trực tiếp giữa 2 sinh viên qua khóa định danh chuẩn hóa `direct_pair_key` chống trùng lặp hội thoại.
- **Group Chat đồ án**: Tự động đồng bộ thành viên từ Module 3, hỗ trợ gửi tệp tin và tài liệu đính kèm trực tiếp.
- **Realtime Notifications**: Đẩy thông báo thời gian thực khi có phản hồi bài đăng, câu trả lời được chọn đúng (+Karma), đơn ứng tuyển nhóm đồ án và nhắc hạn nộp task Kanban sắp tới hạn trong 24 giờ.

### 8. Moderation & Reputation System (Kiểm duyệt & Điểm uy tín)
- **Sổ cái Điểm Uy tín Học thuật (Academic Karma)**:
  - `+15 Karma`: Câu trả lời được chọn là Accepted Answer.
  - `+5 Karma`: Tài liệu chia sẻ được Upvote.
  - `+5 Karma`: Hoàn thành Task Kanban đúng hạn.
  - `+5 Karma`: Tặng đồ miễn phí cho khóa sau trên Chợ.
  - `+2 Karma`: Bài viết hoặc bình luận hữu ích nhận Upvote.
  - `-20 Karma`: Nội dung vi phạm tiêu chuẩn cộng đồng bị gỡ bỏ.
- **4 Cấp bậc Đặc quyền Sinh viên**:
  - `RESTRICTED` (`< 0` Karma): Tài khoản bị giới hạn đăng bài và tải tài liệu.
  - `VERIFIED_MEMBER` (`0 – 49` Karma): Tải tối đa 10 tài liệu/ngày.
  - `ACTIVE_CONTRIBUTOR` (`50 – 149` Karma): **Tải tài liệu KHÔNG GIỚI HẠN**.
  - `TRUSTED_SCHOLAR` (`>= 150` Karma): Đặc quyền khởi tạo nhóm thảo luận chuyên đề riêng.
- **Hệ thống Tự động Ẩn bài (Auto-Moderation)**:
  - Chạm **3 báo cáo** vi phạm (với lý do Đề thi cấm leak `LEAKED_EXAM` hoặc Lừa đảo trọ `SCAM_HOUSING`) -> Tự động chuyển sang `HIDDEN_PENDING_REVIEW`.
  - Chạm **5 báo cáo** vi phạm với các lý do khác -> Tự động tạm ẩn bài.
- **Dashboard Quản trị viên (Admin/Moderator)**: Hàng đợi xét duyệt báo cáo vi phạm, hiển thị danh tính thực của người đăng (kể cả bài ẩn danh) để thi hành chế tài kỷ luật (`WARN`, `TEMPORARY_BAN`, `PERMANENT_BAN`, `DELETE_CONTENT`).

---

## 🚀 Hướng dẫn Cài đặt & Chạy Thử

### 1. Yêu cầu Tiên quyết
- **Node.js**: Phiên bản 18.x trở lên.
- **npm**: Phiên bản 9.x trở lên.
- **Git** đã được cài đặt trên máy.

### 2. Clone dự án
```bash
git clone https://github.com/nguyendat1603/Social-network-for-students.git
cd Social-network-for-students
```

### 3. Cài đặt Dependencies

Cài đặt các gói phụ thuộc cho cả Backend và Frontend:

```bash
# Cài đặt cho Backend
cd backend
npm install

# Cài đặt cho Frontend
cd ../frontend
npm install

# Quay lại thư mục gốc
cd ..
```

### 4. Cấu hình Biến Môi trường (.env)

Hệ thống đã có sẵn file mẫu `.env.example`. Tạo các file `.env` cục bộ cho Backend và Frontend:

- **Tại thư mục `backend/.env`**:
  ```env
  PORT=4000
  NODE_ENV=development
  CORS_ORIGIN=http://localhost:5173
  
  # Thông tin kết nối Supabase Online Project
  SUPABASE_URL=https://your-project-id.supabase.co
  SUPABASE_ANON_KEY=your-supabase-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
  
  # JWT Secrets
  JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
  JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
  ```

- **Tại thư mục `frontend/.env`**:
  ```env
  VITE_API_BASE_URL=http://localhost:4000/api/v1
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
  ```

---

### 5. Khởi động Ứng dụng

Mở **2 cửa sổ Terminal song song**:

#### 🔹 Terminal 1: Khởi động Backend API Server
```bash
cd backend
npm run dev
```
Server Backend sẽ khởi động tại: **`http://localhost:4000`**
> Endpoint kiểm tra sức khỏe hệ thống: `http://localhost:4000/api/v1/health`

#### 🔹 Terminal 2: Khởi động Frontend Web Application
```bash
cd frontend
npm run dev
```
Giao diện Web sẽ sẵn sàng tại: **`http://localhost:5173`**

---

## 👤 Tài khoản Thử nghiệm & Cách Đăng nhập

Mở trình duyệt truy cập: **`http://localhost:5173`**

### Cách 1: Đăng nhập nhanh 1-chạm (Khuyên dùng)
Tại trang Đăng nhập, bấm nút:
> **🏛️ Đăng nhập bằng School SSO OAuth2 (.edu.vn)**

Hệ thống sẽ lập tức cấp phiên đăng nhập đã xác thực sinh viên với tài khoản:
- **Email**: `dat.nt215340@sis.hust.edu.vn`
- **Họ tên**: Nguyễn Thành Đạt
- **MSSV**: `20215340` (K66 - Đại học Bách Khoa Hà Nội)
- **Huy hiệu**: `Verified Student`

### Cách 2: Tự tạo tài khoản sinh viên mới qua OTP
1. Bấm **"Đăng ký & Xác thực OTP .edu"** tại chân trang Đăng nhập.
2. Nhập một email sinh viên (ví dụ: `tensv.mssv@sis.hust.edu.vn` hoặc bất kỳ email có đuôi `.edu.vn`).
3. Điền mật khẩu, họ tên, MSSV và chuyên ngành.
4. Ở chế độ Development, **mã OTP 6 chữ số sẽ được hiển thị trực tiếp trên màn hình** để bạn nhập và xác thực kích hoạt huy hiệu sinh viên ngay lập tức.

---

## 📂 Cấu trúc Thư mục Dự án

```
MXH_HSSV/
├── backend/
│   ├── src/
│   │   ├── common/             # Middlewares (Auth, Error, Anonymity), Utils (JWT, Response)
│   │   ├── config/             # Cấu hình Env, Socket, Database
│   │   ├── database/           # Client kết nối Supabase Online
│   │   ├── jobs/               # Background jobs (Deadline reminder, Auto-hide, Karma audit)
│   │   ├── modules/            # 8 Module nghiệp vụ chuẩn hóa:
│   │   │   ├── identity/       # Module 1: Định danh, OTP .edu, SSO, Hồ sơ học thuật
│   │   │   ├── feed/           # Module 2: Bảng tin học thuật, LaTeX/Code, Accepted Answer
│   │   │   ├── study-group/    # Module 3: Tuyển nhóm đồ án, Group Workspace, Mini-Kanban
│   │   │   ├── course-review/  # Module 4: Review học phần & giảng viên 4 tiêu chí sao
│   │   │   ├── resource-hub/   # Module 5: Phân tầng tài liệu 4 cấp, Inline PDF Preview
│   │   │   ├── marketplace/    # Module 6: Chợ sinh viên & Nhà trọ theo thói quen
│   │   │   ├── communication/  # Module 7: Chat 1-1, Group Chat đồ án, Realtime notify
│   │   │   └── moderation/     # Module 8: Sổ cái Karma, Đặc quyền, Kiểm duyệt Admin
│   │   ├── app.ts              # Express App setup & router integration
│   │   └── server.ts           # Điểm khởi động HTTP Server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI (Navbar, Sidebar, Badges, AnonymousSwitch)
│   │   ├── config/             # Route URLs, API client configs
│   │   ├── features/           # Giao diện & Components theo 8 module nghiệp vụ
│   │   ├── hooks/              # Custom React Hooks (useAuth, useSocket)
│   │   ├── services/           # HTTP API client services cho từng module
│   │   ├── types/              # TypeScript interface & type definitions
│   │   ├── router.tsx          # React Router v6 configuration
│   │   └── main.tsx            # Điểm khởi tạo ứng dụng React
│   └── package.json
│
├── database/
│   └── schema/                 # 8 file DDL PostgreSQL chuẩn hóa từ 01 đến 08
└── docs/
    └── mvp-specification.md    # Tài liệu đặc tả kỹ thuật MVP chuẩn của toàn bộ hệ thống
```

---

## 🔒 Cơ chế Bảo mật & Quy chuẩn An toàn

- **Bảo mật Thông tin Đăng nhập (Zero Secret Leaks)**: Mọi API keys, JWT secrets và chuỗi kết nối cơ sở dữ liệu đều được lưu trong các file `.env` cục bộ và bị chặn tuyệt đối bởi `.gitignore`, không bao giờ được commit lên repository Git.
- **An toàn Dữ liệu Cấp Cơ sở dữ liệu (Database Row-Level Security)**: Toàn bộ 35 bảng trong cơ sở dữ liệu đều được kích hoạt Row-Level Security (RLS) để chỉ cho phép người dùng thao tác trên đúng dữ liệu thuộc thẩm quyền của mình.
- **Ẩn danh Có Kiểm soát (Controlled Anonymity)**: Dữ liệu bài đăng ẩn danh luôn lưu ID thật ở tầng Database, giúp ngăn chặn hành vi quấy rối, leak đề thi cấm hoặc lừa đảo trọ; Ban quản trị có đầy đủ công cụ để tra soát và thi hành chế tài kỷ luật khi cần thiết.

---

## 📄 Bản quyền & Đóng góp
Dự án được xây dựng và phát triển phục vụ cộng đồng học sinh - sinh viên Việt Nam. Mọi đóng góp (Pull Request, Issue) đều được hoan nghênh và đánh giá cao!
