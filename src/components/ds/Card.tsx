import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "outlined" | "ghost";
	padding?: "none" | "sm" | "md" | "lg";
	hover?: boolean;
	width?: "full" | "auto";
}

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
	none: "",
	sm: "card-padding-sm",
	md: "card-padding-md",
	lg: "card-padding-lg",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			variant = "default",
			padding = "md",
			hover = false,
			width = "full",
			className = "",
			children,
			...props
		},
		ref,
	) => {
		const classes = [
			"card",
			variant !== "default" ? `card-${variant}` : "",
			paddingStyles[padding],
			hover ? "card-hover" : "",
			width === "auto" ? "card-auto" : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div ref={ref} className={classes} {...props}>
				{children}
			</div>
		);
	},
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className = "", children, ...props }, ref) => {
		return (
			<div ref={ref} className={`card-header ${className}`} {...props}>
				{children}
			</div>
		);
	},
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
	({ className = "", children, ...props }, ref) => {
		return (
			<h3 ref={ref} className={`card-title ${className}`} {...props}>
				{children}
			</h3>
		);
	},
);

CardTitle.displayName = "CardTitle";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
	({ className = "", children, ...props }, ref) => {
		return (
			<div ref={ref} className={`card-content ${className}`} {...props}>
				{children}
			</div>
		);
	},
);

CardContent.displayName = "CardContent";
