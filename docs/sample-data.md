# Dữ liệu mẫu phát triển

## Xem ngay, không cần database

Đăng nhập `gakusei` / `4444`. Chế độ chỉ xem hiện có:

- 5 khoa, 20 học phần, 30 tác giả giả lập.
- 100 bài viết ở các phạm vi toàn trường, khoa và học phần.
- 240 bình luận (bao gồm phản hồi lồng nhau), câu trả lời được chấp nhận.
- 794 bình chọn khớp với số đếm trong bộ dữ liệu.
- 20 tài liệu với PDF minh họa bố cục (không phải giáo trình thật).
- 10 nhóm học và các công việc minh họa.

Trang chủ tải 20 bài mỗi lần; dùng **Tải thêm bài viết** để xem tiếp.
Chỉ bài có phạm vi CAMPUS xuất hiện trên trang chủ (60 bài).
Mock hỗ trợ tìm kiếm, lọc, sắp xếp và mở chi tiết. Không ghi dữ liệu,
không trộn vào kết quả API và không gửi email/thông báo ra bên ngoài.

Nguồn dữ liệu chung: `frontend/src/demo/sample-data.ts`.
Tài liệu và nhóm mock: `frontend/src/demo/demo.fixtures.ts`.

## Nạp bản tin vào database phát triển

Từ thư mục gốc:

```powershell
npm run seed:check
```

Lệnh này chỉ kiểm tra quyền đọc và đếm bản ghi hiện có. Khóa public có
thể bị RLS giới hạn nên số đếm không nhất thiết là toàn bộ database.

Để ghi, cần cấu hình `SUPABASE_SERVICE_ROLE_KEY` trong `backend/.env`
và xác nhận đây là project phát triển, không phải dữ liệu production.
Không đặt khóa quản trị trong frontend, không commit và không gửi qua chat.

```powershell
$env:SEED_ALLOW_SAMPLE_DATA = "campus-sample-v1"
npm run seed:demo
Remove-Item Env:SEED_ALLOW_SAMPLE_DATA
```

Seed hiện nạp **5 khoa, 20 học phần, 30 tài khoản, 100 bài, 240 bình luận,
794 bình chọn và thẻ học phần**. Tài liệu/nhóm học hiện mới bổ sung ở mock;
chưa seed database vì cần đối chiếu schema nhóm đang triển khai với schema SQL.

Các tài khoản seed không dùng để đăng nhập: mật khẩu ngẫu nhiên bị bỏ đi,
email dùng miền `.invalid`. Đăng nhập bằng tài khoản phát triển có sẵn để
kiểm thử thao tác thật.

### An toàn và khả năng chạy lại

- UUID cố định theo namespace `ca6e2026`, tên/mã có nhãn Mẫu/DEMO.
- Khoa, học phần và hồ sơ có dấu `campus-sample-v1`.
- Chỉ thêm bản ghi chưa tồn tại; không cập nhật nội dung hiện có.
- Tạo bình luận trước khi gắn tham chiếu câu trả lời được chấp nhận.
- Không chạy khi `NODE_ENV=production`; cần chốt xác nhận riêng để ghi.
- Không thay đổi schema, RLS, tài khoản hiện có, file hay storage bucket.
- REST insert theo lô không phải một transaction toàn bộ. Nếu lỗi giữa chừng,
  có thể còn dữ liệu đã ghi; sửa nguyên nhân rồi chạy lại để bổ sung phần thiếu.
- Không chạy hai lệnh seed cùng lúc hoặc để người dùng tương tác trong lúc seed.

Chưa cung cấp lệnh xóa tự động để tránh xóa các tương tác thật phát sinh trên
bài mẫu. Khi cần dọn, kiểm tra liên kết và sao lưu trước; chỉ nhắm tới UUID
trong namespace seed, tuyệt đối không truncate các bảng dùng chung.

## Kiểm tra

```powershell
npm run test:demo
npm run build:frontend
npm run build:backend
```

Kiểm tra dữ liệu bao gồm số lượng, ID duy nhất, liên kết, số đếm bình chọn /
bình luận, phân trang, tìm kiếm, sắp xếp, ẩn danh và màn hình chi tiết.
