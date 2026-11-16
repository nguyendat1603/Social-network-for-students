import React from 'react';
import {
  HousingListing,
  HousingStatus,
} from '../../../types/marketplace.types';
import { VerifiedStudentBadge } from '../../../components/common/VerifiedStudentBadge';

interface HousingListingCardProps {
  listing: HousingListing;
  currentUserId?: string;
  onMessagePoster: (posterId: string, listingTitle: string) => void;
  onStatusChange: (listingId: string, status: HousingStatus) => void;
}

const SLEEP_LABELS: Record<string, string> = {
  EARLY_BIRD: '🌅 Ngủ sớm trước 23h',
  NIGHT_OWL: '🦉 Cú đêm học bài',
  FLEXIBLE: '🕒 Giờ giấc linh hoạt',
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  ANY: 'Nam/Nữ đều được',
};

export const HousingListingCard: React.FC<HousingListingCardProps> = ({
  listing,
  currentUserId,
  onMessagePoster,
  onStatusChange,
}) => {
  const isOwner = currentUserId === listing.poster_id;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 20,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              background:
                listing.listing_type === 'ROOMMATE_WANTED'
                  ? 'var(--color-highlight-yellow)'
                  : 'var(--color-fog-mist)',
              color:
                listing.listing_type === 'ROOMMATE_WANTED'
                  ? '#34d399'
                  : '#60a5fa',
            }}
          >
            {listing.listing_type === 'ROOMMATE_WANTED'
              ? '🤝 Tìm bạn ở ghép'
              : '🏠 Nhượng / Cho thuê phòng trọ'}
          </span>

          {listing.distance_to_campus_km !== null &&
            listing.distance_to_campus_km !== undefined && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                📍 Cách trường {listing.distance_to_campus_km} km
              </span>
            )}
        </div>

        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{listing.title}</h3>

        <div style={{ fontSize: 13, color: 'var(--color-charcoal-ink)' }}>
          Khu vực: <strong>{listing.address_district}</strong>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {listing.description}
        </p>

        {/* Lifestyle Habit Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 20,
              background: 'rgba(30, 41, 59, 0.9)',
              color: 'var(--color-charcoal-ink)',
            }}
          >
            {SLEEP_LABELS[listing.sleep_schedule] || listing.sleep_schedule}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 20,
              background: listing.smoking_allowed
                ? 'var(--color-sand-wash)'
                : 'var(--color-highlight-yellow)',
              color: listing.smoking_allowed ? '#fbbf24' : '#34d399',
            }}
          >
            {listing.smoking_allowed ? '🚬 Cho phép hút thuốc' : '🚭 Không hút thuốc'}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 20,
              background: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
            }}
          >
            {listing.cooking_allowed ? '🍳 Được nấu ăn' : '🍱 Không nấu ăn'}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 20,
              background: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
            }}
          >
            👤 Ưu tiên: {GENDER_LABELS[listing.gender_preference]}
          </span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-charcoal-ink)' }}>
          {Number(listing.monthly_rent_vnd).toLocaleString('vi-VN')} đ / tháng
        </div>
      </div>

      {/* Verified Poster Footer */}
      <div
        style={{
          paddingTop: 12,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-charcoal-ink)', fontWeight: 600 }}>
            {listing.poster?.full_name || 'Sinh viên'}
          </span>
          <VerifiedStudentBadge
            isVerified={Boolean(listing.poster?.is_verified_student)}
            size="sm"
          />
        </div>

        {isOwner ? (
          <button
            type="button"
            onClick={() =>
              onStatusChange(
                listing.id,
                listing.status === 'OPEN' ? 'CLOSED' : 'OPEN'
              )
            }
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              background: 'var(--color-fog-mist)',
              border: '1px solid var(--border-color)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {listing.status === 'OPEN' ? 'Đóng tin đăng' : 'Mở lại tin'}
          </button>
        ) : listing.status === 'OPEN' ? (
          <button
            type="button"
            onClick={() => onMessagePoster(listing.poster_id, listing.title)}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              background: 'var(--brand-primary)',
              border: 'none',
              color: 'var(--color-charcoal-ink)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            💬 Nhắn tin người đăng
          </button>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Đã tìm đủ người
          </span>
        )}
      </div>
    </div>
  );
};
