---
name: realtime-communication
description: >-
  Use this skill when implementing or modifying Module 7: Realtime Communication,
  including 1-on-1 Direct Messaging, Project/Course Group Chat with direct file attachments,
  Socket.IO WebSocket gateways, and Realtime Notifications (post replies, group invites, task deadlines).
---

# Module 7: Realtime Communication Skill

Tài liệu cơ sở: [docs/mvp-specification.md — Module 7](../../../docs/mvp-specification.md)

## Danh sách File Thuộc Module 7

- **Database**:
  - [database/schema/07_realtime_communication.sql](../../../database/schema/07_realtime_communication.sql)
- **Backend (`backend/src/modules/communication/` & `backend/src/jobs/`)**:
  - [communication.routes.ts](../../../backend/src/modules/communication/communication.routes.ts)
  - [communication.controller.ts](../../../backend/src/modules/communication/communication.controller.ts)
  - [communication.service.ts](../../../backend/src/modules/communication/communication.service.ts)
  - [communication.repository.ts](../../../backend/src/modules/communication/communication.repository.ts)
  - [communication.validation.ts](../../../backend/src/modules/communication/communication.validation.ts)
  - [communication.types.ts](../../../backend/src/modules/communication/communication.types.ts)
  - [gateways/chat.gateway.ts](../../../backend/src/modules/communication/gateways/chat.gateway.ts)
  - [gateways/notification.gateway.ts](../../../backend/src/modules/communication/gateways/notification.gateway.ts)
  - [services/direct-message.service.ts](../../../backend/src/modules/communication/services/direct-message.service.ts)
  - [services/group-chat.service.ts](../../../backend/src/modules/communication/services/group-chat.service.ts)
  - [services/realtime-notification.service.ts](../../../backend/src/modules/communication/services/realtime-notification.service.ts)
  - [jobs/task-deadline-reminder.job.ts](../../../backend/src/jobs/task-deadline-reminder.job.ts)
- **Frontend (`frontend/src/features/communication/`)**:
  - Pages: `MessengerPage.tsx`, `NotificationsPage.tsx`
  - Components: `DirectMessageList.tsx`, `ProjectGroupChatList.tsx`, `ChatConversationPanel.tsx`, `ChatFileAttachment.tsx`, `RealtimeNotificationBell.tsx`

## Quy tắc Nghiệp vụ & Kỹ thuật Bắt buộc

1. **Xác thực Kết nối WebSocket (`chat.gateway.ts` & `notification.gateway.ts`)**:
   - Mọi kết nối Socket.IO phải truyền JWT Access Token trong `socket.handshake.auth.token`.
   - Sau khi xác thực, tự động join socket vào room cá nhân `user:${userId}` để nhận thông báo thời gian thực và tin nhắn 1-1.

2. **Direct Messaging 1-1 (`direct-message.service.ts`)**:
   - Đảm bảo giữa 2 sinh viên `(userA, userB)` chỉ tồn tại **duy nhất 1 cuộc hội thoại `DIRECT`** (sắp xếp `min(userA, userB)` và `max(userA, userB)` hoặc tra cứu `conversation_participants` trước khi tạo mới).

3. **Group Chat Nhóm Đồ án / Học phần (`group-chat.service.ts`)**:
   - Đồng bộ chặt chẽ danh sách thành viên với `group_members` của Module 3 (`study-group`). Khi thành viên được duyệt vào nhóm đồ án, tự động thêm vào `conversation_participants` của phòng chat nhóm tương ứng.
   - Hỗ trợ gửi tin nhắn văn bản (`TEXT`), tài liệu đính kèm trực tiếp (`FILE`), và thông báo hệ thống (`SYSTEM`, ví dụ `"Nguyễn Văn A đã tham gia nhóm"`).

4. **Hệ thống Thông báo Thời gian thực (`realtime-notification.service.ts`)**:
   - Cung cấp hàm dùng chung `dispatchNotification(payload)` cho các module khác gọi tới khi:
     - Có bình luận trả lời bài đăng (`POST_REPLY`) hoặc câu trả lời được chọn là đúng (`ANSWER_ACCEPTED`).
     - Có đơn ứng tuyển mới hoặc kết quả duyệt vào nhóm đồ án (`GROUP_INVITE`, `APPLICATION_STATUS`).
     - Task trong Mini-Kanban sắp hết hạn trong vòng 24 giờ (`TASK_DEADLINE` chạy qua `task-deadline-reminder.job.ts`).
   - Lưu thông báo vào bảng `notifications` trước, sau đó emit sự kiện `notification:new` tới room `user:${recipientId}`.

## Các Bước Triển khai (Implementation Steps)

1. Viết DDL cho `conversations`, `conversation_participants`, `messages`, `notifications` trong `07_realtime_communication.sql`.
2. Cấu hình Socket.IO server trong `backend/src/config/socket.config.ts` và gắn `chat.gateway.ts` + `notification.gateway.ts`.
3. Triển khai phân trang con trỏ (cursor-based pagination) cho lịch sử tin nhắn (`GET /api/v1/communication/conversations/:convId/messages?cursor=...`).
4. Xây dựng `MessengerPage.tsx` và `RealtimeNotificationBell.tsx` tự động cập nhật badge số thông báo chưa đọc.

## Kiểm chứng (Validation)
- Gọi API tạo hội thoại 1-1 giữa cùng 2 sinh viên nhiều lần -> Luôn trả về cùng một `conversation_id`.
- Gửi tin nhắn qua Socket event `chat:send_message` -> Người nhận đang online nhận ngay sự kiện `chat:new_message` dưới 100ms và `conversations.last_message_at` được cập nhật.
