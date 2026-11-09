import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { CreateGroupDocumentDTO } from '../study-group.types';
import { groupWorkspaceService } from './group-workspace.service';

export class GroupStorageService {
  async uploadGroupDocument(groupId: string, userId: string, dto: CreateGroupDocumentDTO) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    const { data, error } = await supabase
      .from('group_documents')
      .insert({
        group_id: groupId,
        uploaded_by: userId,
        title: dto.title,
        file_url: dto.fileUrl,
        file_size_bytes: dto.fileSizeBytes || null,
      })
      .select(
        `
        *,
        uploader:users!group_documents_uploaded_by_fkey(id, full_name, avatar_url)
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

    return data;
  }

  async listGroupDocuments(groupId: string, userId: string) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    const { data, error } = await supabase
      .from('group_documents')
      .select(
        `
        *,
        uploader:users!group_documents_uploaded_by_fkey(id, full_name, avatar_url)
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    return data || [];
  }
}

export const groupStorageService = new GroupStorageService();
