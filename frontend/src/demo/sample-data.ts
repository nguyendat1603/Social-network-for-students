// Shared, deterministic sample data for the read-only preview and database seed.
// This namespace belongs exclusively to campus-sample-v1. No real student data.
export const SAMPLE_MARKER = 'campus-sample-v1';
export const sampleId = (kind: number, index: number) =>
  `ca6e2026-${String(kind).padStart(4, '0')}-4000-8000-${String(index + 1).padStart(12, '0')}`;
const timestamp = (hours: number) => new Date(Date.UTC(2026, 10, 18, 8) - hours * 3600000).toISOString();
const facultyNames = ['Công nghệ thông tin', 'Điện - Điện tử', 'Cơ khí', 'Kinh tế và Quản lý', 'Toán - Tin'];
export const sampleFaculties = facultyNames.map((name, i) => ({
  id: sampleId(1, i), code: `DEMO-F${i + 1}`, name: `${name} · Mẫu`,
  description: SAMPLE_MARKER,
}));
const subjects = [
  ['Mạng máy tính', 'chia subnet và phân biệt TCP/UDP', 'IT3080'],
  ['Cơ sở dữ liệu', 'chuẩn hóa bảng và tối ưu truy vấn SQL', 'IT3090'],
  ['Cấu trúc dữ liệu', 'độ phức tạp của cây và bảng băm', 'IT3011'],
  ['Lập trình hướng đối tượng', 'thiết kế interface và tính đa hình', 'IT3100'],
  ['Kỹ thuật phần mềm', 'viết use case và chia công việc sprint', 'IT4082'],
  ['Hệ điều hành', 'deadlock và quản lý bộ nhớ', 'IT3070'],
  ['Trí tuệ nhân tạo', 'lựa chọn heuristic cho thuật toán A*', 'IT3160'],
  ['Phát triển ứng dụng web', 'quản lý trạng thái và gọi API', 'IT4409'],
  ['Mạch điện', 'áp dụng định luật Kirchhoff', 'EE2000'],
  ['Điện tử tương tự', 'phân tích mạch khuếch đại', 'EE2010'],
  ['Điều khiển tự động', 'đọc đồ thị đáp ứng hệ thống', 'EE2020'],
  ['Cơ học kỹ thuật', 'vẽ biểu đồ lực và mô men', 'ME2000'],
  ['Vẽ kỹ thuật', 'đọc hình chiếu và dung sai', 'ME2010'],
  ['Nguyên lý máy', 'phân tích cơ cấu truyền động', 'ME2020'],
  ['Kinh tế vi mô', 'tính độ co giãn cung cầu', 'EM2000'],
  ['Quản trị dự án', 'lập kế hoạch và quản lý rủi ro', 'EM2010'],
  ['Xác suất thống kê', 'phân biệt các phân phối xác suất', 'MI2020'],
  ['Giải tích', 'tính tích phân nhiều lớp', 'MI1110'],
  ['Đại số tuyến tính', 'tìm trị riêng và vector riêng', 'MI1140'],
  ['Toán rời rạc', 'chứng minh quy nạp và duyệt đồ thị', 'MI3052'],
];
export const sampleCourses = subjects.map(([name, , code], i) => ({
  id: sampleId(2, i), code: `DEMO-${code}`, name: `${name} · Mẫu`,
  faculty_id: sampleFaculties[i < 8 ? 0 : i < 11 ? 1 : i < 14 ? 2 : i < 16 ? 3 : 4].id,
  credits: 3, description: SAMPLE_MARKER,
}));
const names = ['Minh Anh', 'Tuấn Minh', 'Ngọc Hà', 'Hoàng Nam', 'Thu Trang', 'Gia Huy',
  'Phương Linh', 'Đức Anh', 'Khánh Vy', 'Quang Huy', 'Hải Yến', 'Bảo Long',
  'Mai Chi', 'Trung Kiên', 'Thảo Nguyên', 'Nhật Minh', 'Thanh Trúc', 'Việt Hoàng',
  'Hồng Nhung', 'Anh Khoa', 'Bích Ngọc', 'Duy Khánh', 'Diệu Linh', 'Đình Phong',
  'Hà My', 'Mạnh Dũng', 'Quỳnh Anh', 'Thành Đạt', 'Ngọc Mai', 'Hữu Phước'];
