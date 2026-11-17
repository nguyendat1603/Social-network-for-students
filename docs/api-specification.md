# Đặc tả API HTTP MXH_HSSV

Ngày đối chiếu: 17/11/2026; mã nguồn gốc `9a7e33b`. Đây là danh mục route và hợp đồng hiện tại, không phải xác nhận các endpoint đã chạy thành công với database cloud. Base URL local: `http://localhost:4000/api/v1`.

## 1. Quy ước

Request có body dùng `Content-Type: application/json`. Route có xác thực dùng `Authorization: Bearer <accessToken>`. Ký hiệu quyền: **P** công khai; **A** đã đăng nhập; **V** có auth và middleware verified student; **M** admin/moderator được controller kiểm tra. Kiểm tra chủ sở hữu/thành viên được ghi riêng. Đường dẫn trong các bảng đều tính từ `/api/v1`.

Thành công mặc định 200; các controller tạo tài nguyên thường trả 201:

```json
{"success":true,"data":{},"meta":null,"error":null}
```

Lỗi từ middleware chung:

```json
{"success":false,"data":null,"meta":null,"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu đầu vào không hợp lệ.","details":[{"field":"email","message":"Định dạng email không hợp lệ."}]}}
```

Lỗi thường gặp: 400 đầu vào/quy tắc nghiệp vụ; 401 thiếu/sai token; 403 thiếu quyền; 404 không tồn tại; 409 trùng dữ liệu; 429 cooldown OTP; 500 lỗi nội bộ/database. `AppError` cung cấp code cụ thể. Route không tồn tại và lỗi parser không có bảo đảm cùng cấu trúc với mọi lỗi nghiệp vụ. Chưa có định dạng lỗi bảo mật thống nhất cho production.

Các API feed, forum, resources dùng `page`, `limit` (mặc định 1/20), `data` là danh sách và `meta` chứa phân trang. Không suy rộng phân trang này cho các API trả mảng còn lại. Request camelCase; nhiều record response giữ tên cột snake_case từ DB. Chưa có serializer thống nhất; không tự đổi tên trường phía client.

## 2. Hệ thống và định danh

| Method | Đường dẫn | Quyền | Đầu vào / kết quả |
| --- | --- | --- | --- |
| GET | `/health` | P | Tên dịch vụ, phase, database, timestamp; không truy vấn DB |
| GET | `/identity/catalog` | P | Danh mục khoa và môn |
| POST | `/identity/register-edu` | P | `email,password,fullName`; tùy chọn `studentCode,facultyId,cohort,major,className`; 201, userId và hạn OTP |
| POST | `/identity/verify-otp` | P | `email,otpCode`; trả accessToken, refreshToken, user |
| POST | `/identity/resend-otp` | P | `email`; trả hạn OTP mới |
| POST | `/identity/login` | P | `email,password`; trả accessToken, refreshToken, user |
| POST | `/identity/oauth/school/callback` | P | `email,fullName,ssoSubjectId`, tùy chọn `avatarUrl`; hiện tin danh tính client gửi, chưa xác minh OAuth |
| POST | `/identity/refresh` | P | `refreshToken`; trả cặp token mới |
| GET | `/identity/profile/me` | A | Hồ sơ của caller |
| GET | `/identity/profile/:userId` | A | Hồ sơ theo userId |
| PUT | `/identity/profile` | V | Các trường hồ sơ và `skills[]` |
| PATCH | `/identity/anonymous-handle` | V | `anonymousHandle`, tùy chọn `anonymousAvatar` |

Đăng ký: password dài 6–100; fullName 2–120; facultyId UUID. Domain lấy từ `ALLOWED_EDU_DOMAINS` và chấp nhận subdomain. OTP đúng sáu chữ số, mặc định TTL 300 giây, tối đa 5 lần thử, gửi lại sau 60 giây. Ngoài production, đăng ký/gửi lại trả `devOtpPreview`; chưa có gửi email thật. Không cung cấp `devOtpPreview` ở production.

Hồ sơ cho phép `studentCode,fullName,avatarUrl,facultyId,major,cohort,className,careerGoal,bio,skills`. Mỗi skill có `skillName,category,proficiencyLevel`, tối đa 30 skill. Category: TECHNICAL/LANGUAGE/SOFT_SKILL; level: BEGINNER/INTERMEDIATE/ADVANCED/EXPERT. Đổi biệt danh có cooldown mặc định 30 ngày. Schema chi tiết: `identity.validation.ts`.

