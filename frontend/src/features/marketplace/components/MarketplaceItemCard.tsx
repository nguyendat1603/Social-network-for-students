import React from 'react';
import {
  ItemStatus,
  MarketplaceItem,
} from '../../../types/marketplace.types';
import { VerifiedStudentBadge } from '../../../components/common/VerifiedStudentBadge';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  currentUserId?: string;
  onMessageSeller: (sellerId: string, itemTitle: string) => void;
  onStatusChange: (itemId: string, status: ItemStatus) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  TEXTBOOK: '📚 Giáo trình cũ',
  CALCULATOR: '🧮 Máy tính cầm tay',
  HARDWARE_KIT: '🔌 Kit Vi điều khiển / Linh kiện',
  DORM_ITEM: '🛋️ Đồ dùng phòng trọ',
  OTHER: '📦 Khác',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới 100%',
  LIKE_NEW_90: 'Mới 90%',
  USED_GOOD: 'Dùng tốt',
  SLIGHTLY_DAMAGED: 'Hỏng nhẹ',
};

export const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  item,
  currentUserId,
  onMessageSeller,
  onStatusChange,
}) => {
  const isOwner = currentUserId === item.seller_id;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(59, 130, 246, 0.14)',
              color: '#60a5fa',
            }}
          >
            {CATEGORY_LABELS[item.category] || item.category}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(148, 163, 184, 0.14)',
              color: 'var(--text-secondary)',
            }}
          >
            {CONDITION_LABELS[item.condition] || item.condition}
          </span>
        </div>

        <h3 style={{ margin: 0, fontSize: 16, color: '#fff' }}>{item.title}</h3>

        {item.course && (
          <div style={{ fontSize: 12, color: '#93c5fd' }}>
            Gắn môn học: <strong>#{item.course.code}</strong> — {item.course.name}
          </div>
        )}

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {item.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: item.is_free ? '#34d399' : '#fbbf24',
            }}
          >
            {item.is_free
              ? '🎁 Tặng miễn phí (0đ • +5 Karma)'
              : `${Number(item.price_vnd).toLocaleString('vi-VN')} đ`}
          </div>
          {item.pickup_location && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              📍 {item.pickup_location}
            </span>
          )}
        </div>
      </div>

      {/* Verified Seller Footer (No Anonymity) */}
      <div
        style={{
          paddingTop: 12,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>
            {item.seller?.full_name || 'Sinh viên'}
          </div>
          <VerifiedStudentBadge
            isVerified={Boolean(item.seller?.is_verified_student)}
            size="sm"
          />
        </div>

        {isOwner ? (
          <select
            value={item.status}
            onChange={(e) =>
              onStatusChange(item.id, e.target.value as ItemStatus)
            }
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: '#0f172a',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: 12,
            }}
          >
            <option value="AVAILABLE">Còn hàng (AVAILABLE)</option>
            <option value="RESERVED">Đã đặt gạch (RESERVED)</option>
            <option value="SOLD">Đã bán / Đã tặng (SOLD)</option>
          </select>
        ) : item.status === 'AVAILABLE' ? (
          <button
            type="button"
            onClick={() => onMessageSeller(item.seller_id, item.title)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            💬 Nhắn tin người bán
          </button>
        ) : (
          <span
            style={{
              fontSize: 12,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'rgba(148, 163, 184, 0.14)',
              color: 'var(--text-muted)',
            }}
          >
            {item.status === 'RESERVED' ? 'Đã đặt gạch' : 'Đã thanh lý'}
          </span>
        )}
      </div>
    </div>
  );
};
