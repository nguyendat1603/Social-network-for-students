# Báo cáo tính năng và mức độ thực tế

Ngày rà soát: 17/11/2026. Baseline: `9a7e33b`. Phương pháp: đọc router/controller/validator/service, SQL, dependency và màn hình frontend. Đây là kiểm tra mã nguồn; chưa chạy liên thông với Supabase cloud, chưa kiểm chứng các tuyên bố về RLS, hiệu năng hoặc “hoàn tất MVP” trong README cũ.

## 1. Cách đọc trạng thái

- **Có triển khai**: thấy code UI/API/nghiệp vụ; vẫn cần test tích hợp để xác nhận dùng được.
- **Một phần**: có luồng nhưng thiếu thành phần hoặc có sai khác schema rõ ràng.
- **Chưa có**: chỉ có mô tả, file rỗng hoặc cấu hình không được kết nối.
- Đề xuất **giữ/giản lược/hoãn/bỏ cơ chế** là để chủ dự án xem xét; lần cập nhật tài liệu này không xóa tính năng hay sửa hành vi runtime.

## 2. Danh mục tính năng

| Nhóm | Tính năng hiện diện | Hiện trạng và giới hạn | Đề xuất |
| --- | --- | --- | --- |
| Định danh | Đăng ký email trường, mật khẩu; cấp/xác minh/gửi lại OTP | Một phần: có hash/TTL/số lần thử/cooldown, chưa gửi email | Giữ, hoàn thành email trước phát hành |
| Định danh | Login, refresh JWT, lưu phiên frontend | Có triển khai; chưa có thu hồi phiên đầy đủ, quên/đổi mật khẩu | Giữ; bổ sung phục hồi tài khoản |
| Định danh | School SSO | Chưa phải OAuth thật; tin email/subject do client khai và phát token | Chặn trên môi trường công khai; tích hợp provider hoặc hoãn |
| Hồ sơ | MSSV, khoa, khóa, ngành, lớp, bio, kỹ năng, mục tiêu nghề nghiệp | Có triển khai; chưa phải xác minh các thuộc tính với trường | Giữ hồ sơ gọn; mục tiêu nghề nghiệp/ngoại ngữ là tùy chọn |
| Ẩn danh | Sinh biệt danh, cooldown, bài/bình luận/review ẩn danh | Có triển khai; cần test rò rỉ danh tính qua mọi payload | Giữ cho hỏi đáp/review, cần moderation |
| Danh mục | Khoa, môn học | Có API/dữ liệu seed | Giữ; cần người quản lý cập nhật danh mục |
| Bảng tin | Campus/Department/Course, lọc/tìm/sắp xếp, chi tiết bài | Có triển khai; chưa có sửa/xóa bài và bình luận qua API | Giữ; bổ sung quyền sửa/xóa nội dung của mình |
| Hỏi đáp | Câu hỏi, bình luận phân cấp, vote và chọn đáp án | Có triển khai; cần kiểm thử quyền tác giả/chống thưởng lặp | Ưu tiên cao |
| Nội dung học thuật | Hashtag môn, khối code/copy, nhận dạng ký hiệu LaTeX | Một phần: công thức hiển thị code, chưa render toán; chưa syntax highlight | Giữ code cơ bản; chỉ thêm render toán khi có nhu cầu |
| Nhóm | Tạo tin tuyển theo môn/kỳ, vị trí/kỹ năng, mục tiêu điểm, ứng tuyển/duyệt | Một phần: có API/UI nhưng courseId number khác UUID SQL | Ưu tiên cao sau sửa tích hợp |
| Workspace | Thành viên, task bốn cột, người nhận việc, deadline, tài liệu URL | Một phần: có code nhưng projection hồ sơ lệch SQL | Giữ task gọn; chưa cần thay thế Trello/Drive |
| Review | Danh mục/chi tiết môn, review môn/giảng viên, điểm tổng hợp, mẹo học | Có triển khai; code có năm điểm số, chưa xác minh đã học môn | Giữ review môn; cân nhắc hoãn chấm giảng viên |
| Forum theo môn | Tìm câu hỏi theo môn/từ khóa/đã có đáp án | Có triển khai trên dữ liệu feed | Dùng như bộ lọc của feed môn, tránh hai luồng hỏi đáp trùng nhau |
| Tài liệu | Cây khoa/môn/kỳ/loại; đăng metadata URL, xem PDF, vote, tải | Một phần: chưa có pipeline upload bytes/storage | Ưu tiên cao; trước mắt gọi đúng là chia sẻ liên kết |
| Tài liệu | Chống trùng SHA-256 | Một phần: hash client hoặc hash metadata, không bảo đảm trùng nội dung | Hoãn lời hứa chống trùng nội dung tới khi server hash bytes |
| Chợ | Đồ cũ, lọc giá/tình trạng/môn, tặng 0đ, trạng thái tin | Một phần: có code, projection và courseId lệch schema | Giữ giai đoạn sau; không xây thanh toán lúc này |
| Nhà ở | Tin trọ/ở ghép; lọc ngân sách/khoảng cách/giờ giấc/hút thuốc/nấu ăn | Một phần: dữ liệu tự khai, chưa xác minh phòng/chủ nhà/khoảng cách | Hoãn nếu thiếu người kiểm duyệt; ưu tiên ở ghép trong cộng đồng |
| Chat | Hội thoại 1-1, chat nhóm đồ án, text/tệp URL | Một phần: REST có code, thiếu realtime và có projection lệch SQL | Giữ chat tối giản nếu cần liên hệ trong ứng dụng |
| Thông báo | Danh sách, lọc chưa đọc, đánh dấu từng tin/tất cả, điều hướng | Có triển khai REST/UI; chỉ tải 30 tin mới nhất; số chưa đọc không toàn cục | Giữ; sửa đếm/phân trang trước khi gọi là inbox đầy đủ |
| Thời gian thực | Push chat/thông báo, gateway Socket.IO | Chưa có transport/listener hoạt động | Hoãn hoặc triển khai một phương án khi có yêu cầu rõ |
| Nhắc deadline | Nhắc task sắp đến hạn | Chưa có scheduler/job chạy | Hoãn; deadline hiển thị trong nhóm đủ cho bản đầu |
| Kiểm duyệt | Báo cáo, ngưỡng tự ẩn, hàng đợi, gỡ/bỏ qua, hành động và nhật ký | Có code; quyền đọc settings còn thiếu role; khóa user chưa bảo đảm vô hiệu JWT | Giữ, bắt buộc trước cộng đồng thật |
| Karma | Điểm cho vote/đáp án/task/tặng đồ, ledger, bảng xếp hạng | Một phần: code gọi `karma_ledger` nhưng SQL không tạo bảng | Giản lược, không coi điểm là chứng nhận uy tín |
| Đặc quyền | Tier, quota tải theo điểm, cờ tạo nhóm tùy chỉnh | Một phần: quota không bảo vệ file URL công khai; cờ nhóm chưa có luồng đầy đủ | Bỏ ràng buộc học tập theo điểm; dùng chống spam riêng |
| Trải nghiệm | Shell điều hướng, breadcrumb, mobile, demo chỉ đọc ở development | Có triển khai và test frontend; demo không chứng minh backend | Giữ phục vụ kiểm thử/trình diễn |

