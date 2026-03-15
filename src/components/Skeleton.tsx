import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const skeletonAnimation = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '12px',
  style 
}) => {
  const { isDark } = useTheme();

  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: isDark 
        ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)' 
        : 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite linear',
      ...style
    }}>
      <style>{skeletonAnimation}</style>
    </div>
  );
};

export const CardSkeleton = ({ isMobile }: { isMobile?: boolean }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      padding: isMobile ? '20px' : '24px',
      borderRadius: '24px',
      border: `1px solid ${theme.glassBorder}`,
      background: theme.card,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: theme.glassShadow
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Skeleton width={48} height={48} borderRadius="16px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height="16px" />
          <Skeleton width="45%" height="12px" style={{ marginTop: '8px' }} />
        </div>
      </div>
      <Skeleton width="100%" height="48px" borderRadius="12px" style={{ marginTop: '4px' }} />
    </div>
  );
};
