import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAuth } from '../../../hooks/useAuth';
import { marketplaceService } from '../../../services/marketplace.service';
import { resourceHubService } from '../../../services/resource-hub.service';
import { communicationService } from '../../../services/communication.service';
import {
  ItemCategory,
  ItemCondition,
  MarketplaceItem,
} from '../../../types/marketplace.types';
import { ItemConditionFilter } from '../components/ItemConditionFilter';
import { MarketplaceItemCard } from '../components/MarketplaceItemCard';
import { PostMarketplaceItemModal } from '../components/PostMarketplaceItemModal';

export const StudentMarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [courses, setCourses] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [condition, setCondition] = useState<ItemCondition | ''>('');
  const [maxPriceVnd, setMaxPriceVnd] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [search, setSearch] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const [itemList, hierarchy] = await Promise.all([
        marketplaceService.listItems({
          category: category || undefined,
          condition: condition || undefined,
          maxPriceVnd: maxPriceVnd ? Number(maxPriceVnd) : undefined,
          onlyFree: onlyFree || undefined,
          search: search || undefined,
        }),
        resourceHubService.getHierarchyTree(),
      ]);
      setItems(itemList);
      setCourses(
        (hierarchy || []).flatMap((f) =>
          (f.courses || []).map((c) => ({
            id: Number(c.id),
            code: c.code,
            name: c.name,
          }))
        )
      );
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [category, condition, onlyFree]);

  const handleMessageSeller = async (sellerId: string, itemTitle: string) => {
    try {
      const conv = await communicationService.startDirectConversation({
        targetUserId: sellerId,
        initialMessage: `Chào bạn, mình đang quan tâm tới mặt hàng "${itemTitle}" trên Chợ Sinh viên MXH_HSSV. Món này còn không ạ?`,
      });
      navigate(`${APP_ROUTES.MESSENGER}?convId=${conv.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể mở cuộc trò chuyện');
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header & Mode Switch */}
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
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                🛒 Chợ Đồ dùng Học tập
              </Link>
              <Link
                to={APP_ROUTES.HOUSING_FINDER}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(148, 163, 184, 0.14)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                🏠 Tìm Bạn ở ghép & Trọ gần trường
              </Link>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, color: 'var(--text-primary)' }}>
              🛒 Chợ Sinh viên — Thanh lý & Tặng Đồ dùng Học tập
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Mua bán hoặc tặng lại giáo trình cũ, máy tính bỏ túi, kit vi điều khiển và đồ dùng phòng trọ giữa các sinh viên đã xác thực (.edu).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
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
            + Đăng bán / Tặng đồ
          </button>
        </div>

        <ItemConditionFilter
          category={category}
          condition={condition}
          maxPriceVnd={maxPriceVnd}
          onlyFree={onlyFree}
          search={search}
          onCategoryChange={setCategory}
          onConditionChange={setCondition}
          onMaxPriceChange={setMaxPriceVnd}
          onOnlyFreeChange={setOnlyFree}
          onSearchChange={setSearch}
          onApply={loadItems}
        />

        {loading ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải mặt hàng...
          </div>
        ) : items.length === 0 ? (
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
            Chưa có mặt hàng nào khớp bộ lọc.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {items.map((item) => (
              <MarketplaceItemCard
                key={item.id}
                item={item}
                currentUserId={user?.userId}
                onMessageSeller={handleMessageSeller}
                onStatusChange={async (itemId, status) => {
                  await marketplaceService.updateItemStatus(itemId, status);
                  await loadItems();
                }}
              />
            ))}
          </div>
        )}
      </div>

      <PostMarketplaceItemModal
        isOpen={isPostModalOpen}
        courses={courses}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={async (payload) => {
          await marketplaceService.createItem(payload);
          await loadItems();
        }}
      />
    </MainLayout>
  );
};
