import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: ReactNode;
	align?: "left" | "center" | "right";
}

export function PageHeader({
	title,
	description,
	children,
	align = "left",
}: PageHeaderProps) {
	return (
		<header className={`page-header page-header-${align}`}>
			<div className="page-header-content">
				<h1 className="page-title">{title}</h1>
				{description && <p className="page-description">{description}</p>}
			</div>
			{children && <div className="page-header-actions">{children}</div>}
		</header>
	);
}
