import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { communicationService } from './communication.service';
import {
  validateSendMessage,
  validateStartDirectConversation,
} from './communication.validation';

export class CommunicationController {
  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conversations = await communicationService.listMyConversations(userId);
      sendSuccess(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  async startDirectConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const dto = validateStartDirectConversation(req.body);
      const conversation = await communicationService.startDirectConversation(userId, dto);
      sendSuccess(res, conversation, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conversationId = String(req.params.conversationId);
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      const messages = await communicationService.listMessages(conversationId, userId, cursor);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conversationId = String(req.params.conversationId);
      const dto = validateSendMessage(req.body);
      const message = await communicationService.sendMessage(conversationId, userId, dto);
      sendSuccess(res, message, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await communicationService.listNotifications(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notificationId =
        typeof req.body?.notificationId === 'string' ? req.body.notificationId : undefined;
      const result = await communicationService.markNotificationsRead(userId, notificationId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const communicationController = new CommunicationController();
