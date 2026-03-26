import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowDownLeft,
	ArrowUpRight,
	DollarSign,
	Download,
	FileSpreadsheet,
	FileText,
	Pencil,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { MonthSelector } from "@/components/layout/MonthSelector";
import * as Select from "@/components/ui/select";
import { appStore, type Transacao } from "@/lib/app-store";
import { CategoryIcon } from "@/lib/category-icons";
import {
	formatCurrency,
	formatCurrencyInput,
	formatDateInput,
	parseCurrency,
} from "@/lib/formatters";
import {
	downloadTemplate,
	exportToCSV,
	exportToXLS,
	formatFileSize,
	type ParsedCSV,
	parseCSV,
	parseOFX,
} from "@/lib/import-export";
import { ActionButton, ActionMenu } from "../components/ds/ActionMenu";
import { Button } from "../components/ds/Button";
import { Card } from "../components/ds/Card";
import { FilterPill, FilterPills } from "../components/ds/FilterPills";
import { PageActions } from "../components/ds/PageActions";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ds/Table";

export const Route = createFileRoute("/lancamentos")({
	component: LancamentosPage,
});

interface Lancamento {
	id: string;
	data: string;
	descricao: string;
	categoria: string;
	status: string;
	valor: number;
	tipo: "despesa" | "receita" | "transferencia";
	conta?: string;
}

const MOCK_LANCAMENTOS: Lancamento[] = [
	{
		id: "1",
		data: "05/03/2026",
		descricao: "Supermercado Extra",
		categoria: "Alimentação",
		status: "Pago",
		valor: 350.0,
		tipo: "despesa",
	},
	{
		id: "2",
		data: "08/03/2026",
		descricao: "Aluguel Março",
		categoria: "Moradia",
		status: "Pago",
		valor: 1800.0,
		tipo: "despesa",
	},
	{
		id: "3",
		data: "10/03/2026",
		descricao: "Conta de Luz",
		categoria: "Moradia",
		status: "Pago",
		valor: 280.0,
		tipo: "despesa",
	},
	{
		id: "5",
		data: "15/03/2026",
		descricao: "Salário March",
		categoria: "Receita",
		status: "Recebido",
		valor: 15000.0,
		tipo: "receita",
	},
];

const MESES = [
	"JANEIRO",
	"FEVEREIRO",
	"MARÇO",
	"ABRIL",
	"MAIO",
	"JUNHO",
	"JULHO",
	"AGOSTO",
	"SETEMBRO",
	"OUTUBRO",
	"NOVEMBRO",
	"DEZEMBRO",
];

const CATEGORIAS = [
	{ id: "alimentacao", nome: "Alimentação", tipo: "despesa" },
	{ id: "moradia", nome: "Moradia", tipo: "despesa" },
	{ id: "transporte", nome: "Transporte", tipo: "despesa" },
	{ id: "saude", nome: "Saúde", tipo: "despesa" },
	{ id: "lazer", nome: "Lazer", tipo: "despesa" },
	{ id: "receita", nome: "Receita", tipo: "receita" },
];

const CONTAS = [
	{ id: "nubank", nome: "Nubank PJ" },
	{ id: "bb", nome: "Banco do Brasil" },
];

interface ImportRow {
	data: string;
	titulo: string;
	categoria: string;
	valor: number;
	valorStr: string;
	tipo: "receita" | "despesa";
	tag: string;
	formaPagamento: string;
	ignored: boolean;
	errors: string[];
}

