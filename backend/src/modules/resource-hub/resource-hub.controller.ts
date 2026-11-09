import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { resourceHubService } from './resource-hub.service';
import { DocumentType } from './resource-hub.types';
import {
  documentVoteSchema,
  uploadDocumentSchema,
} from './resource-hub.validation';

export class ResourceHubController {
  async getHierarchy(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tree = await resourceHubService.getHierarchyTree();
      sendSuccess(res, tree);
    } catch (err) {
      next(err);
    }
  }

  async listResources(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await resourceHubService.listResources({
        facultyId: req.query.facultyId as string | undefined,
        courseId: req.query.courseId as string | undefined,
        courseCode: req.query.courseCode as string | undefined,
        semester: req.query.semester as string | undefined,
        docType: req.query.docType as DocumentType | undefined,
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });
      sendSuccess(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async uploadResource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = uploadDocumentSchema.parse(req.body);
      const created = await resourceHubService.uploadResource(
        req.user!.userId,
        input
      );
      sendSuccess(res, created, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async getDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const docId = String(req.params.docId);
      const doc = await resourceHubService.getResourceDetail(docId);
      sendSuccess(res, doc);
    } catch (err) {
      next(err);
    }
  }

  async downloadResource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const docId = String(req.params.docId);
      const result = await resourceHubService.downloadResource(
        docId,
        req.user!.userId
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async voteResource(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const docId = String(req.params.docId);
      const { voteType } = documentVoteSchema.parse(req.body);
      const result = await resourceHubService.voteResource(
        docId,
        req.user!.userId,
        voteType
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const resourceHubController = new ResourceHubController();
