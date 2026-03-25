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
		<div className="month-selector">
			<button
				type="button"
				className="month-selector-btn"
				onClick={handlePrev}
				aria-label="Mês anterior"
			>
				‹
			</button>
			<span className="month-selector-value">
				{MESES[month - 1]} {year}
			</span>
			<button
				type="button"
				className="month-selector-btn"
				onClick={handleNext}
				aria-label="Próximo mês"
			>
				›
			</button>
		</div>
	);
}
