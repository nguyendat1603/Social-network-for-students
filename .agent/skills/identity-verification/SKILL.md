---
name: identity-verification
description: >-
  Use this skill when implementing or modifying Module 1: Identity & Student Verification,
  including school email (.edu) OTP registration, school SSO OAuth2 login, Verified Student badge issuance,
  Academic Profile management (MSSV, cohort, major, skills), and Anonymous Handle configuration.
---

# Module 1: Identity & Student Verification Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 1](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 1

- **Database**:
  - [database/schema/01_identity_verification.sql](../../../database/schema/01_identity_verification.sql)
- **Backend (`backend/src/modules/identity/`)**:
  - [identity.routes.ts](../../../backend/src/modules/identity/identity.routes.ts)
  - [identity.controller.ts](../../../backend/src/modules/identity/identity.controller.ts)
  - [identity.service.ts](../../../backend/src/modules/identity/identity.service.ts)
  - [identity.repository.ts](../../../backend/src/modules/identity/identity.repository.ts)
  - [identity.validation.ts](../../../backend/src/modules/identity/identity.validation.ts)
  - [identity.types.ts](../../../backend/src/modules/identity/identity.types.ts)
  - [strategies/edu-otp.strategy.ts](../../../backend/src/modules/identity/strategies/edu-otp.strategy.ts)
  - [strategies/school-sso-oauth2.strategy.ts](../../../backend/src/modules/identity/strategies/school-sso-oauth2.strategy.ts)
  - [services/academic-profile.service.ts](../../../backend/src/modules/identity/services/academic-profile.service.ts)
  - [services/anonymous-handle.service.ts](../../../backend/src/modules/identity/services/anonymous-handle.service.ts)
- **Frontend (`frontend/src/features/identity/`)**:
  - Pages: `LoginPage.tsx`, `RegisterEduPage.tsx`, `OtpVerificationPage.tsx`, `SsoCallbackPage.tsx`, `AcademicProfilePage.tsx`
  - Components: `AcademicInfoForm.tsx`, `SkillsLanguageSelector.tsx`, `AnonymousHandleManager.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Kiểm tra Tên miền Email Sinh viên (`.edu` Domain Whitelist)**:
   - Trong `identity.validation.ts`, chỉ chấp nhận email có đuôi thuộc danh sách cấu hình `ALLOWED_EDU_DOMAINS` (ví dụ: `.edu.vn`, `@sis.hust.edu.vn`, `@hust.edu.vn`, `@vnu.edu.vn`).
   - Có thể tự động trích xuất gợi ý MSSV (`student_code`) từ định dạng email trường nếu khớp mẫu (ví dụ `nam.nv210001@sis.hust.edu.vn` -> `20210001`).

2. **Luồng Xác thực OTP (`edu-otp.strategy.ts`)**:
   - Sinh mã OTP 6 chữ số ngẫu nhiên an toàn (`crypto.randomInt(100000, 999999)`).
   - Băm mã OTP (`SHA-256` hoặc `bcrypt`) trước khi lưu vào Redis/DB với `TTL = 300s` (5 phút).
   - Giới hạn tối đa 5 lần nhập sai liên tiếp cho mỗi mã OTP và cooldown 60 giây giữa các lần yêu cầu gửi lại OTP.
   - Sau khi xác thực OTP hoặc SSO OAuth2 thành công: cập nhật `users.is_verified_student = true`, `users.verified_at = NOW()`, và khởi tạo tự động một `anonymous_handle` ngẫu nhiên duy nhất (ví dụ: ` BáchKhoaẨnDanh_8492`).

3. **Hồ sơ Học thuật (`academic-profile.service.ts`)**:
   - Quản lý các trường: `student_code` (unique), `full_name`, `faculty_id`, `major`, `cohort` (Khóa), `class_name` (Lớp sinh hoạt), `career_goal`, và danh sách kỹ năng (`TECHNICAL`, `LANGUAGE`, `SOFT_SKILL`).

4. **Định danh Ẩn danh (`anonymous-handle.service.ts`)**:
   - `anonymous_handle` phải là duy nhất trên toàn hệ thống, không được chứa tên thật hoặc MSSV của chính sinh viên đó.
   - Áp dụng thời gian chờ (cooldown) 30 ngày giữa 2 lần đổi `anonymous_handle` để tránh lạm dụng ẩn danh rồi đổi tên liên tục.

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho bảng `users`, `student_verifications`, `academic_profiles`, `user_skills` trong `01_identity_verification.sql`.
2. Triển khai `edu-otp.strategy.ts` và `school-sso-oauth2.strategy.ts`.
3. Triển khai CRUD hồ sơ học thuật và quản lý `anonymous_handle`.
4. Xây dựng giao diện Đăng ký/Xác thực OTP kèm bộ đếm ngược 60s và trang Hồ sơ học thuật hiển thị huy hiệu `VerifiedStudentBadge`.

## Kiểm chứng (Verification)
- Thử đăng ký bằng email `@gmail.com` -> Phải bị từ chối với mã lỗi `400 INVALID_EDU_EMAIL_DOMAIN`.
- Đăng ký bằng email `.edu.vn` hợp lệ, xác thực OTP đúng -> Nhận token có `isVerifiedStudent: true` và có sẵn `anonymousHandle`.
