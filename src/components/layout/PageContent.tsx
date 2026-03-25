import type { ReactNode } from "react";

interface PageContentProps {
	children: ReactNode;
	padding?: "none" | "sm" | "md" | "lg";
}

export function PageContent({ children, padding = "md" }: PageContentProps) {
	return (
		<main className={`page-content page-content-padding-${padding}`}>
			{children}
		</main>
	);
}
