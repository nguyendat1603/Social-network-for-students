# Hướng dẫn dựng môi trường và triển khai

Đối chiếu repo ngày 17/11/2026 tại `9a7e33b`. Hướng dẫn áp dụng cho source hiện có. Chưa xác nhận cloud database thực tế, chưa triển khai dịch vụ trong lần rà soát này.

## 1. Điều kiện và giới hạn

Cần Git, Node.js/npm tương thích với package-lock và một project Supabase riêng cho development/staging. Dùng phiên bản Node LTS còn được duy trì, xác minh bằng build của cả hai package; repo chưa pin version Node. Máy local cần kết nối Supabase qua HTTPS.

`backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` hiện rỗng; không dùng `docker compose up` như một quy trình đã có. Các file config Redis, mail, OAuth, socket/storage chưa tạo thành dịch vụ chạy được. Không cần dựng Redis/MinIO chỉ để chạy đường code hiện tại.

Hệ thống chưa sẵn sàng mở công khai: SSO tự khai danh tính, thiếu gửi email OTP, lệch schema/truy vấn và thiếu ledger Karma là các blocker cần xử lý trước. Chi tiết tại [báo cáo tính năng](feature-audit.md).

## 2. Cài đặt local

Chạy từ thư mục gốc (PowerShell):

