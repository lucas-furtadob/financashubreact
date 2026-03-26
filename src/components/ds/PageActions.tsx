import type { ReactNode } from "react";

interface PageActionsProps {
	children: ReactNode;
	className?: string;
}

export function PageActions({ children, className = "" }: PageActionsProps) {
	return (
		<div
			className={`page-actions ${className}`}
			style={{
				display: "flex",
				gap: "12px",
				alignItems: "center",
			}}
		>
			{children}
		</div>
	);
}