## 3. Các cơ chế ít giá trị hoặc chưa hợp lý cần quyết định

| Cơ chế | Vấn đề thực tế | Đề xuất để xem xét |
| --- | --- | --- |
| +5 Karma cho task tự tạo rồi chuyển DONE | Người dùng có thể tạo nhiều task vô giá trị; không có bằng chứng chất lượng hay đóng góp cho cộng đồng | Bỏ thưởng Karma toàn hệ thống cho task; chỉ theo dõi tiến độ nội bộ nhóm |
| +5 Karma khi tự đánh dấu tin tặng đồ SOLD | Không có người nhận xác nhận, tạo tin giả dễ; không phản ánh chất lượng học thuật | Bỏ thưởng, giữ chức năng tặng đồ 0đ |
| Điểm cao được tải tài liệu không giới hạn, người mới bị quota | Cản trở đúng người mới cần học; URL công khai vẫn bypass được giới hạn | Bỏ gắn quyền học tập với Karma; nếu cần chống lạm dụng dùng rate limit và storage riêng tư |
| Trusted Scholar mở “nhóm tùy chỉnh” | Chỉ thấy cờ quyền, chưa có luồng sản phẩm rõ; tạo nhóm học tập đã là tính năng thiết yếu | Bỏ đặc quyền này khỏi MVP hoặc xác định use case riêng trước |
| Bảng xếp hạng Karma toàn trường | Khuyến khích chạy điểm và cạnh tranh số lượng; chưa đủ người dùng để có ý nghĩa | Hoãn; nếu giữ chỉ dùng ghi nhận đóng góp có kiểm chứng |
| UPVOTE/DOWNVOTE/HELPFUL cùng tồn tại | Hai tín hiệu tích cực khó phân biệt, thêm tải nhận thức và luật tính điểm | MVP chọn một nút “Hữu ích”; giữ accepted answer cho câu hỏi |
| Forum hỏi bài độc lập với feed môn | Cùng dữ liệu nhưng hai lối đăng/tìm khiến thảo luận bị chia nhỏ | Gộp vào tab câu hỏi của feed môn |
| Review năm tiêu chí rất gần nhau | workload và reading load chồng lặp; người dùng ít có động lực điền đủ | Dùng 2–3 tiêu chí rõ: độ khó, khối lượng, mức hữu ích; phần còn lại bình luận |
| Review giảng viên ẩn danh khi chưa xác minh đã học | Dễ thành nhận xét thiếu căn cứ và tăng gánh kiểm duyệt | Hoãn review cá nhân giảng viên; tập trung kinh nghiệm môn/kỳ học |
| Matching nhà trọ theo thói quen quá chi tiết | Chỉ lọc dữ liệu tự khai, không phải thuật toán ghép phù hợp; dữ liệu dễ thiếu | Giữ khu vực/ngân sách và vài tiêu chí tùy chọn; không quảng bá matching thông minh |
| SSO “một chạm” khi không có provider | Tạo cảm giác xác thực trường nhưng thực tế có thể mạo danh | Tạm bỏ khỏi luồng công khai tới khi có OAuth thật; giữ email OTP sau khi tích hợp email |
| Redis + queue + Socket.IO + S3/MinIO ngay MVP | Các thành phần chưa nối vào code, tăng chi phí vận hành trước khi chứng minh nhu cầu | Hoãn; một API + PostgreSQL + storage đủ cho bản đầu, realtime thêm sau |

