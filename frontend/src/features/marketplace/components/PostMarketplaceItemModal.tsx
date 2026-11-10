import React, { useState } from 'react';
import {
  ItemCategory,
  ItemCondition,
} from '../../../types/marketplace.types';

interface PostMarketplaceItemModalProps {
  isOpen: boolean;
  courses: Array<{ id: number; code: string; name: string }>;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    category: ItemCategory;
    courseId?: number | null;
    priceVnd: number;
    isFree: boolean;
    condition: ItemCondition;
    pickupLocation?: string;
  }) => Promise<void>;
}

export const PostMarketplaceItemModal: React.FC<PostMarketplaceItemModalProps> = ({
  isOpen,
  courses,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('TEXTBOOK');
  const [courseId, setCourseId] = useState<string>('');
  const [isFree, setIsFree] = useState(false);
  const [priceVnd, setPriceVnd] = useState(50000);
  const [condition, setCondition] = useState<ItemCondition>('LIKE_NEW_90');
  const [pickupLocation, setPickupLocation] = useState('Thư viện Tạ Quang Bửu / Cổng Parabol');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        category,
        courseId: courseId ? Number(courseId) : null,
        priceVnd: isFree ? 0 : Number(priceVnd),
        isFree,
        condition,
        pickupLocation: pickupLocation || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng mặt hàng');
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
          maxWidth: 560,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
            🛒 Đăng Thanh lý / Tặng Đồ dùng Học tập
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

        <div
          style={{
            padding: 10,
            marginBottom: 14,
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            fontSize: 12,
          }}
        >
          🛡️ Chống lừa đảo: Bài đăng hiển thị danh tính Sinh viên đã xác thực (.edu) và nhận +5 Karma nếu tặng miễn phí cho khóa sau.
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
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tên món đồ</label>
            <input
              required
              placeholder="VD: Giáo trình Giải tích 1 + Bài tập, Kit STM32F103..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="TEXTBOOK">📚 Giáo trình cũ</option>
                <option value="CALCULATOR">🧮 Máy tính cầm tay</option>
                <option value="HARDWARE_KIT">🔌 Kit vi điều khiển / Linh kiện</option>
                <option value="DORM_ITEM">🛋️ Đồ dùng phòng trọ</option>
                <option value="OTHER">📦 Khác</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tình trạng</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="NEW">Mới 100%</option>
                <option value="LIKE_NEW_90">Mới 90%</option>
                <option value="USED_GOOD">Dùng tốt</option>
                <option value="SLIGHTLY_DAMAGED">Hỏng nhẹ</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Gắn với môn học (Tùy chọn)
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="">-- Không gắn môn --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Giá sinh viên (VNĐ)
              </label>
              <input
                type="number"
                disabled={isFree}
                value={isFree ? 0 : priceVnd}
                onChange={(e) => setPriceVnd(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#34d399',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            🎁 Tặng miễn phí 0đ cho khóa sau (+5 Karma khi hoàn tất)
          </label>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Địa điểm giao nhận tại trường
            </label>
            <input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mô tả chi tiết</label>
            <textarea
              required
              rows={3}
              placeholder="Mô tả tình trạng sách/linh kiện, phụ kiện đi kèm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: 10,
                borderRadius: 8,
                background: '#ffffff',
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
