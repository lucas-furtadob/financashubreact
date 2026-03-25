import { forwardRef, type HTMLAttributes } from "react";

type BadgeVariant =
	| "default"
	| "success"
	| "danger"
	| "warning"
	| "info"
	| "accent";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	size?: BadgeSize;
	pill?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
	default: "badge-default",
	success: "badge-success",
	danger: "badge-danger",
	warning: "badge-warning",
	info: "badge-info",
	accent: "badge-accent",
};

const sizeClasses: Record<BadgeSize, string> = {
	sm: "badge-sm",
	md: "badge-md",
	lg: "badge-lg",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
	(
		{
			variant = "default",
			size = "md",
			pill = false,
			className = "",
			children,
			...props
		},
		ref,
	) => {
		const classes = [
			"badge",
			variantClasses[variant],
			sizeClasses[size],
			pill ? "badge-pill" : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<span ref={ref} className={classes} {...props}>
				{children}
			</span>
		);
	},
);

Badge.displayName = "Badge";

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
	status:
		| "pago"
		| "recebido"
		| "pendente"
		| "atrasado"
		| "cancelado"
		| "ativo"
		| "inativo";
	showDot?: boolean;
}

const statusConfig: Record<
	StatusBadgeProps["status"],
	{ label: string; variant: BadgeVariant }
> = {
	pago: { label: "Pago", variant: "success" },
	recebido: { label: "Recebido", variant: "success" },
	pendente: { label: "Pendente", variant: "warning" },
	atrasado: { label: "Atrasado", variant: "danger" },
	cancelado: { label: "Cancelado", variant: "danger" },
	ativo: { label: "Ativo", variant: "success" },
	inativo: { label: "Inativo", variant: "default" },
};

export function StatusBadge({
	status,
	showDot = true,
	className = "",
	...props
}: StatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<Badge variant={config.variant} className={className} {...props}>
			{showDot && <span className="badge-dot" />}
			{config.label}
		</Badge>
	);
}
