import { supabase } from '../../database';
import { AppError } from '../../common/utils/response.util';
import {
  ResourceFilterQuery,
  UploadDocumentInput,
} from './resource-hub.types';

export class ResourceHubRepository {
  async listDocuments(filter: ResourceFilterQuery) {
    const page = Math.max(1, Number(filter.page || 1));
    const limit = Math.min(50, Math.max(1, Number(filter.limit || 20)));
    const offset = (page - 1) * limit;

    let courseId = filter.courseId;
    if (!courseId && filter.courseCode) {
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('code', filter.courseCode.toUpperCase().trim())
        .maybeSingle();
      courseId = course?.id;
    }

    let query = supabase
      .from('documents')
      .select(
        `
        *,
        faculty:faculties(id, code, name),
        course:courses(id, code, name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'PUBLISHED');

    if (filter.facultyId) {
      query = query.eq('faculty_id', filter.facultyId);
    }
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    if (filter.semester) {
      query = query.eq('semester', filter.semester.trim());
    }
    if (filter.docType) {
      query = query.eq('doc_type', filter.docType);
    }
    if (filter.q && filter.q.trim()) {
      const kw = filter.q.trim();
      query = query.or(
        `title.ilike.%${kw}%,description.ilike.%${kw}%,file_name.ilike.%${kw}%`
      );
    }

    const { data, error, count } = await query
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(error.message, 500, 'RESOURCE_QUERY_ERROR');
    }

    return {
      rows: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async findDuplicateBySha256(courseId: string, fileSha256: string) {
    const { data } = await supabase
      .from('documents')
      .select('id, title, file_url, semester, doc_type')
      .eq('course_id', courseId)
      .eq('file_sha256', fileSha256)
      .maybeSingle();
    return data;
  }

  async createDocument(
    uploaderId: string,
    input: UploadDocumentInput,
    fileSha256: string
  ) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        uploader_id: uploaderId,
        faculty_id: input.facultyId,
        course_id: input.courseId,
        semester: input.semester.trim(),
        doc_type: input.docType,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        file_url: input.fileUrl.trim(),
        preview_url: input.previewUrl?.trim() || input.fileUrl.trim(),
        file_name: input.fileName.trim(),
        file_size: input.fileSize || 0,
        file_sha256: fileSha256,
      })
      .select(
        `
        *,
        faculty:faculties(id, code, name),
        course:courses(id, code, name)
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể tải lên tài liệu.',
        500,
        'DOCUMENT_CREATE_ERROR'
      );
    }

    return data;
  }

  async findDocumentById(docId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(
        `
        *,
        faculty:faculties(id, code, name),
        course:courses(id, code, name)
      `
      )
      .eq('id', docId)
      .eq('status', 'PUBLISHED')
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data;
  }
}

export const resourceHubRepository = new ResourceHubRepository();
