import { supabase } from '../../database';
import { AppError } from '../../common/utils/response.util';
import { resourceHubRepository } from './resource-hub.repository';
import {
  ResourceFilterQuery,
  UploadDocumentInput,
} from './resource-hub.types';
import { documentHierarchyService } from './services/document-hierarchy.service';
import { documentRatingService } from './services/document-rating.service';
import { pdfPreviewService } from './services/pdf-preview.service';

export class ResourceHubService {
  async getHierarchyTree() {
    return documentHierarchyService.getHierarchyTree();
  }

  async listResources(filter: ResourceFilterQuery) {
    const { rows, total, page, limit } =
      await resourceHubRepository.listDocuments(filter);

    const uploaderIds = Array.from(new Set(rows.map((r) => r.uploader_id)));
    const profileMap = new Map<string, Record<string, any>>();

    if (uploaderIds.length > 0) {
      const { data: profiles } = await supabase
        .from('academic_profiles')
        .select('user_id, full_name, student_code, avatar_url')
        .in('user_id', uploaderIds);
      for (const p of profiles || []) {
        profileMap.set(p.user_id, p);
      }
    }

    const items = rows.map((row) => ({
      ...row,
      uploader: profileMap.get(row.uploader_id) || {
        full_name: 'Sinh viên đóng góp',
      },
    }));

    return {
      items,
      meta: { page, limit, total },
    };
  }

  async uploadResource(uploaderId: string, input: UploadDocumentInput) {
    const computedSha256 = pdfPreviewService.computeDocumentSha256(
      input.fileSha256,
      input.fileUrl,
      input.fileName,
      input.fileSize || 0
    );

    const duplicate = await resourceHubRepository.findDuplicateBySha256(
      input.courseId,
      computedSha256
    );

    if (duplicate) {
      throw new AppError(
        `Tài liệu này đã tồn tại trong học phần đã chọn ("${duplicate.title}" - kỳ ${duplicate.semester}).`,
        409,
        'DUPLICATE_DOCUMENT_FILE',
        { existingDocument: duplicate }
      );
    }

    return resourceHubRepository.createDocument(
      uploaderId,
      input,
      computedSha256
    );
  }

  async getResourceDetail(docId: string) {
    const doc = await resourceHubRepository.findDocumentById(docId);
    if (!doc) {
      throw new AppError(
        'Không tìm thấy tài liệu.',
        404,
        'DOCUMENT_NOT_FOUND'
      );
    }

    const { data: uploader } = await supabase
      .from('academic_profiles')
      .select('user_id, full_name, student_code, avatar_url')
      .eq('user_id', doc.uploader_id)
      .maybeSingle();

    return {
      ...doc,
      uploader: uploader || { full_name: 'Sinh viên đóng góp' },
    };
  }

  async downloadResource(docId: string, userId: string) {
    return pdfPreviewService.authorizeAndRecordDownload(docId, userId);
  }

  async voteResource(
    docId: string,
    userId: string,
    voteType: 'UPVOTE' | 'DOWNVOTE'
  ) {
    return documentRatingService.voteDocument(docId, userId, voteType);
  }
}

export const resourceHubService = new ResourceHubService();
