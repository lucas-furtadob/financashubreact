"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	loading?: boolean;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	tooltip?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: "btn-primary",
	secondary: "btn-secondary-outline",
	ghost: "btn-ghost",
	danger: "btn-danger",
	success: "btn-success",
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "btn-sm",
	md: "btn-md",
	lg: "btn-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			fullWidth = false,
			loading = false,
			icon,
			iconPosition = "left",
			className = "",
			children,
			disabled,
			tooltip,
			...props
		},
		ref,
	) => {
		const classes = [
			"btn",
			variantStyles[variant],
			sizeStyles[size],
			fullWidth ? "btn-full" : "",
			loading ? "btn-loading" : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		const buttonContent = (
			<button
				ref={ref}
				className={classes}
				disabled={disabled || loading}
				type="button"
				{...props}
			>
				{loading ? (
					<span className="spinner" />
				) : (
					<>
						{icon && iconPosition === "left" && (
							<span className="btn-icon-left">{icon}</span>
						)}
						{children}
						{icon && iconPosition === "right" && (
							<span className="btn-icon-right">{icon}</span>
						)}
					</>
				)}
			</button>
		);

		if (tooltip) {
			return (
				<TooltipPrimitive.Provider delayDuration={300}>
					<TooltipPrimitive.Root>
						<TooltipPrimitive.Trigger asChild>
							{buttonContent}
						</TooltipPrimitive.Trigger>
						<TooltipPrimitive.Portal>
							<TooltipPrimitive.Content
								side="top"
								sideOffset={4}
								className="tooltip-content"
							>
								{tooltip}
								<TooltipPrimitive.Arrow className="tooltip-arrow" />
							</TooltipPrimitive.Content>
						</TooltipPrimitive.Portal>
					</TooltipPrimitive.Root>
				</TooltipPrimitive.Provider>
			);
		}

		return buttonContent;
	},
);

Button.displayName = "Button";
