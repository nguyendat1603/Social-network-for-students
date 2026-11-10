import React from 'react';
import {
  ItemCategory,
  ItemCondition,
} from '../../../types/marketplace.types';

interface ItemConditionFilterProps {
  category: ItemCategory | '';
  condition: ItemCondition | '';
  maxPriceVnd: string;
  onlyFree: boolean;
  search: string;
  onCategoryChange: (val: ItemCategory | '') => void;
  onConditionChange: (val: ItemCondition | '') => void;
  onMaxPriceChange: (val: string) => void;
  onOnlyFreeChange: (val: boolean) => void;
  onSearchChange: (val: string) => void;
  onApply: () => void;
}

export const ItemConditionFilter: React.FC<ItemConditionFilterProps> = ({
  category,
  condition,
  maxPriceVnd,
  onlyFree,
  search,
  onCategoryChange,
  onConditionChange,
  onMaxPriceChange,
  onOnlyFreeChange,
  onSearchChange,
  onApply,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 14,
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <input
        placeholder="Tìm giáo trình, Casio fx-580VNX, kit Arduino..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onApply()}
        style={{
          padding: '9px 12px',
          borderRadius: 8,
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      />

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as ItemCategory | '')}
        style={{
          padding: '9px 10px',
          borderRadius: 8,
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      >
        <option value="">Tất cả danh mục</option>
        <option value="TEXTBOOK">📚 Giáo trình cũ</option>
        <option value="CALCULATOR">🧮 Máy tính cầm tay</option>
        <option value="HARDWARE_KIT">🔌 Kit vi điều khiển / Linh kiện</option>
        <option value="DORM_ITEM">🛋️ Đồ dùng phòng trọ</option>
        <option value="OTHER">📦 Khác</option>
      </select>

      <select
        value={condition}
        onChange={(e) => onConditionChange(e.target.value as ItemCondition | '')}
        style={{
          padding: '9px 10px',
          borderRadius: 8,
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      >
        <option value="">Mọi tình trạng đồ</option>
        <option value="NEW">Mới 100%</option>
        <option value="LIKE_NEW_90">Mới 90%</option>
        <option value="USED_GOOD">Dùng tốt</option>
        <option value="SLIGHTLY_DAMAGED">Hỏng nhẹ</option>
      </select>

      <input
        type="number"
        placeholder="Giá tối đa (VNĐ)"
        value={maxPriceVnd}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onApply()}
        style={{
          padding: '9px 12px',
          borderRadius: 8,
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
        }}
      />

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
          checked={onlyFree}
          onChange={(e) => onOnlyFreeChange(e.target.checked)}
        />
        🎁 Tặng 0đ
      </label>
    </div>
  );
};
