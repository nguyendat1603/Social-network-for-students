import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { MainLayout } from '../../../components/layout/MainLayout';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';
import { feedService } from '../../../services/feed.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { ContextualFeedTabs } from '../components/ContextualFeedTabs';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';

const FALLBACK_HUST_POSTS: PostItem[] = [
  {
    id: 'hust-demo-post-1',
    author_id: 'u-1',
    feed_scope: 'CAMPUS',
    faculty_id: null,
    course_id: null,
    post_type: 'QUESTION',
    title: 'Cách tối ưu độ trễ truyền gói tin TCP/IP trong Bài tập lớn Mạng máy tính #IT3080?',
    content_body:
      'Chào các đồng môn SoICT, nhóm mình đang cài đặt 멀티-client server bằng C trên Linux cho đồ án môn #IT3080. Khi gửi liên tiếp các gói tin nhỏ, thuật toán Nagle gây trễ khoảng $40\\text{ ms}$ do chờ ACK.\n\n```c\nint flag = 1;\nsetsockopt(sock_fd, IPPROTO_TCP, TCP_NODELAY, (char *)&flag, sizeof(int));\n```\n\nMình bật `TCP_NODELAY` kết hợp `epoll` như trên đã tối ưu nhất cho bài toán streaming chưa hay cần chỉnh thêm kích thước buffer nhận?',
    is_anonymous: false,
    has_latex: true,
    has_code: true,
    upvote_count: 48,
    downvote_count: 1,
    helpful_count: 19,
    comment_count: 14,
    accepted_comment_id: 'ans-1',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    author: {
      id: 'u-1',
      full_name: 'Nguyễn Thành Đạt',
      student_code: '20215340',
      avatar_url: null,
    },
    courseTags: [{ id: 'c-1', code: 'IT3080', name: 'Mạng máy tính' }],
  },
  {
    id: 'hust-demo-post-2',
    author_id: 'u-2',
    feed_scope: 'CAMPUS',
    faculty_id: null,
    course_id: null,
    post_type: 'DISCUSSION',
    title: 'Tổng hợp phương pháp tính tích phân mặt loại 2 và định lý Ostrogradsky-Gauss (#MI1121)',
    content_body:
      'Gửi anh em K68, K69 đang ôn thi cuối kỳ Giải tích 2. Khi gặp mặt cong kín $S$ định hướng ra ngoài giới hạn miền $V$, thay vì chiếu lên 3 mặt phẳng tọa độ rất dễ nhầm dấu pháp tuyến, ta chuyển thẳng sang tích phân bội ba:\n\n$$\\iint_S P\\,dy\\,dz + Q\\,dz\\,dx + R\\,dx\\,dy = \\iiint_V \\left(\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}\\right) dx\\,dy\\,dz$$\n\nLưu ý kiểm tra kỹ điều kiện hàm khả vi liên tục tại điểm kỳ dị $(0,0,0)$ trước khi áp dụng nhé!',
    is_anonymous: false,
    has_latex: true,
    has_code: false,
    upvote_count: 92,
    downvote_count: 0,
    helpful_count: 41,
    comment_count: 23,
    accepted_comment_id: null,
    created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    author: {
      id: 'u-2',
      full_name: 'Đỗ Ngọc Mai Anh',
      student_code: '20237015',
      avatar_url: null,
    },
    courseTags: [{ id: 'c-2', code: 'MI1121', name: 'Giải tích II' }],
  },
  {
    id: 'hust-demo-post-3',
    author_id: 'u-3',
    feed_scope: 'CAMPUS',
    faculty_id: null,
    course_id: null,
    post_type: 'QUESTION',
    title: 'Xin kinh nghiệm chọn giảng viên hướng dẫn Đồ án Thiết kế Hệ thống Nhúng & Vi mạch (SEEE)',
    content_body:
      'Mình đang học năm 3 Trường Điện - Điện tử, kỳ tới bắt đầu nhận đề tài Project 2 hướng FPGA / SoC và xử lý tín hiệu số. Anh chị khóa trên cho mình hỏi lab nào ở nhà C7 hoặc C9 có nhiều thiết bị thực hành thực tế cho sinh viên làm nghiên cứu ạ?',
    is_anonymous: true,
    has_latex: false,
    has_code: false,
    upvote_count: 31,
    downvote_count: 0,
    helpful_count: 12,
    comment_count: 9,
    accepted_comment_id: null,
    created_at: new Date(Date.now() - 3600 * 1000 * 11).toISOString(),
    author: {
      id: 'u-3',
      anonymous_handle: 'KySuDienTu_K67',
      avatar_url: null,
    },
    courseTags: [{ id: 'c-3', code: 'ET3260', name: 'Kỹ thuật Vi xử lý' }],
  },
];

