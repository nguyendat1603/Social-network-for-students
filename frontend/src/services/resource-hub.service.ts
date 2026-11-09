import { apiRequest } from './api.client';
import {
  DocumentItem,
  DocumentType,
  HierarchyFacultyNode,
} from '../types/resource-hub.types';

export const resourceHubService = {
  getHierarchyTree() {
    return apiRequest<HierarchyFacultyNode[]>('/resources/hierarchy');
  },

  listResources(params: {
    facultyId?: string;
    courseId?: string;
    courseCode?: string;
    semester?: string;
    docType?: DocumentType;
    q?: string;
  }) {
    const qs = new URLSearchParams();
    if (params.facultyId) qs.set('facultyId', params.facultyId);
    if (params.courseId) qs.set('courseId', params.courseId);
    if (params.courseCode) qs.set('courseCode', params.courseCode);
    if (params.semester) qs.set('semester', params.semester);
    if (params.docType) qs.set('docType', params.docType);
    if (params.q) qs.set('q', params.q);
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<DocumentItem[]>(`/resources${queryStr}`);
  },

  getDetail(docId: string) {
    return apiRequest<DocumentItem>(`/resources/${docId}`);
  },

  uploadResource(payload: {
    facultyId: string;
    courseId: string;
    semester: string;
    docType: DocumentType;
    title: string;
    description?: string | null;
    fileUrl: string;
    previewUrl?: string | null;
    fileName: string;
    fileSize?: number;
  }) {
    return apiRequest<DocumentItem>('/resources/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  downloadResource(docId: string) {
    return apiRequest<{
      documentId: string;
      title: string;
      fileName: string;
      downloadUrl: string;
      previewUrl: string;
      downloadCount: number;
    }>(`/resources/${docId}/download`, {
      method: 'POST',
    });
  },

  voteResource(docId: string, voteType: 'UPVOTE' | 'DOWNVOTE') {
    return apiRequest<{
      documentId: string;
      currentVote: 'UPVOTE' | 'DOWNVOTE' | null;
      upvote_count: number;
      downvote_count: number;
    }>(`/resources/${docId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },
};
