export function formatCurrency(value: number | string): string {
	const num =
		typeof value === "string"
			? parseFloat(value.replace(/\./g, "").replace(",", "."))
			: value;
	if (isNaN(num)) return "R$ 0,00";
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(num);
}

export function parseCurrency(value: string): number {
	if (!value) return 0;
	const cleaned = value.replace(/[R$\s.]/g, "").replace(",", ".");
	return parseFloat(cleaned) || 0;
}

export function formatCurrencyInput(value: string): string {
	const numeric = value.replace(/\D/g, "");
	if (!numeric) return "";
	const cents = parseInt(numeric) / 100;
	return formatCurrency(cents);
}

export function unformatCurrency(value: string): number {
	if (!value) return 0;
	const withoutSymbol = value.replace("R$", "").trim();
	const normalized = withoutSymbol.replace(/\./g, "").replace(",", ".");
	return parseFloat(normalized) || 0;
}

export function formatDate(date: string | Date): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("pt-BR");
}

export function formatDateInput(date: string): string {
	const cleaned = date.replace(/\D/g, "").slice(0, 8);
	if (cleaned.length >= 5) {
		return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
	} else if (cleaned.length >= 3) {
		return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
	}
	return cleaned;
}

export function formatPercent(value: number): string {
	return `${Math.round(value)}%`;
}

export function maskPhone(value: string): string {
	const cleaned = value.replace(/\D/g, "").slice(0, 11);
	if (cleaned.length >= 10) {
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
	} else if (cleaned.length >= 6) {
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
	} else if (cleaned.length >= 2) {
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
	}
	return cleaned;
}

export function maskCEP(value: string): string {
	const cleaned = value.replace(/\D/g, "").slice(0, 8);
	if (cleaned.length >= 5) {
		return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
	}
	return cleaned;
}

export function maskAccount(value: string): string {
	const cleaned = value.replace(/\D/g, "").slice(0, 20);
	return cleaned;
}
