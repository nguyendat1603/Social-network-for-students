---
name: resource-hub
description: >-
  Use this skill when implementing or modifying Module 5: Document & Resource Hub,
  including hierarchical classification (Faculty -> Course -> Semester -> Document Type),
  file upload deduplication, direct PDF preview, download quota/Karma checks,
  document reliability Upvote/Downvote, and copyright/error reporting.
---

# Module 5: Document & Resource Hub Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 5](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 5

- **Database**:
  - [database/schema/05_document_resource_hub.sql](../../../database/schema/05_document_resource_hub.sql)
- **Backend (`backend/src/modules/resource-hub/`)**:
  - [resource-hub.routes.ts](../../../backend/src/modules/resource-hub/resource-hub.routes.ts)
  - [resource-hub.controller.ts](../../../backend/src/modules/resource-hub/resource-hub.controller.ts)
  - [resource-hub.service.ts](../../../backend/src/modules/resource-hub/resource-hub.service.ts)
  - [resource-hub.repository.ts](../../../backend/src/modules/resource-hub/resource-hub.repository.ts)
  - [resource-hub.validation.ts](../../../backend/src/modules/resource-hub/resource-hub.validation.ts)
  - [resource-hub.types.ts](../../../backend/src/modules/resource-hub/resource-hub.types.ts)
  - [services/document-hierarchy.service.ts](../../../backend/src/modules/resource-hub/services/document-hierarchy.service.ts)
  - [services/pdf-preview.service.ts](../../../backend/src/modules/resource-hub/services/pdf-preview.service.ts)
  - [services/document-rating.service.ts](../../../backend/src/modules/resource-hub/services/document-rating.service.ts)
- **Frontend (`frontend/src/features/resource-hub/`)**:
  - Pages: `ResourceHubPage.tsx`, `DocumentDetailPage.tsx`
  - Components: `FacultyCourseSemesterTree.tsx`, `UploadResourceModal.tsx`, `DocumentCard.tsx`, `InlinePdfPreview.tsx`, `ResourceReliabilityVote.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Phân tầng Tài liệu Chuẩn 4 Cấp (`document-hierarchy.service.ts`)**:
   - Mọi tài liệu upload bắt buộc phải gắn đầy đủ 4 cấp:
     1. `faculty_id` (Khoa/Viện)
     2. `course_id` (Mã môn học, ví dụ `IT3080`)
     3. `semester` (Kỳ học/Năm học chuẩn hóa dạng `YYYY.1`, `YYYY.2`, `YYYY.3`, ví dụ `2025.1`)
     4. `doc_type` (`MIDTERM_EXAM`, `FINAL_EXAM`, `ASSIGNMENT_PROJECT`, `LECTURE_SLIDE`, `SUMMARY_NOTE`)

2. **Chống Upload Trùng lặp & Kiểm tra File An toàn**:
   - Tính mã băm `SHA-256` (`file_sha256`) của nội dung file khi upload. Nếu `file_sha256` đã tồn tại trong cùng `course_id`, từ chối upload và trả về liên kết tới tài liệu đã có sẵn.
   - Chỉ cho phép các định dạng học thuật an toàn (`.pdf`, `.docx`, `.pptx`, `.zip`, `.png`, `.jpg`), kích thước tối đa `50MB`.

3. **Preview Trực tiếp & Kiểm soát Lượt tải (`pdf-preview.service.ts`)**:
   - Cung cấp Signed URL hoặc luồng stream PDF có hỗ trợ HTTP Range Requests để `InlinePdfPreview.tsx` hiển thị trực tiếp trên trình duyệt mà không cần tải toàn bộ file về máy.
   - Khi sinh viên bấm tải xuống (`POST /api/v1/resources/:docId/download`):
     - Kiểm tra hạn mức tải trong ngày dựa trên bậc Karma (`privilege_tiers`: mặc định 10 lượt/ngày cho sinh viên mới, không giới hạn khi `Karma >= 50`).
     - Không trừ lượt nếu sinh viên tải lại tài liệu đã tải trước đó hoặc tải tài liệu do chính mình upload.

4. **Đánh giá Độ tin cậy (`document-rating.service.ts`)**:
   - Sinh viên Upvote/Downvote tài liệu; mỗi Upvote hợp lệ cộng `+5 Karma` cho người đóng góp tài liệu (`uploader_id`).

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho `documents`, `document_votes`, `document_downloads` trong `05_document_resource_hub.sql`.
2. Xây dựng bộ lọc cây thư mục 4 cấp (`Faculty -> Course -> Semester -> Type`) trong `document-hierarchy.service.ts`.
3. Tích hợp kiểm tra `file_sha256`, tạo URL xem trước PDF và ghi nhận lượt tải.
4. Xây dựng giao diện `FacultyCourseSemesterTree.tsx` và trình xem `InlinePdfPreview.tsx`.

## Kiểm chứng (Validation)
- Upload cùng một file PDF 2 lần vào cùng môn học -> Lần 2 phải trả về `409 DUPLICATE_DOCUMENT_FILE`.
- Tài khoản có `< 50 Karma` tải quá 10 tài liệu khác nhau trong 1 ngày -> Lần thứ 11 trả về `429 DAILY_DOWNLOAD_LIMIT_REACHED` kèm gợi ý đóng góp tài liệu/trả lời câu hỏi để tăng Karma.
