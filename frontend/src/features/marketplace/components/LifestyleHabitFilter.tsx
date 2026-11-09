import React from 'react';
import {
  GenderPreference,
  HousingListingType,
  SleepScheduleHabit,
} from '../../../types/marketplace.types';

interface LifestyleHabitFilterProps {
  listingType: HousingListingType | '';
  maxBudgetVnd: string;
  sleepSchedule: SleepScheduleHabit | '';
  noSmokingOnly: boolean;
  genderPreference: GenderPreference | '';
  onListingTypeChange: (val: HousingListingType | '') => void;
  onMaxBudgetChange: (val: string) => void;
  onSleepScheduleChange: (val: SleepScheduleHabit | '') => void;
  onNoSmokingChange: (val: boolean) => void;
  onGenderChange: (val: GenderPreference | '') => void;
}

export const LifestyleHabitFilter: React.FC<LifestyleHabitFilterProps> = ({
  listingType,
  maxBudgetVnd,
  sleepSchedule,
  noSmokingOnly,
  genderPreference,
  onListingTypeChange,
  onMaxBudgetChange,
  onSleepScheduleChange,
  onNoSmokingChange,
  onGenderChange,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 14,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <select
        value={listingType}
        onChange={(e) =>
          onListingTypeChange(e.target.value as HousingListingType | '')
        }
        style={{
          padding: '9px 10px',
          borderRadius: 8,
          background: '#0f172a',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      >
        <option value="">Tất cả loại tin</option>
        <option value="ROOMMATE_WANTED">🤝 Tìm bạn ở ghép</option>
        <option value="ROOM_FOR_RENT">🏠 Phòng trọ cho thuê</option>
      </select>

      <input
        type="number"
        placeholder="Ngân sách tối đa (VD: 2500000)"
        value={maxBudgetVnd}
        onChange={(e) => onMaxBudgetChange(e.target.value)}
        style={{
          padding: '9px 12px',
          borderRadius: 8,
          background: '#0f172a',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      />

      <select
        value={sleepSchedule}
        onChange={(e) =>
          onSleepScheduleChange(e.target.value as SleepScheduleHabit | '')
        }
        style={{
          padding: '9px 10px',
          borderRadius: 8,
          background: '#0f172a',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      >
        <option value="">Mọi giờ giấc sinh hoạt</option>
        <option value="EARLY_BIRD">🌅 Ngủ sớm trước 23h</option>
        <option value="NIGHT_OWL">🦉 Cú đêm học bài</option>
        <option value="FLEXIBLE">🕒 Linh hoạt</option>
      </select>

      <select
        value={genderPreference}
        onChange={(e) =>
          onGenderChange(e.target.value as GenderPreference | '')
        }
        style={{
          padding: '9px 10px',
          borderRadius: 8,
          background: '#0f172a',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      >
        <option value="">Mọi giới tính</option>
        <option value="MALE">Nam</option>
        <option value="FEMALE">Nữ</option>
      </select>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#34d399',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={noSmokingOnly}
          onChange={(e) => onNoSmokingChange(e.target.checked)}
        />
        🚭 Không hút thuốc
      </label>
    </div>
  );
};
