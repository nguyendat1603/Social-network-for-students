---
name: academic-feed
description: >-
  Use this skill when implementing or modifying Module 2: Academic Discussion & Feed,
  including Campus/Department/Course contextual feeds, the Rich-Text/Code/LaTeX Post Engine,
  automatic course hashtag tagging (#IT3080), Q&A Upvote/Downvote/Endorse voting,
  nested comments, and marking Accepted Answers.
---

# Module 2: Academic Discussion & Feed Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 2](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 2

- **Database**:
  - [database/schema/02_academic_feed_discussion.sql](../../../database/schema/02_academic_feed_discussion.sql)
- **Backend (`backend/src/modules/feed/`)**:
  - [feed.routes.ts](../../../backend/src/modules/feed/feed.routes.ts)
  - [feed.controller.ts](../../../backend/src/modules/feed/feed.controller.ts)
  - [feed.service.ts](../../../backend/src/modules/feed/feed.service.ts)
  - [feed.repository.ts](../../../backend/src/modules/feed/feed.repository.ts)
  - [feed.validation.ts](../../../backend/src/modules/feed/feed.validation.ts)
  - [feed.types.ts](../../../backend/src/modules/feed/feed.types.ts)
  - [services/post-engine.service.ts](../../../backend/src/modules/feed/services/post-engine.service.ts)
  - [services/course-tagger.service.ts](../../../backend/src/modules/feed/services/course-tagger.service.ts)
  - [services/vote-engagement.service.ts](../../../backend/src/modules/feed/services/vote-engagement.service.ts)
  - [services/nested-comment.service.ts](../../../backend/src/modules/feed/services/nested-comment.service.ts)
- **Frontend (`frontend/src/features/feed/`)**:
  - Pages: `CampusFeedPage.tsx`, `DepartmentFeedPage.tsx`, `CourseFeedPage.tsx`, `PostDetailPage.tsx`
  - Components: `ContextualFeedTabs.tsx`, `PostComposerModal.tsx`, `PostCard.tsx`, `VoteEndorseBar.tsx`, `NestedCommentTree.tsx`, `AcceptedAnswerBadge.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Phân luồng Bảng tin (`Contextual Feeds`)**:
   - `CAMPUS`: Hiển thị toàn trường; bài loại `ANNOUNCEMENT` chỉ dành cho Quản trị viên/Cán bộ lớp/CLB được cấp quyền.
   - `DEPARTMENT`: Yêu cầu truyền `faculty_id` (mặc định lọc theo Khoa/Viện của sinh viên đang đăng nhập).
   - `COURSE`: Yêu cầu truyền `course_id` hoặc mã học phần (`course_code`), hiển thị cả bài đăng trực tiếp trong học phần lẫn bài đăng có gắn hashtag mã môn đó.

2. **Tự động Gắn thẻ Môn học (`course-tagger.service.ts`)**:
   - Dùng biểu thức chính quy `/#([A-Z]{2,4}\d{3,4}[A-Z]?)/gi` (ví dụ `#IT3080`, `#MI1111`, `#ET2010`) để quét nội dung bài đăng.
   - Tra cứu các mã khớp được trong bảng `courses` và tự động chèn bản ghi vào `post_course_tags`.

3. **Định dạng Học thuật (`post-engine.service.ts`)**:
   - Làm sạch HTML/Markdown đầu vào để chống XSS nhưng **bảo toàn** khối công thức LaTeX (`$...$`, `$$...$$`) và khối mã nguồn (` ```lang ... ``` `).
   - Tự động đặt cờ `has_latex = true` hoặc `has_code = true` để Frontend tải lười (lazy-load) thư viện KaTeX / Syntax Highlighter.

4. **Hệ thống Vote & Accepted Answer (`vote-engagement.service.ts` & `nested-comment.service.ts`)**:
   - Ràng buộc `UNIQUE(user_id, target_type, target_id)` trong bảng `votes`. Nếu người dùng bấm lại cùng loại vote thì hủy vote; nếu đổi từ `UPVOTE` sang `DOWNVOTE` thì cập nhật chênh lệch `±2`.
   - Bình luận đa cấp hỗ trợ `parent_comment_id`.
   - Chỉ tác giả của bài viết có `post_type = 'QUESTION'` mới được gọi API đánh dấu `Accepted Answer` (`is_accepted = true`). Mỗi câu hỏi chỉ có tối đa 1 câu trả lời được chấp nhận tại một thời điểm, đồng thời kích hoạt cộng `+15 Karma` cho tác giả bình luận đó (nếu không phải tự trả lời bài của chính mình).

## Các Bước Triển khai (Implementation Steps)

1. Tạo các bảng `faculties`, `courses`, `posts`, `post_attachments`, `post_course_tags`, `comments`, `votes` kèm `GIN index` trên `posts.search_vector`.
2. Xây dựng `course-tagger.service.ts` và tích hợp vào `post-engine.service.ts` khi tạo/sửa bài viết.
3. Xây dựng `nested-comment.service.ts` trả về cấu trúc cây bình luận đã ẩn danh hóa các tác giả có `is_anonymous = true`.
4. Xây dựng `PostComposerModal.tsx` có tab Preview trực tiếp công thức LaTeX và Code Snippet.

## Kiểm chứng (Validation)
- Đăng bài có nội dung `"Hỏi về tích phân đường trong #MI1131 công thức $$\int_C \mathbf{F} \cdot d\mathbf{r}$$"` -> Bài viết phải tự động xuất hiện trong Course Feed của môn `MI1131` và có `has_latex = true`.
- Đánh dấu 1 bình luận là `Accepted Answer` -> `posts.accepted_comment_id` được cập nhật và người trả lời được cộng Karma.
