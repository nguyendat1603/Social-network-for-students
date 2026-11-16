import React from 'react';

export const VerifiedStudentBadge: React.FC<{ isVerified: boolean; size?: 'sm' | 'md' }> = ({ isVerified, size = 'md' }) =>
  <span className="campus-verified-badge" title={isVerified ? 'Sinh viên đã xác thực email trường' : 'Chưa xác thực email trường'} style={{
    display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
    padding: size === 'sm' ? '4px 8px' : '5px 10px', borderRadius: 6,
    fontSize: size === 'sm' ? 11 : 12, fontWeight: 650,
    background: isVerified ? '#edf4ee' : '#f2f1ec', color: isVerified ? '#3d6a50' : '#69675e',
  }}>{isVerified ? '✓ Đã xác thực' : 'Chưa xác thực'}</span>;
