import { createFileRoute } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import { ActionButton } from "@/components/ds/ActionMenu";
import { PageActions } from "@/components/ds/PageActions";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ds/Table";
import { MonthSelector } from "@/components/layout/MonthSelector";
import * as Select from "@/components/ui/select";
import { appStore } from "@/lib/app-store";
import { CATEGORIAS, getCategoriasDespesas } from "@/lib/categorias";
import { CategoryIcon } from "@/lib/category-icons";

export const Route = createFileRoute("/orcamento")({
	component: OrcamentoPage,
});

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

const DEFAULT_ORCAMENTOS = [
	{
		id: "orc_1",
		categoria_id: "da",
		mes: 3,
		ano: 2026,
		valor_planejado: 1500,
		alerta_ativo: true,
		alerta_percentual: 80,
		status: "ativa",
	},
	{
		id: "orc_2",
		categoria_id: "dm",
		mes: 3,
		ano: 2026,
		valor_planejado: 4000,
		alerta_ativo: true,
		alerta_percentual: 80,
		status: "ativa",
	},
];

const DEFAULT_LANCAMENTOS = [
	{
		id: "l1",
		data_lancamento: "2026-03-05",
		descricao: "Supermercado Extra",
		valor: "350.00",
		tipo_categoria: "SAIDA",
		categoria_id: "da2",
	},
	{
		id: "l2",
		data_lancamento: "2026-03-08",
		descricao: "Aluguel Março",
		valor: "1800.00",
		tipo_categoria: "SAIDA",
		categoria_id: "dm1",
	},
	{
		id: "l3",
		data_lancamento: "2026-03-10",
		descricao: "Conta de Luz",
		valor: "280.00",
		tipo_categoria: "SAIDA",
		categoria_id: "dm",
		conta_id: "conta1",
	},
];

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

function formatPercent(value: number) {
	return `${Math.round(value)}%`;
}

