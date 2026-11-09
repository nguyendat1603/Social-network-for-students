import React from 'react';
import { CourseAggregateMetrics } from '../../../types/course-review.types';

interface CourseCriteriaRadarChartProps {
  aggregate: CourseAggregateMetrics;
}

export const CourseCriteriaRadarChart: React.FC<
  CourseCriteriaRadarChartProps
> = ({ aggregate }) => {
  const criteria = [
    {
      label: 'Độ khó học phần (Difficulty)',
      score: Number(aggregate.avg_difficulty || 0),
      color: '#ef4444',
    },
    {
      label: 'Độ nặng Bài tập lớn (Workload)',
      score: Number(aggregate.avg_workload || 0),
      color: '#f59e0b',
    },
    {
      label: 'Tính công bằng chấm điểm (Fairness)',
      score: Number(aggregate.avg_fairness || 0),
      color: '#10b981',
    },
    {
      label: 'Phương pháp giảng dạy (Teaching)',
      score: Number(aggregate.avg_teaching || 0),
      color: '#3b82f6',
    },
    {
      label: 'Tài liệu cần đọc (Reading Load)',
      score: Number(aggregate.avg_reading_load || 0),
      color: '#8b5cf6',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
          📊 Thống kê 5 Tiêu chí Học phần (Thang 1–5 Sao)
        </h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Tổng số đánh giá ẩn danh: <strong>{aggregate.total_reviews}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {criteria.map((c) => {
          const pct = Math.min(100, Math.round((c.score / 5) * 100));
          return (
            <div key={c.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>{c.label}</span>
                <strong>{c.score.toFixed(2)} / 5.0 ★</strong>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: 'var(--bg-primary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: c.color,
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
