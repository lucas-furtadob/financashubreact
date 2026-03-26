import { ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

interface MenuItem {
	label: string;
	onClick: () => void;
	icon?: ReactNode;
	danger?: boolean;
}

interface ActionMenuProps {
	trigger: ReactNode;
	items: MenuItem[];
	align?: "left" | "right";
}

export function ActionMenu({
	trigger,
	items,
	align = "right",
}: ActionMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={menuRef} style={{ position: "relative" }}>
			<div onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer" }}>
				{trigger}
			</div>
			{isOpen && (
				<div
					style={{
						position: "absolute",
						top: "100%",
						marginTop: "8px",
						right: align === "right" ? 0 : "auto",
						left: align === "left" ? 0 : "auto",
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "8px",
						padding: "8px",
						minWidth: "160px",
						zIndex: 100,
						boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
					}}
				>
					{items.map((item, index) => (
						<button
							key={index}
							type="button"
							onClick={() => {
								item.onClick();
								setIsOpen(false);
							}}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								width: "100%",
								padding: "10px 12px",
								background: "transparent",
								border: "none",
								color: item.danger ? "#EF4444" : "#FFF",
								cursor: "pointer",
								borderRadius: "6px",
								textAlign: "left",
								fontSize: "13px",
								fontWeight: 500,
								transition: "background 0.2s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "rgba(255,255,255,0.05)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "transparent";
							}}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

interface ActionButtonProps {
	icon?: ReactNode;
	label: string;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md";
	disabled?: boolean;
}

export function ActionButton({
	icon,
	label,
	onClick,
	variant = "secondary",
	size = "md",
	disabled = false,
}: ActionButtonProps) {
	const variantStyles = {
		primary: {
			background: "var(--accent)",
			color: "#FFF",
			border: "none",
		},
		secondary: {
			background: "transparent",
			color: "var(--text-secondary)",
			border: "1px solid var(--border)",
		},
		ghost: {
			background: "transparent",
			color: "var(--text-secondary)",
			border: "1px solid transparent",
		},
	};

	const sizeStyles = {
		sm: {
			padding: "8px 14px",
			fontSize: "13px",
			gap: "6px",
		},
		md: {
			padding: "10px 16px",
			fontSize: "14px",
			gap: "8px",
		},
	};

	const styles = variantStyles[variant];
	const sizeStylesApplied = sizeStyles[size];

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			style={{
				...styles,
				...sizeStylesApplied,
				borderRadius: "8px",
				fontWeight: 600,
				cursor: disabled ? "not-allowed" : "pointer",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				opacity: disabled ? 0.5 : 1,
				transition: "all 0.2s",
			}}
		>
			{icon}
			{label}
		</button>
	);
}
