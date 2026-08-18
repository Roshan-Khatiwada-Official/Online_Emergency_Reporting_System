const STATUS_CLASS = {
  Submitted: "badge-submitted",
  Accepted: "badge-accepted",
  "In Progress": "badge-inprogress",
  Solved: "badge-solved",
  Rejected: "badge-rejected",
  Closed: "badge-closed"
};

const SEVERITY_CLASS = {
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low"
};

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLASS[status] || "badge-neutral"}`}>{status}</span>;
}

export function SeverityBadge({ severity }) {
  return <span className={`badge ${SEVERITY_CLASS[severity] || "badge-neutral"}`}>{severity}</span>;
}