Ví dụ đăng nhập:

```http
POST /api/v1/identity/login
Content-Type: application/json

{"email":"student@sis.hust.edu.vn","password":"your-local-test-password"}
```

Không có route GET bắt đầu OAuth, logout server, quên mật khẩu hoặc đổi mật khẩu trong router hiện tại. Refresh chưa có kho thu hồi/rotation bảo đảm token cũ hết hiệu lực.

## 3. Bảng tin và hỏi đáp

| Method | Đường dẫn | Quyền | Đầu vào / kết quả |
| --- | --- | --- | --- |
| GET | `/feed` | P | Query `scope,facultyId,courseId,courseCode,postType,sort,q,page,limit`; items + meta |
| GET | `/feed/posts/:postId` | P | Chi tiết bài và bình luận |
| POST | `/feed/posts` | V | CreatePost bên dưới; 201 |
| POST | `/feed/posts/:postId/vote` | V | `voteType`: UPVOTE/DOWNVOTE/HELPFUL |
| POST | `/feed/posts/:postId/comments` | V | `contentBody`, tùy chọn `parentCommentId,isAnonymous`; 201 |
| POST | `/feed/comments/:commentId/vote` | V | `voteType`: UPVOTE/DOWNVOTE/HELPFUL |
| PATCH | `/feed/posts/:postId/comments/:commentId/accept` | V | Không cần body; quyền tác giả kiểm tra trong service |

CreatePost: `title` 4–255 ký tự, `contentBody` 5–20000; `feedScope` CAMPUS/DEPARTMENT/COURSE (mặc định CAMPUS); `postType` DISCUSSION/QUESTION/ANNOUNCEMENT; tùy chọn UUID `facultyId,courseId`, `isAnonymous`, tối đa 10 `attachments`. Attachment: `fileUrl` URL, `fileName`, `fileType`, `fileSize` không âm. Comment dài 1–10000, parentCommentId UUID. Sort: new/hot/unanswered. Không có endpoint sửa/xóa bài hoặc bình luận trong router hiện tại.

```json
{"feedScope":"CAMPUS","postType":"QUESTION","title":"Hỏi về bài tập","contentBody":"Mình cần giải thích cách làm bài này.","isAnonymous":false}
```

Các route đọc công khai không gắn optional auth middleware, nên gửi Bearer token không tự làm `req.user` có dữ liệu hoặc bật chế độ xem danh tính admin.

## 4. Nhóm học tập

Tất cả route dưới đây có A. Service kiểm tra thành viên/trưởng nhóm tùy thao tác; router chưa dùng V.

| Method | Đường dẫn | Đầu vào / kết quả |
| --- | --- | --- |
| GET | `/study-groups` | Query `courseId,targetGrade,roleName,onlyRecruiting,search` |
| POST | `/study-groups` | `courseId,semester,groupName,projectTopic?,targetGrade,maxMembers,slots[]`; 201 |
| POST | `/study-groups/:groupId/apply` | `slotId,coverLetter,portfolioUrl?`; 201 |
| PATCH | `/study-groups/:groupId/applications/:applicationId` | Trưởng nhóm; `status`: APPROVED/REJECTED |
| GET | `/study-groups/:groupId/workspace` | Thành viên; nhóm, thành viên, task, tài liệu |
| POST | `/study-groups/:groupId/tasks` | Thành viên; `title,description?,assigneeId?,dueDate?,status?`; 201 |
| PATCH | `/study-groups/:groupId/tasks/:taskId` | Thành viên; các trường task và `positionOrder?` |
| DELETE | `/study-groups/:groupId/tasks/:taskId` | Thành viên; `{deleted:true}` |
| POST | `/study-groups/:groupId/documents` | Thành viên; `title,fileUrl,fileSizeBytes?`; 201 |

Tên nhóm tối thiểu 3 ký tự, maxMembers 2–15, targetGrade A+/A/B+/PASS. Mỗi slot: `roleName,requiredSkills[],quantityNeeded`. Ứng tuyển cần coverLetter tối thiểu 10 ký tự. Task status: TODO/IN_PROGRESS/REVIEW/DONE; title tối thiểu 2 khi tạo. File nhóm chỉ ghi metadata URL.

**Sai khác chặn tích hợp:** validator/type của module đang ép `courseId` thành number, trong SQL `courses.id` là UUID. Không có payload courseId có thể thỏa mãn cả hai một cách đúng đắn với schema trong repo. Cần sửa code hoặc migration thống nhất trước khi nghiệm thu.

