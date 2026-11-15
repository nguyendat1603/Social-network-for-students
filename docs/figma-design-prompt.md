# SCHOOL — STYLE REFERENCE & FIGMA PROMPT (MXH_HSSV)
> **Personal academic desktop for creative souls** — Reference: [`design.md`](../design.md)

Tài liệu này đồng bộ hệ thống giao diện của **MXH_HSSV (UniSphere)** theo đúng chuẩn thiết kế **School — Style Reference** trong [`design.md`](../design.md).

---

## 1. TRIẾT LÝ THIẾT KẾ CỐT LÕI (SCHOOL STYLE CONTRACT)

1. **Mặt bàn cá nhân (Personal Desktop Metaphor)**:
   - Nền trang (**Concrete Gray Canvas**): `#dbdbdb`
   - Các thẻ nội dung (**Paper White Widget Cards**): `#ffffff`, bo góc tròn trịa như viên sỏi (`border-radius: 20px`), đổ bóng nhẹ `rgba(0, 0, 0, 0.16) 0px 3px 6px 0px`, **tuyệt đối không dùng viền (no border)**.
   - Các bề mặt phụ: **Fog Mist** (`#f2f2f2`) cho nút pill, **Ash Input** (`#ededed`) cho ô nhập liệu (`border-radius: 25px`), **Sand Wash** (`#e2ceb8`) cho thẻ ghi chú ấm, và **Slate Veil** (`#6a728e`) cho widget thời tiết/trạng thái.
2. **Mono-First Typography (`IBM Plex Mono`)**:
   - Toàn bộ giao diện (tiêu đề, đoạn văn, nhãn, nút bấm, thời gian, mã môn học) đều sử dụng duy nhất font **`IBM Plex Mono`** (`font-weight: 400`, `line-height: 1.4`, tắt ligatures `"liga" 0, "calt" 0`).
   - Không dùng chữ in đậm (bold 700) cho tiêu đề; sự phân cấp thị giác đến từ kích thước (`11px`, `14px`, `16px`, `18px`, `25px`, `43px`) và nhịp điệu monospace.
3. **Quy ước Nhãn Ngoặc Đơn (`Parenthetical Caption`)**:
   - Mọi Widget Card đều mở đầu bằng một dòng nhãn nhỏ `11px` căn giữa nằm trong dấu ngoặc đơn: `(Y)our profile.`, `(Y)our campus feed.`, `(Y)our clock.`, `(Y)our weather.`, `(Y)our modules.`, `(Y)our question.`.
4. **Trò chơi Tô sáng Ký tự đơn (`The Highlighted-Letter Game`)**:
   - Một khối màu phẳng không bo góc, không khoảng đệm (`padding: 0`, `border-radius: 0`) với màu vàng **`#f9f5a2`** (`--color-highlight-yellow`) hoặc xanh cyan **`#c7f6ff`** (`--color-highlight-cyan`) nằm ngay sau một chữ cái đơn (thường là chữ `y` hoặc `Y` trong `(Y)our`).
5. **99% Achromatic (Đơn sắc tinh khiết)**:
   - Mọi văn bản chính đều dùng màu mực than **`#303030`** (`--color-charcoal-ink`), thông tin phụ dùng **`#808080`** (`--color-graphite`).

---

## 2. BẢNG MÃ MÀU & TOKENS CHUẨN (`variables.css`)

| Tên Token | Giá trị | Vai trò trong MXH_HSSV |
| :--- | :--- | :--- |
| `--color-concrete-gray` | `#dbdbdb` | Nền trang chính (Canvas) làm nổi bật các thẻ trắng |
| `--color-paper-white` | `#ffffff` | Bề mặt thẻ Widget Card, nút Verify nổi |
| `--color-charcoal-ink` | `#303030` | Màu chữ chính, tiêu đề, icon, nhãn |
| `--color-fog-mist` | `#f2f2f2` | Nền nút Pill Button, bề mặt phụ |
| `--color-ash-border` | `#ededed` | Nền ô Input (`25px` radius), đường phân cách mảnh |
| `--color-graphite` | `#808080` | Chữ metadata, thời gian, placeholder |
| `--color-sand-wash` | `#e2ceb8` | Thẻ điểm nhấn ấm (Công thức LaTeX, Góc ghi chú) |
| `--color-slate-veil` | `#6a728e` | Thẻ khí quyển mát (`(Y)our weather.`) |
| `--color-highlight-yellow` | `#f9f5a2` | Khối tô sáng chữ cái đơn `(Y)` và trạng thái active |
| `--color-highlight-cyan` | `#c7f6ff` | Khối tô sáng phụ cho chữ cái đơn và tag đặc biệt |
