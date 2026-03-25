import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowDownLeft,
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	DollarSign,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import * as Select from "@/components/ui/select";
import { CategoryIcon } from "@/lib/category-icons";
import {
	formatCurrency,
	formatCurrencyInput,
	formatDateInput,
	parseCurrency,
} from "@/lib/formatters";
import { Button } from "../components/ds/Button";
import { Card } from "../components/ds/Card";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ds/Table";
import { Input } from "../components/ds";

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

function LancamentosPage() {
	const [lancamentos, setLancamentos] =
		useState<Lancamento[]>(MOCK_LANCAMENTOS);
	const [currentMonth, setCurrentMonth] = useState(3);
	const [currentYear] = useState(2026);
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

	const handlePrevMonth = () => {
		if (currentMonth === 1) setCurrentMonth(12);
		else setCurrentMonth(currentMonth - 1);
	};

	const handleNextMonth = () => {
		if (currentMonth === 12) setCurrentMonth(1);
		else setCurrentMonth(currentMonth + 1);
	};

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
		}
		setShowDeleteModal(false);
		setDeleteId(null);
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
				<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
					<button
						type="button"
						className="month-selector"
						style={{
							background: "transparent",
							border: "1px solid var(--border)",
							padding: "10px 16px",
							borderRadius: "8px",
							display: "flex",
							alignItems: "center",
							gap: "12px",
							color: "#FFF",
							cursor: "pointer",
						}}
					>
						<span
							onClick={handlePrevMonth}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && handlePrevMonth()}
							style={{ cursor: "pointer", display: "flex" }}
						>
							<ChevronLeft size={18} />
						</span>
						<span
							style={{
								fontWeight: 600,
								fontSize: "14px",
								letterSpacing: "0.05em",
								textTransform: "uppercase",
							}}
						>
							{MESES[currentMonth - 1]} {currentYear}
						</span>
						<span
							onClick={handleNextMonth}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && handleNextMonth()}
							style={{ cursor: "pointer", display: "flex" }}
						>
							<ChevronRight size={18} />
						</span>
					</button>
					<button
						type="button"
						onClick={() => openModal()}
						style={{
							background: "var(--accent)",
							color: "#FFF",
							border: "none",
							padding: "10px 20px",
							borderRadius: "8px",
							fontWeight: 600,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						+ Novo Lançamento
					</button>
				</div>
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
			<div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
				{["todos", "receita", "despesa"].map((tipo) => (
					<button
						type="button"
						key={tipo}
						onClick={() => setFiltroTipo(tipo)}
						style={{
							padding: "6px 16px",
							borderRadius: "100px",
							fontSize: "13px",
							cursor: "pointer",
							background:
								filtroTipo === tipo ? "var(--accent)" : "var(--bg-card)",
							color: filtroTipo === tipo ? "#FFF" : "var(--text-secondary)",
							border: "1px solid var(--border)",
							textTransform: "capitalize",
						}}
					>
						{tipo === "todos"
							? "Todos"
							: tipo === "receita"
								? "Receitas"
								: "Despesas"}
					</button>
				))}
			</div>

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
									<select
										id="lanc-conta"
										value={conta}
										onChange={(e) => setConta(e.target.value)}
										style={{
											width: "100%",
											background: "#0A0A0B",
											border: "1px solid var(--border)",
											borderRadius: "12px",
											height: "52px",
											color: "#FFF",
											padding: "0 16px",
											fontSize: "15px",
											cursor: "pointer",
										}}
									>
										<option value="">Selecione...</option>
										{CONTAS.map((c) => (
											<option key={c.id} value={c.nome}>
												{c.nome}
											</option>
										))}
									</select>
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
					onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
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
						<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
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
		</main>
	);
}
