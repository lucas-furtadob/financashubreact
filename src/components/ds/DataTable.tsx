import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "./Table";

export interface Column<T> {
	key: string;
	header: string;
	render?: (item: T, index: number) => ReactNode;
	align?: "left" | "center" | "right";
	width?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	keyExtractor: (item: T) => string;
	emptyMessage?: string;
	emptyIcon?: ReactNode;
	loading?: boolean;
	pagination?: {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	};
	onRowClick?: (item: T) => void;
}

export function DataTable<T>({
	columns,
	data,
	keyExtractor,
	emptyMessage = "Nenhum registro encontrado",
	emptyIcon,
	pagination,
	onRowClick,
}: DataTableProps<T>) {
	return (
		<>
			<Table scroll>
				<TableHead sticky>
					<TableRow>
						{columns.map((col) => (
							<TableHeader
								key={col.key}
								style={{ textAlign: col.align || "left", width: col.width }}
							>
								{col.header}
							</TableHeader>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{data.length === 0 ? (
						<TableEmpty
							colSpan={columns.length}
							message={emptyMessage}
							icon={emptyIcon}
						/>
					) : (
						data.map((item, index) => (
							<TableRow
								key={keyExtractor(item)}
								clickable={!!onRowClick}
								onClick={() => onRowClick?.(item)}
							>
								{columns.map((col) => (
									<TableCell
										key={col.key}
										style={{ textAlign: col.align || "left" }}
									>
										{col.render
											? col.render(item, index)
											: String(
													(item as Record<string, unknown>)[col.key] ?? "",
												)}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{pagination && pagination.totalPages > 1 && (
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "16px 20px",
						borderTop: "1px solid var(--border)",
						background: "var(--bg-card)",
					}}
				>
					<span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
						Página {pagination.currentPage} de {pagination.totalPages}
					</span>
					<div style={{ display: "flex", gap: "8px" }}>
						<button
							type="button"
							onClick={() =>
								pagination.onPageChange(pagination.currentPage - 1)
							}
							disabled={pagination.currentPage <= 1}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
								padding: "8px 12px",
								background: "transparent",
								border: "1px solid var(--border)",
								borderRadius: "6px",
								color:
									pagination.currentPage <= 1 ? "var(--text-muted)" : "#FFF",
								cursor: pagination.currentPage <= 1 ? "not-allowed" : "pointer",
								opacity: pagination.currentPage <= 1 ? 0.5 : 1,
								fontSize: "13px",
							}}
						>
							<ChevronLeft size={16} />
							Anterior
						</button>
						<button
							type="button"
							onClick={() =>
								pagination.onPageChange(pagination.currentPage + 1)
							}
							disabled={pagination.currentPage >= pagination.totalPages}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
								padding: "8px 12px",
								background: "transparent",
								border: "1px solid var(--border)",
								borderRadius: "6px",
								color:
									pagination.currentPage >= pagination.totalPages
										? "var(--text-muted)"
										: "#FFF",
								cursor:
									pagination.currentPage >= pagination.totalPages
										? "not-allowed"
										: "pointer",
								opacity:
									pagination.currentPage >= pagination.totalPages ? 0.5 : 1,
								fontSize: "13px",
							}}
						>
							Próximo
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			)}
		</>
	);
}
