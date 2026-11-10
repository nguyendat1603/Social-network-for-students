# HƯỚNG DẪN & MASTER PROMPT CHO FIGMA / UI-UX DESIGNER
# NỀN TẢNG MẠNG XÃ HỘI HỌC THUẬT SINH VIÊN (UNISPHERE - MXH_HSSV)
## THEO MẪU THIẾT KẾ TRONG FOLDER `Design/Design.txt` (NỀN TRẮNG · NÚT XANH FACEBOOK · GRADIENT INSTAGRAM)

Tài liệu này chứa **Master Prompt** đồng bộ 100% với file thiết kế Figma gốc tại `Design/Design.txt`, kết hợp visual theme:
- **Nền trắng / Slate sáng**: Canvas `#F8FAFC`, Cards `#FFFFFF`, Đường viền `#E2E8F0`.
- **Nút bấm hành động màu xanh Facebook**: Brand Blue `#1877F2` (hover `#166FE5`, active `#0E5AAB`), chữ trắng đậm, bo góc 8px.
- **Điểm nhấn màu sắc rực rỡ phong cách Instagram**: Instagram Sunset Gradient `linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)` cho Logo UniSphere, Avatar story ring, thanh tiến trình Academic Karma và các huy hiệu vinh danh.

---

## CÁCH SỬ DỤNG
1. **Dùng với Figma AI / AI UI Designer (Galileo AI, v0, Relume, Claude + Figma MCP)**: Copy toàn bộ phần code block bên dưới và dán vào prompt box.
2. **Dùng với UI/UX Designer**: Gửi file này kết hợp cùng file `Design/Design.txt` để dựng wireframe, high-fidelity prototypes và design system components.

---

```markdown
### SYSTEM ROLE & INSTRUCTION FOR FIGMA AI / UI-UX DESIGNER
Act as a Principal Product Designer & Design System Architect. Create a production-ready, pixel-perfect Figma Design System and full screen flows for "UniSphere" (MXH_HSSV) - an Academic Social Network for University Students based on the exact design tokens and layouts in "Design/Design.txt".

The aesthetic mood must be:
- Base: Crisp Clean White (Canvas: #F8FAFC, Surface Cards: #FFFFFF, Borders: #E2E8F0).
- Primary Actions: Facebook Blue (#1877F2, Hover: #166FE5, Active: #0E5AAB, Text: #FFFFFF, Bold 600, Radius: 8px).
- Vibrant Accents: Instagram Sunset Gradient (linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)) and Instagram Badge Gradient (linear-gradient(135deg, #405de6, #833ab4, #c13584, #e1306c, #fd1d1d)) for Logo, Story Avatar rings, Karma Progress meters, and Top Contributor Badges.

---

## 1. DESIGN SYSTEM FOUNDATION & DESIGN TOKENS (FROM DESIGN.TXT)

### 1.1. Color Palette (Clean White Light Theme)
- Canvas & Surfaces:
  - Canvas Background: #F8FAFC
  - Card & Surface Background: #FFFFFF
  - Elevated / Pill Background: #F1F5F9
  - Input Background: #FFFFFF (Focus ring: 2px #1877F2 with 15% opacity)
- Typography Colors:
  - Heading 1-3 & Titles: #0F172A (Deep Slate)
  - Body Text: #475569 (Legible Charcoal)
  - Subtext & Metadata: #64748B (Muted Slate)
  - Primary Action Text: #FFFFFF
- Primary Brand & Action (Facebook Blue):
  - brand-primary: #1877F2 (Official Facebook Blue)
  - brand-hover:   #166FE5
  - brand-active:  #0E5AAB
  - brand-light:   #E7F3FF (Tinted pill / selected tab background)
  - brand-indigo:  #4338CA (Academic indigo accent from Design.txt)
- Instagram Vibrant Accents:
  - ig-sunset-gradient: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)
  - ig-badge-gradient:  linear-gradient(135deg, #405de6 0%, #5851db 20%, #833ab4 40%, #c13584 60%, #e1306c 80%, #fd1d1d 100%)
  - ig-pink:   #E1306C
  - ig-purple: #833AB4
  - ig-orange: #FD1D1D
- Academic Semantic Badges (Design.txt Tokens):
  - emerald-500: #10B981 (Verified Student tick, Accepted Answers, Positive Karma)
  - amber-500:   #F59E0B (Academic Karma tier, Course ratings)
  - rose-500:    #F43F5E (Report violation, urgent deadlines)
  - sky-500:     #0EA5E9 (Study Groups, channels)
  - violet-500:  #8B5CF6 (Special academic honors)
- Borders & Shadows:
  - Border: #E2E8F0 (Subtle, crisp 1px border)
  - Shadow Card: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)
  - Shadow Hover: 0 4px 6px -1px rgba(15, 23, 42, 0.08)

### 1.2. Typography (Inter Scale from Design.txt)
- Display: 32px / SemiBold 600 / Line-height 150% (#0F172A)
- H1 (Page Header): 24px / SemiBold 600 / Line-height 150% (#0F172A)
- H2 (Section Title): 20px / Regular 400 - SemiBold 600 / Line-height 150% (#0F172A)
- H3 (Card Title): 16px - 17px / SemiBold 600 (#0F172A)
- Body Regular: 13px - 14px / Regular 400 (#475569, line-height 1.6)
- Caption / Meta: 11px - 12px / Medium 500 (#64748B)
- Code & Formula: JetBrains Mono / KaTeX font for Math ($$) and Code snippets (```).

