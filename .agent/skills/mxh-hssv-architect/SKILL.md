---
name: mxh-hssv-architect
description: >-
  Use this skill when designing cross-module architecture, configuring shared backend middlewares,
  setting up the Prisma schema or PostgreSQL migrations, configuring Socket.IO/Redis infrastructure,
  or building shared frontend layouts and common academic UI components (LaTeX, Code, PDF, Anonymous toggle) for MXH_HSSV.
---

# MXH_HSSV System Architect Skill

Tài liệu tham chiếu gốc: [docs/mvp-specification.md](../../../docs/mvp-specification.md)

## Phạm vi Phụ trách
Skill này quản lý tầng nền tảng dùng chung cho cả 8 module nghiệp vụ:
1. **Database & Prisma Core**:
   - `backend/src/database/prisma/schema.prisma`
   - `backend/src/database/index.ts`
   - `database/seeds/seed_faculties_courses.sql`, `database/seeds/seed_karma_privileges.sql`
2. **Backend Shared Infrastructure**:
   - Cấu hình: `backend/src/config/*.config.ts` (`env`, `database`, `redis`, `mail`, `oauth`, `storage`, `socket`, `search`)
   - Middlewares:
     - `auth.middleware.ts` (Xác thực JWT Access Token)
     - `verified-student.middleware.ts` (Kiểm tra `user.is_verified_student === true`)
     - `anonymous-context.middleware.ts` (Xử lý gắn cờ ẩn danh và lọc trường nhạy cảm ở response)
     - `karma-privilege.middleware.ts` (Kiểm tra điểm Karma tối thiểu trước khi cho phép tải tài liệu hoặc tạo group riêng)
     - `role.middleware.ts` (Phân quyền `STUDENT`, `MODERATOR`, `ADMIN`)
3. **Frontend Shared Components & Layouts**:
   - Layouts: `MainLayout.tsx`, `AdminLayout.tsx`, `Navbar.tsx`, `Sidebar.tsx`, `RightSidebar.tsx`
   - Common Academic Components: `VerifiedStudentBadge.tsx`, `AnonymousSwitch.tsx`, `RichTextEditor.tsx`, `CodeSnippetBlock.tsx`, `LatexMathRenderer.tsx`, `PdfViewerModal.tsx`, `CourseTagPill.tsx`, `ReportButton.tsx`

## Quy trình Triển khai Chuẩn (Steps)

### Bước 1: Thiết lập Cấu hình & Cơ sở dữ liệu Nền tảng
1. Định nghĩa các bảng dùng chung (`faculties`, `courses`, `users`) trước khi tạo các bảng phụ thuộc.
2. Cấu hình kết nối PostgreSQL qua Prisma trong `backend/src/database/index.ts` và Redis trong `backend/src/config/redis.config.ts`.
3. Chuẩn hóa hàm trả về JSON envelope trong `backend/src/common/utils/response.util.ts`:
   - `sendSuccess(res, data, meta, statusCode)`
   - `sendError(res, message, code, details, statusCode)`

### Bước 2: Triển khai Chuỗi Middleware Bảo mật
Thứ tự thực thi middleware cho các route nghiệp vụ:
1. `authMiddleware` -> Giải mã JWT, gắn `req.user`.
2. `verifiedStudentMiddleware` -> Chặn các tài khoản chưa xác thực email `.edu` khỏi thao tác ghi.
3. `karmaPrivilegeMiddleware(requiredTier)` -> Áp dụng cho các route cần đặc quyền Karma.
4. `anonymousContextMiddleware` -> Đảm bảo không rò rỉ `author_id` ra JSON response khi `is_anonymous = true`.

### Bước 3: Xây dựng Các Component Học thuật Dùng chung (Frontend)
- `LatexMathRenderer.tsx`: Render công thức inline `$...$` và block `$$...$$` bằng KaTeX, chống XSS.
- `CodeSnippetBlock.tsx`: Hiển thị code có đánh số dòng, highlight cú pháp và nút Copy.
- `AnonymousSwitch.tsx`: Nút bật/tắt chế độ ẩn danh kèm hiển thị trước `anonymous_handle` hiện tại của sinh viên.

## Kiểm tra & Xác nhận (Validation)
- Chạy `npx prisma validate` trong thư mục `backend/` để đảm bảo schema không có lỗi quan hệ.
- Đảm bảo mọi API trả về đúng cấu trúc `{ success, data, meta, error }`.
