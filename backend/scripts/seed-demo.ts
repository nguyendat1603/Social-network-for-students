import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../src/common/utils/hash.util';
import {
  SAMPLE_MARKER, sampleAuthors, sampleFaculties, sampleCourses,
  samplePosts, sampleComments, sampleVotes,
} from '../../frontend/src/demo/sample-data';

// No secrets, connection strings or service keys are printed by this command.
async function main() {
  const mode = process.argv[2] || '--check';
  if (!['--check', '--apply'].includes(mode)) throw new Error('Use --check or --apply.');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!process.env.SUPABASE_URL || !key) {
    throw new Error('Missing Supabase URL or key in backend/.env.');
  }
  const db = createClient(process.env.SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const tables = ['faculties', 'courses', 'users', 'academic_profiles', 'posts', 'post_course_tags', 'comments', 'votes'];
  for (const table of tables) {
    const { error, count } = await db.from(table).select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Preflight ${table}: ${error.message}`);
    console.log(`${table}: ${count} rows`);
  }
  console.log(`Plan ${SAMPLE_MARKER}: 5 faculties, 20 courses, 30 users, 100 posts, ${sampleComments.length} comments, ${sampleVotes.length} votes.`);
  if (mode === '--check') return;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Database seed requires SUPABASE_SERVICE_ROLE_KEY (backend only). No writes performed.');
  }
  if (process.env.NODE_ENV === 'production' || process.env.SEED_ALLOW_SAMPLE_DATA !== SAMPLE_MARKER) {
    throw new Error(`Refusing writes. Use a development database and set SEED_ALLOW_SAMPLE_DATA=${SAMPLE_MARKER} explicitly.`);
  }
  // Refuse UUID collisions with records not marked as ours before writing anything.
  const { data: existing, error: collisionError } = await db.from('users').select('id,email').in('id', sampleAuthors.map(a => a.id));
  if (collisionError) throw new Error(collisionError.message);
  if (existing?.some(row => row.email !== `sample-${sampleAuthors.findIndex(a => a.id === row.id) + 1}@campus.invalid`)) {
    throw new Error('Sample UUID collision with non-sample users; no writes performed.');
  }
  async function insert(table: string, rows: object[], onConflict = 'id') {
    for (let start = 0; start < rows.length; start += 100) {
      const { error } = await db.from(table).upsert(rows.slice(start, start + 100), { onConflict, ignoreDuplicates: true });
      if (error) throw new Error(`${table}: ${error.message}. Safe to rerun after correcting the cause.`);
    }
    console.log(`Seeded ${table}: ${rows.length} planned rows (existing records left unchanged).`);
  }
  await insert('faculties', sampleFaculties);
  await insert('courses', sampleCourses);
  // Generated users cannot log in: passwords are random and discarded, addresses use .invalid.
  // Use an existing real development account to exercise write actions.
  await insert('users', sampleAuthors.map((a, i) => ({
    id: a.id, email: `sample-${i + 1}@campus.invalid`, password_hash: hashPassword(randomBytes(32).toString('hex')),
    role: 'VERIFIED_STUDENT', is_verified_student: true, status: 'ACTIVE', karma_points: 0,
  })));
  await insert('academic_profiles', sampleAuthors.map((a, i) => ({
    user_id: a.id, full_name: a.full_name, anonymous_handle: a.anonymous_handle,
    faculty_id: sampleFaculties[i % 5].id, bio: SAMPLE_MARKER, cohort: 'Mẫu 2026',
  })), 'user_id');
  await insert('posts', samplePosts.map(({ author, faculty, course, courseTags, attachments, accepted_comment_id, ...row }) => row));
  await insert('post_course_tags', samplePosts.map(p => ({ post_id: p.id, course_id: p.course_id })), 'post_id,course_id');
  await insert('comments', sampleComments.map(({ author, ...row }) => row));
  await insert('votes', sampleVotes);
  // Set accepted references only after comments exist; never overwrite an existing answer.
  for (const post of samplePosts.filter(p => p.accepted_comment_id)) {
    const { error } = await db.from('posts').update({ accepted_comment_id: post.accepted_comment_id })
      .eq('id', post.id).is('accepted_comment_id', null);
    if (error) throw new Error(`accepted answer: ${error.message}`);
  }
  console.log('Sample seed complete. No email, storage upload or notification was sent.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
