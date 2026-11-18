import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { identityService } from '../../../services/identity.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { courseNavigation } from '../../../config/course-navigation';
import styles from './CourseDirectoryPage.module.css';

export const CourseDirectoryPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    identityService.getCatalog().then(result => {
      if (!active) return;
      setCourses(result.courses);
      setFaculties(result.faculties);
    }).catch(() => {
      if (active) setError('Không thể tải danh sách học phần. Vui lòng thử lại.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  const query = keyword.trim().toLocaleLowerCase('vi');
  const matching = courses.filter(course => (!facultyId || course.faculty_id === facultyId)
    && `${course.code} ${course.name}`.toLocaleLowerCase('vi').includes(query));

  return <MainLayout>
    <section className={styles.directory}>
      <header><h1>Học phần</h1><p>Chọn một môn để thảo luận, hỏi bài, tìm tài liệu, nhóm học và xem đánh giá.</p></header>
      <div className={styles.filters}>
        <label>Tìm học phần<input type="search" placeholder="Nhập mã hoặc tên môn…" value={keyword} onChange={event => setKeyword(event.target.value)} /></label>
        <label>Khoa / Viện<select value={facultyId} onChange={event => setFacultyId(event.target.value)}>
          <option value="">Tất cả khoa / viện</option>
          {faculties.map(faculty => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
        </select></label>
      </div>
      {loading ? <p role="status">Đang tải học phần…</p> : error ? <div role="alert"><p>{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></div>
        : <>
          <p className={styles.count} role="status">{matching.length} học phần</p>
          {!matching.length && <p>Không tìm thấy học phần. Hãy thử tên khác hoặc đổi bộ lọc.</p>}
          <div className={styles.grid}>{matching.map(course => {
            const links = courseNavigation(course.code);
            return <article key={course.id} className={styles.card}>
              <span className={styles.code}>{course.code}</span>
              <h2><Link to={links[0].to}>{course.name}</Link></h2>
              <p>{faculties.find(faculty => faculty.id === course.faculty_id)?.name || 'Học phần'} · {course.credits} tín chỉ</p>
              <nav aria-label={`Nội dung ${course.name}`}>{links.map(link => <Link key={link.to} to={link.to}>{link.label}</Link>)}</nav>
            </article>;
          })}</div>
        </>}
    </section>
  </MainLayout>;
};
