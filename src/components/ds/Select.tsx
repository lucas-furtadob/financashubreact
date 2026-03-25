import { Check, ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
	icon?: ReactNode;
}

interface SelectProps {
	options: SelectOption[];
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	label?: string;
	error?: string;
	disabled?: boolean;
	multiple?: boolean;
	className?: string;
}

export function Select({
	options,
	value,
	onChange,
	placeholder = "Selecione...",
	label,
	error,
	disabled = false,
	multiple = false,
	className = "",
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);
	const generatedId = useId();
	const selectId = `select-${generatedId}`;

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (optionValue: string) => {
		if (onChange) {
			onChange(optionValue);
		}
		setIsOpen(false);
	};

	const classes = [
		"select",
		isOpen ? "select-open" : "",
		error ? "select-error" : "",
		disabled ? "select-disabled" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="select-wrapper">
			{label && (
				<label htmlFor={selectId} className="select-label">
					{label}
				</label>
			)}
			<div ref={selectRef} className={classes}>
				<button
					type="button"
					id={selectId}
					className="select-trigger"
					onClick={() => !disabled && setIsOpen(!isOpen)}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span
						className={`select-value ${!selectedOption ? "select-placeholder" : ""}`}
					>
						{selectedOption ? (
							<>
								{selectedOption.icon && (
									<span className="select-option-icon">
										{selectedOption.icon}
									</span>
								)}
								{selectedOption.label}
							</>
						) : (
							placeholder
						)}
					</span>
					<span className="select-arrow">
						<ChevronDown size={16} />
					</span>
				</button>
				{isOpen && (
					<div className="select-dropdown" role="listbox">
						{options.map((option) => (
							<button
								type="button"
								key={option.value}
								className={`select-option ${
									option.value === value ? "select-option-selected" : ""
								} ${option.disabled ? "select-option-disabled" : ""}`}
								onClick={() => !option.disabled && handleSelect(option.value)}
								disabled={option.disabled}
								role="option"
								aria-selected={option.value === value}
							>
								{option.icon && (
									<span className="select-option-icon">{option.icon}</span>
								)}
								<span className="select-option-label">{option.label}</span>
								{option.value === value && (
									<span className="select-option-check">
										<Check size={16} />
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>
			{error && <span className="select-error-message">{error}</span>}
		</div>
	);
}
