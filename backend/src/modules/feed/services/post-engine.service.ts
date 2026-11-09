import { sanitizeAnonymousAuthor } from '../../../common/middlewares/anonymous-context.middleware';
import { UserRole } from '../../../common/constants/roles.constant';

const LATEX_DETECTION_REGEX = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\(|\\\[)/;
const CODE_BLOCK_DETECTION_REGEX = /(```[\s\S]+?```|`[^`\n]+`)/;
const DANGEROUS_SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export class PostEngineService {
  /**
   * Sanitizes dangerous `<script>` tags while preserving LaTeX formulas and Code Snippets.
   */
  prepareAcademicContent(rawContent: string): {
    sanitizedBody: string;
    hasLatex: boolean;
    hasCode: boolean;
  } {
    const sanitizedBody = rawContent.replace(DANGEROUS_SCRIPT_REGEX, '');
    const hasLatex = LATEX_DETECTION_REGEX.test(sanitizedBody);
    const hasCode = CODE_BLOCK_DETECTION_REGEX.test(sanitizedBody);

    return {
      sanitizedBody,
      hasLatex,
      hasCode,
    };
  }

  /**
   * Formats a post record and applies Controlled Anonymity rules to author metadata.
   */
  formatPostForClient(
    rawPost: Record<string, any>,
    authorProfile?: Record<string, any> | null,
    viewerRole?: UserRole
  ) {
    const enriched = {
      ...rawPost,
      author: authorProfile
        ? {
            id: authorProfile.user_id,
            full_name: authorProfile.full_name,
            student_code: authorProfile.student_code,
            avatar_url: authorProfile.avatar_url,
            anonymous_handle: authorProfile.anonymous_handle,
            anonymous_avatar: authorProfile.anonymous_avatar,
          }
        : {
            anonymous_handle: 'SinhVienAnDanh',
          },
    };

    return sanitizeAnonymousAuthor(enriched, viewerRole, false);
  }
}

export const postEngineService = new PostEngineService();
