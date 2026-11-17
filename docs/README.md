# Tài liệu dự án MXH_HSSV

Cập nhật ngày 17/11/2026 sau khi đối chiếu source `9a7e33b`.

| Tài liệu | Nội dung | Cách sử dụng |
| --- | --- | --- |
| [Đặc tả MVP](mvp-specification.md) | Mục tiêu nghiệp vụ của tám module | Định hướng ban đầu; không phải danh sách đã hoàn thành |
| [API](api-specification.md) | Route hiện tại, quyền, input/output, validation và giới hạn | Tích hợp frontend/backend |
| [Kiến trúc](architecture.md) | Thành phần runtime, luồng dữ liệu, quyền và khoảng trống | Hiểu code và lập kế hoạch kỹ thuật |
| [Dữ liệu và ERD](database-erd.md) | Bảng/quan hệ/ràng buộc, DDL snapshot, lệch code–schema | Thiết kế migration và dựng DB |
| [Triển khai](deployment-guide.md) | Env, SQL, cài đặt, build, kiểm tra, phát hành/rollback | Dựng local/staging; đọc blocker trước production |
| [Báo cáo tính năng](feature-audit.md) | Hiện trạng từng nhóm tính năng, tính thực tế, đề xuất giản lược | Chủ dự án quyết định phạm vi MVP |
| [Thiết kế giao diện](design.md) | Tham chiếu style | Đọc cùng source UI hiện tại |
| [Figma prompt](figma-design-prompt.md) | Prompt và định hướng giao diện | Tài liệu tham khảo thiết kế |

Tài liệu hiện trạng phân biệt **code đã có**, **chưa triển khai**, **yêu cầu nghiệm thu** và **đề xuất cần quyết định**. Các đề xuất loại bỏ trong báo cáo chưa được áp dụng vào sản phẩm. Database cloud và triển khai production chưa được kiểm chứng trong đợt rà soát này.