## 5. Review môn học

| Method | Đường dẫn | Quyền | Đầu vào / kết quả |
| --- | --- | --- | --- |
| GET | `/course-reviews/directory` | P | Query `facultyId?` |
| GET | `/course-reviews/courses/:courseCode` | P | Môn, review và tổng hợp |
| GET | `/course-reviews/forum/search` | P | `courseCode,courseId,q,onlyAccepted,page,limit`; items + meta |
| POST | `/course-reviews` | V | Payload review; 201 |

Payload: UUID `courseId`, tùy chọn UUID/null `lecturerId`; `semester` YYYY.1/2/3; `difficultyScore,workloadScore,gradingFairnessScore,teachingQualityScore` là số nguyên 1–5; `readingLoadScore` mặc định 3; `reviewContent` 15–8000; `tipsForJunior` tối đa 3000; `expectedGrade` tối đa 10; `isAnonymous` mặc định true. Code hiện có năm tiêu chí, đặc tả cũ mô tả bốn. Chưa có xác thực người review thực sự đã học môn đó.

## 6. Kho tài liệu

| Method | Đường dẫn | Quyền | Đầu vào / kết quả |
| --- | --- | --- | --- |
| GET | `/resources/hierarchy` | P | Cây khoa → môn → kỳ → loại |
| GET | `/resources` | P | Query `facultyId,courseId,courseCode,semester,docType,q,page,limit` |
| GET | `/resources/:docId` | P | Metadata chi tiết |
| POST | `/resources/upload` | V | Metadata JSON, không phải multipart; 201 |
| POST | `/resources/:docId/download` | V | URL tải/xem, tên, số lượt tải |
| POST | `/resources/:docId/vote` | V | `voteType`: UPVOTE/DOWNVOTE |

Upload cần UUID `facultyId,courseId`; `semester`; `docType` MIDTERM_EXAM/FINAL_EXAM/ASSIGNMENT_PROJECT/LECTURE_SLIDE/SUMMARY_NOTE; `title` 4–255; `fileUrl,fileName`; tùy chọn `description,previewUrl,fileSize,fileSha256`. fileSize metadata tối đa 50 MiB; không phải kiểm tra kích thước bytes đã tải lên server. Nếu không có hash 64 ký tự, server hash URL/tên/kích thước, không hash nội dung tệp. Quota tải không bảo vệ URL công khai được trả trong metadata.

## 7. Chợ và nhà trọ

Tất cả route có A; quyền chủ tin được service kiểm tra khi đổi trạng thái.

| Method | Đường dẫn | Đầu vào / kết quả |
| --- | --- | --- |
| GET | `/marketplace/items` | Query `category,condition,courseId,maxPriceVnd,onlyFree,status,search` |
| POST | `/marketplace/items` | `title,description,category,priceVnd,isFree,condition,courseId?,pickupLocation?,imageUrls?`; 201 |
| PATCH | `/marketplace/items/:itemId/status` | `status`: AVAILABLE/RESERVED/SOLD |
| GET | `/marketplace/housing` | Query `listingType,maxBudgetVnd,maxDistanceKm,sleepSchedule,smokingAllowed,cookingAllowed,genderPreference,status,search` |
| POST | `/marketplace/housing` | Payload nhà trọ; 201 |
| PATCH | `/marketplace/housing/:listingId/status` | `status`: OPEN/CLOSED |

Category: TEXTBOOK/CALCULATOR/HARDWARE_KIT/DORM_ITEM/OTHER. Condition: NEW/LIKE_NEW_90/USED_GOOD/SLIGHTLY_DAMAGED. Nhà trọ: `listingType` ROOMMATE_WANTED/ROOM_FOR_RENT; `title,description,addressDistrict,monthlyRentVnd`; tùy chọn `distanceToCampusKm,maxBudgetVnd,sleepSchedule,smokingAllowed,cookingAllowed,genderPreference`. sleepSchedule EARLY_BIRD/NIGHT_OWL/FLEXIBLE; genderPreference MALE/FEMALE/ANY. Không có thanh toán, đặt cọc, xác thực chủ nhà hay bảo đảm giao dịch. courseId của chợ cũng đang dùng number khác UUID SQL.

## 8. Hội thoại và thông báo

Tất cả có A. Quyền tham gia hội thoại được kiểm tra trong repository khi đọc/gửi tin.

