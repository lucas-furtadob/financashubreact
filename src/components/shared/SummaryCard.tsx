import type { ReactNode } from "react";

interface SummaryCardProps {
	title: string;
	value: string | number;
	variant?: "default" | "success" | "danger" | "warning";
	icon?: ReactNode;
	trend?: {
		value: number;
		type: "up" | "down";
	};
}

export function SummaryCard({
	title,
	value,
	variant = "default",
	icon,
	trend,
}: SummaryCardProps) {
	return (
		<div className="summary-card card">
			<div className="summary-card-header">
				<span className="summary-card-title">{title}</span>
				{icon && <span className="summary-card-icon">{icon}</span>}
			</div>
			<div className={`summary-card-value summary-card-value-${variant}`}>
				{typeof value === "number"
					? value.toLocaleString("pt-BR", {
							style: "currency",
							currency: "BRL",
						})
					: value}
			</div>
			{trend && (
				<div className={`summary-card-trend summary-card-trend-${trend.type}`}>
					<span>{trend.type === "up" ? "↑" : "↓"}</span>
					<span>{Math.abs(trend.value)}%</span>
				</div>
			)}
		</div>
	);
}

interface SummaryGridProps {
	children: ReactNode;
	columns?: 2 | 3 | 4;
}

export function SummaryGrid({ children, columns = 3 }: SummaryGridProps) {
	return (
		<div className={`summary-grid summary-grid-cols-${columns}`}>
			{children}
		</div>
	);
}
