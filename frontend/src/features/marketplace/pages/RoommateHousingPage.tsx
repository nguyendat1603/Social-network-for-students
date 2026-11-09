import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAuth } from '../../../hooks/useAuth';
import { marketplaceService } from '../../../services/marketplace.service';
import { communicationService } from '../../../services/communication.service';
import {
  GenderPreference,
  HousingListing,
  HousingListingType,
  SleepScheduleHabit,
} from '../../../types/marketplace.types';
import { LifestyleHabitFilter } from '../components/LifestyleHabitFilter';
import { HousingListingCard } from '../components/HousingListingCard';
import { PostHousingModal } from '../components/PostHousingModal';

export const RoommateHousingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<HousingListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [listingType, setListingType] = useState<HousingListingType | ''>('');
  const [maxBudgetVnd, setMaxBudgetVnd] = useState('');
  const [sleepSchedule, setSleepSchedule] = useState<SleepScheduleHabit | ''>('');
  const [noSmokingOnly, setNoSmokingOnly] = useState(false);
  const [genderPreference, setGenderPreference] =
    useState<GenderPreference | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadHousing = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.listHousing({
        listingType: listingType || undefined,
        maxBudgetVnd: maxBudgetVnd ? Number(maxBudgetVnd) : undefined,
        sleepSchedule: sleepSchedule || undefined,
        smokingAllowed: noSmokingOnly ? false : undefined,
        genderPreference: genderPreference || undefined,
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to load housing listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHousing();
  }, [listingType, maxBudgetVnd, sleepSchedule, noSmokingOnly, genderPreference]);

  const handleMessagePoster = async (posterId: string, listingTitle: string) => {
    try {
      const conv = await communicationService.startDirectConversation({
        targetUserId: posterId,
        initialMessage: `Chào bạn, mình đọc được tin "${listingTitle}" trên mục Nhà trọ & Tìm bạn ở ghép MXH_HSSV và muốn trao đổi thêm ạ!`,
      });
      navigate(`${APP_ROUTES.MESSENGER}?convId=${conv.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể mở cuộc trò chuyện');
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Link
                to={APP_ROUTES.MARKETPLACE_ITEMS}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(148, 163, 184, 0.14)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                🛒 Chợ Đồ dùng Học tập
              </Link>
              <Link
                to={APP_ROUTES.HOUSING_FINDER}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                🏠 Tìm Bạn ở ghép & Trọ gần trường
              </Link>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, color: '#fff' }}>
              🏠 Tìm Bạn Ở Ghép & Phòng Trọ Sinh Viên
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Khớp bạn cùng phòng theo ngân sách tối đa, khoảng cách tới trường và thói quen sinh hoạt (giờ giấc ngủ, hút thuốc, nấu ăn).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            + Đăng tin Tìm trọ / Ở ghép
          </button>
        </div>

        <LifestyleHabitFilter
          listingType={listingType}
          maxBudgetVnd={maxBudgetVnd}
          sleepSchedule={sleepSchedule}
          noSmokingOnly={noSmokingOnly}
          genderPreference={genderPreference}
          onListingTypeChange={setListingType}
          onMaxBudgetChange={setMaxBudgetVnd}
          onSleepScheduleChange={setSleepSchedule}
          onNoSmokingChange={setNoSmokingOnly}
          onGenderChange={setGenderPreference}
        />

        {loading ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải danh sách phòng trọ & bạn ở ghép...
          </div>
        ) : listings.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 36,
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            Chưa có tin đăng nào khớp tiêu chí lối sống & ngân sách.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}
          >
            {listings.map((listing) => (
              <HousingListingCard
                key={listing.id}
                listing={listing}
                currentUserId={user?.userId}
                onMessagePoster={handleMessagePoster}
                onStatusChange={async (listingId, status) => {
                  await marketplaceService.updateHousingStatus(listingId, status);
                  await loadHousing();
                }}
              />
            ))}
          </div>
        )}
      </div>

      <PostHousingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await marketplaceService.createHousingListing(payload);
          await loadHousing();
        }}
      />
    </MainLayout>
  );
};
