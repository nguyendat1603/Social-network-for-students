---
name: study-group-matching
description: >-
  Use this skill when implementing or modifying Module 3: Study Group & Team Matching,
  including teammate recruitment posts by course/role/skills/target grade, application and approval workflows,
  private Group Workspaces, Lead/Member role management, Mini-Kanban task boards, and shared group documents.
---

# Module 3: Study Group & Team Matching Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 3](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 3

- **Database**:
  - [database/schema/03_study_group_matching.sql](../../../database/schema/03_study_group_matching.sql)
- **Backend (`backend/src/modules/study-group/`)**:
  - [study-group.routes.ts](../../../backend/src/modules/study-group/study-group.routes.ts)
  - [study-group.controller.ts](../../../backend/src/modules/study-group/study-group.controller.ts)
  - [study-group.service.ts](../../../backend/src/modules/study-group/study-group.service.ts)
  - [study-group.repository.ts](../../../backend/src/modules/study-group/study-group.repository.ts)
  - [study-group.validation.ts](../../../backend/src/modules/study-group/study-group.validation.ts)
  - [study-group.types.ts](../../../backend/src/modules/study-group/study-group.types.ts)
  - [services/teammate-matching.service.ts](../../../backend/src/modules/study-group/services/teammate-matching.service.ts)
  - [services/group-workspace.service.ts](../../../backend/src/modules/study-group/services/group-workspace.service.ts)
  - [services/kanban-task.service.ts](../../../backend/src/modules/study-group/services/kanban-task.service.ts)
  - [services/group-storage.service.ts](../../../backend/src/modules/study-group/services/group-storage.service.ts)
- **Frontend (`frontend/src/features/study-group/`)**:
  - Pages: `TeammateMatchingPage.tsx`, `GroupWorkspacePage.tsx`
  - Components: `TeamRecruitmentCard.tsx`, `CreateRecruitmentModal.tsx`, `TeamApplicationDrawer.tsx`, `MemberRoleList.tsx`, `MiniKanbanBoard.tsx`, `KanbanTaskCard.tsx`, `GroupSharedDocuments.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Đăng tin Tuyển thành viên & Bộ lọc (`teammate-matching.service.ts`)**:
   - Mỗi nhóm đồ án (`study_groups`) gắn với 1 học phần (`course_id`), học kỳ (`semester`), mục tiêu điểm số (`A+`, `A`, `B+`, `PASS`), và danh sách vị trí cần tuyển (`recruitment_slots`: ví dụ `Backend`, `Frontend`, `Embedded`, `Leader` kèm kỹ năng yêu cầu).
   - Khi sinh viên nộp đơn ứng tuyển (`group_applications`), hệ thống tự động đính kèm tóm tắt Hồ sơ học thuật (`academic_profiles` + `user_skills`) của ứng viên để Nhóm trưởng (`LEAD`) xem xét.

2. **Duyệt Thành viên & Tự động Khởi tạo Không gian Nhóm (`group-workspace.service.ts`)**:
   - Chỉ thành viên có vai trò `LEAD` trong nhóm mới được duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) đơn ứng tuyển.
   - Khi duyệt đơn trong một transaction:
     1. Chuyển trạng thái đơn sang `APPROVED`.
     2. Thêm ứng viên vào `group_members` với vai trò `MEMBER` và vị trí tương ứng.
     3. Tăng `quantity_filled` của `recruitment_slots`; nếu tất cả slot đã đủ hoặc đạt `max_members`, tự động đặt `study_groups.is_recruiting = false`.
     4. Tự động thêm thành viên mới vào phòng `PROJECT_GROUP` chat của nhóm (Module 7) và bắn thông báo thời gian thực.

3. **Mini-Kanban / Task Board (`kanban-task.service.ts`)**:
   - Chỉ thành viên trong nhóm (`group_members`) mới có quyền truy cập Workspace, Kanban và kho tài liệu của nhóm.
   - Hỗ trợ 4 cột trạng thái: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
   - Hỗ trợ kéo thả sắp xếp thứ tự (`position_order`), gán người thực hiện (`assignee_id` phải là thành viên nhóm) và hạn chót (`due_date`).
   - Khi một task được chuyển sang `DONE` trước hoặc đúng `due_date` và được `LEAD` xác nhận, cộng `+5 Karma` cho `assignee_id`.

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho `study_groups`, `recruitment_slots`, `group_applications`, `group_members`, `kanban_tasks`, `group_documents` trong `03_study_group_matching.sql`.
2. Xây dựng luồng tạo nhóm -> tạo vị trí tuyển -> ứng tuyển -> duyệt thành viên trong `teammate-matching.service.ts`.
3. Xây dựng API quản lý Kanban Task và lưu trữ tài liệu nội bộ nhóm.
4. Xây dựng giao diện `TeammateMatchingPage.tsx` (bộ lọc theo môn, vị trí, mục tiêu điểm) và `GroupWorkspacePage.tsx` (tích hợp `MiniKanbanBoard.tsx` và `GroupSharedDocuments.tsx`).

## Kiểm chứng (Validation)
- Người dùng không thuộc nhóm gọi `GET /api/v1/study-groups/:groupId/workspace` -> Phải trả về `403 FORBIDDEN`.
- Khi duyệt đủ số lượng thành viên tối đa -> Nhóm tự động đóng trạng thái tuyển thêm (`is_recruiting = false`).