function OrcamentoPage() {
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
	const [lancamentos] = useState(DEFAULT_LANCAMENTOS);
	const [orcamentos, setOrcamentos] = useState(DEFAULT_ORCAMENTOS);
	const [showModal, setShowModal] = useState(false);
	const [showCopyModal, setShowCopyModal] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<any>(null);
	const [editCategory, setEditCategory] = useState(false);
	const [valorPlanejado, setValorPlanejado] = useState("");
	const [alertaAtivo, setAlertaAtivo] = useState(false);
	const [alertaPercentual, setAlertaPercentual] = useState(80);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [errors, setErrors] = useState<{ categoria?: string; valor?: string }>(
		{},
	);
	const [copySourceMonth, setCopySourceMonth] = useState("");
	const [copyOverwrite, setCopyOverwrite] = useState(false);
	const [showViewTransactions, setShowViewTransactions] = useState(false);
	const [viewTransactionsCat, setViewTransactionsCat] = useState<any>(null);

	const getOrcamentosDoMes = () => {
		return orcamentos.filter(
			(o) =>
				Number(o.mes) === Number(currentMonth) &&
				Number(o.ano) === Number(currentYear) &&
				(o.status === "ativa" || !o.status),
		);
	};

	const getGastoReal = (categoriaId: string) => {
		// Primeiro tenta buscar do store
		const gastoStore = appStore.getGastoPorCategoria(
			categoriaId,
			currentMonth,
			currentYear,
		);
		if (appStore.transacoes.length > 0) {
			return gastoStore;
		}

		// Fallback para dados mocados
		const mesStr = String(currentMonth).padStart(2, "0");
		const dataInicio = `${currentYear}-${mesStr}-01`;
		const dataFim = new Date(currentYear, currentMonth, 0)
			.toISOString()
			.split("T")[0];

		const categoria = CATEGORIAS.find((c) => c.id === categoriaId);
		const CATEGORIASIds = [categoriaId];

		if (categoria && !categoria.paiId) {
			const subs = CATEGORIAS.filter((c) => c.paiId === categoriaId);
			subs.forEach((s) => CATEGORIASIds.push(s.id));
		}

		return lancamentos
			.filter((l) => {
				if (l.tipo_categoria !== "SAIDA") return false;
				if (!CATEGORIASIds.includes(l.categoria_id)) return false;
				return l.data_lancamento >= dataInicio && l.data_lancamento <= dataFim;
			})
			.reduce((sum, l) => sum + (parseFloat(l.valor) || 0), 0);
	};

	const getCategoriaById = (id: string) => CATEGORIAS.find((c) => c.id === id);

	const openModal = (id?: string) => {
		if (id) {
			const orc = orcamentos.find((o) => o.id === id);
			if (orc) {
				setEditingId(id);
				setSelectedCategory(getCategoriaById(orc.categoria_id));
				setValorPlanejado(orc.valor_planejado.toString());
				setAlertaAtivo(orc.alerta_ativo);
				setAlertaPercentual(orc.alerta_percentual);
				setEditCategory(false);
			}
		} else {
			setEditingId(null);
			setSelectedCategory(null);
			setValorPlanejado("");
			setAlertaAtivo(false);
			setAlertaPercentual(80);
			setEditCategory(false);
		}
		setErrors({});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingId(null);
		setErrors({});
		setEditCategory(false);
	};

	const saveOrcamento = () => {
		const valor =
			parseFloat(valorPlanejado.replace(/\./g, "").replace(",", ".")) || 0;

		const newErrors: { categoria?: string; valor?: string } = {};
		if (!selectedCategory) newErrors.categoria = "Selecione uma categoria";
		if (valor <= 0) newErrors.valor = "Valor deve ser maior que zero";

		if (!editingId) {
			const jaOrcado = orcamentos.some(
				(o) =>
					o.categoria_id === selectedCategory?.id &&
					Number(o.mes) === Number(currentMonth) &&
					Number(o.ano) === Number(currentYear) &&
					o.status === "ativa",
			);
			if (jaOrcado)
				newErrors.categoria = "Esta categoria já está orçada neste mês";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}
		setErrors({});

		if (editingId) {
			setOrcamentos((prev) =>
				prev.map((o) =>
					o.id === editingId
						? {
								...o,
								valor_planejado: valor,
								alerta_ativo: alertaAtivo,
								alerta_percentual: alertaPercentual,
							}
						: o,
				),
			);
		} else {
			const newOrcamento = {
				id: "orc_" + Date.now(),
				categoria_id: selectedCategory.id,
				mes: currentMonth,
				ano: currentYear,
				valor_planejado: valor,
				alerta_ativo: alertaAtivo,
				alerta_percentual: alertaPercentual,
				status: "ativa",
			};
			setOrcamentos((prev) => [...prev, newOrcamento]);
		}
		closeModal();
	};

	const confirmDelete = (id: string) => {
		setDeleteId(id);
		setShowDeleteModal(true);
	};

	const deleteOrcamento = () => {
		if (deleteId) {
			setOrcamentos((prev) => prev.filter((o) => o.id !== deleteId));
		}
		setShowDeleteModal(false);
		setDeleteId(null);
	};

	const orcamentosDoMes = getOrcamentosDoMes();
	const totalOrcado = orcamentosDoMes.reduce(
		(sum, o) => sum + o.valor_planejado,
		0,
	);
	const totalGasto = orcamentosDoMes.reduce(
		(sum, o) => sum + getGastoReal(o.categoria_id),
		0,
	);
	const totalRestante = totalOrcado - totalGasto;
	const percentual = totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0;

	return (
		<div
			className="content"
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				overflow: "auto",
			}}
		>
			<header
				className="header"
				style={{
					padding: "40px 48px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				<div className="page-info">
					<h1 style={{ fontSize: "32px", fontWeight: 700, margin: 0 }}>
						Orçamento Mensal
					</h1>
					<p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
						Defina limites de despesa por categoria e acompanhe seus gastos.
					</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<MonthSelector
						month={currentMonth}
						year={currentYear}
						onMonthChange={(month, year) => {
							setCurrentMonth(month);
							setCurrentYear(year);
						}}
					/>
					<PageActions>
						<ActionButton
							icon={<CategoryIcon name="copy" size={16} />}
							label="Copiar orçamento"
							onClick={() => setShowCopyModal(true)}
							variant="secondary"
						/>
						<ActionButton
							icon={<CategoryIcon name="plus" size={16} />}
							label="Novo Orçamento"
							onClick={() => openModal()}
							variant="primary"
						/>
					</PageActions>
				</div>
			</header>

			{/* Summary Cards */}
			<div
				className="summary-cards"
				style={{
					display: "flex",
					gap: "16px",
					padding: "0 48px",
					marginBottom: "24px",
					flexWrap: "wrap",
				}}
			>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "20px 24px",
						display: "flex",
						alignItems: "center",
						gap: "16px",
						flex: 1,
						minWidth: "200px",
					}}
				>
					<div
						className="card-icon planned"
						style={{
							width: "48px",
							height: "48px",
							borderRadius: "12px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(99, 102, 241, 0.1)",
							color: "#818CF8",
						}}
					>
						<CategoryIcon name="target" size={24} />
					</div>
					<div
						className="card-data"
						style={{ display: "flex", flexDirection: "column", gap: "4px" }}
					>
						<span
							className="label"
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								fontWeight: 600,
							}}
						>
							Total Orçado
						</span>
						<span
							className="value"
							style={{
								fontSize: "20px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalOrcado)}
						</span>
					</div>
				</div>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "20px 24px",
						display: "flex",
						alignItems: "center",
						gap: "16px",
						flex: 1,
						minWidth: "200px",
					}}
				>
					<div
						className="card-icon spent"
						style={{
							width: "48px",
							height: "48px",
							borderRadius: "12px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(239, 68, 68, 0.1)",
							color: "#EF4444",
						}}
					>
						<CategoryIcon name="wallet" size={24} />
					</div>
					<div
						className="card-data"
						style={{ display: "flex", flexDirection: "column", gap: "4px" }}
					>
						<span
							className="label"
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								fontWeight: 600,
							}}
						>
							Total Gasto
						</span>
						<span
							className="value"
							style={{
								fontSize: "20px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalGasto)}
						</span>
					</div>
				</div>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "20px 24px",
						display: "flex",
						alignItems: "center",
						gap: "16px",
						flex: 1,
						minWidth: "200px",
					}}
				>
					<div
						className="card-icon remaining"
						style={{
							width: "48px",
							height: "48px",
							borderRadius: "12px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(34, 197, 94, 0.1)",
							color: "#22C55E",
						}}
					>
						<CategoryIcon name="piggy-bank" size={24} />
					</div>
					<div
						className="card-data"
						style={{ display: "flex", flexDirection: "column", gap: "4px" }}
					>
						<span
							className="label"
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								fontWeight: 600,
							}}
						>
							Restante
						</span>
						<span
							className="value"
							style={{
								fontSize: "20px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalRestante)}
						</span>
					</div>
				</div>
				<div
					className="card"
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "20px 24px",
						display: "flex",
						alignItems: "center",
						gap: "16px",
						flex: 1,
						minWidth: "200px",
					}}
				>
					<div
						className="card-icon status"
						style={{
							width: "48px",
							height: "48px",
							borderRadius: "12px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background:
								percentual >= 100
									? "rgba(239, 68, 68, 0.1)"
									: percentual >= 75
										? "rgba(245, 158, 11, 0.1)"
										: "rgba(34, 197, 94, 0.1)",
							color:
								percentual >= 100
									? "#EF4444"
									: percentual >= 75
										? "#F59E0B"
										: "#22C55E",
						}}
					>
						<CategoryIcon
							name={percentual >= 100 ? "alert-circle" : "check-circle"}
							size={24}
						/>
					</div>
					<div
						className="card-data"
						style={{ display: "flex", flexDirection: "column", gap: "4px" }}
					>
						<span
							className="label"
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								fontWeight: 600,
							}}
						>
							Status
						</span>
						<span
							className="value"
							style={{
								fontSize: "20px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
								color:
									percentual >= 100
										? "#EF4444"
										: percentual >= 75
											? "#F59E0B"
											: "#22C55E",
							}}
						>
							{formatPercent(percentual)}
						</span>
					</div>
				</div>
			</div>

			{/* Insight Box */}
			{percentual > 0 && (
				<div
					style={{
						margin: "0 48px 24px",
						padding: "16px 20px",
						background:
							percentual >= 100
								? "rgba(239, 68, 68, 0.1)"
								: percentual >= 75
									? "rgba(245, 158, 11, 0.1)"
									: "rgba(34, 197, 94, 0.1)",
						border: `1px solid ${
							percentual >= 100
								? "rgba(239, 68, 68, 0.3)"
								: percentual >= 75
									? "rgba(245, 158, 11, 0.3)"
									: "rgba(34, 197, 94, 0.3)"
						}`,
						borderRadius: "12px",
						display: "flex",
						alignItems: "center",
						gap: "12px",
					}}
				>
					<CategoryIcon
						name={percentual >= 100 ? "alert-circle" : "info"}
						size={20}
						style={{
							color:
								percentual >= 100
									? "#EF4444"
									: percentual >= 75
										? "#F59E0B"
										: "#22C55E",
						}}
					/>
					<span
						style={{
							fontSize: "14px",
							color:
								percentual >= 100
									? "#EF4444"
									: percentual >= 75
										? "#F59E0B"
										: "#22C55E",
						}}
					>
						{percentual >= 100
							? `Você ultrapassou o orçamento! Seus gastos representam ${formatPercent(percentual)} do total orçado.`
							: percentual >= 75
								? `Atenção: Você já usou ${formatPercent(percentual)} do orçamento deste mês.`
								: `Você está dentro do orçamento. Utilizado ${formatPercent(percentual)} do total orçado.`}
					</span>
				</div>
			)}

			<Table scroll>
				<TableHead sticky>
					<TableRow>
						<TableHeader>Categoria</TableHeader>
						<TableHeader style={{ textAlign: "right" }}>Gasto</TableHeader>
						<TableHeader style={{ textAlign: "right" }}>Orçado</TableHeader>
						<TableHeader style={{ textAlign: "right" }}>Restante</TableHeader>
						<TableHeader style={{ textAlign: "center" }}>Progresso</TableHeader>
						<TableHeader style={{ width: "100px" }}>Ações</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{orcamentosDoMes.length === 0 ? (
						<TableEmpty
							colSpan={6}
							message="Nenhum orçamento configurado para este mês."
							icon={
								<CategoryIcon name="inbox" size={48} style={{ opacity: 0.5 }} />
							}
						/>
					) : (
						orcamentosDoMes.map((orc) => {
							const cat = getCategoriaById(orc.categoria_id);
							if (!cat) return null;

							const gastoReal = getGastoReal(orc.categoria_id);
							const restante = orc.valor_planejado - gastoReal;
							const perc =
								orc.valor_planejado > 0
									? (gastoReal / orc.valor_planejado) * 100
									: 0;
							const isEstouro = gastoReal > orc.valor_planejado;

							let progressColor = "#22C55E";
							if (perc >= 100) progressColor = "#EF4444";
							else if (perc >= 75) progressColor = "#F59E0B";

							return (
								<TableRow key={orc.id}>
									<TableCell>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "12px",
											}}
										>
											<div
												style={{
													background: `${cat.cor}20`,
													color: cat.cor,
													width: "36px",
													height: "36px",
													borderRadius: "8px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<CategoryIcon name={cat.icon || "tag"} size={18} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<span>{cat.nome}</span>
												{cat.paiId && (
													<span
														style={{
															fontSize: "12px",
															color: "var(--text-muted)",
														}}
													>
														{getCategoriaById(cat.paiId)?.nome}
													</span>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell
										style={{
											textAlign: "right",
											color: isEstouro ? "#EF4444" : "inherit",
										}}
									>
										{formatCurrency(gastoReal)}
									</TableCell>
									<TableCell style={{ textAlign: "right" }}>
										{formatCurrency(orc.valor_planejado)}
									</TableCell>
									<TableCell
										style={{
											textAlign: "right",
											color: restante < 0 ? "#EF4444" : "#22C55E",
										}}
									>
										{formatCurrency(restante)}
									</TableCell>
									<TableCell style={{ textAlign: "center" }}>
										<div
											style={{
												width: "120px",
												height: "24px",
												background: "var(--bg-item)",
												borderRadius: "12px",
												position: "relative",
												overflow: "hidden",
												margin: "0 auto",
											}}
										>
											<div
												style={{
													height: "100%",
													width: `${Math.min(perc, 100)}%`,
													background: progressColor,
													borderRadius: "12px",
													transition: "width 0.3s",
												}}
											></div>
											<span
												style={{
													position: "absolute",
													top: "50%",
													left: "50%",
													transform: "translate(-50%, -50%)",
													fontSize: "11px",
													fontWeight: 700,
													textShadow: "0 1px 2px rgba(0,0,0,0.5)",
												}}
											>
												{formatPercent(perc)}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div style={{ display: "flex", gap: "4px" }}>
											<button
												type="button"
												onClick={() => {
													setViewTransactionsCat(cat);
													setShowViewTransactions(true);
												}}
												title="Ver lançamentos"
												style={{
													background: "transparent",
													border: "none",
													color: "var(--text-secondary)",
													cursor: "pointer",
													padding: "8px",
													borderRadius: "6px",
												}}
											>
												<CategoryIcon name="eye" size={16} />
											</button>
											<button
												type="button"
												onClick={() => openModal(orc.id)}
												title="Editar"
												style={{
													background: "transparent",
													border: "none",
													color: "var(--text-secondary)",
													cursor: "pointer",
													padding: "8px",
													borderRadius: "6px",
												}}
											>
												<CategoryIcon name="pencil" size={16} />
											</button>
											<button
												type="button"
												onClick={() => confirmDelete(orc.id)}
												title="Excluir"
												style={{
													background: "transparent",
													border: "none",
													color: "var(--text-secondary)",
													cursor: "pointer",
													padding: "8px",
													borderRadius: "6px",
												}}
											>
												<CategoryIcon name="trash-2" size={16} />
											</button>
										</div>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			{/* Modal */}
			{showModal && (
				<div
					className="modal-overlay"
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
						padding: "24px",
					}}
					onClick={(e) => e.target === e.currentTarget && closeModal()}
				>
					<div
						className="modal-container"
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "500px",
							width: "100%",
							position: "relative",
						}}
					>
						<div
							className="modal-header"
							style={{
								padding: "28px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								borderBottom: "1px solid var(--border)",
							}}
						>
							<div>
								<h2
									className="modal-title"
									style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}
								>
									{editingId ? "Editar Orçamento" : "Novo Orçamento"}
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									Defina o limite de orçamento para a categoria.
								</p>
							</div>
							<button
								type="button"
								onClick={closeModal}
								style={{
									background: "#1F1F23",
									border: "1px solid #2A2A2E",
									width: "32px",
									height: "32px",
									borderRadius: "8px",
									color: "var(--text-secondary)",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<CategoryIcon name="x" size={16} />
							</button>
						</div>
						<div className="modal-form" style={{ padding: "0 28px 28px" }}>
							{!editingId && (
								<div style={{ marginBottom: "20px" }}>
									<label
										htmlFor="orcamento-categoria"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Categoria *
									</label>
									{!editCategory && selectedCategory ? (
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												background: "#0A0A0B",
												border: `1px solid ${errors.categoria ? "#EF4444" : "var(--border)"}`,
												borderRadius: "12px",
												height: "52px",
												padding: "0 16px",
												cursor: "pointer",
											}}
											onClick={() => setEditCategory(true)}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "12px",
												}}
											>
												<div
													style={{
														background: `${selectedCategory.cor}20`,
														color: selectedCategory.cor,
														width: "32px",
														height: "32px",
														borderRadius: "8px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<CategoryIcon
														name={selectedCategory.icon || "tag"}
														size={16}
													/>
												</div>
												<div>
													<div style={{ color: "#FFF", fontWeight: 500 }}>
														{selectedCategory.nome}
													</div>
													{selectedCategory.paiId && (
														<div
															style={{
																fontSize: "12px",
																color: "var(--text-muted)",
															}}
														>
															{
																CATEGORIAS.find(
																	(c) => c.id === selectedCategory.paiId,
																)?.nome
															}
														</div>
													)}
												</div>
											</div>
											<CategoryIcon
												name="pencil"
												size={16}
												style={{ color: "var(--text-muted)" }}
											/>
										</div>
									) : (
										<>
											<Select.Select
												value={selectedCategory?.id || ""}
												onValueChange={(value) => {
													const cat = CATEGORIAS.find((c) => c.id === value);
													setSelectedCategory(cat);
													if (cat) setEditCategory(false);
												}}
											>
												<Select.SelectTrigger
													style={{
														width: "100%",
														background: "#0A0A0B",
														border: `1px solid ${errors.categoria ? "#EF4444" : "var(--border)"}`,
														borderRadius: "12px",
														height: "52px",
														color: "#FFF",
														fontSize: "15px",
														outline: "none",
														display: "flex",
														alignItems: "center",
													}}
												>
													<Select.SelectValue placeholder="Selecione uma categoria..." />
												</Select.SelectTrigger>
												<Select.SelectContent
													style={{
														background: "var(--bg-card)",
														border: "1px solid var(--border)",
														borderRadius: "12px",
													}}
												>
													{getCategoriasDespesas().map((cat) => (
														<Select.SelectItem
															key={cat.id}
															value={cat.id}
															style={{
																color: "#FFF",
																padding: "10px 12px",
																borderRadius: "8px",
															}}
														>
															{cat.nivel > 0 ? "  " : ""}
															{cat.nivel > 0 ? "↳ " : ""}
															{cat.nome}
															{cat.nomePai ? ` (${cat.nomePai})` : ""}
														</Select.SelectItem>
													))}
												</Select.SelectContent>
											</Select.Select>
											{errors.categoria && (
												<span
													style={{
														color: "#EF4444",
														fontSize: "12px",
														marginTop: "4px",
														display: "block",
													}}
												>
													{errors.categoria}
												</span>
											)}
										</>
									)}
								</div>
							)}
							<div style={{ marginBottom: "20px" }}>
								<label
									htmlFor="orcamento-valor"
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Valor Planejado (R$) *
								</label>
								<input
									id="orcamento-valor"
									type="text"
									value={valorPlanejado}
									onChange={(e) => setValorPlanejado(e.target.value)}
									placeholder="0,00"
									style={{
										width: "100%",
										background: "#0A0A0B",
										border: `1px solid ${errors.valor ? "#EF4444" : "var(--border)"}`,
										borderRadius: "12px",
										height: "52px",
										color: "#FFF",
										padding: "0 16px",
										fontSize: "15px",
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
							<div
								style={{
									marginBottom: "20px",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<label
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
									}}
								>
									Alerta Ativo
								</label>
								<label
									style={{
										position: "relative",
										width: "48px",
										height: "26px",
									}}
								>
									<input
										type="checkbox"
										checked={alertaAtivo}
										onChange={(e) => setAlertaAtivo(e.target.checked)}
										style={{ opacity: 0, width: 0, height: 0 }}
									/>
									<span
										style={{
											position: "absolute",
											cursor: "pointer",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											backgroundColor: "var(--bg-item)",
											transition: "0.3s",
											borderRadius: "26px",
											border: "1px solid var(--border)",
										}}
									></span>
								</label>
							</div>
							{alertaAtivo && (
								<div style={{ marginBottom: "20px" }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Alerta (%)
									</label>
									<input
										type="number"
										value={alertaPercentual}
										onChange={(e) =>
											setAlertaPercentual(parseInt(e.target.value))
										}
										min={1}
										max={100}
										style={{
											width: "100%",
											background: "#0A0A0B",
											border: "1px solid var(--border)",
											borderRadius: "12px",
											height: "52px",
											color: "#FFF",
											padding: "0 16px",
											fontSize: "15px",
											outline: "none",
										}}
									/>
								</div>
							)}
						</div>
						<div
							className="modal-footer"
							style={{
								padding: "24px 28px",
								background: "#111113",
								borderTop: "1px solid var(--border)",
								display: "flex",
								justifyContent: "flex-end",
								gap: "12px",
							}}
						>
							<button
								onClick={closeModal}
								style={{
									background: "transparent",
									border: "1px solid var(--border)",
									color: "var(--text-secondary)",
									padding: "10px 20px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								Cancelar
							</button>
							<button
								onClick={saveOrcamento}
								style={{
									background: "var(--accent)",
									border: "none",
									color: "#FFF",
									padding: "10px 20px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								Salvar Orçamento
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Modal */}
			{showDeleteModal && (
				<div
					className="modal-overlay"
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
							Excluir Orçamento?
						</h2>
						<p
							style={{
								color: "var(--text-muted)",
								fontSize: "14px",
								lineHeight: 1.5,
								marginBottom: "24px",
							}}
						>
							Esta ação removerá o orçamento desta categoria. Deseja continuar?
						</p>
						<div
							style={{ display: "flex", gap: "12px", justifyContent: "center" }}
						>
							<button
								onClick={() => setShowDeleteModal(false)}
								style={{
									background: "transparent",
									border: "1px solid var(--border)",
									color: "var(--text-secondary)",
									padding: "10px 20px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								Cancelar
							</button>
							<button
								onClick={deleteOrcamento}
								style={{
									background: "#EF4444",
									border: "none",
									color: "#FFF",
									padding: "10px 20px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								Excluir
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Copy Budget Modal */}
			{showCopyModal && (
				<div
					className="modal-overlay"
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
						padding: "24px",
					}}
					onClick={(e) =>
						e.target === e.currentTarget && setShowCopyModal(false)
					}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "450px",
							width: "100%",
							position: "relative",
						}}
					>
						<div
							style={{
								padding: "28px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
						>
							<div>
								<h2
									style={{
										fontSize: "20px",
										fontWeight: 700,
										margin: 0,
									}}
								>
									Copiar Orçamento
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									Copie os orçamentos de outro mês para o mês atual.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setShowCopyModal(false)}
								style={{
									background: "#1F1F23",
									border: "1px solid #2A2A2E",
									width: "32px",
									height: "32px",
									borderRadius: "8px",
									color: "var(--text-secondary)",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<CategoryIcon name="x" size={16} />
							</button>
						</div>
						<div style={{ padding: "0 28px 28px" }}>
							<div style={{ marginBottom: "20px" }}>
								<label
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Mês de Origem *
								</label>
								<select
									value={copySourceMonth}
									onChange={(e) => setCopySourceMonth(e.target.value)}
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
									<option value="">Selecione um mês...</option>
									{Array.from({ length: 12 }, (_, i) => {
										const mes = i + 1;
										const key = `${currentYear}-${String(mes).padStart(2, "0")}`;
										return (
											<option key={key} value={key}>
												{MESES[mes - 1]} {currentYear}
											</option>
										);
									})}
									{Array.from({ length: 12 }, (_, i) => {
										const mes = i + 1;
										const ano = currentYear - 1;
										const key = `${ano}-${String(mes).padStart(2, "0")}`;
										return (
											<option key={key} value={key}>
												{MESES[mes - 1]} {ano}
											</option>
										);
									})}
								</select>
							</div>
							<div
								style={{
									marginBottom: "20px",
									display: "flex",
									alignItems: "center",
									gap: "12px",
								}}
							>
								<input
									type="checkbox"
									id="copy-overwrite"
									checked={copyOverwrite}
									onChange={(e) => setCopyOverwrite(e.target.checked)}
									style={{ width: "18px", height: "18px", cursor: "pointer" }}
								/>
								<label
									htmlFor="copy-overwrite"
									style={{
										fontSize: "14px",
										color: "var(--text-secondary)",
										cursor: "pointer",
									}}
								>
									Substituir orçamentos existentes do mês atual
								</label>
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
							<button
								type="button"
								onClick={() => setShowCopyModal(false)}
								style={{
									background: "transparent",
									border: "1px solid var(--border)",
									color: "var(--text-secondary)",
									padding: "10px 20px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={() => {
									if (!copySourceMonth) return;
									const [sourceAno, sourceMes] = copySourceMonth
										.split("-")
										.map(Number);

									const orcamentosSource = orcamentos.filter(
										(o) =>
											o.mes === sourceMes &&
											o.ano === sourceAno &&
											o.status === "ativa",
									);

									if (orcamentosSource.length === 0) {
										alert("Nenhum orçamento encontrado no mês de origem");
										return;
									}

									let newOrcamentos = [...orcamentos];

									if (!copyOverwrite) {
										const existingIds = newOrcamentos
											.filter(
												(o) => o.mes === currentMonth && o.ano === currentYear,
											)
											.map((o) => o.categoria_id);

										const toAdd = orcamentosSource.filter(
											(o) => !existingIds.includes(o.categoria_id),
										);

										toAdd.forEach((o) => {
											newOrcamentos.push({
												...o,
												id:
													"orc_" +
													Date.now() +
													Math.random().toString(36).substr(2, 9),
												mes: currentMonth,
												ano: currentYear,
											});
										});
									} else {
										newOrcamentos = newOrcamentos.filter(
											(o) => !(o.mes === currentMonth && o.ano === currentYear),
										);

										orcamentosSource.forEach((o) => {
											newOrcamentos.push({
												...o,
												id:
													"orc_" +
													Date.now() +
													Math.random().toString(36).substr(2, 9),
												mes: currentMonth,
												ano: currentYear,
											});
										});
									}

									setOrcamentos(newOrcamentos);
									setShowCopyModal(false);
									setCopySourceMonth("");
									setCopyOverwrite(false);
									alert(`${orcamentosSource.length} orçamento(s) copiado(s)!`);
								}}
								style={{
									background: "var(--accent)",
									border: "none",
									color: "#FFF",
									padding: "10px 20px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								Copiar Orçamento
							</button>
						</div>
					</div>
				</div>
			)}

			{/* View Transactions Modal */}
			{showViewTransactions && viewTransactionsCat && (
				<div
					className="modal-overlay"
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
						padding: "24px",
					}}
					onClick={(e) =>
						e.target === e.currentTarget && setShowViewTransactions(false)
					}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "600px",
							width: "100%",
							maxHeight: "80vh",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div
							style={{
								padding: "28px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
						>
							<div
								style={{ display: "flex", alignItems: "center", gap: "12px" }}
							>
								<div
									style={{
										background: `${viewTransactionsCat.cor}20`,
										color: viewTransactionsCat.cor,
										width: "40px",
										height: "40px",
										borderRadius: "10px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<CategoryIcon
										name={viewTransactionsCat.icon || "tag"}
										size={20}
									/>
								</div>
								<div>
									<h2
										style={{
											fontSize: "20px",
											fontWeight: 700,
											margin: 0,
										}}
									>
										{viewTransactionsCat.nome}
									</h2>
									<p
										style={{
											color: "var(--text-muted)",
											fontSize: "13px",
											marginTop: "2px",
										}}
									>
										{MESES[currentMonth - 1]} {currentYear}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowViewTransactions(false)}
								style={{
									background: "#1F1F23",
									border: "1px solid #2A2A2E",
									width: "32px",
									height: "32px",
									borderRadius: "8px",
									color: "var(--text-secondary)",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<CategoryIcon name="x" size={16} />
							</button>
						</div>
						<div
							style={{
								padding: "0 28px 28px",
								overflowY: "auto",
								flex: 1,
							}}
						>
							{(() => {
								const categoria = viewTransactionsCat;
								const CATEGORIASIds = [categoria.id];

								if (!categoria.paiId) {
									const subs = CATEGORIAS.filter(
										(c) => c.paiId === categoria.id,
									);
									subs.forEach((s) => CATEGORIASIds.push(s.id));
								}

								const mesStr = String(currentMonth).padStart(2, "0");
								const dataInicio = `${currentYear}-${mesStr}-01`;
								const dataFim = new Date(currentYear, currentMonth, 0)
									.toISOString()
									.split("T")[0];

								const lancamentosCategoria = lancamentos.filter((l) => {
									if (l.tipo_categoria !== "SAIDA") return false;
									if (!CATEGORIASIds.includes(l.categoria_id)) return false;
									return (
										l.data_lancamento >= dataInicio &&
										l.data_lancamento <= dataFim
									);
								});

								if (lancamentosCategoria.length === 0) {
									return (
										<div
											style={{
												textAlign: "center",
												padding: "40px 20px",
												color: "var(--text-muted)",
											}}
										>
											<CategoryIcon
												name="inbox"
												size={48}
												style={{ marginBottom: "16px", opacity: 0.5 }}
											/>
											<p>Nenhum lançamento nesta categoria este mês.</p>
										</div>
									);
								}

								return (
									<Table>
										<TableHead>
											<TableRow>
												<TableHeader>Data</TableHeader>
												<TableHeader>Descrição</TableHeader>
												<TableHeader style={{ textAlign: "right" }}>
													Valor
												</TableHeader>
											</TableRow>
										</TableHead>
										<TableBody>
											{lancamentosCategoria.map((l) => (
												<TableRow key={l.id}>
													<TableCell style={{ color: "var(--text-muted)" }}>
														{new Date(l.data_lancamento).toLocaleDateString(
															"pt-BR",
														)}
													</TableCell>
													<TableCell>{l.descricao}</TableCell>
													<TableCell
														style={{ textAlign: "right", color: "#EF4444" }}
													>
														{formatCurrency(parseFloat(l.valor))}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								);
							})()}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
