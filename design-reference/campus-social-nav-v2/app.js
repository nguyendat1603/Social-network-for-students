/* Campus Social · UX prototype. No backend or network calls. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  const courses = [
    { id: 'IT3080', note: 'Học phần đang theo dõi' },
    { id: 'IT2021', note: 'Học phần đang theo dõi' },
    { id: 'MI1114', note: 'Học phần đang theo dõi' },
  ];
  const posts = [
    { id: 1, name: 'Minh Anh', avatar: 'M', avatarClass: 'avatar-a', time: '20 phút trước', course: 'IT3080', topic: 'Bài tập lớn', title: 'Bài tập lớn IT3080: nên chia phần API, cơ sở dữ liệu và kiểm thử như thế nào?', excerpt: 'Nhóm mình có 4 người, đang bị chồng chéo khi mỗi bạn tự làm một nhánh. Mọi người thường thống nhất hợp đồng API trước hay thiết kế bảng dữ liệu trước?', body: 'Nhóm mình có 4 người, đang bị chồng chéo khi mỗi bạn tự làm một nhánh. Mọi người thường thống nhất hợp đồng API trước hay thiết kế bảng dữ liệu trước?\n\nMình muốn tìm một cách phân chia thực tế để giảm xung đột khi merge và tránh việc mỗi người tạo một schema khác nhau.', answers: 4, helpful: 12, solved: false, saved: false, liked: false, answerText: 'Một cách dễ bắt đầu: cả nhóm chốt API contract và tên thực thể chung trong 1 buổi, sau đó chia từng luồng hoàn chỉnh cho mỗi người. Kéo request/response mẫu vào repository để mọi người sử dụng chung.' },
    { id: 2, name: 'Khánh Linh', avatar: 'L', avatarClass: 'avatar-b', time: '1 giờ trước', course: 'IT2021', topic: 'Kinh nghiệm học', title: 'Checklist nhỏ mình dùng trước khi nộp báo cáo nhóm', excerpt: 'Chia sẻ lại những mục dễ bị quên: liên kết tài liệu, ảnh minh họa, phân công thực tế và kiểm tra quyền truy cập file.', body: 'Mình tổng hợp checklist nhỏ để nhóm kiểm tra trước khi nộp báo cáo:\n\n• Có nêu rõ phần đóng góp của từng thành viên không?\n• Link demo và link tài liệu có mở được không?\n• Có ghi giới hạn chưa hoàn thiện của hệ thống không?\n• Kiểm tra kết quả build và những lỗi cần lưu ý.', answers: 7, helpful: 28, solved: true, saved: false, liked: false, answerText: 'Cảm ơn bạn đã tổng hợp. Mình bổ sung thêm: nên chạy thử demo bằng tài khoản mới trước buổi trình bày.' },
    { id: 3, name: 'Quốc Bảo', avatar: 'B', avatarClass: 'avatar-c', time: 'Hôm qua', course: 'MI1114', topic: 'Ôn tập', title: 'Mình đang tìm 2 bạn cùng ôn bài theo từng chủ đề trước kỳ kiểm tra', excerpt: 'Ưu tiên học đều 2 buổi mỗi tuần, mỗi người chuẩn bị một số bài và cùng chữa sau đó. Ai quan tâm thì để lại lời nhắn nhé.', body: 'Mình muốn lập nhóm học nhỏ, 3–4 người cùng chuẩn bị tài liệu trước buổi học. Mỗi buổi chọn một chủ đề, tự làm bài rồi cùng giải thích cho nhau những chỗ chưa hiểu.', answers: 2, helpful: 8, solved: false, saved: false, liked: false, answerText: 'Mình quan tâm nhé. Tụi mình có thể thống nhất lịch và danh sách bài trước buổi đầu.' },
  ];
  const resources = [
    { id: 11, title: 'Mẫu cấu trúc báo cáo bài tập lớn', course: 'IT3080', kind: 'Mẫu báo cáo', semester: 'Học kỳ mẫu', author: 'Minh Anh', description: 'Khung trình bày gồm mục tiêu, kiến trúc, phân công, kết quả kiểm thử và hướng phát triển.' },
    { id: 12, title: 'Ghi chú ôn tập theo chủ đề', course: 'MI1114', kind: 'Ghi chú', semester: 'Học kỳ mẫu', author: 'Quốc Bảo', description: 'Tài liệu gợi ý cách hệ thống hóa kiến thức và luyện tập theo từng nhóm bài.' },
    { id: 13, title: 'Checklist kiểm tra trước khi nộp đồ án', course: 'IT2021', kind: 'Checklist', semester: 'Học kỳ mẫu', author: 'Khánh Linh', description: 'Danh sách ngắn để rà soát giao diện, API, dữ liệu và quyền trước khi demo.' },
    { id: 14, title: 'Tổng hợp câu hỏi tự ôn cho nhóm', course: 'IT3080', kind: 'Bộ câu hỏi', semester: 'Học kỳ mẫu', author: 'Hà Phương', description: 'Các câu hỏi mở để cùng ôn và trao đổi đáp án trong nhóm học phần.' },
  ];
  const groups = [
    { id: 21, course: 'IT3080', name: 'Nhóm bài tập lớn — cần 1 bạn kiểm thử', description: 'Đã có ba thành viên phụ trách giao diện, API và dữ liệu. Nhóm cần một bạn thích viết test, kiểm tra luồng sử dụng và tổng hợp lỗi.', roles: ['Tester', 'QA'], people: '3 / 4 thành viên', joined: false },
    { id: 22, course: 'IT2021', name: 'Tìm bạn phụ trách giao diện và trải nghiệm', description: 'Tụi mình muốn làm giao diện rõ ràng, phù hợp sinh viên dùng hằng ngày. Có mockup sơ bộ, cần thêm người thích nghiên cứu UX.', roles: ['Frontend', 'UI/UX'], people: '2 / 4 thành viên', joined: false },
    { id: 23, course: 'MI1114', name: 'Nhóm ôn tập theo tuần', description: 'Nhóm học nhỏ, luân phiên chuẩn bị đề bài và giải thích cách làm. Không yêu cầu trình độ cao, chỉ cần tham gia đều.', roles: ['Thành viên học'], people: '2 / 5 thành viên', joined: false },
  ];
  const notifications = [
    { id: 1, text: 'Minh Anh đã phản hồi trong thảo luận IT3080.', time: '10 phút trước', read: false },
    { id: 2, text: 'Có tài liệu minh họa mới trong học phần IT2021.', time: 'Hôm qua', read: false },
  ];

  const state = { view: 'home', course: 'IT3080', lastCourse: 'IT3080', feedTab: 'all', courseTab: 'questions', search: '', prevView: 'home', showStarter: true };
  let nextId = 100;
  let toastTimer = null;
  let restoreFocus = null;

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3400);
  }

  function nav(view, options = {}) {
    if (view !== 'search') state.prevView = state.view;
    state.view = view;
    if (options.course && options.course !== 'all') {
      state.course = options.course;
      state.lastCourse = options.course;
    } else if (options.course === 'all') {
      state.course = 'all';
    } else if (view === 'resources' || view === 'groups') {
      state.course = 'all';
    } else if (view === 'course' && state.course === 'all') {
      state.course = state.lastCourse;
    }
    if (options.tab) state.courseTab = options.tab;
    if (view !== 'search') state.search = '';
    render();
    $('.workspace')?.scrollIntoView({behavior:'instant', block:'start'});
    $('#main-content')?.focus({preventScroll:true});
  }

  function breadcrumb(view = state.view) {
    if (view === 'home') return '';
    const labels = {course:'Học phần',resources:'Kho tài liệu',groups:'Tìm nhóm',saved:'Bài đã lưu',search:'Tìm kiếm'};
    const scoped = (view==='resources' || view==='groups') && state.course !== 'all';
    let parts = `<button type="button" data-nav="home">Trang chủ</button><span aria-hidden="true">/</span>`;
    if (scoped) parts += `<button type="button" data-course="${esc(state.course)}">Học phần ${esc(state.course)}</button><span aria-hidden="true">/</span>`;
    parts += `<span class="crumb-current" aria-current="page">${esc(view==='course'?'Học phần '+state.course:scoped?(view==='resources'?'Tài liệu':'Nhóm học'):labels[view])}</span>`;
    return `<nav class="breadcrumbs" aria-label="Đường dẫn trang">${parts}</nav>`;
  }

  function scopedContextLink() {
    if (state.course==='all') return '';
    return `<div class="context-return"><span>${icon('book')} Bạn đang xem nội dung của <strong>${esc(state.course)}</strong></span><button data-course="${esc(state.course)}">${icon('arrow-right')} Về trang học phần</button></div>`;
  }

  function starterNote() {
    if (!state.showStarter) return `<div class="starter-minimal"><span>Mới dùng Campus Social?</span> <button id="starter-help">Xem hướng dẫn nhanh</button></div>`;
    return `<div class="starter-guide"><div><strong>Lần đầu đến đây?</strong><p>Chọn một việc bên dưới. Bạn có thể quay về Trang chủ bất cứ lúc nào.</p></div><div class="starter-buttons"><button id="starter-help">Xem cách dùng trong 30 giây</button><button id="starter-dismiss" aria-label="Ẩn lời gợi ý">${icon('x')}</button></div></div>`;
  }

  function renderNav() {
    $$('[data-nav]').forEach(btn => {
      const active = btn.dataset.nav === state.view || (state.view === 'saved' && btn.dataset.nav === 'saved');
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
    });
    const locationNames = {home:'Trang chủ',course:'Học phần '+state.course,resources:'Kho tài liệu'+(state.course!=='all'?' · '+state.course:''),groups:'Tìm nhóm'+(state.course!=='all'?' · '+state.course:''),saved:'Bài đã lưu',search:'Kết quả tìm kiếm'};
    $('#current-location').textContent = locationNames[state.view] || 'Campus Social';
    $('#sidebar-courses').innerHTML = courses.map(c => `<button class="sidebar-course ${state.view === 'course' && state.course===c.id ? 'is-selected' : ''}" data-course="${c.id}"><span class="course-mini-dot"></span>${c.id}</button>`).join('');
  }

  function coursePills(activeCourse, includeAll = true) {
    const opts = (includeAll ? [{ id:'all', label:'Tất cả học phần' }] : []).concat(courses.map(c => ({ id:c.id, label:c.id })));
    return `<div class="course-pills" aria-label="Lọc học phần">${opts.map(c=>`<button class="course-pill ${activeCourse === c.id?'active':''}" data-filter-course="${c.id}">${c.label}</button>`).join('')}</div>`;
  }

  function postRow(p) {
    return `<article class="feed-item" data-post-id="${p.id}">
       <div class="feed-head"><span class="avatar ${p.avatarClass}">${esc(p.avatar)}</span><div class="feed-byline"><strong>${esc(p.name)} <span aria-label="Sinh viên đã xác minh (dữ liệu mẫu)" title="Huy hiệu minh họa">· Sinh viên</span></strong><span>${esc(p.time)}</span></div><span class="feed-status ${p.solved?'solved':'open'}">${p.solved?'Có câu trả lời':'Đang cần giúp'}</span></div>
       <button class="feed-title" data-post-open="${p.id}">${esc(p.title)}</button>
       <p class="feed-excerpt">${esc(p.excerpt)}</p>
       <div class="feed-meta"><span class="meta-tag">${esc(p.course)}</span><span class="meta-topic">${esc(p.topic)}</span></div>
       <div class="feed-actions"><button class="small-action ${p.liked?'on':''}" data-helpful="${p.id}" aria-pressed="${p.liked}">${icon('heart')} Hữu ích · ${p.helpful}</button><button class="small-action" data-post-open="${p.id}">${icon('message')} ${p.answers} phản hồi</button><button class="small-action bookmark-action ${p.saved?'on':''}" data-save="${p.id}" aria-pressed="${p.saved}" aria-label="${p.saved?'Bỏ lưu':'Lưu bài viết'}">${icon('bookmark')} ${p.saved?'Đã lưu':'Lưu'}</button></div>
      </article>`;
  }
  function resourcesRows(items) {
    if (!items.length) return empty('Chưa tìm thấy tài liệu phù hợp', 'Thử đổi mã học phần hoặc từ khóa để xem nội dung khác.', 'resources');
    return `<div class="resource-list">${items.map(r=>`<article class="resource-row"><div class="resource-file-icon">${icon('files')}</div><div class="resource-content"><h3>${esc(r.title)}</h3><div class="resource-meta"><span>${esc(r.course)}</span><span>·</span><span>${esc(r.kind)}</span><span>·</span><span>${esc(r.author)}</span></div><p class="resource-desc">${esc(r.description)}</p></div><button class="ghost-button" data-resource-open="${r.id}">Xem thông tin</button></article>`).join('')}</div>`;
  }
  function groupsRows(items) {
    if (!items.length) return empty('Chưa có nhóm phù hợp', 'Bạn có thể thử tìm nhóm ở một học phần khác.', 'groups');
    return `<div class="group-list">${items.map(g=>`<article class="group-entry"><div class="group-topline"><h3>${esc(g.name)}</h3><span class="group-status">Đang tìm thành viên</span></div><p>${esc(g.description)}</p><div class="group-bottom"><span class="meta-tag">${esc(g.course)}</span>${g.roles.map(r=>`<span class="group-role">${esc(r)}</span>`).join('')}<span class="group-members">${esc(g.people)}</span><button class="ghost-button" data-group-apply="${g.id}">${g.joined?'Đã gửi quan tâm': 'Quan tâm nhóm'}</button></div></article>`).join('')}</div>`;
  }
  function empty(title, description, next = null) {
    return `<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h3>${esc(title)}</h3><p>${esc(description)}</p>${next?`<button class="ghost-button" data-nav="${next}">Xem tất cả</button>`:''}</div>`;
  }
  function renderHome() {
    const filter = state.feedTab === 'unanswered' ? posts.filter(p=>!p.solved) : posts;
    return `<div class="greeting"><p class="eyebrow">Một nơi để học cùng nhau</p><h1 class="page-heading">Hôm nay bạn cần gì<br>cho việc học?</h1><p class="greeting-sub">Tìm câu trả lời, tài liệu hoặc bạn học phù hợp — tất cả bắt đầu từ môn bạn quan tâm.</p><form class="hero-search" id="hero-search">${icon('search')}<label for="hero-search-input" class="sr-only">Tìm kiếm</label><input id="hero-search-input" name="q" placeholder="Thử tìm: IT3080, tài liệu, nhóm đồ án..." autocomplete="off"/><button type="submit">Tìm kiếm</button></form></div>
      ${starterNote()}
      <div class="quick-actions"><button class="quick-action" id="quick-ask"><span class="action-icon">${icon('message')}</span><span class="action-copy"><strong>Hỏi về môn học</strong><small>Đặt câu hỏi để được giúp</small></span>${icon('arrow-right')}</button><button class="quick-action" data-nav="resources"><span class="action-icon">${icon('files')}</span><span class="action-copy"><strong>Tìm tài liệu</strong><small>Slide, ghi chú, mẫu báo cáo</small></span>${icon('arrow-right')}</button><button class="quick-action" data-nav="groups"><span class="action-icon">${icon('users')}</span><span class="action-copy"><strong>Tìm nhóm</strong><small>Học chung hoặc làm đồ án</small></span>${icon('arrow-right')}</button></div>
      <div class="mobile-courses"><div class="mobile-courses-head"><strong>Môn bạn đang theo dõi</strong><small>Chọn môn để xem mọi nội dung liên quan</small></div><div class="mobile-course-links">${courses.map(c=>`<button data-course="${c.id}">${c.id} ${icon('arrow-right')}</button>`).join('')}</div></div>
      <div class="section-topline"><h2 class="section-title">Góc trao đổi hôm nay</h2><button class="subtle-link" data-nav="course">Đến học phần ${icon('arrow-right')}</button></div>
      ${coursePills('all')}
      <div class="content-tabs" role="tablist" aria-label="Lọc bài viết"><button role="tab" aria-selected="${state.feedTab==='all'}" class="content-tab ${state.feedTab==='all'?'active':''}" data-feed-tab="all">Mới cập nhật</button><button role="tab" aria-selected="${state.feedTab==='unanswered'}" class="content-tab ${state.feedTab==='unanswered'?'active':''}" data-feed-tab="unanswered">Đang cần giúp</button></div><div class="feed-list">${filter.map(postRow).join('') || empty('Chưa có câu hỏi mới', 'Hãy thử xem các bài đăng đã có lời giải hoặc đặt câu hỏi đầu tiên.')}</div>`;
  }
  function renderCourse() {
    const currentCourse = state.course;
    const scopedPosts = posts.filter(p => p.course === currentCourse);
    const scopedResources = resources.filter(r => r.course === currentCourse);
    const scopedGroups = groups.filter(g => g.course === currentCourse);
    let body;
    if(state.courseTab === 'questions') body = `<div class="feed-list">${scopedPosts.map(postRow).join('') || empty('Học phần này chưa có thảo luận', 'Hãy bắt đầu bằng một câu hỏi ngắn, nêu rõ bạn đã thử những gì.')}</div>`;
    if(state.courseTab === 'documents') body = `${resourcesRows(scopedResources)}<div class="see-more-context"><button data-go-scoped="resources" data-course-id="${esc(currentCourse)}">Xem thêm tài liệu của ${esc(currentCourse)} ${icon('arrow-right')}</button></div>`;
    if(state.courseTab === 'groups') body = `${groupsRows(scopedGroups)}<div class="see-more-context"><button data-go-scoped="groups" data-course-id="${esc(currentCourse)}">Xem thêm nhóm của ${esc(currentCourse)} ${icon('arrow-right')}</button></div>`;
    return `${breadcrumb()}<div class="page-headrow"><div><p class="eyebrow">Tất cả trong một học phần</p><h1 class="page-heading">Học phần ${esc(currentCourse)}</h1><p class="page-intro">Bạn đang xem nội dung của <strong>${esc(currentCourse)}</strong>. Chọn Hỏi đáp, Tài liệu hoặc Nhóm học ngay bên dưới.</p></div><button class="button-primary" id="course-ask">${icon('plus')} Đặt câu hỏi</button></div>
      <section class="course-banner"><div class="course-caption">BẠN MUỐN CHUYỂN SANG MÔN KHÁC?</div><h2>${esc(currentCourse)}</h2><p>Chọn mã môn bên dưới. Đây là dữ liệu minh họa, không phải danh mục môn học chính thức.</p><div class="course-switcher">${courses.map(c=>`<button class="${c.id===currentCourse?'active':''}" data-course="${c.id}">${c.id}</button>`).join('')}</div></section>
      <p class="content-choice-label">TRONG HỌC PHẦN NÀY · CHỌN NỘI DUNG CẦN XEM</p><div class="content-tabs course-content-tabs" role="tablist" aria-label="Nội dung học phần"><button role="tab" class="content-tab ${state.courseTab==='questions'?'active':''}" aria-selected="${state.courseTab==='questions'}" data-course-tab="questions">Hỏi đáp · ${scopedPosts.length}</button><button role="tab" class="content-tab ${state.courseTab==='documents'?'active':''}" aria-selected="${state.courseTab==='documents'}" data-course-tab="documents">Tài liệu · ${scopedResources.length}</button><button role="tab" class="content-tab ${state.courseTab==='groups'?'active':''}" aria-selected="${state.courseTab==='groups'}" data-course-tab="groups">Nhóm học · ${scopedGroups.length}</button></div>${body}`;
  }
  function renderResources() {
    return `${breadcrumb()}<div class="page-headrow"><div><p class="eyebrow">Tài liệu có ngữ cảnh</p><h1 class="page-heading">${state.course==='all'?'Kho tài liệu học tập':'Tài liệu · '+esc(state.course)}</h1><p class="page-intro">Chọn mã học phần để chỉ xem tài liệu môn đó. Có thể chuyển lại “Tất cả học phần” bất cứ lúc nào.</p></div></div>
      ${scopedContextLink()}<div class="page-divider"></div><div class="section-topline" style="margin-top:0"><h2 class="section-title">Tài liệu được chia sẻ</h2></div><p class="filter-help">LỌC THEO HỌC PHẦN</p>${coursePills(state.course === 'all' ? 'all' : state.course)}${resourcesRows(state.course==='all'?resources:resources.filter(r=>r.course===state.course))}<p class="resource-side-note">Trong bản sản phẩm thật, tài liệu cần có nguồn, quyền truy cập, trạng thái kiểm duyệt và bản xem PDF thực tế.</p>`;
  }
  function renderGroups() {
    return `${breadcrumb()}<div class="page-headrow"><div><p class="eyebrow">Làm việc cùng đúng người</p><h1 class="page-heading">${state.course==='all'?'Tìm nhóm học & đồ án':'Tìm nhóm · '+esc(state.course)}</h1><p class="page-intro">Xem nhóm đang làm gì, đang cần ai, và cân nhắc trước khi gửi quan tâm.</p></div></div>
      ${scopedContextLink()}<div class="page-divider"></div><div class="section-topline" style="margin-top:0"><h2 class="section-title">Nhóm đang tìm thành viên</h2></div><p class="filter-help">LỌC THEO HỌC PHẦN</p>${coursePills(state.course === 'all' ? 'all' : state.course)}${groupsRows(state.course==='all'?groups:groups.filter(g=>g.course===state.course))}<p class="resource-side-note">Nút “Quan tâm nhóm” chỉ mô phỏng gửi đơn trong giao diện; không gửi dữ liệu thật.</p>`;
  }
  function renderSaved() {
    const saved = posts.filter(p=>p.saved);
    return `${breadcrumb()}<p class="eyebrow">Nội dung dành cho bạn</p><h1 class="page-heading">Đã lưu để xem lại</h1><p class="page-intro">Những câu hỏi bạn đánh dấu sẽ được đưa về một chỗ, không cần phải tìm lại trong dòng tin.</p><div class="page-divider"></div><div class="feed-list">${saved.length?saved.map(postRow).join(''):empty('Bạn chưa lưu bài viết nào', 'Khi thấy một câu hỏi hữu ích, nhấn “Lưu” để giữ lại và đọc vào lúc thuận tiện.', 'home')}</div>`;
  }
  function includesTerm(item, q) { return Object.values(item).some(x=>typeof x === 'string' && x.toLocaleLowerCase('vi').includes(q)); }
  function renderSearch() {
    const q = state.search.toLocaleLowerCase('vi');
    const pp = posts.filter(p=>includesTerm(p,q));
    const rr = resources.filter(r=>includesTerm(r,q));
    const gg = groups.filter(g=>includesTerm(g,q));
    return `${breadcrumb()}<p class="eyebrow">Tìm kiếm trong cộng đồng</p><h1 class="page-heading">Kết quả tìm kiếm</h1><p class="page-intro">Từ khóa: <strong>“${esc(state.search)}”</strong></p><div class="search-results-overview"><strong>${pp.length+rr.length+gg.length} kết quả minh họa</strong> · Bài viết ${pp.length} · Tài liệu ${rr.length} · Nhóm ${gg.length}</div>
      <h2 class="search-group-title">Câu hỏi và bài viết</h2>${pp.length?pp.map(postRow).join(''):empty('Không tìm thấy bài viết', 'Hãy thử từ khóa ngắn hơn hoặc mã học phần.')}
      <h2 class="search-group-title">Tài liệu</h2>${resourcesRows(rr)}
      <h2 class="search-group-title">Nhóm học và đồ án</h2>${groupsRows(gg)}`;
  }
  function renderRail() {
    let helper = `<div class="rail-note"><div class="rail-spark">${icon('spark')} MỘT GỢI Ý NHỎ</div><h3>Không cần biết hết mới được đặt câu hỏi.</h3><p>Nói rõ phần bạn đã thử và chỗ đang bí. Người khác sẽ dễ giúp bạn hơn.</p></div>`;
    if(state.view === 'groups') helper = `<div class="rail-note"><div class="rail-spark">${icon('spark')} TRƯỚC KHI THAM GIA</div><h3>Chọn nhóm hợp với cách bạn học.</h3><p>Hỏi thêm lịch làm việc, kỳ vọng và phần việc trước khi nhận lời.</p></div>`;
    if(state.view === 'resources') helper = `<div class="rail-note"><div class="rail-spark">${icon('spark')} CHỌN TÀI LIỆU</div><h3>Đúng môn quan trọng hơn nhiều file.</h3><p>Ưu tiên tài liệu có ngữ cảnh, nguồn chia sẻ rõ ràng và phù hợp học kỳ.</p></div>`;
    return `${helper}<section class="rail-section"><h2 class="rail-section-title">MÔN ĐANG THEO DÕI</h2>${courses.map(c=>`<button class="rail-course" data-course="${c.id}"><span class="rail-course-dot">${c.id.slice(0,2)}</span><span class="rail-course-name">${c.id}<small>Đi đến câu hỏi, tài liệu, nhóm</small></span>${icon('arrow-right')}</button>`).join('')}</section><section class="rail-section"><h2 class="rail-section-title">CỘNG ĐỒNG TỐT HƠN KHI</h2><div class="rail-mini-line">${icon('check-circle')}<div>Hỏi rõ điều mình cần<small>Đưa đủ bối cảnh để người khác giúp</small></div></div><div class="rail-mini-line">${icon('check-circle')}<div>Chia sẻ tài liệu có nguồn<small>Tôn trọng tác giả và quyền sử dụng</small></div></div><div class="rail-mini-line">${icon('check-circle')}<div>Tương tác tử tế<small>Phản hồi hữu ích, không công kích</small></div></div></section><p class="rail-footer"><strong>Campus Social · UX preview</strong><br>Không dùng dữ liệu sinh viên thật trong bản thử nghiệm.</p>`;
  }
  function render() {
    renderNav();
    let html = state.view==='home' ? renderHome() : state.view==='course' ? renderCourse() : state.view==='resources' ? renderResources() : state.view==='groups' ? renderGroups() : state.view==='saved' ? renderSaved() : renderSearch();
    $('#main-content').innerHTML = html;
    $('#context-rail').innerHTML = renderRail();
    updateNotificationBadge();
  }
  function updateNotificationBadge() { $('#notification-count').classList.toggle('hidden', notifications.every(n=>n.read)); }
  function openModal(title, eyebrow, content) {
    restoreFocus = document.activeElement;
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-header"><div><p class="eyebrow">${esc(eyebrow)}</p><h2 class="modal-title">${esc(title)}</h2></div><button class="close-button" data-close-modal aria-label="Đóng cửa sổ">${icon('x')}</button></div><div class="modal-body">${content}</div></div>`;
    root.classList.remove('hidden');
    document.body.style.overflow='hidden';
    $('[data-close-modal]',root)?.focus();
  }
  function closeModal() {
    $('#modal-root').classList.add('hidden');
    $('#modal-root').innerHTML='';
    document.body.style.overflow='';
    restoreFocus?.focus?.();
  }
  function helpModal() {
    openModal('Bắt đầu với Campus Social', 'HƯỚNG DẪN NGẮN · KHÔNG CẦN HỌC THUỘC MENU', `<p class="help-modal-intro">Bạn chỉ cần nhớ một điều: <strong>chọn học phần, rồi chọn việc muốn làm.</strong></p><div class="help-steps"><div><span>01</span><p><strong>Chọn môn bạn đang học</strong><small>Vào “Theo môn học” và chọn mã môn, ví dụ IT3080.</small></p></div><div><span>02</span><p><strong>Chọn nội dung cần tìm</strong><small>Ở mỗi môn đều có 3 mục: Hỏi đáp, Tài liệu, Nhóm học.</small></p></div><div><span>03</span><p><strong>Bắt đầu trao đổi</strong><small>Đọc bài trước, đặt câu hỏi nếu chưa có lời giải, hoặc gửi quan tâm nhóm.</small></p></div></div><div class="help-modal-actions"><button class="button-primary" data-guide-go="course">${icon('book')} Mở học phần IT3080</button><button class="ghost-button" data-guide-go="resources">Xem kho tài liệu</button></div><p class="detail-disclaimer">Đây là bản demo: thao tác không gửi dữ liệu đến người dùng thật.</p>`);
  }
  function askModal() {
    openModal('Đặt câu hỏi', 'CHIA SẺ VỚI CỘNG ĐỒNG', `<form id="question-form"><div class="form-field"><label class="form-label" for="question-course">Bạn đang hỏi về học phần nào?</label><select class="form-select" id="question-course" required>${courses.map(c=>`<option value="${c.id}" ${state.course===c.id?'selected':''}>${c.id}</option>`).join('')}</select></div><div class="form-field"><label class="form-label" for="question-title">Tiêu đề câu hỏi</label><input class="text-input" id="question-title" placeholder="Ví dụ: Làm sao chia việc để không trùng API?" minlength="12" maxlength="140" required/><small class="form-help">Mô tả cụ thể điều bạn đang gặp phải, tránh tiêu đề như “Cứu em với”.</small></div><div class="form-field"><label class="form-label" for="question-body">Bạn đã thử gì, và đang mắc ở đâu?</label><textarea class="text-area" id="question-body" placeholder="Viết bối cảnh và điều bạn muốn được giải thích..." minlength="20" required></textarea></div><label class="inline-checkbox"><input type="checkbox" id="question-anonymous"/><span>Đăng dưới biệt danh <span class="form-help">(chỉ là hiển thị; hệ thống thật vẫn cần biết chủ bài để xử lý vi phạm)</span></span></label><div class="modal-action-row"><span class="modal-footer-hint">Bản xem trước: câu hỏi chỉ xuất hiện trong phiên này, không gửi lên server.</span><button type="submit" class="button-primary">${icon('send')} Đăng câu hỏi mẫu</button></div></form>`);
  }
  function postModal(id) {
    const post = posts.find(p=>p.id===id);
    if(!post)return;
    openModal(post.title, `${post.course} · ${post.topic}`, `<p class="detail-body">${esc(post.body)}</p><div class="detail-reply"><strong>${icon('check-circle')} Phản hồi minh họa từ cộng đồng</strong><p>${esc(post.answerText || 'Bài viết này đang chờ phản hồi phù hợp.')}</p></div><form id="reply-form" data-post-id="${post.id}"><div class="form-field"><label for="reply-text" class="form-label">Góp thêm ý kiến</label><textarea id="reply-text" class="text-area" style="min-height:82px" minlength="5" placeholder="Trả lời lịch sự, tập trung vào câu hỏi..." required></textarea></div><div class="modal-action-row"><span class="modal-footer-hint">Phản hồi chỉ được thêm vào dữ liệu mẫu trong phiên này.</span><button class="button-primary" type="submit">${icon('send')} Gửi phản hồi mẫu</button></div></form>`);
  }
  function resourceModal(id) {
    const r = resources.find(x=>x.id===id);
    if(!r)return;
    openModal(r.title, `${r.course} · ${r.kind}`, `<p class="detail-body">${esc(r.description)}</p><div class="attachment-placeholder">${icon('files')}<p>Vùng xem trước tài liệu</p><small>Chưa có tệp PDF thật trong prototype này.</small></div><p class="detail-disclaimer">Khi tích hợp: kiểm tra nguồn tài liệu, quyền xem, kích thước tệp và preview PDF trước khi cho tải.</p>`);
  }
  function applyModal(id) {
    const g = groups.find(x=>x.id===id);
    if(!g)return;
    if(g.joined){toast('Bạn đã gửi quan tâm cho nhóm này trong bản demo.');return;}
    openModal('Gửi lời quan tâm', `${g.course} · TÌM NHÓM`, `<p class="detail-body">${esc(g.name)}</p><form id="apply-form" data-group-id="${g.id}"><div class="form-field"><label for="apply-text" class="form-label">Bạn muốn đóng góp điều gì?</label><textarea class="text-area" id="apply-text" minlength="15" required placeholder="Ví dụ: Mình có thể phụ trách kiểm thử các luồng chính và viết checklist..." style="min-height:115px"></textarea></div><div class="modal-action-row"><span class="modal-footer-hint">Mô phỏng đơn ứng tuyển, không gửi cho thành viên thật.</span><button class="button-primary" type="submit">${icon('send')} Gửi quan tâm mẫu</button></div></form>`);
  }
  function openSearchModal() {
    openModal('Tìm trong Campus Social', 'TÌM KIẾM', `<form id="global-search-form"><div class="form-field"><label class="form-label" for="global-search-input">Nhập từ khóa hoặc mã học phần</label><input id="global-search-input" class="text-input" placeholder="IT3080, tài liệu, nhóm, báo cáo..." autocomplete="off" required/></div><div class="modal-action-row"><span class="modal-footer-hint">Tìm trong dữ liệu minh họa của prototype.</span><button type="submit" class="button-primary">${icon('search')} Tìm kiếm</button></div></form>`);
    $('#global-search-input').focus();
  }
  function doSearch(term) {
    const q = String(term||'').trim();
    if(!q){toast('Hãy nhập từ khóa trước khi tìm kiếm.');return;}
    state.search = q;
    closeModal();
    state.view='search';
    render();
    $('#main-content').scrollIntoView({behavior:'smooth'});
  }
  function renderNotifications() {
    const panel=$('#notification-panel');
    panel.innerHTML=`<div class="notif-head"><strong>Thông báo</strong><button id="mark-all-read">Đánh dấu đã đọc</button></div>${notifications.length ? notifications.map(n=>`<div class="notification-item ${n.read?'read':''}"><span class="notif-circle"></span><div><p>${esc(n.text)}</p><small>${esc(n.time)}</small></div></div>`).join('') : '<div class="notifs-empty">Chưa có thông báo</div>'}<div style="font-size:10px;color:#98a09c;border-top:1px solid #f0f1ed;padding-top:10px">Dữ liệu thông báo minh họa.</div>`;
  }
  function toggleNotifications() {
    const isHidden = $('#notification-panel').classList.toggle('hidden');
    $('#notification-toggle').setAttribute('aria-expanded',String(!isHidden));
    if(!isHidden)renderNotifications();
  }

  document.addEventListener('click', e => {
    const target=e.target;
    if(target.closest('#starter-help,#sidebar-help')){helpModal();return;}
    if(target.closest('#starter-dismiss')){state.showStarter=false;render();return;}
    const guideGo=target.closest('[data-guide-go]');
    if(guideGo){const view=guideGo.dataset.guideGo;closeModal();if(view==='course')nav('course',{course:'IT3080',tab:'questions'});else nav(view);return;}
    const scopedGo=target.closest('[data-go-scoped]');
    if(scopedGo){nav(scopedGo.dataset.goScoped,{course:scopedGo.dataset.courseId});return;}
    const navBtn = target.closest('[data-nav]');
    if (navBtn) { nav(navBtn.dataset.nav); return; }
    const courseBtn = target.closest('[data-course]');
    if(courseBtn){nav('course',{course:courseBtn.dataset.course,tab:'questions'});return;}
    const filterBtn=target.closest('[data-filter-course]');
    if(filterBtn){
      const c=filterBtn.dataset.filterCourse;
      if(state.view==='home') { if(c==='all'){state.feedTab='all';render();} else nav('course',{course:c}); }
      else {state.course=c;if(c!=='all')state.lastCourse=c;render();}
      return;
    }
    const feedTab = target.closest('[data-feed-tab]');
    if(feedTab){state.feedTab=feedTab.dataset.feedTab;render();return;}
    const courseTab=target.closest('[data-course-tab]');
    if(courseTab){state.courseTab=courseTab.dataset.courseTab;render();return;}
    const openPost=target.closest('[data-post-open]');
    if(openPost){postModal(Number(openPost.dataset.postOpen));return;}
    const helpful=target.closest('[data-helpful]');
    if(helpful){const p=posts.find(x=>x.id===Number(helpful.dataset.helpful));if(p){p.liked=!p.liked;p.helpful+=p.liked?1:-1;render();toast(p.liked?'Đã đánh dấu câu hỏi hữu ích (demo).':'Đã bỏ đánh dấu hữu ích (demo).');}return;}
    const save=target.closest('[data-save]');
    if(save){const p=posts.find(x=>x.id===Number(save.dataset.save));if(p){p.saved=!p.saved;render();toast(p.saved?'Đã lưu để xem lại (demo).':'Đã bỏ lưu bài viết (demo).');}return;}
    const resource=target.closest('[data-resource-open]');
    if(resource){resourceModal(Number(resource.dataset.resourceOpen));return;}
    const group=target.closest('[data-group-apply]');
    if(group){applyModal(Number(group.dataset.groupApply));return;}
    if(target.closest('#top-ask,#quick-ask,#course-ask')){askModal();return;}
    if(target.closest('#top-search-trigger')){openSearchModal();return;}
    if(target.closest('#notification-toggle')){toggleNotifications();return;}
    if(target.closest('#mark-all-read')){notifications.forEach(n=>n.read=true);renderNotifications();updateNotificationBadge();toast('Đã đánh dấu thông báo mẫu là đã đọc.');return;}
    if(target.closest('[data-close-modal]')){closeModal();return;}
    if(target.id==='modal-root'){closeModal();return;}
    if(target.closest('#profile-button')){toast('Đây là tài khoản mô phỏng. Hồ sơ và quyền riêng tư sẽ được thiết kế sau khi chốt luồng chính.');return;}
    if(target.closest('#browse-courses')){nav('course');return;}
    if(!target.closest('#notification-panel') && !target.closest('#notification-toggle')){
      $('#notification-panel').classList.add('hidden');$('#notification-toggle').setAttribute('aria-expanded','false');
    }
  });
  document.addEventListener('submit', e => {
    if(e.target.id==='hero-search'){e.preventDefault();const q=$('#hero-search-input').value;doSearch(q);return;}
    if(e.target.id==='global-search-form'){e.preventDefault();doSearch($('#global-search-input').value);return;}
    if(e.target.id==='question-form'){
      e.preventDefault();
      const title=$('#question-title').value.trim(),body=$('#question-body').value.trim(),course=$('#question-course').value,anonymous=$('#question-anonymous').checked;
      if(title.length<12||body.length<20){toast('Hãy mô tả rõ hơn để mọi người dễ giúp bạn.');return;}
      posts.unshift({id:nextId++,name:anonymous?'Một sinh viên':'Bạn (demo)',avatar:anonymous?'?':'B',avatarClass:'avatar-d',time:'Vừa xong',course,topic:'Câu hỏi mới',title,excerpt:body.length>180?body.slice(0,178)+'…':body,body,answers:0,helpful:0,solved:false,saved:false,liked:false,answerText:'Chưa có phản hồi. Bạn có thể mở câu hỏi để thử tính năng trả lời.'});
      closeModal();state.view='course';state.course=course;state.courseTab='questions';render();toast('Đã thêm câu hỏi mẫu vào học phần '+course+'.');return;
    }
    if(e.target.id==='reply-form'){
      e.preventDefault();const post=posts.find(p=>p.id===Number(e.target.dataset.postId));const reply=$('#reply-text').value.trim();
      if(post && reply.length>=5){post.answers+=1;post.answerText=reply;closeModal();render();toast('Đã thêm phản hồi mẫu vào câu hỏi.');}return;
    }
    if(e.target.id==='apply-form'){
      e.preventDefault();const group=groups.find(g=>g.id===Number(e.target.dataset.groupId));const message=$('#apply-text').value.trim();if(group && message.length>=15){group.joined=true;closeModal();render();toast('Đã gửi quan tâm mẫu. Chưa có yêu cầu thật nào được tạo.');}return;
    }
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      if(!$('#modal-root').classList.contains('hidden'))closeModal();
      else{$('#notification-panel').classList.add('hidden');$('#notification-toggle').setAttribute('aria-expanded','false');}
      return;
    }
    if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !e.ctrlKey&&!e.metaKey){e.preventDefault();openSearchModal();}
    if(e.key==='Tab' && !$('#modal-root').classList.contains('hidden')){
      const focusable=$$('#modal-root button,#modal-root input,#modal-root textarea,#modal-root select').filter(el=>!el.disabled);
      if(focusable.length){const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
  });
  render();
})();
