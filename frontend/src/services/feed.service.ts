import { apiRequest } from './api.client';
import {
  CommentItem,
  FeedScope,
  PostItem,
  PostType,
  VoteType,
} from '../types/feed.types';

export const feedService = {
  listPosts(params: {
    scope?: FeedScope;
    facultyId?: string;
    courseId?: string;
    courseCode?: string;
    postType?: PostType;
    sort?: 'new' | 'hot' | 'unanswered';
    q?: string;
  }) {
    const qs = new URLSearchParams();
    if (params.scope) qs.set('scope', params.scope);
    if (params.facultyId) qs.set('facultyId', params.facultyId);
    if (params.courseId) qs.set('courseId', params.courseId);
    if (params.courseCode) qs.set('courseCode', params.courseCode);
    if (params.postType) qs.set('postType', params.postType);
    if (params.sort) qs.set('sort', params.sort);
    if (params.q) qs.set('q', params.q);

    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<PostItem[]>(`/feed${queryStr}`);
  },

  getPostDetail(postId: string) {
    return apiRequest<PostItem>(`/feed/posts/${postId}`);
  },

  createPost(payload: {
    feedScope: FeedScope;
    facultyId?: string | null;
    courseId?: string | null;
    postType: PostType;
    title: string;
    contentBody: string;
    isAnonymous?: boolean;
    attachments?: Array<{
      fileUrl: string;
      fileName: string;
      fileType?: string;
      fileSize?: number;
    }>;
  }) {
    return apiRequest<PostItem>('/feed/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  votePost(postId: string, voteType: VoteType) {
    return apiRequest<{
      targetId: string;
      currentVote: VoteType | null;
      upvote_count: number;
      downvote_count: number;
      helpful_count: number;
    }>(`/feed/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },

  voteComment(commentId: string, voteType: VoteType) {
    return apiRequest<{
      targetId: string;
      currentVote: VoteType | null;
      upvote_count: number;
      downvote_count: number;
      helpful_count: number;
    }>(`/feed/comments/${commentId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },

  createComment(
    postId: string,
    payload: {
      parentCommentId?: string | null;
      contentBody: string;
      isAnonymous?: boolean;
    }
  ) {
    return apiRequest<CommentItem>(`/feed/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  acceptAnswer(postId: string, commentId: string) {
    return apiRequest<{
      postId: string;
      acceptedCommentId: string;
      karmaAwarded: number;
    }>(`/feed/posts/${postId}/comments/${commentId}/accept`, {
      method: 'PATCH',
    });
  },
};
