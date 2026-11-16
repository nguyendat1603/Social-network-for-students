# Campus Social UX v2 — tiến độ migration

## Sửa lỗi sau independent review (2026-11-16)

- Messenger: URL là nguồn chọn hội thoại; gắn kết quả tin nhắn với ID hội thoại, chặn request cũ và refresh sau gửi ở hội thoại đã rời. Panel được mount theo ID để kết quả gửi cũ không xóa bản nháp của hội thoại mới.
- Resource Hub: tách trạng thái catalog loading/ready/error; xử lý catalog rỗng, mã môn sai, lỗi hierarchy/catalog/danh sách; thêm thử lại và lối xem tất cả. Bỏ phản hồi cũ khi thay bộ lọc hoặc rời trang. Bộ lọc một cột trên mobile, có label liên kết đúng control.
- Composer: giới hạn theo chiều cao viewport, nội dung cuộn được; form và nút hành động thích ứng ở 320px. Giữ hook focus/Tab/Escape hiện có.
- Nhóm học: báo lỗi mã môn/API rõ ràng; nạp danh sách môn trước khi kiểm tra mã, giữ đường chọn lại môn và nút thử lại; không hiển thị empty-success khi lỗi.
- Review: năm tiêu chí có ID riêng qua useId, label focus đúng select. Homepage dùng dấu phân cách · giữa mã và tên môn.
- Test mới: `tests/campus-ux-regressions.browser.cjs`, chạy qua `node tests/campus-shell.browser.cjs http://127.0.0.1:5177 regressions`. Đã qua catalog/hierarchy/list lỗi và retry, catalog rỗng, mã môn sai và phục hồi, nhóm API lỗi, responsive 320/390/1440 × 600, modal cuộn/Tab/Escape/khôi phục focus, label review, delayed send A→B, stale read và stale error. Race Messenger trong review không còn tái hiện trong các ca này.
- Validation: typecheck và production build qua; 22/22 Node test qua; smoke 21 route ở 1440/390 qua; Demo development và production preview qua; `git diff --check` qua. Build/dev/preview cần chạy ngoài filesystem sandbox do esbuild bị chặn đọc đường dẫn cấu hình.
- Browser dùng fixture API và auth cô lập; chưa kiểm thử backend thật. Giữ nguyên các giới hạn SSO, persistence Đã lưu/theo dõi và backend end-to-end bên dưới. Không commit/push/merge/rebase/reset.

Nhánh: `feat/campus-ux-v2-shell`. Giữ nguyên các thay đổi đã có trong cùng phiên. Không commit, push, merge, reset; không sửa backend, database hay hợp đồng API.

## Phần đã triển khai

