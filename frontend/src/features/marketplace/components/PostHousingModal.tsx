import React, { useState } from 'react';
import {
  GenderPreference,
  HousingListingType,
  SleepScheduleHabit,
} from '../../../types/marketplace.types';

interface PostHousingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    listingType: HousingListingType;
    title: string;
    description: string;
    addressDistrict: string;
    distanceToCampusKm?: number | null;
    monthlyRentVnd: number;
    maxBudgetVnd?: number | null;
    sleepSchedule: SleepScheduleHabit;
    smokingAllowed: boolean;
    cookingAllowed: boolean;
    genderPreference: GenderPreference;
  }) => Promise<void>;
}

export const PostHousingModal: React.FC<PostHousingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [listingType, setListingType] =
    useState<HousingListingType>('ROOMMATE_WANTED');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressDistrict, setAddressDistrict] = useState(
    'Ngõ Tự Do / Trần Đại Nghĩa, Hai Bà Trưng'
  );
  const [distanceToCampusKm, setDistanceToCampusKm] = useState('0.8');
  const [monthlyRentVnd, setMonthlyRentVnd] = useState(2200000);
  const [sleepSchedule, setSleepSchedule] =
    useState<SleepScheduleHabit>('EARLY_BIRD');
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [cookingAllowed, setCookingAllowed] = useState(true);
  const [genderPreference, setGenderPreference] =
    useState<GenderPreference>('ANY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        listingType,
        title,
        description,
        addressDistrict,
        distanceToCampusKm: distanceToCampusKm ? Number(distanceToCampusKm) : null,
        monthlyRentVnd: Number(monthlyRentVnd),
        maxBudgetVnd: Number(monthlyRentVnd),
        sleepSchedule,
        smokingAllowed,
        cookingAllowed,
        genderPreference,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng tin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 580,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>
            🏠 Đăng Tin Tìm Bạn Ở Ghép / Phòng Trọ Sinh Viên
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: 10,
              marginBottom: 12,
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.16)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loại tin đăng</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as HousingListingType)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="ROOMMATE_WANTED">🤝 Tìm bạn ở ghép</option>
                <option value="ROOM_FOR_RENT">🏠 Nhượng / Cho thuê phòng</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Chi phí / người / tháng (VNĐ)
              </label>
              <input
                type="number"
                required
                value={monthlyRentVnd}
                onChange={(e) => setMonthlyRentVnd(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tiêu đề tin</label>
            <input
              required
              placeholder="VD: Tìm 1 bạn nam K67-K69 ở ghép phòng khép kín ngõ Tự Do"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Khu vực / Địa chỉ
              </label>
              <input
                required
                value={addressDistrict}
                onChange={(e) => setAddressDistrict(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Cách trường (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={distanceToCampusKm}
                onChange={(e) => setDistanceToCampusKm(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Giờ giấc sinh hoạt
              </label>
              <select
                value={sleepSchedule}
                onChange={(e) =>
                  setSleepSchedule(e.target.value as SleepScheduleHabit)
                }
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="EARLY_BIRD">🌅 Ngủ sớm trước 23h</option>
                <option value="NIGHT_OWL">🦉 Cú đêm học bài</option>
                <option value="FLEXIBLE">🕒 Linh hoạt</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Ưu tiên giới tính
              </label>
              <select
                value={genderPreference}
                onChange={(e) =>
                  setGenderPreference(e.target.value as GenderPreference)
                }
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="ANY">Nam / Nữ đều được</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={cookingAllowed}
                onChange={(e) => setCookingAllowed(e.target.checked)}
              />
              🍳 Được nấu ăn trong phòng
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={smokingAllowed}
                onChange={(e) => setSmokingAllowed(e.target.checked)}
              />
              🚬 Cho phép hút thuốc
            </label>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mô tả tiện ích phòng & yêu cầu bạn cùng phòng
            </label>
            <textarea
              required
              rows={3}
              placeholder="Điều hòa, nóng lạnh, để xe tầng 1, giờ giấc tự do không chung chủ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: 10,
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Đang đăng...' : 'Đăng tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
