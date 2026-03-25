import { useCallback, useState } from "react";

export type ValidationRule<T> = {
	validate: (value: T) => boolean;
	message: string;
};

export type ValidationRules<T> = {
	[K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[];
};

export interface ValidationError {
	field: string;
	message: string;
}

export function useFormValidation<T extends Record<string, any>>(
	initialValues: T,
	rules: ValidationRules<T>,
) {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState < Partial<Record<keyof T, string>>({});

	const validateField = useCallback(
		(field: keyof T, value: any): string | null => {
			const fieldRules = rules[field];
			if (!fieldRules) return null;

			const ruleArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
			for (const rule of ruleArray) {
				if (!rule.validate(value)) {
					return rule.message;
				}
			}
			return null;
		},
		[rules],
	);

	const validateAll = useCallback((): boolean => {
		const newErrors: Partial<Record<keyof T, string>> = {};
		let isValid = true;

		for (const field of Object.keys(rules) as (keyof T)[]) {
			const error = validateField(field, values[field]);
			if (error) {
				newErrors[field] = error;
				isValid = false;
			}
		}

		setErrors(newErrors);
		return isValid;
	}, [rules, values, validateField]);

	const setValue = useCallback(
		(field: keyof T, value: any) => {
			setValues((prev) => ({ ...prev, [field]: value }));
			const error = validateField(field, value);
			setErrors((prev) => ({
				...prev,
				[field]: error || undefined,
			}));
		},
		[validateField],
	);

	const reset = useCallback(
		(newValues?: T) => {
			setValues(newValues || initialValues);
			setErrors({});
		},
		[initialValues],
	);

	const clearError = useCallback((field: keyof T) => {
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}, []);

	return {
		values,
		errors,
		setValue,
		validateAll,
		reset,
		clearError,
		setValues,
		isValid:
			Object.keys(errors).filter((k) => errors[k as keyof T]).length === 0,
	};
}

export const ValidationRules = {
	required: (message = "Campo obrigatório"): ValidationRule<any> => ({
		validate: (value) => {
			if (value === null || value === undefined) return false;
			if (typeof value === "string") return value.trim().length > 0;
			return true;
		},
		message,
	}),

	minLength: (min: number, message?: string): ValidationRule<string> => ({
		validate: (value) => !value || value.length >= min,
		message: message || `Mínimo de ${min} caracteres`,
	}),

	maxLength: (max: number, message?: string): ValidationRule<string> => ({
		validate: (value) => !value || value.length <= max,
		message: message || `Máximo de ${max} caracteres`,
	}),

	positiveNumber: (
		message = "Valor deve ser positivo",
	): ValidationRule<number> => ({
		validate: (value) => !value || value >= 0,
		message,
	}),

	minValue: (min: number, message?: string): ValidationRule<number> => ({
		validate: (value) => !value || value >= min,
		message: message || `Valor mínimo: ${min}`,
	}),

	maxValue: (max: number, message?: string): ValidationRule<number> => ({
		validate: (value) => !value || value <= max,
		message: message || `Valor máximo: ${max}`,
	}),

	range: (
		min: number,
		max: number,
		message?: string,
	): ValidationRule<number> => ({
		validate: (value) => !value || (value >= min && value <= max),
		message: message || `Valor deve estar entre ${min} e ${max}`,
	}),

	email: (message = "Email inválido"): ValidationRule<string> => ({
		validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
		message,
	}),
};
