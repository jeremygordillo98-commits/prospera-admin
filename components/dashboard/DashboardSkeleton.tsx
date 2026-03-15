import React from 'react';

interface DashboardSkeletonProps {
  isMobile: boolean;
  isDark: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ isMobile, isDark }) => {
  const skeletonPulse = `
    @keyframes pulseOp { 0% { opacity: 0.5; } 50% { opacity: 0.2; } 100% { opacity: 0.5; } }
    .sk-box { animation: pulseOp 1.5s infinite ease-in-out; background: ${isDark ? '#333' : '#e0e0e0'}; border-radius: 8px; }
  `;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? 10 : 16, width: '100%', boxSizing: 'border-box' }}>
      <style>{skeletonPulse}</style>
      <div style={{ padding: isMobile ? 15 : 20, borderRadius: 16, background: 'transparent', marginBottom: 24, height: 100 }} className="sk-box" />
      <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: isMobile ? '1fr' : "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div style={{ padding: isMobile ? 15 : 20, borderRadius: 16, height: 120 }} className="sk-box" />
        <div style={{ padding: isMobile ? 15 : 20, borderRadius: 16, height: 120 }} className="sk-box" />
      </div>
      <div style={{ marginBottom: 24, display: isMobile ? 'flex' : "grid", gridTemplateColumns: isMobile ? undefined : "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, overflowX: 'hidden' }}>
        <div style={{ padding: isMobile ? 15 : 20, borderRadius: 16, height: 110, minWidth: isMobile ? 160 : 'auto' }} className="sk-box" />
        <div style={{ padding: isMobile ? 15 : 20, borderRadius: 16, height: 110, minWidth: isMobile ? 160 : 'auto' }} className="sk-box" />
        <div style={{ padding: isMobile ? 15 : 20, borderRadius: 16, height: 110, minWidth: isMobile ? 160 : 'auto' }} className="sk-box" />
      </div>
    </div>
  );
};
