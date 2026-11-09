export type FeedScope = 'CAMPUS' | 'DEPARTMENT' | 'COURSE';
export type PostType = 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT';
export type VoteTargetType = 'POST' | 'COMMENT';
export type VoteType = 'UPVOTE' | 'DOWNVOTE' | 'HELPFUL';

export interface PostAttachmentInput {
  fileUrl: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
}

export interface CreatePostInput {
  feedScope: FeedScope;
  facultyId?: string | null;
  courseId?: string | null;
  postType: PostType;
  title: string;
  contentBody: string;
  isAnonymous?: boolean;
  attachments?: PostAttachmentInput[];
}

export interface CreateCommentInput {
  parentCommentId?: string | null;
  contentBody: string;
  isAnonymous?: boolean;
}

export interface FeedFilterQuery {
  scope?: FeedScope;
  facultyId?: string;
  courseId?: string;
  courseCode?: string;
  postType?: PostType;
  sort?: 'new' | 'hot' | 'unanswered';
  q?: string;
  page?: number;
  limit?: number;
}
