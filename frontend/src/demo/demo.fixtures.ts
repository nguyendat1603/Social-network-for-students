// Development-only, read-only dataset. Never merged with backend responses.
// Loaded dynamically behind import.meta.env.DEV in api.client.ts.
const created = '2026-11-12T08:00:00Z';
const faculty = { id: '1', code: 'CNTT', name: 'Khoa Công nghệ thông tin · Demo', description: 'Dữ liệu minh họa' };
const course = { id: '1', code: 'IT3080', name: 'Mạng máy tính · Demo', faculty_id: '1', credits: 3, description: 'Học phần minh họa để xem giao diện.' };
const author = { id: 'demo-author', full_name: 'Sinh viên minh họa', student_code: null, avatar_url: null, is_verified_student: false };
const post = {
  id: 'demo-post', author_id: author.id, feed_scope: 'CAMPUS', faculty_id: '1', course_id: '1', post_type: 'QUESTION',
  title: '[Demo] Cùng trao đổi cách chia việc cho bài tập lớn',
  content_body: 'Đây là dữ liệu minh họa trong môi trường phát triển. Bạn có thể mở bài viết và xem bố cục thảo luận; đăng bài, bình luận và bình chọn cần đăng nhập thật.',
  has_latex: false, has_code: false, is_anonymous: false, upvote_count: 0, downvote_count: 0, helpful_count: 0,
  comment_count: 1, accepted_comment_id: null, created_at: created, author, faculty, course, attachments: [], courseTags: [course],
  comments: [{ id: 'demo-comment', post_id: 'demo-post', parent_comment_id: null, content_body: 'Phản hồi minh họa, không phải nội dung sinh viên thật.', has_latex: false, has_code: false, is_anonymous: false, is_accepted: false, upvote_count: 0, downvote_count: 0, helpful_count: 0, created_at: created, author, replies: [] }],
};
const aggregate = { total_reviews: 0, avg_difficulty: 0, avg_workload: 0, avg_fairness: 0, avg_teaching: 0, avg_reading_load: 0 };
const group = {
  id: 'demo-group', course_id: 1, semester: '2026.1', group_name: '[Demo] Nhóm học Mạng máy tính', project_topic: 'Xem thử không gian làm việc nhóm',
  target_grade: 'A', max_members: 4, member_count: 1, is_recruiting: true, leader_id: 'demo-author', created_at: created,
  course: { ...course, id: 1 }, leader: author, is_member: true, my_member_role: 'MEMBER', my_application_status: null,
  slots: [{ id: 'demo-slot', group_id: 'demo-group', role_name: 'Frontend', required_skills: ['React'], quantity_needed: 1, quantity_filled: 0 }],
};

function previewPdf() {
  const stream = 'BT /F1 18 Tf 50 740 Td (Campus Social - Development Demo) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const start = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return `data:application/pdf;base64,${btoa(pdf)}`;
}
const document = {
  id: 'demo-document', uploader_id: 'demo-author', faculty_id: '1', course_id: '1', semester: '2026.1', doc_type: 'SUMMARY_NOTE',
  title: '[Demo] Ghi chú ôn tập Mạng máy tính', description: 'Tệp minh họa tạo cục bộ, không chứa tài liệu thật.',
  file_url: previewPdf(), preview_url: null, file_name: 'campus-demo.pdf', file_size: 650,
  file_sha256: '0'.repeat(64), download_count: 0, upvote_count: 0, downvote_count: 0, created_at: created, faculty, course, uploader: author,
};
const conversation = {
  id: 'demo-conversation', type: 'PROJECT_GROUP', title: '[Demo] Trao đổi nhóm học', study_group_id: group.id,
  created_at: created, last_message_at: created, study_group: group, participants: [{ user_id: author.id, user: author }],
  latest_message: { id: 'demo-message', content: 'Tin nhắn minh họa · chỉ xem.', message_type: 'TEXT', created_at: created, sender: author },
};
const tier = { tierCode: 'VERIFIED_MEMBER', badgeLabel: 'Minh họa', dailyDownloadLimit: 0, canCreateCustomGroup: false, nextTierPoints: 50 };

