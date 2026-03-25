import { forwardRef, type InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			hint,
			icon,
			iconPosition = "left",
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const generatedId = useId();
		const inputId = id || generatedId;
		const errorId = `${inputId}-error`;
		const hintId = `${inputId}-hint`;

		const inputClasses = [
			"input",
			error ? "input-error" : "",
			icon ? `input-with-icon input-icon-${iconPosition}` : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div className="input-wrapper">
				{label && (
					<label htmlFor={inputId} className="input-label">
						{label}
					</label>
				)}
				<div className="input-container">
					{icon && iconPosition === "left" && (
						<span className="input-icon-left">{icon}</span>
					)}
					<input
						ref={ref}
						id={inputId}
						className={inputClasses}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : hint ? hintId : undefined}
						{...props}
					/>
					{icon && iconPosition === "right" && (
						<span className="input-icon-right">{icon}</span>
					)}
				</div>
				{error && (
					<span id={errorId} className="input-error-message">
						{error}
					</span>
				)}
				{hint && !error && (
					<span id={hintId} className="input-hint">
						{hint}
					</span>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, error, hint, className = "", id, ...props }, ref) => {
		const generatedId = useId();
		const textareaId = id || generatedId;

		const textareaClasses = [
			"textarea",
			error ? "textarea-error" : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div className="textarea-wrapper">
				{label && (
					<label htmlFor={textareaId} className="textarea-label">
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={textareaId}
					className={textareaClasses}
					aria-invalid={!!error}
					{...props}
				/>
				{error && <span className="textarea-error-message">{error}</span>}
				{hint && !error && <span className="textarea-hint">{hint}</span>}
			</div>
		);
	},
);

Textarea.displayName = "Textarea";
