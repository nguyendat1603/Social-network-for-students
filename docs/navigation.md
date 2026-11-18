# Điều hướng Campus

## Thanh bên

- **Trang chủ**: bản tin toàn trường.
- **Học tập**: Học phần, Kho tài liệu, Nhóm học & đồ án.
- **Cộng đồng**: Thảo luận khoa, Chợ sinh viên, Phòng trọ & ở ghép.
- **Cá nhân**: Tin nhắn, Thông báo, Uy tín & đặc quyền.
- **Hồ sơ**: bấm tài khoản ở cuối thanh bên; mock hiển thị yêu cầu đăng nhập thật.
- Kiểm duyệt chỉ hiển thị cho ADMIN/MODERATOR.

Các nhóm có thể đóng/mở riêng. Khi thu gọn toàn bộ thanh bên, tất cả chức
năng vẫn có biểu tượng và nhãn trợ năng/tooltip. Sở thích thu gọn được lưu
trong localStorage (`campus_navigation_preferences`), không chứa dữ liệu tài khoản.
Khi chuyển trang, nhóm chứa trang hiện tại tự mở.

Trên điện thoại có 5 mục: Trang chủ, Học phần, Tài liệu, Nhóm học, Menu.
Menu trình bày lại các nhóm và liên kết hồ sơ.

## Trung tâm học phần

`/courses` dùng danh mục học phần hiện có, tìm theo mã/tên và lọc khoa.
Chọn môn để mở thảo luận, hoặc đi thẳng đến một trong năm tab:

| Tab | Đường dẫn |
| --- | --- |
| Thảo luận | `/feed/course?code=...` |
| Hỏi đáp | `/course-reviews/forum?courseCode=...` |
| Tài liệu | `/resources?code=...` |
| Nhóm học | `/study-groups?code=...` |
| Đánh giá | `/course-reviews/:courseCode` |

Thảo luận lọc bài `DISCUSSION`; Hỏi đáp lọc `QUESTION` và cho phép tìm
câu đã có lời giải được chấp nhận. Các tab dùng chung mã học phần và dữ
liệu hiện có, không tạo kho dữ liệu riêng.

Kho tài liệu/Nhóm học từ thanh bên là chế độ toàn hệ thống. Khi truy cập
từ tab học phần, chúng được lọc theo môn. Trang chi tiết tài liệu/không gian
nhóm giữ các tab dựa trên học phần của bản ghi.

Các đường dẫn cũ, gồm `/course-reviews` và `/course-reviews/forum`, vẫn
hoạt động; chỉ bỏ liên kết trùng lặp trên thanh bên. `/feed/course` không có
mã môn sẽ yêu cầu chọn môn, không tự chọn ngầm IT3080.

## Kiểm tra

```powershell
npm run test:navigation
npm run test:demo
npm run build:frontend
npm run build:backend
```

Kiểm thử điều hướng kiểm tra mục cha được chọn duy nhất, năm tab giữ đúng
môn, dữ liệu mock theo môn, và ID học phần nhóm dạng UUID/số nguyên cũ.
Không thay đổi schema hay ghi dữ liệu vào database.
