import type {
	HTMLAttributes,
	ReactNode,
	TdHTMLAttributes,
	ThHTMLAttributes,
} from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
	variant?: "default" | "striped" | "borderless";
	hoverable?: boolean;
	scroll?: boolean;
	maxHeight?: string;
}

export function Table({
	variant = "default",
	hoverable = true,
	className = "",
	children,
	scroll = false,
	maxHeight = "500px",
	...props
}: TableProps) {
	const classes = [
		"table",
		variant !== "default" ? `table-${variant}` : "",
		hoverable ? "table-hover" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className="table-wrapper"
			style={{
				overflow: scroll ? "auto" : undefined,
				maxHeight: scroll ? maxHeight : undefined,
			}}
		>
			<table className={classes} {...props}>
				{children}
			</table>
		</div>
	);
}

interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
	sticky?: boolean;
}

export function TableHead({
	className = "",
	children,
	sticky = false,
	...props
}: TableHeadProps) {
	return (
		<thead
			className={`table-head ${className}`}
			{...props}
			style={
				sticky
					? {
							position: "sticky",
							top: 0,
							zIndex: 1,
							background: "var(--bg-card)",
						}
					: undefined
			}
		>
			{children}
		</thead>
	);
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({
	className = "",
	children,
	...props
}: TableBodyProps) {
	return (
		<tbody className={`table-body ${className}`} {...props}>
			{children}
		</tbody>
	);
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	clickable?: boolean;
	selected?: boolean;
}

export function TableRow({
	clickable = false,
	selected = false,
	className = "",
	children,
	...props
}: TableRowProps) {
	const classes = [
		"table-row",
		clickable ? "table-row-clickable" : "",
		selected ? "table-row-selected" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<tr className={classes} {...props}>
			{children}
		</tr>
	);
}

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
	sortable?: boolean;
	sortDirection?: "asc" | "desc" | null;
	onSort?: () => void;
}

export function TableHeader({
	sortable = false,
	sortDirection = null,
	onSort,
	className = "",
	children,
	...props
}: TableHeaderProps) {
	const classes = [
		"table-header",
		sortable ? "table-header-sortable" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<th
			className={classes}
			onClick={sortable ? onSort : undefined}
			role={sortable ? "button" : undefined}
			aria-sort={
				sortDirection
					? sortDirection === "asc"
						? "ascending"
						: "descending"
					: undefined
			}
			{...props}
		>
			{children}
			{sortable && sortDirection && (
				<span className="table-sort-icon">
					{sortDirection === "asc" ? "↑" : "↓"}
				</span>
			)}
		</th>
	);
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({
	className = "",
	children,
	...props
}: TableCellProps) {
	return (
		<td className={`table-cell ${className}`} {...props}>
			{children}
		</td>
	);
}

interface TableEmptyProps {
	colSpan?: number;
	message?: string;
	icon?: ReactNode;
}

export function TableEmpty({
	colSpan,
	message = "Nenhum registro encontrado",
	icon,
}: TableEmptyProps) {
	return (
		<tr className="table-empty">
			<td colSpan={colSpan}>
				<div className="table-empty-content">
					{icon && <span className="table-empty-icon">{icon}</span>}
					<span className="table-empty-text">{message}</span>
				</div>
			</td>
		</tr>
	);
}

interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showingFrom?: number;
	showingTo?: number;
	totalItems?: number;
}

export function TablePagination({
	currentPage,
	totalPages,
	onPageChange,
	showingFrom,
	showingTo,
	totalItems,
}: TablePaginationProps) {
	return (
		<div className="table-pagination">
			<div className="table-pagination-info">
				{showingFrom && showingTo && totalItems && (
					<span>
						Mostrando {showingFrom} a {showingTo} de {totalItems} registros
					</span>
				)}
			</div>
			<div className="table-pagination-controls">
				<button
					type="button"
					className="pagination-btn"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
				>
					Anterior
				</button>
				<span className="pagination-info">
					{currentPage} / {totalPages}
				</span>
				<button
					type="button"
					className="pagination-btn"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					Próximo
				</button>
			</div>
		</div>
	);
}
