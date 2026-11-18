import assert from 'node:assert/strict';
import { sampleAuthors, sampleCourses, sampleFaculties, samplePosts, sampleComments, sampleVotes } from '../../frontend/src/demo/sample-data';
import { demoRead } from '../../frontend/src/demo/demo.fixtures';

const posts = new Map(samplePosts.map(p => [p.id, p]));
const authors = new Set(sampleAuthors.map(a => a.id));
const courses = new Set(sampleCourses.map(c => c.id));
const comments = new Map(sampleComments.map(c => [c.id, c]));
assert.equal(posts.size, 100);
assert.equal(authors.size, 30);
assert.equal(courses.size, 20);
assert.equal(sampleFaculties.length, 5);
assert.equal(comments.size, 240);
assert.equal(new Set(sampleVotes.map(v => `${v.user_id}:${v.target_type}:${v.target_id}`)).size, sampleVotes.length);
for (const post of samplePosts) {
  assert.ok(authors.has(post.author_id));
  assert.ok(courses.has(post.course_id));
  const children = sampleComments.filter(c => c.post_id === post.id);
  assert.equal(children.length, post.comment_count);
  if (post.accepted_comment_id) {
    const accepted = comments.get(post.accepted_comment_id)!;
    assert.equal(accepted.post_id, post.id);
    assert.ok(accepted.is_accepted);
  }
  for (const [type, count] of [['UPVOTE', post.upvote_count], ['DOWNVOTE', post.downvote_count], ['HELPFUL', post.helpful_count]]) {
    assert.equal(sampleVotes.filter(v => v.target_id === post.id && v.vote_type === type).length, count);
  }
}
for (const comment of sampleComments) {
  assert.ok(posts.has(comment.post_id));
  assert.ok(authors.has(comment.author_id));
  if (comment.parent_comment_id) assert.equal(comments.get(comment.parent_comment_id)?.post_id, comment.post_id);
}
type Row = Record<string, any>;
const read = (path: string) => demoRead(path) as Row[];
const page1 = read('/feed?scope=CAMPUS&limit=20&page=1');
const page2 = read('/feed?scope=CAMPUS&limit=20&page=2');
assert.equal(page1.length, 20);
assert.equal(page2.length, 20);
assert.ok(page1.every(p => !page2.some(other => p.id === other.id)));
assert.equal(read('/feed?scope=CAMPUS&limit=20&page=4').length, 0);
assert.ok(read('/feed?scope=CAMPUS&sort=unanswered').every(p => p.post_type === 'QUESTION' && !p.accepted_comment_id));
const hot = read('/feed?scope=CAMPUS&sort=hot');
assert.ok(hot.every((p, i) => !i || hot[i - 1].upvote_count >= p.upvote_count));
assert.equal(read('/feed?q=impossible-search-xyz').length, 0);
assert.equal(read(`/feed?courseId=${sampleCourses[0].id}`).length, 5);
assert.equal(read('/feed?courseCode=IT3080').length, 5);
for (const item of [...page1, ...page2]) {
  const detail = demoRead(`/feed/posts/${item.id}`) as Row;
  assert.equal(detail.id, item.id);
  assert.equal(detail.comments.reduce((total: number, c: Row) => total + 1 + c.replies.length, 0), detail.comment_count);
  if (item.is_anonymous) assert.equal(item.author.full_name, undefined);
}
const documents = read('/resources');
assert.equal(documents.length, 20);
assert.equal(read('/resources?docType=SUMMARY_NOTE').length, 4);
assert.equal((demoRead(`/resources/${documents[0].id}`) as Row).id, documents[0].id);
assert.equal(read('/study-groups').length, 10);
const groups = read('/study-groups?onlyRecruiting=true');
assert.ok(groups.length > 0 && groups.every(g => g.is_recruiting));
assert.equal((demoRead(`/study-groups/${groups[0].id}/workspace`) as Row).group.id, groups[0].id);
console.log('PASS: sample counts, references, counters, votes, pagination, filters, sorting, anonymous authors, details, documents and groups.');
