// Run via: node tests/campus-shell.browser.cjs http://127.0.0.1:5177 regressions
// Uses the smoke runner's isolated auth and intercepted API; never a real backend.
module.exports = async ({ send, evaluate, until, baseUrl, assert, artifacts, setCatalogMode }) => {
  const screenshot = async name => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    require('node:fs').writeFileSync(require('node:path').join(artifacts, name + '.png'), Buffer.from(data, 'base64'));
  };
  const navigate = route => send('Page.navigate', { url: baseUrl + route });
  const change = (selector, value) => evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  })()`);
  const pause = () => new Promise(resolve => setTimeout(resolve, 200));

  setCatalogMode('error');
  await navigate('/resources?code=IT3080');
  await until(`!!document.querySelector('[role=alert] button')`);
  assert.equal(await evaluate(`document.querySelector('main').innerText.includes('Đang tải kho tài liệu')`), false);
  setCatalogMode('normal');
  await evaluate(`document.querySelector('[role=alert] button').click()`);
  await until(`!!document.querySelector('main a[href="/resources/demo-document"]')`);
  assert.equal(await evaluate(`!!document.querySelector('[role=alert]')`), false);
  setCatalogMode('empty');
  await navigate('/resources?code=IT3080');
  await until(`document.querySelector('[role=alert]')?.textContent.includes('Không tìm thấy học phần')`);
  assert.equal(await evaluate(`document.querySelector('main').innerText.includes('Đang tải kho tài liệu')`), false);
  await navigate('/resources');
  await until(`!!document.querySelector('main a[href="/resources/demo-document"]')`);
  setCatalogMode('normal');
  await navigate('/resources?code=UNKNOWN');
  await until(`!!document.querySelector('[role=alert]')`);
  assert.equal(await evaluate(`!!document.querySelector('main a[href="/resources/demo-document"]')`), false);
  await change('#resource-filter-1', '1');
  await until(`!!document.querySelector('main a[href="/resources/demo-document"]') && !document.querySelector('[role=alert]')`);
  console.log('PASS catalog failure/retry, empty catalog and invalid resource course recovery');
  for (const mode of ['hierarchy-error', 'resource-error']) {
    setCatalogMode(mode);
    await navigate('/resources?code=IT3080');
    await until(`!!document.querySelector('[role=alert] button')`);
    assert.equal(await evaluate(`document.querySelector('main').innerText.includes('Chưa có tài liệu')`), false);
    setCatalogMode('normal');
    await evaluate(`document.querySelector('[role=alert] button').click()`);
    await until(`!!document.querySelector('main a[href="/resources/demo-document"]') && !document.querySelector('[role=alert]')`);
  }

  await navigate('/study-groups?code=UNKNOWN');
  await until(`document.querySelector('[role=alert]')?.textContent.includes('Không tìm thấy học phần')`);
  assert.equal(await evaluate(`document.querySelector('main').innerText.includes('Chưa có nhóm')`), false);
  await change('main select', '1');
  await until(`!document.querySelector('[role=alert]') && document.querySelector('main').innerText.includes('[Demo] Nhóm học')`);
  console.log('PASS invalid study course preserves catalog and recovers through course selection');
  setCatalogMode('group-error');
  await navigate('/study-groups?code=IT3080');
  await until(`!!document.querySelector('[role=alert] button')`);
  assert.equal(await evaluate(`document.querySelector('main').innerText.includes('Chưa có nhóm')`), false);
  setCatalogMode('normal');
  await evaluate(`document.querySelector('[role=alert] button').click()`);
  await until(`!document.querySelector('[role=alert]') && document.querySelector('main').innerText.includes('[Demo] Nhóm học')`);

  for (const width of [320, 390, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 600, deviceScaleFactor: 1, mobile: width < 810 });
    await navigate('/resources?code=IT3080');
    await until(`!!document.querySelector('main a[href="/resources/demo-document"]')`);
    assert.equal(await evaluate(`document.documentElement.scrollWidth > innerWidth + 1`), false);
    if (width < 810) assert.equal(await evaluate(`Array.from(document.querySelectorAll('.campus-resource-filters select')).every(el => el.getBoundingClientRect().width > 240)`), true);
    await screenshot(`resources-${width}`);
    await navigate('/feed');
    await until(`!!document.querySelector('[data-campus-ask]')`);
    await evaluate(`document.querySelector('[data-campus-ask]').focus(); document.querySelector('[data-campus-ask]').click()`);
    await until(`!!document.querySelector('[role=dialog] form')`);
    assert.equal(await evaluate(`(() => { const f=document.querySelector('[role=dialog] form'), r=f.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && f.scrollHeight >= f.clientHeight; })()`), true);
    assert.equal(await evaluate(`(() => {const f=document.querySelector('[role=dialog] form'); return f.scrollWidth <= f.clientWidth && document.documentElement.scrollWidth <= innerWidth;})()`), true);
    await evaluate(`document.querySelector('[role=dialog] button[type=submit]').focus()`);
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Tab', code:'Tab', windowsVirtualKeyCode:9 });
    assert.equal(await evaluate(`document.querySelector('[role=dialog] button') === document.activeElement`), true);
    await evaluate(`document.querySelector('[role=dialog] button[type=submit]').scrollIntoView({block:'nearest'})`);
    assert.equal(await evaluate(`document.querySelector('[role=dialog] button[type=submit]').getBoundingClientRect().bottom <= innerHeight`), true);
    await screenshot(`composer-${width}`);
    await evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true }))`);
    await until(`!document.querySelector('[role=dialog]')`);
    assert.equal(await evaluate(`document.activeElement.hasAttribute('data-campus-ask')`), true);
    console.log(`PASS filters and scrollable composer ${width}x600, Escape restores focus`);
  }

  await navigate('/course-reviews/IT3080');
  await until(`Array.from(document.querySelectorAll('main button')).some(b=>b.textContent.includes('Viết'))`);
  await evaluate(`Array.from(document.querySelectorAll('main button')).find(b=>b.textContent.includes('Viết')).click()`);
  await until(`!!document.querySelector('[role=dialog]')`);
  assert.equal(await evaluate(`(() => { const labels=[...document.querySelectorAll('[role=dialog] label')].filter(l=>l.htmlFor.includes('-rating-')); return labels.length===5 && new Set(labels.map(l=>l.htmlFor)).size===5 && labels.every(l=>{l.click();return document.activeElement===l.control;}); })()`), true);
  console.log('PASS all five rating labels focus their unique controls');

  await navigate('/messenger?convId=A');
  await until(`document.querySelector('main')?.innerText.includes('Private message A')`);
  // Hold a send to A while switching to B. A's eventual refresh must not replace B.
  await evaluate(`(() => { const original=window.fetch; window.fetch=async (...args)=>{if(args[1]?.method==='POST') await new Promise(r=>window.releaseSend=r);return original(...args);}; })()`);
  await change('main form input', 'Send to A');
  await evaluate(`document.querySelector('main form').requestSubmit()`);
  await until(`!!window.releaseSend`);
  await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Peer B')).click()`);
  await until(`document.querySelector('main')?.innerText.includes('Private message B')`);
  await change('main form input', 'Draft for B');
  await evaluate(`window.releaseSend()`);
  await pause();
  assert.equal(await evaluate(`location.search === '?convId=B' && !document.querySelector('main').innerText.includes('Private message A') && document.querySelector('main form input').value === 'Draft for B'`), true);
  // Hold an A read, switch again, and reject the stale response.
  await evaluate(`(() => { const original=window.fetch;window.fetch=async (...args)=>{if(String(args[0]).endsWith('/A/messages') && !args[1]?.method) await new Promise(r=>window.rejectRead=r);return original(...args);}; })()`);
  await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Peer A')).click()`);
  await until(`!!window.rejectRead`);
  await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Peer B')).click()`);
  await until(`document.querySelector('main')?.innerText.includes('Private message B')`);
  await evaluate(`window.rejectRead()`);
  await pause();
  assert.equal(await evaluate(`!document.querySelector('main').innerText.includes('Private message A')`), true);
  // The same pending-read path with an error must not put an error on B.
  await evaluate(`window.fetch=async (...args)=>{if(String(args[0]).endsWith('/A/messages')) await new Promise((_,reject)=>window.failRead=()=>reject(new Error('stale A error')));return new Response(JSON.stringify({success:true,data:[{id:'b',sender_id:'peer-B',message_type:'TEXT',content:'Private message B',created_at:'2026-11-12T08:00:00Z'}]}),{status:200});}`);
  await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Peer A')).click()`);
  await until(`!!window.failRead`);
  await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Peer B')).click()`);
  await until(`document.querySelector('main')?.innerText.includes('Private message B')`);
  await evaluate(`window.failRead()`);
  await pause();
  assert.equal(await evaluate(`!!document.querySelector('[role=alert]')`), false);
  console.log('PASS delayed send, refresh-after-send, stale read and stale error cannot update B');
  console.log(`Screenshots: ${artifacts}`);
};
