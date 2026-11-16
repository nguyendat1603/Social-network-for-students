/* Lightweight DOM-free smoke test for the prototype's navigation state machine.
   It does not replace real browser/assistive technology testing. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const filename = __dirname + '/app.js';
const handlers = {};
const elements = new Map();
function element(id){
  if(!elements.has(id)){
    const active = new Set(id==='modal-root'||id==='notification-panel' ? ['hidden'] : []);
    const obj={ innerHTML:'',textContent:'',style:{},dataset:{},attributes:{},
      classList:{add:(c)=>active.add(c),remove:(c)=>active.delete(c),contains:(c)=>active.has(c),toggle:(c)=>{active.has(c)?active.delete(c):active.add(c);return active.has(c)}},
      setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},
      focus(){},scrollIntoView(){},querySelector(){return element('close-modal')},querySelectorAll(){return []}
    };
    elements.set(id,obj);
  }
  return elements.get(id);
}
const document={
  body:{style:{}},activeElement:{tagName:'BODY',focus(){}},
  querySelector(sel){return element(sel)},querySelectorAll(sel){return []},
  addEventListener(name,cb){handlers[name]=cb}
};
vm.runInNewContext(fs.readFileSync(filename,'utf8'), {document,console,setTimeout,clearTimeout});
function click(selector,dataset={}){
  const target = { id:selector.startsWith('#')?selector.slice(1):'',dataset,
    closest(query){
      return query.split(',').some(q=>q.trim()===selector)?this:null;
    }
  };
  handlers.click({target});
}
const html=()=>element('#main-content').innerHTML;
assert.match(html(), /Lần đầu đến đây/);
assert.match(html(), /Hỏi về môn học/);
click('#starter-help');
assert.match(element('#modal-root').innerHTML, /chọn học phần, rồi chọn việc muốn làm/);
click('[data-guide-go]',{guideGo:'course'});
assert.match(html(), /Học phần IT3080/);
click('[data-course-tab]',{courseTab:'documents'});
assert.match(html(), /Mẫu cấu trúc báo cáo bài tập lớn/);
click('[data-go-scoped]',{goScoped:'resources', courseId:'IT3080'});
assert.match(html(), /Tài liệu · IT3080/);
assert.doesNotMatch(html(), /Ghi chú ôn tập theo chủ đề/);
click('[data-course]',{course:'IT3080'});
assert.match(html(), /Học phần IT3080/);
click('[data-course-tab]',{courseTab:'groups'});
click('[data-go-scoped]',{goScoped:'groups',courseId:'IT3080'});
assert.match(html(), /Tìm nhóm · IT3080/);
click('[data-nav]',{nav:'saved'});
assert.match(html(), /Đã lưu để xem lại/);
click('[data-nav]',{nav:'home'});
click('#starter-dismiss');
assert.doesNotMatch(html(), /Lần đầu đến đây/);
assert.match(html(), /Xem hướng dẫn nhanh/);
click('[data-nav]',{nav:'course'});
assert.match(html(), /Học phần IT3080/);
console.log('PASS: Guide → course → documents → scoped resources → course → groups → saved → home → dismiss.');
