export type FeedScope = 'CAMPUS' | 'DEPARTMENT' | 'COURSE';
export type PostType = 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT';
export type VoteType = 'UPVOTE' | 'DOWNVOTE' | 'HELPFUL';

export interface PostAuthorInfo {
  id?: string;
  full_name?: string;
  student_code?: string | null;
  avatar_url?: string | null;
  anonymous_handle?: string;
  anonymous_avatar?: string | null;
}

export interface PostAttachmentItem {
  id?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface CourseTagItem {
  id: string;
  code: string;
  name: string;
}

export interface CommentItem {
  id: string;
  post_id: string;
  author_id?: string;
  parent_comment_id: string | null;
  content_body: string;
  has_latex: boolean;
  has_code: boolean;
  is_anonymous: boolean;
  is_accepted: boolean;
  upvote_count: number;
  downvote_count: number;
  helpful_count: number;
  created_at: string;
  author?: PostAuthorInfo;
  replies?: CommentItem[];
}

export interface PostItem {
  id: string;
  author_id?: string;
  feed_scope: FeedScope;
  faculty_id: string | null;
  course_id: string | null;
  post_type: PostType;
  title: string;
  content_body: string;
  has_latex: boolean;
  has_code: boolean;
  is_anonymous: boolean;
  upvote_count: number;
  downvote_count: number;
  helpful_count: number;
  comment_count: number;
  accepted_comment_id: string | null;
  created_at: string;
  author?: PostAuthorInfo;
  faculty?: { id: string; code: string; name: string } | null;
  course?: { id: string; code: string; name: string } | null;
  attachments?: PostAttachmentItem[];
  courseTags?: CourseTagItem[];
  comments?: CommentItem[];
}