- Shell v2 dùng chung trên tám module: sidebar, header, điều hướng mobile, tìm kiếm, breadcrumb và menu tài khoản. Màu đỏ trầm, nền trắng ấm, khoảng cách và typography dựa trên `design-reference/campus-social-nav-v2/`.
- Homepage: bố cục editorial, hướng dẫn ban đầu, ba lối vào theo nhu cầu và danh mục học phần thật từ catalog. Không còn bài fallback hoặc tăng phiếu giả khi API lỗi.
- Review: danh mục, chi tiết, bộ lọc, thống kê và dialog viết review được hài hòa với v2. Lỗi tải có thông báo thay vì chờ vô hạn.
- Hồ sơ: bỏ nền gradient tối, chuẩn hóa form và badge xác thực, sửa bố cục mobile. Chờ profile tải xong trước khi mở form để tránh giữ giá trị của profile cũ.
- Messaging: danh sách hội thoại và nội dung thích ứng mobile; màu tin nhắn và composer phù hợp v2. Gửi thất bại giữ bản nháp và báo lỗi; phản hồi tải tin cũ không ghi đè lựa chọn mới. Đính kèm giữ nguyên API gửi URL, có kiểm tra giao thức và báo lỗi.
- Marketplace / housing: tiêu đề, chuyển mục, bộ lọc, card, nút liên hệ và form đăng tin được cập nhật. Không hiển thị danh sách rỗng như một lần tải thành công khi API lỗi.
- Karma / moderation: chuẩn hóa bề mặt, tab, bộ lọc, trạng thái và form; cải thiện độ tương phản trên nền sáng. Lỗi tải/cập nhật được hiển thị.
- Login: thay màn video/particle bằng layout editorial và form email/mật khẩu, không điền sẵn tài khoản hoặc mật khẩu mẫu. Đăng ký tiếp tục dùng trang có đầy đủ trường và API hiện có.
- Registration / OTP: cùng bảng màu và kiểu form v2, label liên kết với control, bố cục một cột trên mobile. OTP đọc email từ navigation state hoặc query, có khóa gửi lặp/cooldown; OTP preview chỉ hoạt động trong development.
- SSO callback: giữ route và chuyển vào profile nếu đã có phiên xác thực; khi chưa có phiên, hiển thị trạng thái chưa cấu hình và lối về đăng nhập. Đã bỏ thao tác tự dựng tên/subject/email mẫu rồi gọi SSO như đăng nhập thật. Service API SSO vẫn giữ nguyên, chưa có kết nối identity provider thực tế để chứng minh đăng nhập trường.
- Course navigation: mã môn đi giữa hỏi đáp, tài liệu, nhóm; tab có `aria-current`; breadcrumb có liên kết về học phần. Trang chi tiết tài liệu, bài viết và workspace lấy course code từ dữ liệu API. Chọn môn ở forum cập nhật URL; composer học phần mặc định đúng môn đang xem. Bộ lọc không tải toàn bộ dữ liệu khi mã môn không hợp lệ.
- Tương tác gây hiểu nhầm: bỏ Theo dõi chỉ đổi state cục bộ; chia sẻ chỉ xác nhận sau khi clipboard thành công; bỏ URL PDF mẫu điền sẵn trong form tài liệu. Chat nổi chuyển tới messenger thật; xóa danh sách bạn mẫu và cơ chế tự trả lời khỏi store cũ.
- Accessibility: thêm nhãn control, icon còn thiếu, trạng thái lỗi, hỗ trợ bàn phím cho prompt đăng bài, focus khi chuyển trang. Chín dialog/drawer dùng hook chung để focus ban đầu, giữ Tab trong dialog, Escape và khôi phục focus; dialog mount sẵn theo dõi trạng thái mở.

## Kiểm thử đã thực thi

- `npm.cmd --prefix frontend run typecheck`: thành công.
- `npm.cmd run build` trong frontend: thành công; Vite biến đổi 135 module. Vite/esbuild chạy ngoài filesystem sandbox vì sandbox không đọc được đường dẫn cấu hình.
- `node --test frontend/tests/*.test.cjs`: 22 passed, 0 failed.
- `git diff --check`: thành công.
- Chrome smoke: 1440, 1330, 1120, 811, 810, 540, 390, 320 px; navigation mobile, Escape/focus, anonymous mode, badge thông báo, composer, resource navigation và logout thành công.
- Chrome `all-routes`: 21 route ở 1440px và 390px, kiểm tra đúng pathname, có vùng nội dung, không tràn ngang; không có runtime exception. Có thêm ảnh SSO callback ở hai kích thước và kiểm tra callback khi có/chưa có phiên.
- 21 route: `/feed`, `/feed/department`, `/feed/course?code=IT3080`, `/feed/posts/demo-post`, `/course-reviews`, `/course-reviews/IT3080`, `/course-reviews/forum?courseCode=IT3080`, `/resources?code=IT3080`, `/resources/demo-document`, `/study-groups?code=IT3080`, `/study-groups/demo-group/workspace`, `/marketplace`, `/marketplace/housing`, `/messenger?convId=demo-conversation`, `/notifications`, `/karma`, `/profile`, `/admin/moderation`, `/login`, `/register-edu`, `/verify-otp`.
- Chrome tương tác: chuyển học phần sang tài liệu giữ mã môn; tab active; composer focus/Escape và khôi phục focus; API gửi tin trả lỗi 500 vẫn giữ bản nháp, hiển thị lỗi, không giả thành công.
- Chrome Demo development: mã sai bị từ chối; 4444 vào được; 15 trang demo mở được; profile/admin bị chặn; không tạo auth session thật; ghi bị từ chối; không có request backend trong demo; thoát xóa trạng thái demo.
- Chrome production preview: không có ô demo; sessionStorage demo giả không vượt qua đăng nhập.
- Đã xem ảnh desktop/mobile của homepage, profile, review, messaging, housing, moderation và registration; sửa các vấn đề phát hiện về logo, chat/tabbar, badge, độ tương phản và outline vùng main.
- Ảnh cuối: `C:/Users/HP/AppData/Local/Temp/opencode/campus-shell-1794818417792-92020/`.