### 1.3. Spacing & Shapes (Design.txt Spacing System)
- Space Scale: space/4 (4px), space/8 (8px), space/12 (12px), space/16 (16px), space/24 (24px), space/32 (32px), space/48 (48px).
- Radius: 6px (Badges), 8px (Facebook buttons, Inputs), 12px (Cards, Modals), 16px (Containers), 9999px (Pills, Story rings).

---

## 2. GLOBAL 3-COLUMN DESKTOP ARCHITECTURE (1440PX)

Align with screen "02.1 · Bảng tin học thuật" in Design.txt:
1. Left Navigation Sidebar (260px - Sticky, Background: #FFFFFF, Border-right: 1px solid #E2E8F0):
   - Logo: "🎓 UniSphere · MXH_HSSV" with Instagram gradient ring and text.
   - Module Navigation (8 Active Items):
     - 👤 1. Hồ sơ & Định danh (/profile)
     - 📰 2. Bảng tin Học thuật (/feed)
     - 👥 3. Tìm Nhóm & Đồ án (/groups)
     - ⭐ 4. Đánh giá Môn học & Q&A (/courses)
     - 📚 5. Kho Tài liệu Mở (/resources)
     - 🛒 6. Chợ Sinh viên & Trọ (/marketplace)
     - 💬 7. Tin nhắn & Trao đổi (/messages)
     - ⚡ 8. Karma & Đặc quyền (/karma)
   - Active state: Background #E7F3FF (Facebook blue tint), Text #1877F2 (Facebook blue bold), Border-left 3px solid #1877F2.
   - Admin navigation: 🛡️ Dashboard Kiểm duyệt (Red tint).
2. Center Canvas (720px - Scrollable, Canvas: #F8FAFC):
   - Page Header with title and Facebook Blue Primary Action button (+ Đăng bài / Đặt câu hỏi).
   - Scope Segmented Control: [Campus Feed] | [Department Feed] | [Course Feed].
   - Search bar + Filter Pills (Mới nhất, Nổi bật, Chưa có câu trả lời).
   - Post Feed Cards (#FFFFFF cards with subtle #E2E8F0 border and shadow-card).
3. Right Sidebar (310px - Sticky, Background: #F8FAFC):
   - Widget 1: "Góc học tập cá nhân" (#FFFFFF card, 12px radius):
     - Student Avatar with Instagram Story Ring (2.5px gradient).
     - Name ("Nguyễn Minh Anh ✓"), Cohort & Faculty ("K65 · Công nghệ thông tin").
     - Separator 1px #E2E8F0.
     - Academic Karma meter: Large 26px #1877F2 number (450), "⚡ Bậc 2" pill, Instagram sunset gradient progress bar, text "Còn 300 điểm đến Bậc 3".
   - Widget 2: "Chủ đề nổi bật" (#FFFFFF card):
     - Trending hashtags (#IT3080 Mạng máy tính, #MI2020 Xác suất thống kê, #DoAnTotNghiep K65).
   - Widget 3: Quick Action banner (Facebook blue to Indigo gradient, "Chia sẻ tài liệu học tập +30 Karma").

---

## 3. FULL SCREEN FLOWS (EXACT SCREEN CODES FROM DESIGN.TXT)

### MODULE 1: HỒ SƠ & ĐỊNH DANH SINH VIÊN
- 01.1 · Đăng ký sinh viên: Split screen (Left: 640px #4338CA intro banner with university student community illustrations; Right: #FFFFFF form with .edu email input and Facebook blue submit button).
- 01.2 · Xác thực email OTP: 6-digit OTP input boxes with countdown timer and resend link.
- 01.3 · Hồ sơ học thuật: Cover banner, Avatar with Verified tick xanh, MSSV, Niên khóa, Chuyên ngành, Kỹ năng, và Anonymous Handle preview (@SV_AnDanh_4829).

### MODULE 2: BẢNG TIN HỌC THUẬT & THẢO LUẬN
- 02.1 · Bảng tin học thuật: 3-column layout, multi-scope tab bar, Post Cards with Upvote/Downvote/Helpful buttons and course tag pills (#IT3080).
- 02.2 · Soạn bài viết: Post Composer with LaTeX formula preview ($$\int$$), Code Block snippet (```cpp), PDF attachment pill, Anonymous mode toggle switch.
- 02.3 · Thảo luận & lời giải: Post detail with green highlighted "Accepted Answer" banner, threaded nested comment tree with "Đánh dấu là câu trả lời đúng" button.

### MODULE 3: TÌM NHÓM & KHÔNG GIAN ĐỒ ÁN
- 03.1 · Tìm đồng đội: Recruitment card grid with Target Grade pill (Mục tiêu: Điểm A+), Missing role tags ([Frontend], [Backend]), Facebook blue "Ứng tuyển vào nhóm" button.
- 03.2 · Không gian đồ án: Project header with sprint progress bar, Mini-Kanban Board (4 columns: Cần làm, Đang làm, Đang review, Hoàn thành), drag-and-drop task cards with assignee avatars.
- 03.3 · Ứng tuyển vào nhóm: Slide-out drawer modal with application message, CV attachment, and leader review actions (Chấp nhận / Từ chối).

### MODULE 4: ĐÁNH GIÁ MÔN HỌC & HỎI ĐÁP
- 04.1 · Tổng quan môn học: 4-criterion visual breakdown (Độ khó 3.8/5, Khối lượng bài tập 4.2/5, Điểm công bằng 4.5/5, Tài liệu đọc 3.6/5) with horizontal rating bars and radar chart.
- 04.2 · Đánh giá giảng viên: Anonymous review cards by semester with pros/cons tags and helpful endorsement counter.
- 04.3 · Hỏi đáp môn học: Subject forum Q&A with search filter, course code tags, and accepted answers.

### MODULE 5: KHO TÀI LIỆU HỌC TẬP MỞ
- 05.1 · Kho tài liệu: Hierarchical breadcrumb filter (Khoa > Môn > Học kỳ > Đề thi/Slide/Đồ án), 98% hữu ích rating badge, instant duplicate hash detector, in-app clean PDF previewer with watermark.

### MODULE 6: CHỢ SINH VIÊN & NHÀ TRỌ
- 06.1 · Chợ sinh viên: Product cards (Giáo trình, máy tính Casio, kit Arduino), price in VND (120.000đ), condition tag (Mới 99%), "Nhắn tin trao đổi" button.
- 06.2 · Nhà trọ & bạn cùng phòng: Dorm/room cards with price (2.2 triệu/tháng), distance (Cách trường 800m), lifestyle habit compatibility badge (95% Hợp gu sinh hoạt: Giờ giấc tự do, Không hút thuốc, Thức khuya).
- 06.3 · Chi tiết sản phẩm: Image gallery, verified seller card, direct message CTA.

### MODULE 7: TIN NHẮN & THÔNG BÁO THỜI GIAN THỰC
- 07.1 · Tin nhắn: Split messenger (Left: Chat list with online dots and unread counters; Right: Message canvas with code snippet display, inline PDF viewer, and typing indicator).
- 07.2 · Trung tâm thông báo: Categorized tabs (Tất cả, Hỏi đáp, Đồ án, Hệ thống) with high-contrast unread indicators.

### MODULE 8: KARMA, ĐẶC QUYỀN & KIỂM DUYỆT
- 08.1 · Karma & đặc quyền: Level 1 (Tân sinh viên: 0-199 Karma) -> Level 2 (Sinh viên tích cực: 200-749 Karma) -> Level 3 (Đại sứ học thuật: 750+ Karma), unlocked privileges list, Karma transaction ledger (+15 trả lời, +30 chia sẻ đề thi).
- 08.2 · Hàng đợi kiểm duyệt: Moderator review table with auto-hide status (3/5 reports - Đã tạm ẩn), quick action buttons (Phê duyệt giữ lại, Xóa vĩnh viễn, Cảnh cáo tác giả).
- 08.3 · Báo cáo vi phạm: Modal with reason selection (Lộ đề thi/Gian lận, Lừa đảo trọ, Toxic, Spam).

---

## 4. FIGMA OUTPUT REQUIREMENTS
1. Color Styles: Slate 50-900, Facebook Blue 50-700, Instagram Sunset Gradient, Semantic Emerald/Amber/Rose/Sky/Violet.
2. Typography Styles: Inter Display/H1/H2/H3/Body/Caption.
3. Interactive Components: Facebook Blue Primary Buttons (Default, Hover, Active, Disabled), Instagram story ring avatars, Post cards, Kanban cards, Review breakdown bars.
4. Frames: 1440px Desktop 3-Column Frames + 390px Mobile Responsive Frames.
```
