import type { ReactNode } from "react";

interface FilterPillsProps {
	children: ReactNode;
	className?: string;
}

export function FilterPills({ children, className = "" }: FilterPillsProps) {
	return (
		<div
			className={`filter-pills ${className}`}
			style={{
				display: "flex",
				gap: "8px",
				marginBottom: "24px",
				alignItems: "center",
				whiteSpace: "nowrap",
			}}
		>
			{children}
		</div>
	);
}

interface FilterPillProps {
	active?: boolean;
	onClick?: () => void;
	children: ReactNode;
	className?: string;
}

export function FilterPill({
	active = false,
	onClick,
	children,
	className = "",
}: FilterPillProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				padding: "6px 16px",
				borderRadius: "100px",
				fontSize: "13px",
				cursor: "pointer",
				background: active ? "var(--accent)" : "transparent",
				color: active ? "#FFF" : "var(--text-secondary)",
				border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
				fontWeight: 500,
				transition: "all 0.2s",
				whiteSpace: "nowrap",
			}}
			className={className}
		>
			{children}
		</button>
	);
}
