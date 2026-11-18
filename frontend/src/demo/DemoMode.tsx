import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from './demo.store';
import styles from './DemoMode.module.css';

export const DEMO_WRITE_MESSAGE = 'Thao tác này cần đăng nhập thật. Chế độ demo chỉ cho phép xem, không ghi dữ liệu.';

export const DemoModeBanner: React.FC = () => {
  const active = useDemoStore(state => state.active);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!active) return;
    const blocked = () => setNotice(DEMO_WRITE_MESSAGE);
    window.addEventListener('campus-demo-write-blocked', blocked);
    // Legacy screens have independent action components. Disable their write controls
    // without replacing those components or changing any real authentication state.
    const changed = new Map<HTMLButtonElement, { disabled: boolean; title: string }>();
    const disableWrites = () => document.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
      if (button.closest('[data-demo-banner]') || button.hasAttribute('data-demo-read-action')) return;
      const label = `${button.textContent} ${button.getAttribute('aria-label') || ''} ${changed.get(button)?.title || button.title}`;
      if ((button.type === 'submit' && !!button.closest('form:not([role="search"])')) || /[▲▼👍👎]|IN_PROGRESS|REVIEW|upvote|downvote|helpful|hữu ích|gửi|đăng (bài|tin|câu hỏi)|tạo |upload|tải (về|xuống)|tải về|ứng tuyển|duyệt|từ chối|xóa|xoá|đánh dấu|chấp nhận|chọn làm|hoàn thành|lưu (thay đổi|hồ sơ)|cập nhật|báo cáo/i.test(label)) {
        if (!changed.has(button)) changed.set(button, { disabled: button.disabled, title: button.title });
        button.disabled = true;
        button.title = DEMO_WRITE_MESSAGE;
      }
    });
    disableWrites();
    const observer = new MutationObserver(disableWrites);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('campus-demo-write-blocked', blocked);
      changed.forEach((original, button) => { button.disabled = original.disabled; button.title = original.title; });
    };
  }, [active]);
  if (!active || !notice) return null;
  return <div className={styles.banner} data-demo-banner>
    <span className={styles.notice} role="status">{notice}</span>
  </div>;
};

export const DemoUnavailable: React.FC = () => <main className={styles.unavailable}>
  <h1>Trang này cần đăng nhập thật</h1>
  <p>Hồ sơ cá nhân và quản trị không được mở bằng mã demo. Hãy thoát demo và đăng nhập bằng tài khoản có quyền phù hợp.</p>
  <Link to="/feed">Về trang chủ demo</Link>
</main>;
