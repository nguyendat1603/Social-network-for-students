---
name: moderation-reputation
description: >-
  Use this skill when implementing or modifying Module 8: Moderation & Reputation System,
  including the Academic Karma ledger, privilege tier unlocking (unlimited downloads, custom group creation),
  violation reporting (leaked exams, housing scams, toxic content), automatic report threshold hiding,
  and the Admin/Moderator review dashboard.
---

# Module 8: Moderation & Reputation System Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 8](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 8

- **Database**:
  - [database/schema/08_moderation_reputation.sql](../../../database/schema/08_moderation_reputation.sql)
- **Backend (`backend/src/modules/moderation/` & `backend/src/jobs/`)**:
  - [moderation.routes.ts](../../../backend/src/modules/moderation/moderation.routes.ts)
  - [moderation.controller.ts](../../../backend/src/modules/moderation/moderation.controller.ts)
  - [moderation.service.ts](../../../backend/src/modules/moderation/moderation.service.ts)
  - [moderation.repository.ts](../../../backend/src/modules/moderation/moderation.repository.ts)
  - [moderation.validation.ts](../../../backend/src/modules/moderation/moderation.validation.ts)
  - [moderation.types.ts](../../../backend/src/modules/moderation/moderation.types.ts)
  - [services/academic-karma.service.ts](../../../backend/src/modules/moderation/services/academic-karma.service.ts)
  - [services/privilege-unlock.service.ts](../../../backend/src/modules/moderation/services/privilege-unlock.service.ts)
  - [services/report-engine.service.ts](../../../backend/src/modules/moderation/services/report-engine.service.ts)
  - [services/auto-moderation.service.ts](../../../backend/src/modules/moderation/services/auto-moderation.service.ts)
  - [jobs/karma-recalculation.job.ts](../../../backend/src/jobs/karma-recalculation.job.ts)
  - [jobs/auto-hide-reported.job.ts](../../../backend/src/jobs/auto-hide-reported.job.ts)
- **Frontend (`frontend/src/features/moderation/`)**:
  - Pages: `AcademicKarmaPage.tsx`, `AdminModerationDashboardPage.tsx`
  - Components: `KarmaPointsSummary.tsx`, `PrivilegeUnlockProgress.tsx`, `ReportViolationModal.tsx`, `ModerationQueueTable.tsx`, `AutoModThresholdSettings.tsx`, `UserSanctionModal.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Sổ cái Điểm Uy tín Học thuật (`academic-karma.service.ts`)**:
   - Mọi thay đổi điểm Karma phải được thực hiện qua một hàm giao dịch duy nhất `recordKarmaTransaction(userId, actionType, pointsDelta, referenceType, referenceId)`:
     - Chèn bản ghi vào `karma_ledger` (chống cộng trùng lặp bằng khóa `UNIQUE(user_id, action_type, reference_type, reference_id)` cho các sự kiện một lần).
     - Cập nhật `users.karma_points = users.karma_points + pointsDelta`.
   - Khung điểm chuẩn (định nghĩa trong `karma-rules.constant.ts`):
     - `DOCUMENT_UPVOTED`: `+5`
     - `ANSWER_ACCEPTED`: `+15`
     - `POST_OR_COMMENT_UPVOTED`: `+2`
     - `KANBAN_TASK_COMPLETED_ON_TIME`: `+5`
     - `CONTENT_REMOVED_VIOLATION`: `-20`
   - Không cộng điểm khi người dùng tự tương tác với nội dung của chính mình.

2. **Mở khóa Đặc quyền (`privilege-unlock.service.ts`)**:
   - Đánh giá bậc đặc quyền hiện tại dựa trên `users.karma_points`:
     - `RESTRICTED` (`< 0`): Chặn tạo bài đăng/chợ mới.
     - `VERIFIED_MEMBER` (`0 – 49`): Tải tối đa 10 tài liệu/ngày.
     - `ACTIVE_CONTRIBUTOR` (`50 – 149`): Tải tài liệu **không giới hạn**.
     - `TRUSTED_SCHOLAR` (`>= 150`): Tạo group thảo luận chuyên đề riêng + hiển thị huy hiệu `Trusted Contributor`.

3. **Kiểm duyệt Nội dung & Tự động Ẩn bài Khi Đạt Ngưỡng (`report-engine.service.ts` & `auto-moderation.service.ts`)**:
   - Ràng buộc `UNIQUE(reporter_id, target_type, target_id)` trong `content_reports` để 1 tài khoản không thể spam report cùng 1 bài viết nhiều lần.
   - Ngưỡng tự động ẩn (`moderation-thresholds.constant.ts`):
     - Với lý do `LEAKED_EXAM` (Đề thi cấm leak) hoặc `SCAM_HOUSING` (Lừa đảo trọ): chạm **3 báo cáo độc lập** -> Tự động chuyển trạng thái nội dung sang `HIDDEN_PENDING_REVIEW`.
     - Với các lý do khác (`HARASSMENT_TOXIC`, `COPYRIGHT_WRONG_DOC`, `SPAM`): chạm **5 báo cáo độc lập** -> Tự động chuyển trạng thái sang `HIDDEN_PENDING_REVIEW`.

4. **Admin / Moderator Dashboard**:
   - Cho phép Admin/Mod xem danh sách nội dung bị báo cáo sắp xếp theo mức độ nghiêm trọng và số lượng report.
   - Admin/Mod có quyền tra cứu `author_id` thật của bài đăng ẩn danh vi phạm để áp dụng chế tài (`WARN`, `TEMPORARY_BAN`, `PERMANENT_BAN`) và ghi log bất biến vào bảng `moderation_actions`.

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho `karma_ledger`, `privilege_tiers`, `content_reports`, `moderation_actions` trong `08_moderation_reputation.sql`.
2. Xây dựng `academic-karma.service.ts` và `privilege-unlock.service.ts` để các module 2, 3, 5 gọi tới.
3. Xây dựng `report-engine.service.ts` tích hợp `auto-moderation.service.ts`.
4. Xây dựng trang `AcademicKarmaPage.tsx` (cho sinh viên theo dõi điểm & đặc quyền) và `AdminModerationDashboardPage.tsx` (cho Ban quản trị).

## Kiểm chứng (Validation)
- 3 sinh viên khác nhau báo cáo 1 bài đăng với lý do `LEAKED_EXAM` -> Bài đăng tự động chuyển sang `HIDDEN_PENDING_REVIEW` và biến mất khỏi Feed công khai.
- Khi Admin duyệt báo cáo là vi phạm thật (`DELETE_CONTENT`) -> Tác giả bài viết tự động bị trừ `-20 Karma` trong `karma_ledger`.
