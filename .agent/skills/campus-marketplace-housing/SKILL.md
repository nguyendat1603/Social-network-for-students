---
name: campus-marketplace-housing
description: >-
  Use this skill when implementing or modifying Module 6: Campus Marketplace & Housing,
  including student secondhand item listings (textbooks, calculators, hardware kits, dorm items),
  student-friendly price and condition filters, and roommate/housing finder with budget and lifestyle habit matching.
---

# Module 6: Campus Marketplace & Housing Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 6](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 6

- **Database**:
  - [database/schema/06_campus_marketplace_housing.sql](../../../database/schema/06_campus_marketplace_housing.sql)
- **Backend (`backend/src/modules/marketplace/`)**:
  - [marketplace.routes.ts](../../../backend/src/modules/marketplace/marketplace.routes.ts)
  - [marketplace.controller.ts](../../../backend/src/modules/marketplace/marketplace.controller.ts)
  - [marketplace.service.ts](../../../backend/src/modules/marketplace/marketplace.service.ts)
  - [marketplace.repository.ts](../../../backend/src/modules/marketplace/marketplace.repository.ts)
  - [marketplace.validation.ts](../../../backend/src/modules/marketplace/marketplace.validation.ts)
  - [marketplace.types.ts](../../../backend/src/modules/marketplace/marketplace.types.ts)
  - [services/item-listing.service.ts](../../../backend/src/modules/marketplace/services/item-listing.service.ts)
  - [services/housing-roommate.service.ts](../../../backend/src/modules/marketplace/services/housing-roommate.service.ts)
- **Frontend (`frontend/src/features/marketplace/`)**:
  - Pages: `StudentMarketplacePage.tsx`, `RoommateHousingPage.tsx`
  - Components: `MarketplaceItemCard.tsx`, `ItemConditionFilter.tsx`, `PostMarketplaceItemModal.tsx`, `HousingListingCard.tsx`, `LifestyleHabitFilter.tsx`, `PostHousingModal.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Không Cho phép Ẩn danh trong Giao dịch Mua bán & Nhà trọ**:
   - Để chống lừa đảo (`SCAM_HOUSING`), mọi bài đăng trong Module 6 bắt buộc hiển thị hồ sơ sinh viên đã xác thực (`Verified Student`) của người đăng (`seller_id` / `poster_id`), không hỗ trợ chế độ ẩn danh.
   - Cho phép nút **"Nhắn tin trực tiếp cho người đăng"** kết nối thẳng sang Module 7 (`Direct Messaging 1-1`) kèm thẻ trích dẫn mặt hàng/phòng trọ đang quan tâm.

2. **Chợ Thanh lý Đồ dùng Học tập (`item-listing.service.ts`)**:
   - Danh mục chuẩn: `TEXTBOOK` (Giáo trình), `CALCULATOR` (Máy tính cầm tay), `HARDWARE_KIT` (Kit vi điều khiển/linh kiện thực hành), `DORM_ITEM` (Đồ dùng phòng trọ), `OTHER`.
   - Hỗ trợ gắn `course_id` tùy chọn (ví dụ: Giáo trình Giải tích 1 gắn với `MI1111` để sinh viên học môn đó dễ tìm).
   - Nếu `is_free = true` (Tặng lại cho khóa sau), ép `price_vnd = 0` và cộng `+5 Karma` khi giao dịch hoàn tất.
   - Trạng thái: `AVAILABLE` -> `RESERVED` -> `SOLD`.

3. **Tìm Bạn ở ghép & Trọ Sinh viên (`housing-roommate.service.ts`)**:
   - Hỗ trợ bộ lọc kết hợp giữa ngân sách (`max_budget_vnd`), khoảng cách tới trường (`distance_to_campus_km`), và các tiêu chí lối sống:
     - `sleep_schedule`: `EARLY_BIRD` (Ngủ trước 23h), `NIGHT_OWL` (Thức khuya học bài), `FLEXIBLE`
     - `smoking_allowed`: `true` / `false`
     - `cooking_allowed`: `true` / `false`
     - `gender_preference`: `MALE`, `FEMALE`, `ANY`

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho `marketplace_items`, `marketplace_item_images`, `housing_listings` trong `06_campus_marketplace_housing.sql`.
2. Xây dựng bộ lọc đa điều kiện (giá, tình trạng đồ, mã môn học) trong `item-listing.service.ts`.
3. Xây dựng bộ lọc tìm phòng/bạn ở ghép theo ngân sách và thói quen sinh hoạt trong `housing-roommate.service.ts`.
4. Xây dựng giao diện `StudentMarketplacePage.tsx` và `RoommateHousingPage.tsx` kèm nút mở nhanh cửa sổ Chat 1-1.

## Kiểm chứng (Validation)
- Đăng mặt hàng với `is_free = true` nhưng truyền `price_vnd = 100000` -> Hệ thống phải tự chuẩn hóa `price_vnd = 0`.
- Lọc tìm bạn ở ghép với `max_budget_vnd = 2500000` và `smoking_allowed = false` -> Chỉ trả về các bài đăng khớp đồng thời cả 2 điều kiện.