Browser regression sử dụng API response chỉ trong trình duyệt test và tài khoản test cục bộ, không đưa dữ liệu đó vào production hoặc cấp quyền thật. Các lần test ban đầu có lỗi selector/path và xung đột hồ sơ Chrome khi chạy song song; đã sửa và các lần chạy cuối nêu trên thành công.

## Giới hạn và việc còn lại

- Chưa kiểm thử end-to-end với backend/tài khoản thật: đăng ký và nhận email OTP, đăng bài/upload/ứng tuyển, gửi/nhận tin thời gian thực, cập nhật chợ/nhà trọ, review và xử lý vi phạm. Cần môi trường cùng tài khoản có quyền phù hợp; kết quả browser fixture không thay thế xác nhận này.
- SSO thực chưa được cấu hình. Không thể hoàn thành kết nối identity provider trong phạm vi chỉ frontend khi không có cấu hình/luồng xác thực hợp lệ; không giả lập thành công.
- Prototype có Đã lưu và học phần đang theo dõi, nhưng repo chưa có integration persistence đã được xác nhận cho hai thao tác đó. Không thêm endpoint hoặc thao tác ghi giả. Danh mục môn hiện hiển thị catalog, không gọi là danh sách đang theo dõi.
- Có kiểm tra bàn phím/dialog và nhãn cơ bản, chưa có audit screen reader/WCAG toàn diện hoặc kiểm thử mọi tổ hợp dữ liệu, modal và quyền. Các route chính đã được kiểm tra; không khẳng định toàn bộ trạng thái nghiệp vụ đã được bao phủ.
- Cần người duyệt UX đối chiếu cuối với prototype và thử trên thiết bị thật. Style compatibility cũ vẫn được giữ ở những component đang sử dụng để tránh refactor không cần thiết.

## Xem local và chạy lại

Từ frontend:
```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5175
```
Mở `http://127.0.0.1:5175/login`; development demo dùng mã `4444`.

```powershell
node tests/campus-shell.browser.cjs http://127.0.0.1:5175 all-routes
node tests/campus-shell.browser.cjs http://127.0.0.1:5175 demo-dev
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4175
node tests/campus-shell.browser.cjs http://127.0.0.1:4175 demo-prod
```

## Tệp thay đổi trong toàn bộ phiên

