function StatCard({ label, value, tone = "default" }) {
  return (
    <div className={`dpart-stat-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{Number(value || 0).toLocaleString()}</strong>
    </div>
  );
}

export default StatCard;
