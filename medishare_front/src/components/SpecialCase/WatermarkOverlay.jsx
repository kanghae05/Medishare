export default function WatermarkOverlay({ user }) {
  const userName = user?.name ?? "사용자";
  const userId = user?.memberId ?? user?.id ?? user?.sub ?? "-";
  const viewedAt = new Date().toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <div className="watermark-overlay" aria-label="열람자 정보">
      🔒 열람자: {userName}({userId}) | {viewedAt}
    </div>
  );
}