export const sampleAuthors = names.map((name, i) => ({
  id: sampleId(3, i), full_name: `${name} · Mẫu`, student_code: null,
  avatar_url: null, anonymous_handle: `ban_hoc_mau_${i + 1}`,
}));
const replies = [
  'Bạn thử viết một ví dụ nhỏ trước, ghi rõ đầu vào và kết quả mong đợi rồi kiểm tra từng bước nhé.',
  'Mình từng gặp chỗ này. Nên đối chiếu điều kiện áp dụng trong giáo trình trước khi dùng công thức.',
  'Có thể chia thành hai trường hợp và lập bảng so sánh. Như vậy sẽ dễ nhận ra điểm khác nhau hơn.',
  'Nhóm mình dùng sơ đồ để tổng hợp kiến thức, sau đó mỗi người giải một bài và kiểm tra chéo.',
  'Cảm ơn bạn đã chia sẻ. Phần giải thích này giúp mình hiểu vì sao cách làm trước đó chưa đúng.',
  'Bạn bổ sung phần đã thử và bước bắt đầu bị vướng được không? Mọi người sẽ dễ góp ý cụ thể hơn.',
];
export const samplePosts = Array.from({ length: 100 }, (_, i) => {
  const subjectIndex = i % subjects.length;
  const [name, topic] = subjects[subjectIndex];
  const course = sampleCourses[subjectIndex];
  const faculty = sampleFaculties.find(item => item.id === course.faculty_id)!;
  const variant = Math.floor(i / subjects.length);
  const titles = [
    `${name}: mình đang vướng phần ${topic}`,
    `Chia sẻ cách ôn ${name} theo từng dạng bài`,
    `Tìm bạn cùng luyện bài tập ${name} cuối tuần`,
    `Checklist tự học ${name} trước kỳ kiểm tra`,
    `${name}: những lỗi dễ mắc khi làm bài tập lớn`,
  ];
  const bodies = [
    `Mình đang học phần ${topic}. Đã đọc lại lý thuyết và thử giải bài mẫu nhưng chưa hiểu cách chọn hướng làm.\n\nMình muốn hiểu bản chất thay vì chỉ nhớ đáp án. Bạn nào có thể giải thích bằng một ví dụ đơn giản không?`,
    `Mình chia phần ${topic} thành ba bước: tóm tắt khái niệm, tự giải bài cơ bản, rồi kiểm tra với một trường hợp khác.\n\nMỗi buổi chỉ tập trung một dạng bài. Nếu sai, mình ghi lại nguyên nhân vào một bảng riêng để ôn lại cuối tuần. Mọi người có cách học nào hiệu quả hơn không?`,
    `Mình muốn tìm 2–3 bạn cùng ôn phần ${topic}. Dự kiến học tối thứ Bảy, mỗi người chuẩn bị một câu hỏi để cả nhóm trao đổi.\n\nKhông yêu cầu học giỏi sẵn, chỉ cần chuẩn bị trước và tham gia đều. Lịch có thể thống nhất lại theo thời gian của mọi người.`,
    `Trước khi làm bài phần ${topic}, mình kiểm tra: đã hiểu giả thiết chưa, đã ghi đúng đơn vị chưa, và kết quả có hợp lý không.\n\nSau đó mình tự giải lại không nhìn lời giải, đổi một dữ kiện để kiểm tra mức độ hiểu. Đây là checklist cá nhân, rất mong nhận thêm góp ý.`,
    `Nhóm mình từng bắt tay vào làm ngay mà chưa thống nhất yêu cầu phần ${topic}. Kết quả là các phần không khớp khi ghép lại.\n\nLần này nhóm viết rõ đầu vào, đầu ra và tiêu chí hoàn thành trước. Mỗi thành viên có một nhiệm vụ nhỏ, kiểm tra chéo trước khi tích hợp. Mình chia sẻ để các bạn tránh mất thời gian như nhóm mình.`,
  ];
  const hasCode = subjectIndex === 1 && variant === 0;
  const hasLatex = subjectIndex >= 16 && variant === 0;
  const postType = variant === 0 ? 'QUESTION' : variant === 3 ? 'ANNOUNCEMENT' : 'DISCUSSION';
  return {
    id: sampleId(4, i), author_id: sampleAuthors[i % 30].id,
    feed_scope: i % 5 < 3 ? 'CAMPUS' : i % 5 === 3 ? 'COURSE' : 'DEPARTMENT',
    faculty_id: faculty.id, course_id: course.id, post_type: postType,
    title: `[Mẫu] ${titles[variant]}`,
    content_body: `${bodies[variant]}${hasCode ? '\n\n```sql\nSELECT course_id, COUNT(*)\nFROM posts\nGROUP BY course_id;\n```' : ''}${hasLatex ? '\n\nMình đang kiểm tra công thức $P(A|B) = P(A \\cap B) / P(B)$ với $P(B) > 0$.' : ''}`,
    has_code: hasCode, has_latex: hasLatex, is_anonymous: postType !== 'ANNOUNCEMENT' && i % 9 === 0,
    upvote_count: i % 11, downvote_count: i % 3, helpful_count: i % 5,
    comment_count: i % 5 === 0 ? 0 : 3,
    accepted_comment_id: variant === 0 && i % 5 !== 0 && i % 2 === 0 ? sampleId(5, i * 3) : null,
    status: 'PUBLISHED', created_at: timestamp(i * 3), author: sampleAuthors[i % 30],
    faculty, course, courseTags: [course], attachments: [],
  };
});
export const sampleComments = samplePosts.flatMap((post, i) =>
  Array.from({ length: post.comment_count }, (_, j) => ({
    id: sampleId(5, i * 3 + j), post_id: post.id, author_id: sampleAuthors[(i + j + 1) % 30].id,
    parent_comment_id: j === 2 ? sampleId(5, i * 3) : null,
    content_body: replies[(i + j) % replies.length],
    has_code: false, has_latex: false, is_anonymous: false,
    is_accepted: post.accepted_comment_id === sampleId(5, i * 3 + j),
    upvote_count: 0, downvote_count: 0, helpful_count: 0,
    status: 'PUBLISHED', created_at: timestamp(i * 3 - (j + 1) / 6),
    author: sampleAuthors[(i + j + 1) % 30],
  })));
export const sampleVotes = samplePosts.flatMap((post, i) => {
  const types = [
    ...Array.from({ length: post.upvote_count }, () => 'UPVOTE'),
    ...Array.from({ length: post.downvote_count }, () => 'DOWNVOTE'),
    ...Array.from({ length: post.helpful_count }, () => 'HELPFUL'),
  ];
  return types.map((vote_type, j) => ({
    id: sampleId(6, i * 30 + j), user_id: sampleAuthors[(i + j + 1) % 30].id,
    target_type: 'POST', target_id: post.id, vote_type, created_at: timestamp(i * 3 - 1),
  }));
});
