---
name: mxh-hssv-master
description: >-
  Master skill index and implementation playbook for the Student Social Network (MXH_HSSV) platform.
  Use this skill to understand the overall system structure, locate module-specific skills,
  and enforce the MVP Specification across Database, Backend, and Frontend layers.
---

# MXH_HSSV — Master Skill & System Index

Tài liệu cơ sở chính (Single Source of Truth) của toàn dự án nằm tại:
- [docs/mvp-specification.md](./docs/mvp-specification.md)
- Yêu cầu nghiệp vụ gốc: [corefunction.txt](./corefunction.txt)

## Danh mục Skills theo Module Nghiệp vụ

Khi triển khai hoặc chỉnh sửa bất kỳ phân hệ nào, hãy đọc [docs/mvp-specification.md](./docs/mvp-specification.md) trước, sau đó kích hoạt Skill tương ứng trong `.agent/skills/`:

| STT | Module Nghiệp vụ | Skill Path | Database Schema | Backend Module | Frontend Feature |
| :-- | :--------------- | :--------- | :-------------- | :------------- | :--------------- |
| 0 | **Kiến trúc tổng thể & Tích hợp** | [.agent/skills/mxh-hssv-architect/SKILL.md](./.agent/skills/mxh-hssv-architect/SKILL.md) | `backend/src/database/prisma/schema.prisma` | `backend/src/common/`, `backend/src/config/` | `frontend/src/components/`, `frontend/src/store/` |
| 1 | **Identity & Student Verification** | [.agent/skills/identity-verification/SKILL.md](./.agent/skills/identity-verification/SKILL.md) | `database/schema/01_identity_verification.sql` | `backend/src/modules/identity/` | `frontend/src/features/identity/` |
| 2 | **Academic Discussion & Feed** | [.agent/skills/academic-feed/SKILL.md](./.agent/skills/academic-feed/SKILL.md) | `database/schema/02_academic_feed_discussion.sql` | `backend/src/modules/feed/` | `frontend/src/features/feed/` |
| 3 | **Study Group & Team Matching** | [.agent/skills/study-group-matching/SKILL.md](./.agent/skills/study-group-matching/SKILL.md) | `database/schema/03_study_group_matching.sql` | `backend/src/modules/study-group/` | `frontend/src/features/study-group/` |
| 4 | **Course Review & Peer Q&A** | [.agent/skills/course-review-qa/SKILL.md](./.agent/skills/course-review-qa/SKILL.md) | `database/schema/04_course_review_qa.sql` | `backend/src/modules/course-review/` | `frontend/src/features/course-review/` |
| 5 | **Document & Resource Hub** | [.agent/skills/resource-hub/SKILL.md](./.agent/skills/resource-hub/SKILL.md) | `database/schema/05_document_resource_hub.sql` | `backend/src/modules/resource-hub/` | `frontend/src/features/resource-hub/` |
| 6 | **Campus Marketplace & Housing** | [.agent/skills/campus-marketplace-housing/SKILL.md](./.agent/skills/campus-marketplace-housing/SKILL.md) | `database/schema/06_campus_marketplace_housing.sql` | `backend/src/modules/marketplace/` | `frontend/src/features/marketplace/` |
| 7 | **Realtime Communication** | [.agent/skills/realtime-communication/SKILL.md](./.agent/skills/realtime-communication/SKILL.md) | `database/schema/07_realtime_communication.sql` | `backend/src/modules/communication/` | `frontend/src/features/communication/` |
| 8 | **Moderation & Reputation System** | [.agent/skills/moderation-reputation/SKILL.md](./.agent/skills/moderation-reputation/SKILL.md) | `database/schema/08_moderation_reputation.sql` | `backend/src/modules/moderation/` | `frontend/src/features/moderation/` |

## Nguyên tắc Triển khai Bất biến (Core Invariants)

1. **Xác thực Sinh viên (`Verified Student`)**: Mọi thao tác ghi dữ liệu (đăng bài, bình luận, tải lên/tải xuống tài liệu, lập nhóm, đăng chợ/nhà trọ) phải đi qua `verified-student.middleware.ts`.
2. **Ẩn danh có Kiểm soát (`Controlled Anonymity`)**:
   - Không bao giờ để `author_id = NULL` khi người dùng chọn đăng ẩn danh.
   - Bắt buộc lưu `author_id` thật trong DB và bật cờ `is_anonymous = true`.
   - Tầng DTO/Serializer phải che giấu thông tin cá nhân (`full_name`, `student_code`, `email`, `avatar_url`) và chỉ trả về `anonymous_handle` trừ khi người gọi có quyền `MODERATOR`/`ADMIN` đang tra cứu vi phạm.
3. **Liên kết Học phần (`Course-Centric Linking`)**: Các thực thể `posts`, `study_groups`, `course_reviews`, `documents`, `marketplace_items` đều liên kết chặt chẽ với bảng `courses` (`course_id`) và `faculties` (`faculty_id`).
4. **Sổ cái Điểm uy tín (`Karma Ledger`)**: Không cập nhật trực tiếp cột `users.karma_points` một cách rời rạc; mọi biến động điểm phải ghi nhận một bản ghi vào `karma_ledger` trong cùng một database transaction.
