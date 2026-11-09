import { AppError } from '../../common/errors/app.error';
import { SendMessageDTO, StartDirectConversationDTO } from './communication.types';

export const validateStartDirectConversation = (
  body: Record<string, unknown>
): StartDirectConversationDTO => {
  const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId.trim() : '';
  const initialMessage =
    typeof body.initialMessage === 'string' ? body.initialMessage.trim() : undefined;

  if (!targetUserId) {
    throw new AppError('Vui lòng chọn người nhận tin nhắn', 400, 'VALIDATION_ERROR');
  }

  return {
    targetUserId,
    initialMessage: initialMessage || undefined,
  };
};

export const validateSendMessage = (body: Record<string, unknown>): SendMessageDTO => {
  const messageType = (body.messageType as SendMessageDTO['messageType']) || 'TEXT';
  const content = typeof body.content === 'string' ? body.content.trim() : undefined;
  const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl.trim() : undefined;
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : undefined;
  const fileSizeBytes =
    typeof body.fileSizeBytes === 'number'
      ? body.fileSizeBytes
      : body.fileSizeBytes
      ? Number(body.fileSizeBytes)
      : undefined;

  if (!content && !fileUrl) {
    throw new AppError('Tin nhắn phải có nội dung văn bản hoặc tệp đính kèm', 400, 'VALIDATION_ERROR');
  }

  return {
    messageType: fileUrl ? 'FILE' : messageType,
    content: content || (fileName ? `Đã gửi tệp đính kèm: ${fileName}` : ''),
    fileUrl,
    fileName,
    fileSizeBytes,
  };
};