| Method | Đường dẫn | Đầu vào / kết quả |
| --- | --- | --- |
| GET | `/communication/conversations` | Hội thoại của caller |
| POST | `/communication/conversations/direct` | `targetUserId,initialMessage?`; lấy/tạo hội thoại; 201 |
| GET | `/communication/conversations/:conversationId/messages` | Query `cursor?`; mảng tin |
| POST | `/communication/conversations/:conversationId/messages` | `content?` hoặc `fileUrl?`; tùy chọn `messageType,fileName,fileSizeBytes`; 201 |
| GET | `/communication/notifications` | `{items,unreadCount}` từ tối đa 30 thông báo mới nhất |
| PATCH | `/communication/notifications/read` | `notificationId?`; thiếu ID sẽ đánh dấu tất cả của caller; `{updated:true}` |

Chưa có WebSocket/SSE contract. Không hứa cập nhật ngay khi có tin mới. unreadCount hiện chỉ đếm trong tối đa 30 item được lấy, không phải tổng chưa đọc toàn tài khoản. Bộ lọc chưa đọc ở UI hoạt động trên tập item đã tải.

## 9. Kiểm duyệt và Karma

| Method | Đường dẫn | Quyền | Đầu vào / kết quả |
| --- | --- | --- | --- |
| GET | `/moderation/karma/me` | A | Tổng điểm, tier và lịch sử |
| GET | `/moderation/karma/privileges` | A | Đặc quyền của caller |
| GET | `/moderation/karma/leaderboard` | A | Query `limit,facultyId` |
| POST | `/moderation/reports` | A | `targetType,targetId,reasonCode,description?`; 201 |
| GET | `/moderation/admin/queue` | M | Query `status,targetType,reasonCode,page,limit` |
| PATCH | `/moderation/admin/queue/:targetType/:targetId/resolve` | M | `status,actionTaken?,sanctionTargetUser?,reason?` |
| POST | `/moderation/admin/actions` | M | `targetType,targetId,actionTaken,reason,targetUserId?,expiresAt?,deductKarma?`; 201 |
| GET | `/moderation/admin/actions` | M | Lịch sử xử lý |
| GET | `/moderation/admin/settings` | A | Hiện thiếu kiểm tra role đọc cấu hình |
| PATCH | `/moderation/admin/settings/:reasonCode` | M | `thresholdCount,isEnabled` |

Resolve status: RESOLVED_REMOVED/RESOLVED_DISMISSED. Danh mục target/reason/action chính xác nằm ở `backend/src/common/constants/moderation-thresholds.constant.ts`; không nhận giá trị tự đặt. Cập nhật threshold hiện chưa có validation chặt cho số nguyên dương. Không giả định khóa user sẽ vô hiệu token hiện tại.

- targetType: POST, COMMENT, DOCUMENT, COURSE_REVIEW, MARKETPLACE_ITEM, HOUSING_LISTING.
- reasonCode: LEAKED_EXAM, SCAM_HOUSING, HARASSMENT_TOXIC, COPYRIGHT_WRONG_DOC, SPAM. Ngưỡng mặc định tương ứng: 3, 3, 5, 5, 5; cấu hình DB có thể thay đổi.
- actionTaken: AUTO_HIDE, DELETE_CONTENT, WARN, TEMPORARY_BAN, PERMANENT_BAN.

## 10. Tiêu chí nghiệm thu hợp đồng

- Mỗi route protected trả 401 khi thiếu/sai token; caller sai quyền hoặc ngoài nhóm/hội thoại trả 403; người thường không xử lý được admin action.
- Validator và schema thống nhất UUID/courseId; tất cả truy vấn projection phải dùng cột có thật.
- Payload ẩn danh không lộ author ID/hồ sơ thật, kể cả record lồng nhau.
- Tạo nội dung và tài liệu hợp lệ có thể đọc lại; vote/accept/download có kết quả nhất quán khi lặp và khi đồng thời.
- Pagination trả đúng items/meta, frontend không làm mất meta khi cần chuyển trang.
- Không cho callback SSO tự khai hoạt động trên môi trường công khai. Hoàn thành gửi email trước khi mở đăng ký thật.
- Kiểm thử tích hợp cần chạy trên DB staging dựng từ SQL; test UI/demo không đủ chứng minh contract backend.

Đây là tiêu chí cần đạt, chưa phải kết quả test. Các khoảng trống và quyết định sản phẩm được theo dõi trong [báo cáo tính năng](feature-audit.md).