export const CampusFeedPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sort, setSort] = useState<'new' | 'hot' | 'unanswered'>('new');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedService.listPosts({
        scope: 'CAMPUS',
        sort,
        q: searchQuery || undefined,
      });
      if (data && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(FALLBACK_HUST_POSTS);
      }
    } catch {
      setPosts(FALLBACK_HUST_POSTS);
    } finally {
      setLoading(false);
    }
  }, [sort, searchQuery]);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => {
        setFaculties(res.faculties || []);
        setCourses(res.courses || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Listen for Left Sidebar 'Viết bài mới' button trigger
  useEffect(() => {
    const handleOpenComposer = () => setShowComposer(true);
    window.addEventListener('open-substack-composer', handleOpenComposer);
    if (searchParams.get('compose') === '1') {
      setShowComposer(true);
    }
    return () => {
      window.removeEventListener('open-substack-composer', handleOpenComposer);
    };
  }, [searchParams]);

  const handleVote = async (postId: string, voteType: VoteType) => {
    try {
      const res = await feedService.votePost(postId, voteType);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                upvote_count: res.upvote_count,
                downvote_count: res.downvote_count,
                helpful_count: res.helpful_count,
              }
            : p
        )
      );
    } catch {
      // Optimistic local update for demo posts
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                upvote_count:
                  voteType === 'UPVOTE' ? p.upvote_count + 1 : p.upvote_count,
                downvote_count:
                  voteType === 'DOWNVOTE'
                    ? p.downvote_count + 1
                    : p.downvote_count,
                helpful_count:
                  voteType === 'HELPFUL'
                    ? p.helpful_count + 1
                    : p.helpful_count,
              }
            : p
        )
      );
    }
  };

  const userInitials = (user?.fullName || 'SV')
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <MainLayout variant="campus" onAsk={() => setShowComposer(true)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 1. SUBSTACK HERO BANNER CARD (Teal/dark gradient, Cahuenga 32px white heading) */}
        <section className="substack-hero-banner" data-campus-feed-header>
          {/* Subtle decorative editorial pen/notebook geometry in right background */}
          <svg
            width="180"
            height="180"
            viewBox="0 0 120 120"
            fill="none"
            style={{
              position: 'absolute',
              right: -12,
              bottom: -24,
              opacity: 0.12,
              pointerEvents: 'none',
            }}
          >
            <rect
              x="16"
              y="16"
              width="72"
              height="88"
              rx="8"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <line
              x1="30"
              y1="38"
              x2="74"
              y2="38"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <line
              x1="30"
              y1="54"
              x2="74"
              y2="54"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <line
              x1="30"
              y1="70"
              x2="58"
              y2="70"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="84" cy="84" r="22" stroke="#ff6719" strokeWidth="4" />
          </svg>

          <h1
            style={{
              fontFamily: 'var(--font-cahuenga)',
              fontSize: 31,
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 1.22,
              marginBottom: 8,
              maxWidth: 520,
            }}
          >
            Bàn làm việc Học thuật Sinh viên Bách Khoa
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-system-ui)',
              fontSize: 15,
              color: '#c8c8c8',
              lineHeight: 1.5,
              maxWidth: 500,
              marginBottom: 20,
            }}
          >
            Nơi xuất bản bài giảng, giải đề Giải tích &amp; IT bằng LaTeX, tìm đồng đội làm Đồ án và kết nối trực tiếp giữa các Trường/Viện ĐHBK Hà Nội.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="substack-btn-primary"
            >
              Viết bài chia sẻ
            </button>

            <Link
              to={APP_ROUTES.RESOURCE_HUB}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #b6b6b6',
                color: '#ffffff',
                fontFamily: 'var(--font-system-ui)',
                fontWeight: 500,
                fontSize: 15,
                padding: '8px 20px',
                borderRadius: 9999,
                textDecoration: 'none',
              }}
            >
              Khám phá Kho Đề thi
            </Link>
          </div>
        </section>

        {/* 2. Substack Quick Compose Prompt Row */}
        <div
          onClick={() => setShowComposer(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--color-cloud)',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#ffedd5',
                color: '#c2410c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
            <span style={{ fontSize: 15, color: 'var(--color-stone)' }}>
              Bạn đang thắc mắc môn học nào? Nhập công thức $LaTeX$ hoặc #MãMôn...
            </span>
          </div>

          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-signal-orange)',
              flexShrink: 0,
            }}
          >
            Đăng ngay
          </span>
        </div>

        {/* 3. Navigation Scope Tabs & Sort Bar */}
        <div>
          <ContextualFeedTabs />

          <div
            data-campus-feed-filters
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 14,
              flexWrap: 'wrap',
            }}
          >
            {/* Sort Pills (Secondary Gray Pill vs Orange Active Pill) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(
                [
                  { id: 'new', label: 'Mới nhất' },
                  { id: 'hot', label: 'Sôi nổi nhất' },
                  { id: 'unanswered', label: 'Chưa có lời giải' },
                ] as const
              ).map((item) => {
                const active = sort === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSort(item.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 500,
                      border: 'none',
                      backgroundColor: active
                        ? 'var(--color-ink)'
                        : 'var(--color-cloud)',
                      color: active ? '#ffffff' : 'var(--color-ink)',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Inline Keyword Filter */}
            <div style={{ flex: '0 1 220px' }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc nhanh theo từ khóa..."
                aria-label="Lọc bài viết"
                style={{
                  borderRadius: 9999,
                  padding: '6px 14px',
                  fontSize: 13,
                  border: '1px solid var(--color-ash)',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Feed Post List (Flat editorial rhythm separated by 1px #eeeeee hairlines) */}
        {loading ? (
          <div
            style={{
              padding: '32px 0',
              color: 'var(--color-stone)',
              fontSize: 15,
            }}
          >
            Đang tải bản tin học thuật Bách Khoa...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        )}

        {showComposer && (
          <PostComposerModal
            defaultScope="CAMPUS"
            faculties={faculties}
            courses={courses}
            onClose={() => setShowComposer(false)}
            onSubmit={async (payload) => {
              await feedService.createPost(payload);
              await loadFeed();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
