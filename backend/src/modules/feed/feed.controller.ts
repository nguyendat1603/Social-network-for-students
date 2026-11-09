import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { feedService } from './feed.service';
import { FeedScope, PostType } from './feed.types';
import {
  createCommentSchema,
  createPostSchema,
  voteSchema,
} from './feed.validation';

export class FeedController {
  async listFeed(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await feedService.listFeed(
        {
          scope: req.query.scope as FeedScope | undefined,
          facultyId: req.query.facultyId as string | undefined,
          courseId: req.query.courseId as string | undefined,
          courseCode: req.query.courseCode as string | undefined,
          postType: req.query.postType as PostType | undefined,
          sort: req.query.sort as 'new' | 'hot' | 'unanswered' | undefined,
          q: req.query.q as string | undefined,
          page: req.query.page ? Number(req.query.page) : 1,
          limit: req.query.limit ? Number(req.query.limit) : 20,
        },
        req.user?.role
      );
      sendSuccess(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = createPostSchema.parse(req.body);
      const post = await feedService.createPost(
        req.user!.userId,
        input,
        req.user!.role
      );
      sendSuccess(res, post, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async getPostDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const detail = await feedService.getPostDetail(postId, req.user?.role);
      sendSuccess(res, detail);
    } catch (err) {
      next(err);
    }
  }

  async votePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const { voteType } = voteSchema.parse(req.body);
      const result = await feedService.votePost(
        req.user!.userId,
        postId,
        voteType
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async voteComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = String(req.params.commentId);
      const { voteType } = voteSchema.parse(req.body);
      const result = await feedService.voteComment(
        req.user!.userId,
        commentId,
        voteType
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const input = createCommentSchema.parse(req.body);
      const comment = await feedService.addComment(
        postId,
        req.user!.userId,
        input,
        req.user!.role
      );
      sendSuccess(res, comment, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async acceptAnswer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const commentId = String(req.params.commentId);
      const result = await feedService.acceptAnswer(
        postId,
        commentId,
        req.user!.userId
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const feedController = new FeedController();
