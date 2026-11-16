import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from './demo.store';
import styles from './DemoMode.module.css';

export const DemoAccess: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const enter = useDemoStore(state => state.enter);
  const navigate = useNavigate();
  if (!import.meta.env.DEV) return null;
  return <section className={styles.access} aria-labelledby="demo-access-title">
    <h2 id="demo-access-title">Truy cập bản demo</h2>
    <p>Chỉ dành cho phát triển. Xem giao diện bằng dữ liệu minh họa, không cần kết nối backend.</p>
    <form onSubmit={event => {
      event.preventDefault();
      if (!enter(code)) { setError('Mã demo không đúng. Vui lòng thử lại.'); return; }
      navigate('/feed');
    }}>
      <label htmlFor="demo-code">Mã truy cập demo</label>
      <input id="demo-code" inputMode="numeric" autoComplete="off" value={code} onChange={event => { setCode(event.target.value); setError(''); }} aria-describedby={error ? 'demo-code-error' : undefined} aria-invalid={!!error} />
      {error && <p id="demo-code-error" role="alert">{error}</p>}
      <button type="submit">Vào chế độ demo</button>
    </form>
  </section>;
};
