import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { PostCard } from '../../feed/components/PostCard';
import { courseReviewService } from '../../../services/course-review.service';
import { feedService } from '../../../services/feed.service';
import { identityService } from '../../../services/identity.service';
import { PostItem, VoteType } from '../../../types/feed.types';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostComposerModal } from '../../feed/components/PostComposerModal';
import { SubjectQuestionSearch } from '../components/SubjectQuestionSearch';

export const SubjectQaForumPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourse = searchParams.get('courseCode') || searchParams.get('code') || '';

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const [selectedCourseCode, setSelectedCourseCode] = useState(initialCourse);
  useEffect(() => { setSelectedCourseCode(searchParams.get('courseCode') || searchParams.get('code') || ''); }, [searchParams]);
  const [keyword, setKeyword] = useState('');
  const [onlyAccepted, setOnlyAccepted] = useState(false);
  const [questions, setQuestions] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => { setCourses(res.courses); setFaculties(res.faculties); })
      .catch(() => setError('Không thể tải danh mục học phần.'));
  }, []);

  const runSearch = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const data = await courseReviewService.searchSubjectForum({
        courseCode: selectedCourseCode || undefined,
        q: keyword || undefined,
        onlyAccepted,
      });
      if (version === requestVersion.current) setQuestions(data);
    } catch {
      if (version === requestVersion.current) { setQuestions([]); setError('Không thể tải câu hỏi. Vui lòng thử lại.'); }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [selectedCourseCode, keyword, onlyAccepted]);

  useEffect(() => {
    runSearch();
    return () => { requestVersion.current++; };
  }, [runSearch]);

  const handleVote = async (postId: string, voteType: VoteType) => {
    await feedService.votePost(postId, voteType);
    await runSearch();
  };

  return (
    <MainLayout pageClassName="campus-page campus-reviews" onAsk={courses.length ? () => setShowComposer(true) : undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            Hỏi đáp học phần
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
          onCourseChange={code => {
            setSelectedCourseCode(code);
            const next = new URLSearchParams(searchParams);
            if (code) next.set('courseCode', code); else next.delete('courseCode');
            next.delete('code');
            setSearchParams(next);
          }}
          onKeywordChange={setKeyword}
          onOnlyAcceptedChange={setOnlyAccepted}
        />
        {error && <p role="alert">{error} <button type="button" onClick={runSearch}>Thử lại</button></p>}

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
        {showComposer && <PostComposerModal defaultScope="COURSE" defaultPostType="QUESTION"
          defaultCourseId={courses.find(course => course.code === selectedCourseCode)?.id}
          courses={courses} faculties={faculties} onClose={() => setShowComposer(false)}
          onSubmit={async payload => { await feedService.createPost(payload); await runSearch(); }} />}
      </div>
    </MainLayout>
  );
};
