import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { PostCard } from '../../feed/components/PostCard';
import { courseReviewService } from '../../../services/course-review.service';
import { feedService } from '../../../services/feed.service';
import { identityService } from '../../../services/identity.service';
import { PostItem, VoteType } from '../../../types/feed.types';
import { CourseItem } from '../../../types/identity.types';
import { SubjectQuestionSearch } from '../components/SubjectQuestionSearch';

export const SubjectQaForumPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCourse = searchParams.get('courseCode') || '';

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState(initialCourse);
  const [keyword, setKeyword] = useState('');
  const [onlyAccepted, setOnlyAccepted] = useState(false);
  const [questions, setQuestions] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => setCourses(res.courses))
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseReviewService.searchSubjectForum({
        courseCode: selectedCourseCode || undefined,
        q: keyword || undefined,
        onlyAccepted,
      });
      setQuestions(data);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseCode, keyword, onlyAccepted]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleVote = async (postId: string, voteType: VoteType) => {
    await feedService.votePost(postId, voteType);
    await runSearch();
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            🔎 Diễn đàn Hỏi bài theo Môn (Subject-Specific Q&A Forum)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Tra cứu câu hỏi học thuật cũ theo mã học phần, từ khóa lỗi hoặc lời giải đã được xác nhận Accepted Answer.
          </p>
        </div>

        <SubjectQuestionSearch
          courses={courses}
          selectedCourseCode={selectedCourseCode}
          keyword={keyword}
          onlyAccepted={onlyAccepted}
          onCourseChange={setSelectedCourseCode}
          onKeywordChange={setKeyword}
          onOnlyAcceptedChange={setOnlyAccepted}
        />

        {loading ? (
          <div>Đang tìm kiếm câu hỏi học thuật...</div>
        ) : questions.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            Không tìm thấy câu hỏi nào khớp bộ lọc.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {questions.map((q) => (
              <PostCard key={q.id} post={q} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
