import { supabase } from '../../../database';
import { sha256Hash } from '../../../common/utils/hash.util';
import { AppError } from '../../../common/utils/response.util';
import { academicKarmaService } from '../../moderation/services/academic-karma.service';

export class PdfPreviewService {
  computeDocumentSha256(
    explicitHash: string | undefined,
    fileUrl: string,
    fileName: string,
    fileSize: number
  ): string {
    if (explicitHash && explicitHash.trim().length === 64) {
      return explicitHash.trim().toLowerCase();
    }
    return sha256Hash(`${fileUrl.trim()}|${fileName.trim()}|${fileSize}`);
  }

  /**
   * Checks daily download quota based on the student's Karma tier
   * and records the download if permitted.
   */
  async authorizeAndRecordDownload(documentId: string, userId: string) {
    const { data: doc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('status', 'PUBLISHED')
      .maybeSingle();

    if (!doc) {
      throw new AppError(
        'Không tìm thấy tài liệu hoặc tài liệu đã bị gỡ.',
        404,
        'DOCUMENT_NOT_FOUND'
      );
    }

    // Uploader or repeat downloader of the same file does not consume daily quota
    const { data: alreadyDownloaded } = await supabase
      .from('document_downloads')
      .select('id')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (doc.uploader_id !== userId && !alreadyDownloaded) {
      const { data: user } = await supabase
        .from('users')
        .select('karma_points')
        .eq('id', userId)
        .maybeSingle();

      const karma = user?.karma_points ?? 0;
      const tier = academicKarmaService.getTierForKarma(karma);

      if (tier.dailyDownloadLimit !== null) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from('document_downloads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('downloaded_at', startOfDay.toISOString());

        if ((count || 0) >= tier.dailyDownloadLimit) {
          throw new AppError(
            `Bạn đã dùng hết ${tier.dailyDownloadLimit} lượt tải tài liệu trong ngày (Bậc hiện tại: ${tier.badgeLabel}, ${karma} Karma). Hãy chia sẻ tài liệu hoặc trả lời câu hỏi đạt >= 50 Karma để mở khóa tải không giới hạn!`,
            429,
            'DAILY_DOWNLOAD_LIMIT_REACHED',
            {
              dailyLimit: tier.dailyDownloadLimit,
              currentKarma: karma,
              unlockUnlimitedAtKarma: 50,
            }
          );
        }
      }

      await supabase.from('document_downloads').insert({
        document_id: documentId,
        user_id: userId,
      });

      await supabase
        .from('documents')
        .update({ download_count: (doc.download_count || 0) + 1 })
        .eq('id', documentId);
    }

    return {
      documentId: doc.id,
      title: doc.title,
      fileName: doc.file_name,
      downloadUrl: doc.file_url,
      previewUrl: doc.preview_url || doc.file_url,
      downloadCount:
        doc.uploader_id !== userId && !alreadyDownloaded
          ? (doc.download_count || 0) + 1
          : doc.download_count || 0,
    };
  }
}

export const pdfPreviewService = new PdfPreviewService();