Không coi toàn bộ một module là “vô nghĩa”: phần lớn giải quyết nhu cầu sinh viên có thật. Vấn đề chính là phạm vi quá rộng và các cơ chế thưởng/quyền chưa có bằng chứng hữu ích. Chưa tự ý loại bỏ mục nào.

## 4. Các blocker kỹ thuật cần xử lý

| Ưu tiên | Phát hiện | Bằng chứng trong repo / tác động |
| --- | --- | --- |
| P0 trước mở công khai | SSO nhận danh tính không có xác minh provider | `identity.routes.ts`, `school-sso-oauth2.strategy.ts`; có thể cấp JWT cho email tự khai, kể cả user đã tồn tại |
| P0 trước mở đăng ký thật | Không có gửi OTP qua email | `edu-otp.strategy.ts` chỉ lưu/trả mã; mail config và email job rỗng |
| P1 tích hợp | courseId number khác UUID SQL | `study-group.validation.ts`, `marketplace.types.ts` và `01_identity_verification.sql` |
| P1 tích hợp | Truy vấn hồ sơ sai bảng/cột | Nhóm/chợ/chat query `users.full_name/avatar_url`, có chỗ `academic_profiles.student_id`; SQL dùng `academic_profiles.full_name/avatar_url/student_code` |
| P1 dữ liệu | Thiếu DDL `karma_ledger` | Karma service dùng bảng này; không có CREATE TABLE trong tám schema SQL |
| P1 an toàn quyền | JWT còn hiệu lực sau thay đổi trạng thái user | Auth middleware chỉ xác minh JWT; cần cưỡng chế trạng thái khóa/thu hồi phiên |
| P1 nhất quán | Nhiều bước ghi nhóm/điểm không nguyên tử | SDK nhiều request; lỗi giữa chừng hoặc đồng thời có thể lệch membership/điểm |
| P1 hợp đồng | Một số route admin/settings và pagination chưa nhất quán | GET settings chỉ auth; client API chỉ trả data, làm mất meta phân trang |
| P2 trải nghiệm | Thông báo chỉ đếm chưa đọc trong 30 tin mới nhất | `realtime-notification.service.ts`; bỏ sót tin chưa đọc cũ |
| P2 chất lượng | Không có kiểm thử backend tích hợp đầy đủ | Thư mục test backend chủ yếu là placeholder; UI/demo không bao phủ DB |

