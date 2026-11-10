import React from 'react';
import { UserPrivilegesResponse } from '../../../types/moderation.types';

interface PrivilegeUnlockProgressProps {
  privileges: UserPrivilegesResponse;
}

const TIERS = [
  {
    code: 'RESTRICTED',
    name: 'Tài khoản Giới hạn',
    minKarma: -999,
    description: 'Karma âm (< 0). Chặn tạo bài đăng mới & tải tài liệu.',
    color: '#f87171',
    perks: ['Cần tích lũy lại Karma bằng các câu trả lời hữu ích'],
  },
  {
    code: 'VERIFIED_MEMBER',
    name: 'Verified Student',
    minKarma: 0,
    description: 'Sinh viên đã xác thực email trường (.edu).',
    color: '#60a5fa',
    perks: [
      'Đăng bài, bình luận, hỏi đáp học tập',
      'Tham gia & tuyển nhóm đồ án',
      'Tải tối đa 10 tài liệu/ngày',
    ],
  },
  {
    code: 'ACTIVE_CONTRIBUTOR',
    name: 'Active Contributor',
    minKarma: 50,
    description: 'Đóng góp tích cực (từ 50 Karma trở lên).',
    color: '#34d399',
    perks: [
      'Mở khóa tải tài liệu KHÔNG GIỚI HẠN',
      'Huy hiệu Active Contributor trên hồ sơ',
      'Ưu tiên duyệt đơn ứng tuyển nhóm đồ án',
    ],
  },
  {
    code: 'TRUSTED_SCHOLAR',
    name: 'Trusted Scholar',
    minKarma: 150,
    description: 'Học giả uy tín hàng đầu (từ 150 Karma trở lên).',
    color: '#fbbf24',
    perks: [
      'Đặc quyền tạo nhóm thảo luận chuyên đề riêng',
      'Huy hiệu Trusted Scholar vinh danh trên diễn đàn',
      'Quyền đề cử tài liệu xuất sắc lên trang chủ',
    ],
  },
];

export const PrivilegeUnlockProgress: React.FC<PrivilegeUnlockProgressProps> = ({
  privileges,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, color: '#fff' }}>
            🏆 Tiến trình Mở khóa Đặc quyền Học thuật
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            Điểm Karma mở khóa các tính năng cao cấp: Tải tài liệu không giới hạn & Khởi tạo nhóm nghiên cứu riêng.
          </p>
        </div>

        {/* Daily Download Quota Pill */}
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'rgba(59, 130, 246, 0.14)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lượt tải tài liệu hôm nay:</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>
            {privileges.dailyDownloadLimit === null
              ? 'Không giới hạn (Unlimited)'
              : `${privileges.downloadsUsedToday} / ${privileges.dailyDownloadLimit} (Còn ${privileges.remainingDownloadsToday})`}
          </div>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {TIERS.map((tier) => {
          const isCurrent = privileges.tierCode === tier.code;
          const isUnlocked =
            tier.code === 'RESTRICTED'
              ? privileges.karmaPoints < 0
              : privileges.karmaPoints >= tier.minKarma;

          return (
            <div
              key={tier.code}
              style={{
                borderRadius: 12,
                padding: 16,
                background: isCurrent
                  ? 'rgba(30, 41, 59, 0.95)'
                  : 'rgba(15, 23, 42, 0.45)',
                border: isCurrent
                  ? `2px solid ${tier.color}`
                  : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: tier.color,
                    }}
                  >
                    {tier.name}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: tier.color,
                        color: '#0f172a',
                      }}
                    >
                      BẬC HIỆN TẠI
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {tier.minKarma < 0 ? 'Dưới 0 Karma' : `Từ ${tier.minKarma} Karma trở lên`}
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    margin: '8px 0',
                    lineHeight: 1.4,
                  }}
                >
                  {tier.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {tier.perks.map((perk, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: isUnlocked ? '#e2e8f0' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ color: isUnlocked ? tier.color : 'var(--text-muted)' }}>
                        {isUnlocked ? '✓' : '•'}
                      </span>
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
