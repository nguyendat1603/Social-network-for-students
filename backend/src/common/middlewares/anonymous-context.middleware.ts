import { UserRole } from '../constants/roles.constant';

export interface AuthorSortableEntity {
  author_id?: string;
  is_anonymous?: boolean;
  author?: {
    id?: string;
    full_name?: string;
    student_code?: string | null;
    avatar_url?: string | null;
    anonymous_handle?: string;
    anonymous_avatar?: string | null;
  };
}

/**
 * Controlled Anonymity Helper:
 * Masks real identity fields (`author_id`, `full_name`, `student_code`, `avatar_url`)
 * when `is_anonymous === true`, unless the viewer is a Moderator or Admin inspecting violations.
 */
export function sanitizeAnonymousAuthor<T extends AuthorSortableEntity>(
  entity: T,
  viewerRole?: UserRole,
  includeModeratorTrace = false
): T {
  if (!entity.is_anonymous) {
    return entity;
  }

  const isPrivilegedMod =
    includeModeratorTrace &&
    (viewerRole === UserRole.ADMIN || viewerRole === UserRole.MODERATOR);

  if (isPrivilegedMod) {
    return entity;
  }

  const anonymousHandle =
    entity.author?.anonymous_handle || 'SinhVienAnDanh';
  const anonymousAvatar = entity.author?.anonymous_avatar || null;

  return {
    ...entity,
    author_id: undefined,
    author: {
      anonymous_handle: anonymousHandle,
      anonymous_avatar: anonymousAvatar,
    },
  };
}