export function demoRead(endpoint: string): unknown {
  if (!import.meta.env.DEV) throw new Error('Demo không khả dụng trong production.');
  const url = new URL(endpoint, 'https://demo.invalid');
  const path = url.pathname;
  const q = url.searchParams;
  let value: unknown;
  if (path === '/identity/catalog') value = { faculties: [faculty], courses: [course] };
  else if (path === '/feed' || path === '/course-reviews/forum/search') {
    const matches = (!q.get('courseCode') || q.get('courseCode') === course.code) && (!q.get('courseId') || q.get('courseId') === course.id)
      && (!q.get('q') || `${post.title} ${post.content_body}`.toLocaleLowerCase('vi').includes(q.get('q')!.toLocaleLowerCase('vi'))) && q.get('onlyAccepted') !== 'true';
    value = matches ? [{ ...post, feed_scope: q.get('scope') || 'COURSE' }] : [];
  }
  else if (path === '/feed/posts/demo-post') value = post;
  else if (path === '/course-reviews/directory') value = { courses: [{ ...course, faculty, aggregate }], lecturers: [] };
  else if (path === '/course-reviews/courses/IT3080') value = { course, aggregate, lecturers: [], reviews: [] };
  else if (path === '/resources/hierarchy') value = [{ ...faculty, courses: [{ ...course, documentCount: 1, semesters: ['2026.1'] }] }];
  else if (path === '/resources') value = (!q.get('q') || document.title.toLowerCase().includes(q.get('q')!.toLowerCase())) && (!q.get('courseCode') || q.get('courseCode') === course.code) && (!q.get('docType') || q.get('docType') === document.doc_type) && (!q.get('semester') || q.get('semester') === document.semester) ? [document] : [];
  else if (path === '/resources/demo-document') value = document;
  else if (path === '/study-groups') value = (!q.get('targetGrade') || q.get('targetGrade') === group.target_grade) && (!q.get('search') || group.group_name.toLowerCase().includes(q.get('search')!.toLowerCase())) ? [group] : [];
  else if (path === '/study-groups/demo-group/workspace') value = {
    group, myMembership: { group_id: group.id, user_id: 'demo-viewer', member_role: 'MEMBER', assigned_role: 'Người xem demo' },
    members: [{ group_id: group.id, user_id: author.id, member_role: 'LEAD', assigned_role: 'Điều phối', joined_at: created, user: { ...author, skills: [] } }],
    slots: group.slots, tasks: [{ id: 'demo-task', group_id: group.id, title: '[Demo] Thống nhất kế hoạch học', status: 'TODO', position_order: 0, created_at: created }], documents: [], applications: [], conversationId: conversation.id,
  };
  else if (path === '/marketplace/items' || path === '/marketplace/housing') value = [];
  else if (path === '/communication/conversations') value = [conversation];
  else if (path === '/communication/conversations/demo-conversation/messages') value = [{ id: 'demo-message', conversation_id: conversation.id, sender_id: author.id, message_type: 'TEXT', content: 'Đây là tin nhắn minh họa. Gửi tin nhắn cần đăng nhập thật.', created_at: created, sender: author }];
  else if (path === '/communication/notifications') value = { unreadCount: 1, items: [{ id: 'demo-notification', recipient_id: 'demo-viewer', type: 'POST_REPLY', title: '[Demo] Phản hồi trong thảo luận', body: 'Thông báo minh họa, không gửi từ hệ thống thật.', reference_url: '/feed/posts/demo-post', is_read: false, created_at: created }] };
  else if (path === '/moderation/karma/me') value = { currentKarma: 0, tier, stats: { totalEarned: 0, totalDeducted: 0, transactionsCount: 0 }, recentTransactions: [] };
  else if (path === '/moderation/karma/privileges') value = { userId: 'demo-viewer', karmaPoints: 0, tierCode: tier.tierCode, badgeLabel: 'Minh họa', isRestricted: true, dailyDownloadLimit: 0, downloadsUsedToday: 0, remainingDownloadsToday: 0, canCreateCustomGroup: false, canPost: false };
  else if (path === '/moderation/karma/leaderboard') value = [];
  else throw new Error('Màn hình này chưa có dữ liệu demo. Vui lòng đăng nhập thật.');
  return structuredClone(value);
}