- `frontend/CAMPUS_UX_V2_PROGRESS.md`
- `frontend/src/assets/styles/campus-pages.css`
- `frontend/src/components/common/CampusIcon.tsx`
- `frontend/src/components/common/VerifiedStudentBadge.tsx`
- `frontend/src/components/layout/CampusAppShell.module.css`
- `frontend/src/components/layout/CampusAppShell.tsx`
- `frontend/src/components/layout/CampusBreadcrumbs.tsx`
- `frontend/src/components/layout/FloatingChatBubbles.tsx`
- `frontend/src/components/layout/MainLayout.tsx`
- `frontend/src/features/communication/components/ChatConversationPanel.tsx`
- `frontend/src/features/communication/components/ChatFileAttachment.tsx`
- `frontend/src/features/communication/components/DirectMessageList.tsx`
- `frontend/src/features/communication/components/ProjectGroupChatList.tsx`
- `frontend/src/features/communication/components/RealtimeNotificationBell.tsx`
- `frontend/src/features/communication/pages/MessengerPage.tsx`
- `frontend/src/features/communication/pages/NotificationsPage.tsx`
- `frontend/src/features/course-review/components/LecturerReviewList.tsx`
- `frontend/src/features/course-review/components/SubjectQuestionSearch.tsx`
- `frontend/src/features/course-review/components/WriteAnonymousReviewModal.tsx`
- `frontend/src/features/course-review/pages/CourseReviewDetailPage.tsx`
- `frontend/src/features/course-review/pages/CourseReviewDirectoryPage.tsx`
- `frontend/src/features/course-review/pages/SubjectQaForumPage.tsx`
- `frontend/src/features/feed/components/NestedCommentTree.tsx`
- `frontend/src/features/feed/components/PostCard.tsx`
- `frontend/src/features/feed/components/PostComposerModal.tsx`
- `frontend/src/features/feed/pages/CampusFeedPage.tsx`
- `frontend/src/features/feed/pages/CourseFeedPage.tsx`
- `frontend/src/features/feed/pages/PostDetailPage.tsx`
- `frontend/src/features/identity/components/AcademicInfoForm.tsx`
- `frontend/src/features/identity/components/AnonymousHandleManager.tsx`
- `frontend/src/features/identity/components/SkillsLanguageSelector.tsx`
- `frontend/src/features/identity/pages/AcademicProfilePage.tsx`
- `frontend/src/features/identity/pages/LandingAuthPage.tsx`
- `frontend/src/features/identity/pages/OtpVerificationPage.tsx`
- `frontend/src/features/identity/pages/RegisterEduPage.tsx`
- `frontend/src/features/identity/pages/SsoCallbackPage.tsx`
- `frontend/src/features/marketplace/components/HousingListingCard.tsx`
- `frontend/src/features/marketplace/components/ItemConditionFilter.tsx`
- `frontend/src/features/marketplace/components/LifestyleHabitFilter.tsx`
- `frontend/src/features/marketplace/components/MarketplaceItemCard.tsx`
- `frontend/src/features/marketplace/components/PostHousingModal.tsx`
- `frontend/src/features/marketplace/components/PostMarketplaceItemModal.tsx`
- `frontend/src/features/marketplace/pages/RoommateHousingPage.tsx`
- `frontend/src/features/marketplace/pages/StudentMarketplacePage.tsx`
- `frontend/src/features/moderation/components/AutoModThresholdSettings.tsx`
- `frontend/src/features/moderation/components/KarmaPointsSummary.tsx`
- `frontend/src/features/moderation/components/ModerationQueueTable.tsx`
- `frontend/src/features/moderation/components/PrivilegeUnlockProgress.tsx`
- `frontend/src/features/moderation/components/ReportViolationModal.tsx`
- `frontend/src/features/moderation/components/UserSanctionModal.tsx`
- `frontend/src/features/moderation/pages/AcademicKarmaPage.tsx`
- `frontend/src/features/moderation/pages/AdminModerationDashboardPage.tsx`
- `frontend/src/features/resource-hub/components/DocumentCard.tsx`
- `frontend/src/features/resource-hub/components/UploadResourceModal.tsx`
- `frontend/src/features/resource-hub/pages/DocumentDetailPage.tsx`
- `frontend/src/features/resource-hub/pages/ResourceHubPage.tsx`
- `frontend/src/features/study-group/components/CreateRecruitmentModal.tsx`
- `frontend/src/features/study-group/components/GroupSharedDocuments.tsx`
- `frontend/src/features/study-group/components/KanbanTaskCard.tsx`
- `frontend/src/features/study-group/components/MiniKanbanBoard.tsx`
- `frontend/src/features/study-group/components/TeamApplicationDrawer.tsx`
- `frontend/src/features/study-group/components/TeamRecruitmentCard.tsx`
- `frontend/src/features/study-group/pages/GroupWorkspacePage.tsx`
- `frontend/src/features/study-group/pages/TeammateMatchingPage.tsx`
- `frontend/src/hooks/useDialog.ts`
- `frontend/src/main.tsx`
- `frontend/src/store/chatBubbles.store.ts`
- `frontend/tests/campus-navigation.test.cjs`
- `frontend/tests/campus-shell.browser.cjs`
