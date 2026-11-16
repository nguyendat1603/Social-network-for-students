# Campus Social — Navigation UX v2 (prototype)

Đây là prototype HTML/CSS/JavaScript của Campus Social, phục vụ việc duyệt thiết kế. **Không tích hợp backend, không gửi dữ liệu thật.**

## Cách mở

1. Cách đơn giản nhất: mở file `Campus_Social_UX_Dieu_Huong_V2.html` được cung cấp riêng, có sẵn HTML + CSS + JS trong một file.
2. Nếu dùng bộ mã nguồn tách file: giải nén và mở `index.html`. Ba tệp `index.html`, `styles.css`, `app.js` phải nằm cạnh nhau.
3. Thử thay đổi chiều rộng cửa sổ hoặc dùng điện thoại để đánh giá bố cục responsive.

## Những gì đã sửa so với v1

- Trang chủ có phần **“Lần đầu đến đây?”**, người dùng có thể đọc hướng dẫn ngắn hoặc ẩn đi.
- Ba hành động khởi đầu được đặt tên theo nhu cầu: **Hỏi về môn học, Tìm tài liệu, Tìm nhóm**.
- Trang học phần nói rõ môn đang xem và có tab **Hỏi đáp / Tài liệu / Nhóm học**.
- Bổ sung **đường dẫn trang (breadcrumb)** và liên kết về học phần khi đi sâu sang tài liệu hoặc tìm nhóm theo môn.
- Bộ lọc tài liệu và tìm nhóm hiển thị rõ phạm vi môn học; không làm mất mã môn khi chuyển từ học phần.
- Thanh điều hướng mobile thêm mục **Đã lưu**, cùng danh sách môn đang theo dõi ngay trên trang chủ điện thoại.
- Giữ nguyên màu sắc, kiểu chữ, khoảng trắng và cấu trúc nội dung chủ đạo của v1.

## Kịch bản duyệt giao diện

Thử với một người chưa từng xem Campus Social:

1. Từ trang chủ, tìm nơi cần bấm để mở học phần `IT3080`.
2. Trong học phần, chuyển từ **Hỏi đáp** sang **Tài liệu** mà không phải nhập lại mã môn.
3. Xem thêm tài liệu `IT3080` trong kho tài liệu và tìm nút **Về trang học phần**.
4. Từ học phần, chuyển sang **Nhóm học** và xem nhóm đang cần người.
5. Trên điện thoại, lưu một bài viết rồi tự tìm lại ở mục **Đã lưu**.
6. Đánh giá xem lời hướng dẫn có hữu ích hay đang chiếm diện tích không cần thiết.

Ghi lại điểm người dùng bấm nhầm, lúc họ dừng lại để suy nghĩ và những nhãn họ không hiểu. Đừng giải thích giúp trước khi người dùng tự thử.

## Kiểm thử mã nguồn

- `node --check app.js`: kiểm tra cú pháp JS.
- `node navigation_smoke_test.cjs`: kiểm tra luồng trạng thái điều hướng bằng DOM giả lập.

Chưa thay thế cho kiểm thử trình duyệt thực, kiểm thử hỗ trợ bàn phím/đọc màn hình và thử nghiệm với người dùng thực.