```powershell
npm --prefix backend ci
npm --prefix frontend ci
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Chỉ copy env khi file đích chưa tồn tại, tránh ghi đè cấu hình cá nhân. Không copy secret vào tài liệu, issue hay commit. `.gitignore` giữ các `.env.example` và bỏ qua `.env`/`.env.*` thật.

## 3. Cấu hình môi trường

| Biến | Nơi dùng | Ý nghĩa |
| --- | --- | --- |
| PORT | Backend | Mặc định 4000 |
| NODE_ENV | Backend | development local, production khi phát hành; production không trả OTP preview |
| CORS_ORIGIN | Backend | Origin frontend chính xác, local mặc định http://localhost:5173 |
| SUPABASE_URL | Backend | URL project Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Backend | Key riêng server để truy cập DB; không gửi xuống frontend |
| SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY | Backend | Fallback trong code; không thay thế tùy tiện service-role cho luồng cần quyền ghi |
| JWT_ACCESS_SECRET / JWT_REFRESH_SECRET | Backend | Hai secret mạnh, khác nhau; không dùng fallback development |
| JWT_ACCESS_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN | Backend | Mặc định 1d / 7d |
| ALLOWED_EDU_DOMAINS | Backend | Danh sách domain phân tách bằng dấu phẩy; thí điểm một trường nên dùng domain cụ thể |
| OTP_TTL_SECONDS / OTP_MAX_ATTEMPTS | Backend | Mặc định 300 / 5 |
| OTP_RESEND_COOLDOWN_SECONDS | Backend | Mặc định 60 |
| ANONYMOUS_HANDLE_COOLDOWN_DAYS | Backend | Mặc định 30 |
| DATABASE_URL / DIRECT_URL | Prisma CLI | Chỉ phục vụ công cụ/schema Prisma; runtime hiện dùng Supabase SDK |
| VITE_API_BASE_URL | Frontend build | Ví dụ http://localhost:4000/api/v1; production dùng URL HTTPS của API |
| VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY | Frontend mẫu | Có trong env.example; không đồng nghĩa frontend đã tích hợp Supabase Auth/Realtime |

Các biến `VITE_*` có thể nằm trong bundle trình duyệt: tuyệt đối không đặt service-role key vào đó. Thay biến Vite cần build lại. Backend đọc `.env` theo working directory; các script npm ở root chuyển vào đúng package bằng `--prefix`.

## 4. Khởi tạo database

Dùng DB development/staging mới, không áp dụng mù lên production đã có dữ liệu. Chạy các file SQL bằng công cụ PostgreSQL hoặc SQL Editor của Supabase, theo thứ tự:

1. `database/schema/01_identity_verification.sql`
2. `database/schema/02_academic_feed_discussion.sql`
3. `database/schema/03_study_group_matching.sql`
4. `database/schema/04_course_review_qa.sql`
5. `database/schema/05_document_resource_hub.sql`
6. `database/schema/06_campus_marketplace_housing.sql`
7. `database/schema/07_realtime_communication.sql`
8. `database/schema/08_moderation_reputation.sql`
9. `database/seeds/seed_faculties_courses.sql`
10. `database/seeds/seed_karma_privileges.sql`

`seed_sample_users.sql` chỉ dành cho môi trường thử nghiệm sau khi xem nội dung. Không đưa tài khoản mẫu vào production. SQL có `IF NOT EXISTS` không bảo đảm nâng cấp cấu trúc bảng cũ: cần migration cụ thể cho từng thay đổi. Thư mục migrations hiện chưa có migration hoàn chỉnh.

Sau khi chạy, đối chiếu cột, khóa ngoại, index và RLS với [đặc tả dữ liệu](database-erd.md). Repo hiện thiếu DDL cho `karma_ledger`; các projection ở module nhóm/chợ/chat còn dùng `users.full_name`, `users.avatar_url` trong khi hai cột này nằm ở `academic_profiles`. Vì vậy dựng DB từ repo chưa đủ làm mọi chức năng hoạt động. Không dùng Prisma `db push` để thay toàn bộ schema SQL: Prisma hiện chỉ mô tả một phần dữ liệu.

## 5. Chạy và kiểm tra local

Mở hai terminal tại root:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Frontend local mặc định ở http://localhost:5173. Nếu Vite tự đổi cổng do cổng bận, cập nhật CORS_ORIGIN hoặc giải phóng cổng; không suy ra lỗi login là lỗi database.

Kiểm tra API:

```powershell
Invoke-RestMethod http://localhost:4000/api/v1/health
Invoke-RestMethod http://localhost:4000/api/v1/identity/catalog
```

Health chỉ chứng minh Express trả lời; catalog mới kiểm tra được một truy vấn DB đọc. Sau đó thử đăng ký/OTP local, đăng nhập, tạo câu hỏi/bình luận, quyền thành viên nhóm và admin. Giữ dữ liệu thử riêng. Demo chỉ cho xem và chỉ bật trong development; không coi dữ liệu demo là dữ liệu thật hay bằng chứng backend chạy được.

Kiểm tra tĩnh và build:

```powershell
npm --prefix backend run typecheck
npm --prefix frontend run typecheck
npm run build:backend
npm run build:frontend
node --test frontend/tests/campus-navigation.test.cjs frontend/tests/demo-access.test.cjs frontend/tests/notifications-page.test.cjs
```

Các test browser trong `frontend/tests/*.browser.cjs` cần đọc điều kiện môi trường của script (Chrome/server/đường dẫn riêng). Không coi chúng là bộ test production có thể chạy trên mọi máy mà không cấu hình. Chưa có test backend tự động đầy đủ; build thành công không phát hiện cột DB thiếu.

## 6. Quy trình phát hành sau khi xử lý blocker

1. Chốt migration, sao lưu DB, diễn tập restore trên staging. Ghi rõ version ứng dụng và schema tương ứng.
2. Hoàn thành xác thực SSO/email, kiểm tra quyền server, khóa tài khoản, bảo vệ tệp và các lỗi tích hợp trong audit.
3. Chạy typecheck/build/test, kiểm thử staging bằng user chưa verified, verified, ngoài nhóm và moderator. Đo lỗi, thời gian phản hồi và các truy vấn chậm.
4. Backend build bằng `npm --prefix backend run build`, chạy từ thư mục backend bằng `npm start`; entry là `dist/server.js`. Dùng dịch vụ quản lý process, env production và HTTPS ở proxy/platform.
5. Frontend build bằng `npm --prefix frontend run build`; phục vụ `frontend/dist` dưới HTTPS. Cấu hình SPA fallback về `index.html` cho URL như `/feed/...`; không fallback request API sang HTML.
6. Đặt VITE_API_BASE_URL đúng API production trước build và CORS_ORIGIN đúng origin web. Không dùng Vite dev server/preview làm dịch vụ production.
7. Kiểm tra health, catalog, login và một luồng đọc/ghi thiết yếu sau deploy; theo dõi log lỗi đã che secret. Chỉ mở lưu lượng khi các bước đạt.

Chưa có cấu hình hosting, domain, pipeline hoặc Docker trong repo để mô tả lệnh deploy một nút. Tài liệu này không tự tạo hay thay đổi cloud project.

## 7. Rollback và xử lý sự cố

- Lưu bản build/commit trước và snapshot DB trước migration. Rollback ứng dụng về build trước chỉ an toàn nếu schema còn tương thích; migration phá vỡ phải có kế hoạch phục hồi dữ liệu riêng.
- Lỗi CORS: kiểm tra scheme/host/port origin frontend với CORS_ORIGIN.
- API không khởi động: kiểm tra working directory và SUPABASE_URL/key; không in key để debug.
- Query báo thiếu cột/quan hệ: đối chiếu schema thật với SQL và projection; không thêm cột trùng dữ liệu chỉ để che lỗi thiết kế.
- OTP production không đến: hiện chưa có email provider; đổi NODE_ENV sang development không phải cách sửa cho production.
- Chat không tự cập nhật: hiện là REST, chưa có realtime transport.
- Backup phải được kiểm thử khôi phục; không khẳng định có backup chỉ vì dùng dịch vụ cloud.