function LancamentosPage() {
	const [lancamentos, setLancamentos] =
		useState<Lancamento[]>(MOCK_LANCAMENTOS);
	const [currentMonth, setCurrentMonth] = useState(3);
	const [currentYear, setCurrentYear] = useState(2026);
	const [filtroTipo, setFiltroTipo] = useState("todos");
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [tipoSelecionado, setTipoSelecionado] = useState<
		"despesa" | "receita" | "transferencia"
	>("despesa");
	const [valor, setValor] = useState("");
	const [data, setData] = useState("");
	const [descricao, setDescricao] = useState("");
	const [categoria, setCategoria] = useState("");
	const [conta, setConta] = useState("");
	const [status, setStatus] = useState("Pago");
	const [errors, setErrors] = useState<{
		valor?: string;
		data?: string;
		descricao?: string;
	}>({});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const [showImportModal, setShowImportModal] = useState(false);
	const [importStep, setImportStep] = useState(1);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importAccount, setImportAccount] = useState("");
	const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
	const [importMapping, setImportMapping] = useState<Record<string, string>>(
		{},
	);
	const [validatedRows, setValidatedRows] = useState<ImportRow[]>([]);
	const [showExportMenu, setShowExportMenu] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const filteredLancamentos = lancamentos.filter((l) => {
		if (filtroTipo === "todos") return true;
		return l.tipo === filtroTipo;
	});

	const getMonthFromDate = (dateStr: string) => {
		const parts = dateStr.split("/");
		if (parts.length !== 3) return 0;
		return parseInt(parts[1]);
	};

	const getYearFromDate = (dateStr: string) => {
		const parts = dateStr.split("/");
		if (parts.length !== 3) return 0;
		return parseInt(parts[2]);
	};

	const lancamentosDoMes = lancamentos.filter(
		(l) =>
			getMonthFromDate(l.data) === currentMonth &&
			getYearFromDate(l.data) === currentYear,
	);

	const totalReceitas = lancamentosDoMes
		.filter((l) => l.tipo === "receita")
		.reduce((sum, l) => sum + l.valor, 0);
	const totalDespesas = lancamentosDoMes
		.filter((l) => l.tipo === "despesa")
		.reduce((sum, l) => sum + l.valor, 0);
	const saldo = totalReceitas - totalDespesas;

	const openModal = (lanc?: Lancamento) => {
		if (lanc) {
			setEditingId(lanc.id);
			setTipoSelecionado(lanc.tipo);
			setValor(lanc.valor.toString());
			setData(lanc.data);
			setDescricao(lanc.descricao);
			setCategoria(lanc.categoria);
			setConta(lanc.conta || "");
			setStatus(lanc.status);
		} else {
			setEditingId(null);
			setTipoSelecionado("despesa");
			setValor("");
			setData(new Date().toLocaleDateString("pt-BR"));
			setDescricao("");
			setCategoria("");
			setConta("");
			setStatus("Pago");
		}
		setErrors({});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingId(null);
		setErrors({});
	};

	const validate = (): boolean => {
		const newErrors: { valor?: string; data?: string; descricao?: string } = {};
		if (!valor || parseCurrency(valor) <= 0)
			newErrors.valor = "Valor é obrigatório";
		if (!data || data.length < 10) newErrors.data = "Data é obrigatória";
		if (!descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const saveLancamento = () => {
		if (!validate()) return;

		const valorNum = parseCurrency(valor);
		const mes = parseInt(data.split("/")[1]);
		const ano = parseInt(data.split("/")[2]);

		if (editingId) {
			setLancamentos(
				lancamentos.map((l) =>
					l.id === editingId
						? {
								...l,
								valor: valorNum,
								data,
								descricao,
								categoria,
								conta,
								status,
								tipo: tipoSelecionado,
							}
						: l,
				),
			);
			// Atualiza no store
			appStore.updateTransacao(editingId, {
				valor: valorNum,
				descricao,
				categoriaId: categoria,
				status:
					status === "Pago" || status === "Recebido" ? "concluida" : "pendente",
				tipo: tipoSelecionado as any,
				mes,
				ano,
			});
		} else {
			const newLanc: Lancamento = {
				id: `lanc_${Date.now()}`,
				valor: valorNum,
				data,
				descricao,
				categoria,
				conta,
				status: tipoSelecionado === "receita" ? "Recebido" : "Pago",
				tipo: tipoSelecionado,
			};
			setLancamentos([...lancamentos, newLanc]);
			// Adiciona ao store
			appStore.addTransacao({
				id: newLanc.id,
				data: new Date(ano, mes - 1, parseInt(data.split("/")[0])),
				descricao: newLanc.descricao,
				categoriaId: newLanc.categoria,
				valor: newLanc.valor,
				tipo: newLanc.tipo as any,
				status:
					newLanc.status === "Pago" || newLanc.status === "Recebido"
						? "concluida"
						: "pendente",
				contaId: newLanc.conta,
				mes,
				ano,
			});
		}
		closeModal();
	};

	const confirmDelete = (id: string) => {
		setDeleteId(id);
		setShowDeleteModal(true);
	};

	const deleteLancamento = () => {
		if (deleteId) {
			setLancamentos(lancamentos.filter((l) => l.id !== deleteId));
			appStore.deleteTransacao(deleteId);
		}
		setShowDeleteModal(false);
		setDeleteId(null);
	};

	const handleExport = (format: "csv" | "xls") => {
		setShowExportMenu(false);
		const headers = [
			"Data",
			"Descrição",
			"Categoria",
			"Conta",
			"Status",
			"Tipo",
			"Valor",
		];
		const rows = lancamentos.map((l) => [
			l.data,
			l.descricao,
			l.categoria,
			l.conta || "",
			l.status,
			l.tipo,
			l.valor,
		]);
		const filename = `lancamentos_${MESES[currentMonth - 1].toLowerCase()}_${currentYear}.${format}`;
		if (format === "csv") {
			exportToCSV(headers, rows, filename);
		} else {
			exportToXLS(headers, rows, filename);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImportFile(file);
		const reader = new FileReader();
		reader.onload = (ev) => {
			const content = ev.target?.result as string;
			const isOFX =
				file.name.toLowerCase().endsWith(".ofx") ||
				file.name.toLowerCase().endsWith(".qfx");
			if (isOFX) {
				const ofxData = parseOFX(content);
				const rows: ImportRow[] = ofxData.map((t) => ({
					data: t.data,
					titulo: t.titulo,
					categoria: "",
					valor: t.valor,
					valorStr: formatCurrency(t.valor),
					tipo: t.tipo,
					tag: "",
					formaPagamento: "",
					ignored: false,
					errors: [],
				}));
				setValidatedRows(rows);
				setImportStep(2);
			} else {
				const parsed = parseCSV(content);
				setParsedData(parsed);
				const autoMapping: Record<string, string> = {};
				parsed.headers.forEach((header, idx) => {
					const h = header.toLowerCase();
					if (h.includes("data") || h.includes("date"))
						autoMapping["data"] = String(idx);
					else if (
						h.includes("titulo") ||
						h.includes("title") ||
						h.includes("descricao") ||
						h.includes("nome")
					)
						autoMapping["titulo"] = String(idx);
					else if (
						h.includes("valor") ||
						h.includes("value") ||
						h.includes("amount")
					)
						autoMapping["valor"] = String(idx);
					else if (h.includes("categoria") || h.includes("category"))
						autoMapping["categoria"] = String(idx);
				});
				setImportMapping(autoMapping);
				setImportStep(2);
			}
		};
		reader.readAsText(file);
	};

	const validateImport = () => {
		if (!parsedData) return;
		const rows: ImportRow[] = parsedData.rows.map((row) => {
			const dataIdx = parseInt(importMapping["data"] || "-1");
			const tituloIdx = parseInt(importMapping["titulo"] || "-1");
			const valorIdx = parseInt(importMapping["valor"] || "-1");
			const categoriaIdx = parseInt(importMapping["categoria"] || "-1");

			const data = dataIdx >= 0 ? row[dataIdx] : "";
			const titulo = tituloIdx >= 0 ? row[tituloIdx] : "";
			const valorStr = valorIdx >= 0 ? row[valorIdx] : "0";
			const categoria = categoriaIdx >= 0 ? row[categoriaIdx] : "";

			const valorNum = parseCurrency(valorStr.replace(/[R$\s]/g, ""));
			const tipo = valorNum < 0 ? "despesa" : "receita";
			const valorAbs = Math.abs(valorNum);

			return {
				data,
				titulo,
				categoria,
				valor: valorAbs,
				valorStr: formatCurrency(valorAbs),
				tipo,
				tag: "",
				formaPagamento: "",
				ignored: false,
				errors:
					!data || !titulo || !valorAbs ? ["Campos obrigatórios faltando"] : [],
			};
		});
		setValidatedRows(rows);
		setImportStep(3);
	};

	const executeImport = () => {
		const validRows = validatedRows.filter(
			(r) => !r.ignored && r.errors.length === 0,
		);
		const newLancamentos: Lancamento[] = validRows.map((r) => ({
			id: `lanc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			data: r.data,
			descricao: r.titulo,
			categoria: r.categoria,
			status: r.tipo === "receita" ? "Recebido" : "Pago",
			valor: r.valor,
			tipo: r.tipo,
			conta: importAccount,
		}));
		setLancamentos([...lancamentos, ...newLancamentos]);
		closeImportModal();
	};

	const closeImportModal = () => {
		setShowImportModal(false);
		setImportStep(1);
		setImportFile(null);
		setImportAccount("");
		setParsedData(null);
		setImportMapping({});
		setValidatedRows([]);
	};

	const toggleRowIgnored = (idx: number) => {
		const newRows = [...validatedRows];
		newRows[idx].ignored = !newRows[idx].ignored;
		setValidatedRows(newRows);
	};

	const updateRowField = (
		idx: number,
		field: keyof ImportRow,
		value: string,
	) => {
		const newRows = [...validatedRows];
		(newRows[idx] as Record<string, unknown>)[field] = value;
		setValidatedRows(newRows);
	};

	return (
		<main
			style={{
				padding: "40px 48px",
				flex: 1,
				display: "flex",
				flexDirection: "column",
				overflow: "auto",
			}}
		>
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: "32px",
				}}
			>
				<div>
					<h1 style={{ fontSize: "32px", fontWeight: 700, margin: 0 }}>
						Lançamentos
					</h1>
					<p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
						Gerencie suas receitas e despesas
					</p>
				</div>
				<PageActions>
					<MonthSelector
						month={currentMonth}
						year={currentYear}
						onMonthChange={(month, year) => {
							setCurrentMonth(month);
							setCurrentYear(year);
						}}
					/>
					<ActionButton
						icon={<Plus size={18} />}
						label="Novo lançamento"
						onClick={() => openModal()}
						variant="primary"
					/>
					<ActionButton
						icon={<Upload size={16} />}
						label="Importar"
						onClick={() => setShowImportModal(true)}
						variant="secondary"
						size="sm"
					/>
					<ActionMenu
						trigger={
							<ActionButton
								icon={<Download size={16} />}
								label="Exportar"
								variant="secondary"
								size="sm"
							/>
						}
						items={[
							{
								label: "Exportar CSV",
								onClick: () => handleExport("csv"),
								icon: <FileText size={16} />,
							},
							{
								label: "Exportar Excel",
								onClick: () => handleExport("xls"),
								icon: <FileSpreadsheet size={16} />,
							},
						]}
					/>
				</PageActions>
			</header>

			{/* Summary Cards */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "24px",
					marginBottom: "32px",
				}}
			>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "24px",
						display: "flex",
						gap: "16px",
					}}
				>
					<div
						style={{
							width: "40px",
							height: "40px",
							borderRadius: "8px",
							background: "rgba(34,197,94,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#22C55E",
						}}
					>
						<ArrowDownLeft size={20} />
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<span
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								fontWeight: 600,
							}}
						>
							Recebido
						</span>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalReceitas)}
						</span>
					</div>
				</div>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "24px",
						display: "flex",
						gap: "16px",
					}}
				>
					<div
						style={{
							width: "40px",
							height: "40px",
							borderRadius: "8px",
							background: "rgba(239,68,68,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#EF4444",
						}}
					>
						<ArrowUpRight size={20} />
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<span
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								fontWeight: 600,
							}}
						>
							Pago
						</span>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalDespesas)}
						</span>
					</div>
				</div>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "24px",
						display: "flex",
						gap: "16px",
					}}
				>
					<div
						style={{
							width: "40px",
							height: "40px",
							borderRadius: "8px",
							background: "rgba(99,102,241,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "var(--accent)",
						}}
					>
						<DollarSign size={20} />
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<span
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								fontWeight: 600,
							}}
						>
							Saldo Atual
						</span>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
								color: saldo >= 0 ? "#22C55E" : "#EF4444",
							}}
						>
							{formatCurrency(saldo)}
						</span>
					</div>
				</div>
			</div>

			{/* Filter Pills */}
			<FilterPills>
				<FilterPill
					active={filtroTipo === "todos"}
					onClick={() => setFiltroTipo("todos")}
				>
					Todos
				</FilterPill>
				<FilterPill
					active={filtroTipo === "receita"}
					onClick={() => setFiltroTipo("receita")}
				>
					Receitas
				</FilterPill>
				<FilterPill
					active={filtroTipo === "despesa"}
					onClick={() => setFiltroTipo("despesa")}
				>
					Despesas
				</FilterPill>
			</FilterPills>

			<Card padding="none">
				<Table scroll>
					<TableHead sticky>
						<TableRow>
							<TableHeader>Data</TableHeader>
							<TableHeader>Descrição</TableHeader>
							<TableHeader>Categoria</TableHeader>
							<TableHeader>Status</TableHeader>
							<TableHeader style={{ textAlign: "right" }}>Valor</TableHeader>
							<TableHeader style={{ width: "100px" }}>Ações</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredLancamentos.length === 0 ? (
							<TableEmpty colSpan={6} message="Nenhum lançamento encontrado." />
						) : (
							filteredLancamentos.map((lanc) => (
								<TableRow key={lanc.id}>
									<TableCell>
										<span style={{ color: "var(--text-secondary)" }}>
											{lanc.data}
										</span>
									</TableCell>
									<TableCell>
										<span>{lanc.descricao}</span>
									</TableCell>
									<TableCell>
										<span style={{ color: "var(--text-secondary)" }}>
											{lanc.categoria}
										</span>
									</TableCell>
									<TableCell>
										<span
											style={{
												padding: "4px 10px",
												borderRadius: "20px",
												fontSize: "11px",
												fontWeight: 600,
												background:
													lanc.status === "Pago" || lanc.status === "Recebido"
														? "rgba(34,197,94,0.1)"
														: "rgba(245,158,11,0.1)",
												color:
													lanc.status === "Pago" || lanc.status === "Recebido"
														? "#22C55E"
														: "#F59E0B",
											}}
										>
											{lanc.status}
										</span>
									</TableCell>
									<TableCell>
										<span
											style={{
												fontFamily: "'Inter', sans-serif",
												fontSize: "14px",
												color: lanc.tipo === "receita" ? "#22C55E" : "#EF4444",
											}}
										>
											{lanc.tipo === "receita" ? "+" : "-"}
											{formatCurrency(lanc.valor)}
										</span>
									</TableCell>
									<TableCell>
										<div
											style={{
												display: "flex",
												gap: "4px",
												justifyContent: "flex-end",
											}}
										>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openModal(lanc)}
												tooltip="Editar"
											>
												<Pencil size={16} />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => confirmDelete(lanc.id)}
												tooltip="Excluir"
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			{/* Modal */}
			{showModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(0,0,0,0.7)",
						backdropFilter: "blur(4px)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
					onKeyDown={(e) => e.key === "Escape" && closeModal()}
					onClick={(e) => e.target === e.currentTarget && closeModal()}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "600px",
							width: "100%",
							maxHeight: "90vh",
							overflow: "auto",
						}}
					>
						<div
							style={{
								padding: "28px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								borderBottom: "1px solid var(--border)",
							}}
						>
							<div>
								<h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
									{editingId ? "Editar lançamento" : "Novo lançamento"}
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									Preencha os campos para registrar este lançamento.
								</p>
							</div>
							<button
								type="button"
								onClick={() => closeModal()}
								style={{
									background: "#1F1F23",
									border: "1px solid #2A2A2E",
									width: "32px",
									height: "32px",
									borderRadius: "8px",
									color: "var(--text-secondary)",
									cursor: "pointer",
								}}
							>
								✕
							</button>
						</div>

						{/* Tabs */}
						<div
							style={{
								display: "flex",
								borderBottom: "1px solid var(--border)",
								padding: "0 28px",
							}}
						>
							{["despesa", "receita", "transferencia"].map((tipo) => (
								<button
									key={tipo}
									type="button"
									onClick={() => setTipoSelecionado(tipo as any)}
									style={{
										padding: "12px 20px",
										background: "transparent",
										border: "none",
										borderBottom:
											tipoSelecionado === tipo
												? "2px solid var(--accent)"
												: "2px solid transparent",
										color:
											tipoSelecionado === tipo
												? "var(--accent)"
												: "var(--text-secondary)",
										fontSize: "14px",
										fontWeight: 500,
										cursor: "pointer",
										textTransform: "capitalize",
									}}
								>
									{tipo}
								</button>
							))}
						</div>

						<div style={{ padding: "28px" }}>
							<div
								style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
							>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="lanc-valor"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Valor *
									</label>
									<input
										id="lanc-valor"
										type="text"
										placeholder="R$ 0,00"
										value={valor}
										onChange={(e) =>
											setValor(formatCurrencyInput(e.target.value))
										}
										style={{
											width: "100%",
											background: "#0A0A0B",
											border: `1px solid ${errors.valor ? "#EF4444" : "var(--border)"}`,
											borderRadius: "12px",
											height: "52px",
											color: "#FFF",
											padding: "0 16px",
											fontSize: "18px",
											fontWeight: 600,
											outline: "none",
										}}
									/>
									{errors.valor && (
										<span
											style={{
												color: "#EF4444",
												fontSize: "12px",
												marginTop: "4px",
												display: "block",
											}}
										>
											{errors.valor}
										</span>
									)}
								</div>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="lanc-data"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Data *
									</label>
									<input
										id="lanc-data"
										type="text"
										placeholder="DD/MM/AAAA"
										value={data}
										onChange={(e) => setData(formatDateInput(e.target.value))}
										style={{
											width: "100%",
											background: "#0A0A0B",
											border: `1px solid ${errors.data ? "#EF4444" : "var(--border)"}`,
											borderRadius: "12px",
											height: "52px",
											color: "#FFF",
											padding: "0 16px",
											fontSize: "15px",
											outline: "none",
										}}
									/>
									{errors.data && (
										<span
											style={{
												color: "#EF4444",
												fontSize: "12px",
												marginTop: "4px",
												display: "block",
											}}
										>
											{errors.data}
										</span>
									)}
								</div>
							</div>
							<div style={{ marginBottom: "20px" }}>
								<label
									htmlFor="lanc-desc"
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Descrição *
								</label>
								<input
									id="lanc-desc"
									type="text"
									placeholder="Ex.: Almoço com a equipe"
									value={descricao}
									onChange={(e) => setDescricao(e.target.value)}
									style={{
										width: "100%",
										background: "#0A0A0B",
										border: `1px solid ${errors.descricao ? "#EF4444" : "var(--border)"}`,
										borderRadius: "12px",
										height: "52px",
										color: "#FFF",
										padding: "0 16px",
										fontSize: "15px",
										outline: "none",
									}}
								/>
								{errors.descricao && (
									<span
										style={{
											color: "#EF4444",
											fontSize: "12px",
											marginTop: "4px",
											display: "block",
										}}
									>
										{errors.descricao}
									</span>
								)}
							</div>
							<div
								style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
							>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="lanc-cat"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Categoria
									</label>
									<Select.Select
										value={categoria}
										onValueChange={(value) => setCategoria(value)}
									>
										<Select.SelectTrigger
											className="w-full"
											style={{
												background: "#0A0A0B",
												border: "1px solid var(--border)",
												borderRadius: "12px",
												height: "52px",
												color: "#FFF",
												fontSize: "15px",
											}}
										>
											<Select.SelectValue placeholder="Selecione..." />
										</Select.SelectTrigger>
										<Select.SelectContent
											style={{
												background: "var(--bg-card)",
												border: "1px solid var(--border)",
												borderRadius: "12px",
											}}
										>
											{CATEGORIAS.filter(
												(c) =>
													c.tipo === tipoSelecionado ||
													tipoSelecionado === "transferencia",
											).map((cat) => (
												<Select.SelectItem
													key={cat.id}
													value={cat.nome}
													style={{
														color: "#FFF",
														padding: "10px 12px",
														borderRadius: "8px",
													}}
												>
													{cat.nome}
												</Select.SelectItem>
											))}
										</Select.SelectContent>
									</Select.Select>
								</div>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="lanc-conta"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Conta
									</label>
									<Select.Select
										value={conta}
										onValueChange={(value) => setConta(value)}
									>
										<Select.SelectTrigger
											style={{
												width: "100%",
												background: "#0A0A0B",
												border: "1px solid var(--border)",
												borderRadius: "12px",
												height: "52px",
												color: "#FFF",
												fontSize: "15px",
												outline: "none",
												display: "flex",
												alignItems: "center",
											}}
										>
											<Select.SelectValue placeholder="Selecione..." />
										</Select.SelectTrigger>
										<Select.SelectContent
											style={{
												background: "var(--bg-card)",
												border: "1px solid var(--border)",
												borderRadius: "12px",
											}}
										>
											{CONTAS.map((c) => (
												<Select.SelectItem
													key={c.id}
													value={c.nome}
													style={{
														color: "#FFF",
														padding: "10px 12px",
														borderRadius: "8px",
													}}
												>
													{c.nome}
												</Select.SelectItem>
											))}
										</Select.SelectContent>
									</Select.Select>
								</div>
							</div>
						</div>

						<div
							style={{
								padding: "24px 28px",
								background: "#111113",
								borderTop: "1px solid var(--border)",
								display: "flex",
								justifyContent: "flex-end",
								gap: "12px",
							}}
						>
							<Button variant="ghost" onClick={() => closeModal()}>
								Cancelar
							</Button>
							<Button
								type="button"
								variant="primary"
								onClick={saveLancamento}
								style={{ background: "#22C55E", color: "#FFF" }}
							>
								{editingId ? "Salvar" : "Confirmar"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{showDeleteModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(0,0,0,0.7)",
						backdropFilter: "blur(4px)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
					onKeyDown={(e) => e.key === "Escape" && setShowDeleteModal(false)}
					onClick={(e) =>
						e.target === e.currentTarget && setShowDeleteModal(false)
					}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							padding: "32px",
							maxWidth: "400px",
							textAlign: "center",
						}}
					>
						<div
							style={{
								background: "rgba(239,68,68,0.1)",
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 20px",
							}}
						>
							<CategoryIcon
								name="alert-triangle"
								size={32}
								style={{ color: "#EF4444" }}
							/>
						</div>
						<h2
							style={{
								fontSize: "20px",
								fontWeight: 700,
								color: "#FFF",
								marginBottom: "12px",
							}}
						>
							Excluir Lançamento?
						</h2>
						<p
							style={{
								color: "var(--text-muted)",
								fontSize: "14px",
								lineHeight: 1.5,
								marginBottom: "24px",
							}}
						>
							Esta ação não pode ser desfeita.
						</p>
						<div
							style={{ display: "flex", gap: "12px", justifyContent: "center" }}
						>
							<Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
								Cancelar
							</Button>
							<Button
								type="button"
								onClick={deleteLancamento}
								style={{ background: "#EF4444", color: "#FFF" }}
							>
								Excluir
							</Button>
						</div>
					</div>
				</div>
			)}

			{showImportModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(0,0,0,0.7)",
						backdropFilter: "blur(4px)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
					onKeyDown={(e) => e.key === "Escape" && closeImportModal()}
					onClick={(e) => e.target === e.currentTarget && closeImportModal()}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "700px",
							width: "100%",
							maxHeight: "90vh",
							overflow: "auto",
						}}
					>
						<div
							style={{
								padding: "28px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								borderBottom: "1px solid var(--border)",
							}}
						>
							<div>
								<h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
									Importar Lançamentos
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									{importStep === 1 && "Selecione o arquivo para importar"}
									{importStep === 2 && "Mapeie as colunas do arquivo"}
									{importStep === 3 && "Revise e confirme a importação"}
								</p>
							</div>
							<button
								type="button"
								onClick={closeImportModal}
								style={{
									background: "#1F1F23",
									border: "1px solid #2A2A2E",
									width: "32px",
									height: "32px",
									borderRadius: "8px",
									color: "var(--text-secondary)",
									cursor: "pointer",
								}}
							>
								✕
							</button>
						</div>

						<div style={{ padding: "28px" }}>
							{importStep === 1 && (
								<div>
									<div style={{ marginBottom: "24px" }}>
										<label
											style={{
												display: "block",
												fontSize: "13px",
												fontWeight: 500,
												color: "var(--text-secondary)",
												marginBottom: "8px",
											}}
										>
											Conta *
										</label>
										<Select.Select
											value={importAccount}
											onValueChange={setImportAccount}
										>
											<Select.SelectTrigger
												style={{
													background: "#0A0A0B",
													border: "1px solid var(--border)",
													borderRadius: "12px",
													height: "52px",
													color: "#FFF",
													fontSize: "15px",
												}}
											>
												<Select.SelectValue placeholder="Selecione uma conta..." />
											</Select.SelectTrigger>
											<Select.SelectContent
												style={{
													background: "var(--bg-card)",
													border: "1px solid var(--border)",
													borderRadius: "12px",
												}}
											>
												{CONTAS.map((c) => (
													<Select.SelectItem
														key={c.id}
														value={c.nome}
														style={{
															color: "#FFF",
															padding: "10px 12px",
															borderRadius: "8px",
														}}
													>
														{c.nome}
													</Select.SelectItem>
												))}
											</Select.SelectContent>
										</Select.Select>
									</div>

									<div style={{ marginBottom: "24px" }}>
										<label
											htmlFor="import-file-input"
											style={{
												display: "block",
												fontSize: "13px",
												fontWeight: 500,
												color: "var(--text-secondary)",
												marginBottom: "8px",
											}}
										>
											Arquivo (CSV ou OFX) *
										</label>
										<div
											style={{
												border: "2px dashed var(--border)",
												borderRadius: "12px",
												padding: "40px",
												textAlign: "center",
												cursor: "pointer",
												transition: "border-color 0.2s",
											}}
											role="button"
											tabIndex={0}
											onClick={() => fileInputRef.current?.click()}
											onKeyDown={(e) =>
												e.key === "Enter" && fileInputRef.current?.click()
											}
										>
											<input
												id="import-file-input"
												ref={fileInputRef}
												type="file"
												accept=".csv,.ofx,.qfx"
												onChange={handleFileSelect}
												style={{ display: "none" }}
											></input>
											<Upload
												size={48}
												style={{
													color: "var(--text-muted)",
													marginBottom: "16px",
												}}
											/>
											<p
												style={{
													color: "#FFF",
													fontSize: "15px",
													marginBottom: "8px",
												}}
											>
												{importFile
													? importFile.name
													: "Clique ou arraste o arquivo"}
											</p>
											{importFile && (
												<p
													style={{
														color: "var(--text-muted)",
														fontSize: "13px",
													}}
												>
													{formatFileSize(importFile.size)}
												</p>
											)}
										</div>
									</div>

									<p
										style={{
											color: "var(--text-muted)",
											fontSize: "12px",
											marginTop: "16px",
										}}
									>
										Formatos suportados: CSV (separado por ; ou ,), OFX/QFX
										(extrato bancário)
									</p>
								</div>
							)}

							{importStep === 2 && parsedData && (
								<div>
									<div style={{ marginBottom: "24px" }}>
										<p
											style={{
												color: "var(--text-muted)",
												fontSize: "13px",
												marginBottom: "16px",
											}}
										>
											Corresponda as colunas do seu arquivo com os campos do
											sistema:
										</p>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 1fr",
												gap: "16px",
											}}
										>
											{[
												{ key: "data", label: "Data", required: true },
												{ key: "titulo", label: "Título", required: true },
												{ key: "valor", label: "Valor", required: true },
												{
													key: "categoria",
													label: "Categoria",
													required: false,
												},
											].map((field) => (
												<div key={field.key}>
													<label
														style={{
															display: "block",
															fontSize: "12px",
															fontWeight: 500,
															color: "var(--text-secondary)",
															marginBottom: "6px",
														}}
													>
														{field.label}{" "}
														{field.required && (
															<span style={{ color: "#EF4444" }}>*</span>
														)}
													</label>
													<select
														value={importMapping[field.key] || ""}
														onChange={(e) =>
															setImportMapping({
																...importMapping,
																[field.key]: e.target.value,
															})
														}
														style={{
															width: "100%",
															padding: "10px 12px",
															background: "#1F1F23",
															border: "1px solid #2D2D30",
															borderRadius: "8px",
															color: "#FFF",
															fontSize: "13px",
														}}
													>
														<option value="">Selecionar...</option>
														{parsedData.headers.map((h, idx) => (
															<option key={idx} value={String(idx)}>
																{h.substring(0, 25)}
															</option>
														))}
													</select>
												</div>
											))}
										</div>
									</div>
									<Button
										variant="primary"
										onClick={validateImport}
										style={{ background: "var(--accent)", color: "#FFF" }}
									>
										Validar Dados
									</Button>
								</div>
							)}

							{importStep === 2 && !parsedData && (
								<div style={{ textAlign: "center", padding: "40px" }}>
									<p
										style={{ color: "var(--text-muted)", marginBottom: "16px" }}
									>
										Arquivo OFX importado.
									</p>
									<Button
										variant="primary"
										onClick={validateImport}
										style={{ background: "var(--accent)", color: "#FFF" }}
									>
										Revisar Dados ({validatedRows.length} registros)
									</Button>
								</div>
							)}

							{importStep === 3 && (
								<div>
									<div
										style={{
											marginBottom: "24px",
											display: "flex",
											gap: "24px",
										}}
									>
										<div
											style={{
												flex: 1,
												padding: "16px",
												background: "#1F1F23",
												borderRadius: "8px",
											}}
										>
											<p
												style={{
													color: "var(--text-muted)",
													fontSize: "12px",
													marginBottom: "4px",
												}}
											>
												Total
											</p>
											<p
												style={{
													color: "#FFF",
													fontSize: "18px",
													fontWeight: 600,
												}}
											>
												{validatedRows.length}
											</p>
										</div>
										<div
											style={{
												flex: 1,
												padding: "16px",
												background: "#1F1F23",
												borderRadius: "8px",
											}}
										>
											<p
												style={{
													color: "var(--text-muted)",
													fontSize: "12px",
													marginBottom: "4px",
												}}
											>
												Válidos
											</p>
											<p
												style={{
													color: "#22C55E",
													fontSize: "18px",
													fontWeight: 600,
												}}
											>
												{
													validatedRows.filter(
														(r) => !r.ignored && r.errors.length === 0,
													).length
												}
											</p>
										</div>
										<div
											style={{
												flex: 1,
												padding: "16px",
												background: "#1F1F23",
												borderRadius: "8px",
											}}
										>
											<p
												style={{
													color: "var(--text-muted)",
													fontSize: "12px",
													marginBottom: "4px",
												}}
											>
												Com erros
											</p>
											<p
												style={{
													color: "#EF4444",
													fontSize: "18px",
													fontWeight: 600,
												}}
											>
												{
													validatedRows.filter((r) => r.errors.length > 0)
														.length
												}
											</p>
										</div>
									</div>

									<div
										style={{
											maxHeight: "300px",
											overflow: "auto",
											border: "1px solid var(--border)",
											borderRadius: "8px",
										}}
									>
										<Table>
											<TableHead>
												<TableRow>
													<TableHeader style={{ width: "40px" }}></TableHeader>
													<TableHeader>Data</TableHeader>
													<TableHeader>Título</TableHeader>
													<TableHeader style={{ textAlign: "right" }}>
														Valor
													</TableHeader>
													<TableHeader>Status</TableHeader>
												</TableRow>
											</TableHead>
											<TableBody>
												{validatedRows.slice(0, 50).map((row, idx) => (
													<TableRow
														key={idx}
														style={{ opacity: row.ignored ? 0.5 : 1 }}
													>
														<TableCell>
															<input
																type="checkbox"
																checked={!row.ignored}
																onChange={() => toggleRowIgnored(idx)}
															/>
														</TableCell>
														<TableCell>{row.data}</TableCell>
														<TableCell>{row.titulo}</TableCell>
														<TableCell
															style={{
																textAlign: "right",
																color:
																	row.tipo === "receita"
																		? "#22C55E"
																		: "#EF4444",
															}}
														>
															{row.tipo === "receita" ? "+" : "-"}
															{row.valorStr}
														</TableCell>
														<TableCell>
															{row.errors.length > 0 ? (
																<span
																	style={{ color: "#EF4444", fontSize: "12px" }}
																>
																	{row.errors[0]}
																</span>
															) : (
																<span
																	style={{ color: "#22C55E", fontSize: "12px" }}
																>
																	OK
																</span>
															)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									{validatedRows.length > 50 && (
										<p
											style={{
												color: "var(--text-muted)",
												fontSize: "12px",
												marginTop: "8px",
												textAlign: "center",
											}}
										>
											Mostrando 50 de {validatedRows.length} registros
										</p>
									)}
								</div>
							)}
						</div>

						<div
							style={{
								padding: "24px 28px",
								background: "#111113",
								borderTop: "1px solid var(--border)",
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							{importStep > 1 && (
								<Button
									variant="ghost"
									onClick={() => setImportStep(importStep - 1)}
								>
									Voltar
								</Button>
							)}
							<div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
								<Button variant="ghost" onClick={closeImportModal}>
									Cancelar
								</Button>
								{importStep === 3 && (
									<Button
										variant="primary"
										onClick={executeImport}
										style={{ background: "#22C55E", color: "#FFF" }}
									>
										Importar{" "}
										{
											validatedRows.filter(
												(r) => !r.ignored && r.errors.length === 0,
											).length
										}{" "}
										registros
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