P0/P1 ở đây là ưu tiên của đợt rà soát dựa trên code, không phải kết luận đã khai thác trên hệ thống đang chạy.

## 5. Phạm vi MVP đề nghị

Thí điểm một trường với bốn luồng: (1) email trường + hồ sơ gọn; (2) hỏi đáp theo môn + đáp án hữu ích; (3) chia sẻ tài liệu; (4) tuyển nhóm + task cơ bản. Giữ báo cáo/kiểm duyệt và thông báo REST hỗ trợ các luồng này. Chat tối giản có thể giữ nếu không chuyển người dùng sang công cụ khác.

Hoãn nhà trọ, review giảng viên, realtime/job phức tạp và bảng xếp hạng. Chợ đồ cũ có thể mở sau khi cộng đồng học tập có người dùng. Không thêm AI matching, thanh toán, điểm thưởng phức tạp hoặc thông số hiệu năng chưa đo.

Nghiệm thu bằng các kịch bản có giá trị: sinh viên mới vào và hỏi được một câu; người khác trả lời và được chọn đáp án; tìm đúng tài liệu môn/kỳ; ứng tuyển và vào đúng workspace; người ngoài không đọc được chat nhóm; báo cáo được xử lý và nội dung vi phạm không còn xuất hiện. Các kịch bản phải chạy trên DB staging dựng được từ repo.

## 6. Giới hạn xác minh

Kết quả kiểm tra ngày 17/11/2026: build backend và frontend đều đạt; 22 test hiện có về điều hướng/demo/thông báo đều đạt. Danh mục API đã đối chiếu đủ 60 route HTTP (gồm health); phụ lục dữ liệu có đủ 34 CREATE TABLE từ tám file schema. Link tương đối và code fence của bộ tài liệu đã được kiểm tra. Build frontend chạy ngoài sandbox sau khi esbuild gặp giới hạn quyền đọc thư mục; không sửa source để vượt lỗi môi trường.

Lần cập nhật này hoàn thiện tài liệu và rà soát source, không sửa các blocker runtime nêu trên và không tự loại bỏ tính năng. Kết quả typecheck/build/test ghi trong commit bàn giao không thay cho kiểm thử DB hoặc review bảo mật độc lập. Chủ dự án cần quyết định phạm vi ở mục 3–5 trước khi triển khai thay đổi hành vi.
