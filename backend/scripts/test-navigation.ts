import assert from 'node:assert/strict';
import { CAMPUS_ALL_NAV, CAMPUS_NAV_GROUPS, CAMPUS_PRIMARY_NAV, isCampusNavActive } from '../../frontend/src/config/navigation.config';
import { courseNavigation } from '../../frontend/src/config/course-navigation';
import { APP_ROUTES } from '../../frontend/src/config/routes.config';
import { sampleCourses } from '../../frontend/src/demo/sample-data';
import { demoRead } from '../../frontend/src/demo/demo.fixtures';
import { validateStudyGroupCourseId } from '../src/modules/study-group/study-group.validation';

assert.equal(CAMPUS_NAV_GROUPS.length, 3);
assert.equal(CAMPUS_PRIMARY_NAV.length, 4);
assert.equal(new Set(CAMPUS_ALL_NAV.map(item => item.to)).size, CAMPUS_ALL_NAV.length);
for (const pathname of [
  '/feed', '/feed/posts/example', '/courses', '/feed/course', '/course-reviews',
  '/course-reviews/forum', '/course-reviews/IT3080', '/resources', '/resources/example',
  '/study-groups', '/study-groups/example/workspace', '/feed/department',
  '/marketplace', '/marketplace/housing', '/messenger', '/notifications', '/karma',
]) {
  assert.equal(CAMPUS_ALL_NAV.filter(item => isCampusNavActive(item.to, pathname)).length, 1, pathname);
}
assert.ok(isCampusNavActive(APP_ROUTES.COURSES, '/course-reviews/forum'));
assert.ok(!isCampusNavActive(APP_ROUTES.MARKETPLACE_ITEMS, '/marketplace/housing'));
for (const course of sampleCourses) {
  const tabs = courseNavigation(course.code);
  assert.equal(tabs.length, 5);
  assert.equal(new Set(tabs.map(tab => tab.to)).size, 5);
  for (const tab of tabs) {
    const url = new URL(tab.to, 'https://campus.invalid');
    assert.equal(url.searchParams.get('code') || url.searchParams.get('courseCode') || decodeURIComponent(url.pathname.split('/').pop()!), course.code);
  }
  const questions = demoRead(`/course-reviews/forum/search?courseCode=${course.code}`) as Array<{ post_type: string; course_id: string }>;
  assert.ok(questions.every(item => item.post_type === 'QUESTION' && item.course_id === course.id));
  const discussions = demoRead(`/feed?courseCode=${course.code}&postType=DISCUSSION`) as Array<{ post_type: string; course_id: string }>;
  assert.ok(discussions.length > 0 && discussions.every(item => item.post_type === 'DISCUSSION' && item.course_id === course.id));
  const groups = demoRead(`/study-groups?courseId=${course.id}`) as Array<{ course_id: string }>;
  assert.ok(groups.every(item => item.course_id === course.id));
  assert.equal(validateStudyGroupCourseId(course.id), course.id);
}
assert.equal(validateStudyGroupCourseId('42'), 42);
assert.equal(validateStudyGroupCourseId(42), 42);
for (const invalid of [undefined, null, '', 'NaN', NaN, 0, -1, 1.2, {}, [], 'invalid-course']) {
  assert.throws(() => validateStudyGroupCourseId(invalid));
}
assert.equal(new URL(courseNavigation('Môn / A&B')[4].to, 'https://campus.invalid').pathname.split('/').length, 3);
console.log('PASS: grouped navigation, unique active parents, five course tabs, course-scoped mock content, UUID and legacy integer course IDs.');
