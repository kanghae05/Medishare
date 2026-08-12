import { scheduleTypeLabels } from "./dpartUtils";

function StatusBadge({ type }) {
  return (
    <span className={`dpart-badge status-${type || "AVAILABLE"}`}>
      {scheduleTypeLabels[type] || type || "-"}
    </span>
  );
}

export default StatusBadge;
