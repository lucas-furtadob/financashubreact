import { ChevronLeft, ChevronRight } from "lucide-react";

const MESES = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

interface MonthSelectorProps {
	month: number;
	year: number;
	onMonthChange: (month: number, year: number) => void;
}

export function MonthSelector({
	month,
	year,
	onMonthChange,
}: MonthSelectorProps) {
	const handlePrev = () => {
		if (month === 1) {
			onMonthChange(12, year - 1);
		} else {
			onMonthChange(month - 1, year);
		}
	};

	const handleNext = () => {
		if (month === 12) {
			onMonthChange(1, year + 1);
		} else {
			onMonthChange(month + 1, year);
		}
	};

	return (
		<div
			className="month-selector"
			style={{
				display: "flex",
				alignItems: "center",
				background: "var(--bg-card)",
				border: "1px solid var(--border)",
				borderRadius: "12px",
				padding: "4px",
				gap: "4px",
			}}
		>
			<button
				type="button"
				onClick={handlePrev}
				aria-label="Mês anterior"
				style={{
					background: "transparent",
					border: "none",
					color: "var(--text-secondary)",
					cursor: "pointer",
					padding: "12px",
					borderRadius: "8px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transition: "all 0.2s",
				}}
			>
				<ChevronLeft size={22} />
			</button>
			<div
				style={{
					padding: "10px 20px",
					fontWeight: 700,
					fontSize: "16px",
					letterSpacing: "0.02em",
					color: "#FFF",
					minWidth: "180px",
					textAlign: "center",
				}}
			>
				{MESES[month - 1].toUpperCase()} {year}
			</div>
			<button
				type="button"
				onClick={handleNext}
				aria-label="Próximo mês"
				style={{
					background: "transparent",
					border: "none",
					color: "var(--text-secondary)",
					cursor: "pointer",
					padding: "12px",
					borderRadius: "8px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transition: "all 0.2s",
				}}
			>
				<ChevronRight size={22} />
			</button>
		</div>
	);
}
