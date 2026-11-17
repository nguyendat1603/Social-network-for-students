import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { normalizeUserWithProfile } from '../../../common/utils/profile.util';
import { CreateGroupDocumentDTO } from '../study-group.types';
import { groupWorkspaceService } from './group-workspace.service';

export class GroupStorageService {
  async uploadGroupDocument(groupId: string, userId: string, dto: CreateGroupDocumentDTO) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    const fileName =
      dto.fileName && dto.fileName.trim()
        ? dto.fileName.trim()
        : `${dto.title.replace(/\s+/g, '_')}.pdf`;

    const { data, error } = await supabase
      .from('group_documents')
      .insert({
        group_id: groupId,
        uploader_id: userId,
        title: dto.title,
        file_url: dto.fileUrl,
        file_name: fileName,
        file_size: dto.fileSizeBytes ?? 0,
      })
      .select(
        `
        *,
        uploader:users!group_documents_uploader_id_fkey(
          id,
          academic_profile:academic_profiles(full_name, avatar_url, student_code)
        )
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể lưu tài liệu nhóm',
        500,
        'GROUP_DOCUMENT_UPLOAD_FAILED'
      );
    }

    return {
      ...data,
      uploaded_by: data.uploader_id ?? userId,
      file_size_bytes: data.file_size ?? dto.fileSizeBytes ?? null,
      uploader: normalizeUserWithProfile(data.uploader),
    };
  }

  async listGroupDocuments(groupId: string, userId: string) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    const { data, error } = await supabase
      .from('group_documents')
      .select(
        `
        *,
        uploader:users!group_documents_uploader_id_fkey(
          id,
          academic_profile:academic_profiles(full_name, avatar_url, student_code)
        )
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    return (data || []).map((d) => ({
      ...d,
      uploaded_by: d.uploader_id ?? d.uploaded_by,
      file_size_bytes: d.file_size ?? d.file_size_bytes ?? null,
      uploader: normalizeUserWithProfile(d.uploader),
    }));
  }
}

export const groupStorageService = new GroupStorageService();
