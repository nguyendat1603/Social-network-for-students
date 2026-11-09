---
name: course-review-qa
description: >-
  Use this skill when implementing or modifying Module 4: Course Review & Peer Q&A,
  including anonymous course and lecturer reviews, 1-5 star multi-criteria analytics
  (difficulty, workload, grading fairness, reading load), and the subject-specific Q&A forum with full-text search.
---

# Module 4: Course Review & Peer Q&A Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 4](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 4

- **Database**:
  - [database/schema/04_course_review_qa.sql](../../../database/schema/04_course_review_qa.sql)
- **Backend (`backend/src/modules/course-review/`)**:
  - [course-review.routes.ts](../../../backend/src/modules/course-review/course-review.routes.ts)
  - [course-review.controller.ts](../../../backend/src/modules/course-review/course-review.controller.ts)
  - [course-review.service.ts](../../../backend/src/modules/course-review/course-review.service.ts)
  - [course-review.repository.ts](../../../backend/src/modules/course-review/course-review.repository.ts)
  - [course-review.validation.ts](../../../backend/src/modules/course-review/course-review.validation.ts)
  - [course-review.types.ts](../../../backend/src/modules/course-review/course-review.types.ts)
  - [services/lecturer-review.service.ts](../../../backend/src/modules/course-review/services/lecturer-review.service.ts)
  - [services/review-statistics.service.ts](../../../backend/src/modules/course-review/services/review-statistics.service.ts)
  - [services/subject-forum-search.service.ts](../../../backend/src/modules/course-review/services/subject-forum-search.service.ts)
- **Frontend (`frontend/src/features/course-review/`)**:
  - Pages: `CourseReviewDirectoryPage.tsx`, `CourseReviewDetailPage.tsx`, `SubjectQaForumPage.tsx`
  - Components: `WriteAnonymousReviewModal.tsx`, `CourseCriteriaRadarChart.tsx`, `LecturerReviewList.tsx`, `SubjectQuestionSearch.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Đánh giá Ẩn danh & Chống Spam Review (`lecturer-review.service.ts`)**:
   - Mọi đánh giá học phần/giảng viên mặc định bật `is_anonymous = true` để bảo vệ sinh viên, nhưng hệ thống vẫn lưu `author_id` với ràng buộc `UNIQUE(course_id, lecturer_id, author_id, semester)` nhằm đảm bảo mỗi sinh viên chỉ đánh giá 1 lần cho mỗi môn/giảng viên trong một học kỳ.
   - Không hiển thị `author_id`, `full_name`, hay `student_code` ra API công khai; chỉ hiển thị `anonymous_handle` và `semester` đã học.

2. **Thống kê Tiêu chí 1–5 Sao (`review-statistics.service.ts`)**:
   - Bắt buộc validate các thang điểm nguyên từ `1` đến `5`:
     - `difficulty_score` (Độ khó môn học)
     - `workload_score` (Độ nặng của bài tập / BTL)
     - `grading_fairness_score` (Tính công bằng khi chấm điểm)
     - `teaching_quality_score` (Phương pháp giảng dạy)
     - `reading_load_score` (Khối lượng tài liệu cần đọc)
   - Mỗi khi có review mới được thêm hoặc bị ẩn do vi phạm, cập nhật bảng tổng hợp `course_review_aggregates` để đọc nhanh điểm trung bình mà không cần `AVG()` toàn bảng trên mỗi request.

3. **Diễn đàn Hỏi bài theo Môn & Tìm kiếm Toàn văn (`subject-forum-search.service.ts`)**:
   - Tích hợp PostgreSQL Full-Text Search (`to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content_body,''))` kết hợp `pg_trgm`) để sinh viên tìm nhanh câu hỏi cũ theo mã môn học (`course_code`), từ khóa lý thuyết hoặc chuỗi báo lỗi lập trình.
   - Hỗ trợ bộ lọc ưu tiên các câu hỏi đã có `Accepted Answer`.

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho `lecturers`, `course_reviews`, `course_review_aggregates` và index tìm kiếm trong `04_course_review_qa.sql`.
2. Xây dựng logic tạo review ẩn danh và tự động tính lại `course_review_aggregates`.
3. Xây dựng công cụ tìm kiếm toàn văn câu hỏi theo môn học trong `subject-forum-search.service.ts`.
4. Xây dựng biểu đồ trực quan hóa các tiêu chí 1–5 sao trong `CourseCriteriaRadarChart.tsx`.

## Kiểm chứng (Validation)
- Gửi 2 review liên tiếp từ cùng 1 tài khoản cho cùng `(course_id, lecturer_id, semester)` -> Lần thứ 2 phải trả về `409 DUPLICATE_COURSE_REVIEW`.
- Kiểm tra payload JSON của `GET /api/v1/course-reviews/courses/:courseCode` -> Tuyệt đối không chứa trường `author_id` của người viết review ẩn danh.
