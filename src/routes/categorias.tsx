import { createFileRoute } from "@tanstack/react-router";
import {
	Archive,
	ChevronRight,
	Eye,
	EyeOff,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryIcon } from "#/lib/category-icons";
import { Button } from "../components/ds/Button";
import { Card } from "../components/ds/Card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ds/Table";

export const Route = createFileRoute("/categorias")({
	component: CategoriasPage,
});

interface Categoria {
	id: string;
	nome: string;
	tipo: "despesa" | "receita" | "investimento";
	cor: string;
	status: "ativa" | "inativa";
	icon: string;
	paiId: string | null;
	relatorio: boolean;
	desc?: string;
}

const MOCK_CATEGORIAS: Categoria[] = [
	{
		id: "rf",
		nome: "RECEITAS FIXAS",
		tipo: "receita",
		paiId: null,
		icon: "banknote",
		cor: "#10B981",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "rf1",
		nome: "SALÁRIO LUCAS",
		tipo: "receita",
		paiId: "rf",
		icon: "user",
		cor: "#10B981",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "rf2",
		nome: "SALÁRIO ILANA",
		tipo: "receita",
		paiId: "rf",
		icon: "user",
		cor: "#10B981",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "da",
		nome: "ALIMENTAÇÃO",
		tipo: "despesa",
		paiId: null,
		icon: "utensils",
		cor: "#EF4444",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "da1",
		nome: "RESTAURANTE E LANCHES",
		tipo: "despesa",
		paiId: "da",
		icon: "coffee",
		cor: "#EF4444",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "da2",
		nome: "SUPERMERCADO",
		tipo: "despesa",
		paiId: "da",
		icon: "shopping-cart",
		cor: "#EF4444",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "dm",
		nome: "MORADIA",
		tipo: "despesa",
		paiId: null,
		icon: "home",
		cor: "#3B82F6",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "dm1",
		nome: "ALUGUEL",
		tipo: "despesa",
		paiId: "dm",
		icon: "key",
		cor: "#3B82F6",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "dm2",
		nome: "CONDOMÍNIO",
		tipo: "despesa",
		paiId: "dm",
		icon: "building",
		cor: "#3B82F6",
		status: "ativa",
		relatorio: true,
	},
	{
		id: "inv1",
		nome: "INVESTIMENTOS",
		tipo: "investimento",
		paiId: null,
		icon: "bar-chart-2",
		cor: "#6366F1",
		status: "ativa",
		relatorio: true,
	},
];

const ICONS = [
	"tag",
	"shopping-cart",
	"utensils",
	"car",
	"fuel",
	"home",
	"navigation",
	"banknote",
	"laptop",
	"trending-up",
	"bar-chart-2",
	"landmark",
	"bitcoin",
	"shield",
	"gift",
	"heart",
	"coffee",
	"book",
	"smartphone",
	"tv",
	"wifi",
	"zap",
	"droplet",
	"key",
	"building",
	"user",
	"briefcase",
	"file-text",
	"credit-card",
	"smartphone",
];

const COLORS = [
	"#EF4444",
	"#F97316",
	"#F59E0B",
	"#22C55E",
	"#3B82F6",
	"#8B5CF6",
	"#EC4899",
	"#14B8A6",
	"#06B6D4",
	"#6366F1",
];

function CategoriasPage() {
	const [categorias, setCategorias] = useState<Categoria[]>(MOCK_CATEGORIAS);
	const [tipoSelecionado, setTipoSelecionado] = useState<
		"despesa" | "receita" | "investimento"
	>("despesa");
	const [statusSelecionado, setStatusSelecionado] = useState<
		"ativa" | "inativa"
	>("ativa");
	const [showModal, setShowModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showPopover, setShowPopover] = useState<string | null>(null);

	useEffect(() => {
		const handleClickOutside = () => {
			setShowPopover(null);
		};
		if (showPopover) {
			document.addEventListener("click", handleClickOutside);
		}
		return () => document.removeEventListener("click", handleClickOutside);
	}, [showPopover]);

	const [editingId, setEditingId] = useState<string | null>(null);
	const [parentId, setParentId] = useState<string | null>(null);
	const [nome, setNome] = useState("");
	const [tipo, setTipo] = useState<"despesa" | "receita" | "investimento">(
		"despesa",
	);
	const [cor, setCor] = useState("#EF4444");
	const [icon, setIcon] = useState("tag");
	const [relatorio, setRelatorio] = useState(true);
	const [errors, setErrors] = useState<{ nome?: string }>({});
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const filtered = categorias.filter(
		(c) => c.tipo === tipoSelecionado && c.status === statusSelecionado,
	);

	const parents = filtered.filter((c) => !c.paiId);
	const children = filtered.filter((c) => c.paiId);

	const getChildren = (parentId: string) =>
		children.filter((c) => c.paiId === parentId);

	const openModal = (cat?: Categoria, newParentId?: string | null) => {
		if (cat) {
			setEditingId(cat.id);
			setNome(cat.nome);
			setTipo(cat.tipo);
			setCor(cat.cor);
			setIcon(cat.icon);
			setRelatorio(cat.relatorio);
			setParentId(cat.paiId);
		} else {
			setEditingId(null);
			setNome("");
			setTipo(tipoSelecionado);
			setCor(
				tipoSelecionado === "receita"
					? "#10B981"
					: tipoSelecionado === "investimento"
						? "#6366F1"
						: "#EF4444",
			);
			setIcon("tag");
			setRelatorio(true);
			setParentId(newParentId ?? null);
		}
		setErrors({});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingId(null);
	};

	const validate = (): boolean => {
		const newErrors: { nome?: string } = {};
		if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const saveCategoria = () => {
		if (!validate()) return;

		if (editingId) {
			setCategorias(
				categorias.map((c) =>
					c.id === editingId
						? { ...c, nome, tipo, cor, icon, relatorio, paiId: parentId }
						: c,
				),
			);
		} else {
			const newCat: Categoria = {
				id: `cat_${Date.now()}`,
				nome,
				tipo,
				cor,
				icon,
				status: "ativa",
				relatorio,
				paiId: parentId,
			};
			setCategorias([...categorias, newCat]);
		}
		closeModal();
	};

	const toggleStatus = (id: string) => {
		const cat = categorias.find((c) => c.id === id);
		if (!cat) return;

		const newStatus = cat.status === "ativa" ? "inativa" : "ativa";

		setCategorias(
			categorias.map((c) => {
				if (c.id === id) return { ...c, status: newStatus };
				if (c.paiId === id && newStatus === "inativa")
					return { ...c, status: "inativa" };
				return c;
			}),
		);
		setShowPopover(null);
	};

	const toggleRelatorio = (id: string) => {
		setCategorias(
			categorias.map((c) =>
				c.id === id ? { ...c, relatorio: !c.relatorio } : c,
			),
		);
		setShowPopover(null);
	};

	const confirmDelete = (id: string) => {
		setDeleteId(id);
		setShowDeleteModal(true);
		setShowPopover(null);
	};

	const deleteCategoria = () => {
		if (deleteId) {
			setCategorias(
				categorias.filter((c) => c.id !== deleteId && c.paiId !== deleteId),
			);
		}
		setShowDeleteModal(false);
		setDeleteId(null);
	};

	const getTypeLabel = (tipo: string) => {
		switch (tipo) {
			case "despesa":
				return "Despesas";
			case "receita":
				return "Receitas";
			case "investimento":
				return "Investimentos";
			default:
				return tipo;
		}
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
						Categorias
					</h1>
					<p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
						Gerencie as categorias de suas receitas, despesas e investimentos.
					</p>
				</div>
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
					<CategoryIcon name="plus" size={16} />
					Nova Categoria
				</button>
			</header>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "24px",
				}}
			>
				<div style={{ display: "flex", gap: "8px" }}>
					{(["despesa", "receita", "investimento"] as const).map((tipo) => (
						<button
							type="button"
							key={tipo}
							onClick={() => setTipoSelecionado(tipo)}
							style={{
								padding: "8px 20px",
								borderRadius: "8px",
								fontSize: "13px",
								fontWeight: 600,
								cursor: "pointer",
								background:
									tipoSelecionado === tipo ? "var(--accent)" : "transparent",
								color:
									tipoSelecionado === tipo ? "#FFF" : "var(--text-secondary)",
								border: "1px solid var(--border)",
							}}
						>
							{getTypeLabel(tipo)}
						</button>
					))}
				</div>
				<div
					style={{
						display: "flex",
						gap: "8px",
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "10px",
						padding: "4px",
					}}
				>
					<button
						type="button"
						onClick={() => setStatusSelecionado("ativa")}
						style={{
							padding: "8px 16px",
							borderRadius: "8px",
							fontSize: "13px",
							fontWeight: 600,
							cursor: "pointer",
							background:
								statusSelecionado === "ativa" ? "var(--accent)" : "transparent",
							color:
								statusSelecionado === "ativa"
									? "#FFF"
									: "var(--text-secondary)",
							border: "none",
						}}
					>
						Ativas
					</button>
					<button
						type="button"
						onClick={() => setStatusSelecionado("inativa")}
						style={{
							padding: "8px 16px",
							borderRadius: "8px",
							fontSize: "13px",
							fontWeight: 600,
							cursor: "pointer",
							background:
								statusSelecionado === "inativa"
									? "var(--accent)"
									: "transparent",
							color:
								statusSelecionado === "inativa"
									? "#FFF"
									: "var(--text-secondary)",
							border: "none",
						}}
					>
						Arquivadas
					</button>
				</div>
			</div>

			<Card padding="none">
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>Categoria</TableHeader>
							<TableHeader style={{ width: "120px" }}>Relatório</TableHeader>
							<TableHeader style={{ width: "180px", textAlign: "right" }}>
								Ações
							</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{filtered.length === 0 ? (
							<tr>
								<td
									colSpan={3}
									style={{
										textAlign: "center",
										padding: "48px",
										color: "var(--text-muted)",
									}}
								>
									Nenhuma categoria{" "}
									{getTypeLabel(tipoSelecionado).toLowerCase()}{" "}
									{statusSelecionado === "ativa" ? "ativa" : "arquivada"}{" "}
									encontrada.
								</td>
							</tr>
						) : (
							<>
								{parents.map((parent) => (
									<>
										<TableRow
											key={parent.id}
											style={{ background: "var(--bg-card)" }}
										>
											<TableCell>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "12px",
														paddingLeft: "8px",
													}}
												>
													<div
														style={{
															width: "36px",
															height: "36px",
															borderRadius: "8px",
															background: `${parent.cor}18`,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															color: parent.cor,
														}}
													>
														<CategoryIcon
															name={parent.icon || "tag"}
															size={18}
														/>
													</div>
													<span style={{ fontWeight: 600, fontSize: "15px" }}>
														{parent.nome}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<span
													style={{
														padding: "4px 10px",
														borderRadius: "20px",
														fontSize: "11px",
														fontWeight: 600,
														background: parent.relatorio
															? "rgba(34,197,94,0.1)"
															: "rgba(107,107,112,0.2)",
														color: parent.relatorio ? "#22C55E" : "#6B6B70",
													}}
												>
													{parent.relatorio ? "Exibir" : "Ocultar"}
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
														onClick={() => openModal(parent)}
														tooltip="Editar"
													>
														<Pencil size={16} />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => confirmDelete(parent.id)}
														tooltip="Excluir"
													>
														<Trash2 size={16} />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openModal(undefined, parent.id)}
														tooltip="Adicionar subcategoria"
													>
														<Plus size={16} />
													</Button>
													<div style={{ position: "relative" }}>
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																setShowPopover(
																	showPopover === parent.id ? null : parent.id,
																)
															}
														>
															<MoreHorizontal size={16} />
														</Button>
														{showPopover === parent.id && (
															<div
																style={{
																	position: "absolute",
																	top: "100%",
																	right: 0,
																	marginTop: "4px",
																	background: "var(--bg-card)",
																	border: "1px solid var(--border)",
																	borderRadius: "8px",
																	padding: "4px",
																	minWidth: "200px",
																	zIndex: 50,
																	boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
																}}
															>
																<button
																	type="button"
																	onClick={() => toggleStatus(parent.id)}
																	style={{
																		display: "flex",
																		alignItems: "center",
																		gap: "8px",
																		width: "100%",
																		padding: "8px 12px",
																		background: "transparent",
																		border: "none",
																		color: "var(--text-primary)",
																		fontSize: "13px",
																		cursor: "pointer",
																		borderRadius: "6px",
																	}}
																>
																	<CategoryIcon
																		name={
																			parent.status === "ativa"
																				? "archive"
																				: "archive-restore"
																		}
																		size={14}
																	/>
																	{parent.status === "ativa"
																		? "Arquivar"
																		: "Desarquivar"}
																</button>
																<button
																	type="button"
																	onClick={() => toggleRelatorio(parent.id)}
																	style={{
																		display: "flex",
																		alignItems: "center",
																		gap: "8px",
																		width: "100%",
																		padding: "8px 12px",
																		background: "transparent",
																		border: "none",
																		color: "var(--text-primary)",
																		fontSize: "13px",
																		cursor: "pointer",
																		borderRadius: "6px",
																	}}
																>
																	<CategoryIcon
																		name={parent.relatorio ? "eye-off" : "eye"}
																		size={14}
																	/>
																	{parent.relatorio
																		? "Ocultar dos relatórios"
																		: "Exibir nos relatórios"}
																</button>
															</div>
														)}
													</div>
												</div>
											</TableCell>
										</TableRow>
										{getChildren(parent.id).map((child) => (
											<TableRow
												key={child.id}
												style={{ background: "var(--bg-item)" }}
											>
												<TableCell>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: "10px",
															paddingLeft: "56px",
														}}
													>
														<div
															style={{
																width: "36px",
																height: "36px",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
															}}
														>
															<CategoryIcon
																name="corner-down-right"
																size={16}
																style={{ color: "var(--text-muted)" }}
															/>
														</div>
														<div
															style={{
																width: "32px",
																height: "32px",
																borderRadius: "8px",
																background: `${child.cor}18`,
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																color: child.cor,
															}}
														>
															<CategoryIcon
																name={child.icon || "tag"}
																size={16}
															/>
														</div>
														<span
															style={{
																fontSize: "14px",
																color: "var(--text-secondary)",
															}}
														>
															{child.nome}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<span
														style={{
															padding: "4px 10px",
															borderRadius: "20px",
															fontSize: "11px",
															fontWeight: 600,
															background: child.relatorio
																? "rgba(34,197,94,0.1)"
																: "rgba(107,107,112,0.2)",
															color: child.relatorio ? "#22C55E" : "#6B6B70",
														}}
													>
														{child.relatorio ? "Exibir" : "Ocultar"}
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
															onClick={() => openModal(child)}
															tooltip="Editar"
														>
															<Pencil size={14} />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => confirmDelete(child.id)}
															tooltip="Excluir"
														>
															<Trash2 size={14} />
														</Button>
														<div style={{ position: "relative" }}>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	setShowPopover(
																		showPopover === child.id ? null : child.id,
																	)
																}
															>
																<MoreHorizontal size={14} />
															</Button>
															{showPopover === child.id && (
																<div
																	style={{
																		position: "absolute",
																		top: "100%",
																		right: 0,
																		marginTop: "4px",
																		background: "var(--bg-card)",
																		border: "1px solid var(--border)",
																		borderRadius: "8px",
																		padding: "4px",
																		minWidth: "200px",
																		zIndex: 50,
																		boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
																	}}
																>
																	<button
																		type="button"
																		onClick={() => toggleStatus(child.id)}
																		style={{
																			display: "flex",
																			alignItems: "center",
																			gap: "8px",
																			width: "100%",
																			padding: "8px 12px",
																			background: "transparent",
																			border: "none",
																			color: "var(--text-primary)",
																			fontSize: "13px",
																			cursor: "pointer",
																			borderRadius: "6px",
																		}}
																	>
																		<CategoryIcon
																			name={
																				child.status === "ativa"
																					? "archive"
																					: "archive-restore"
																			}
																			size={14}
																		/>
																		{child.status === "ativa"
																			? "Arquivar"
																			: "Desarquivar"}
																	</button>
																	<button
																		type="button"
																		onClick={() => toggleRelatorio(child.id)}
																		style={{
																			display: "flex",
																			alignItems: "center",
																			gap: "8px",
																			width: "100%",
																			padding: "8px 12px",
																			background: "transparent",
																			border: "none",
																			color: "var(--text-primary)",
																			fontSize: "13px",
																			cursor: "pointer",
																			borderRadius: "6px",
																		}}
																	>
																		<CategoryIcon
																			name={child.relatorio ? "eye-off" : "eye"}
																			size={14}
																		/>
																		{child.relatorio
																			? "Ocultar dos relatórios"
																			: "Exibir nos relatórios"}
																	</button>
																</div>
															)}
														</div>
													</div>
												</TableCell>
											</TableRow>
										))}
									</>
								))}
							</>
						)}
					</TableBody>
				</Table>
			</Card>

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
					onClick={(e) => e.target === e.currentTarget && closeModal()}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "500px",
							width: "100%",
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
								<h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
									{editingId
										? "Editar Categoria"
										: parentId
											? "Nova Subcategoria"
											: "Nova Categoria"}
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									{editingId
										? "Edite os dados da categoria."
										: "Preencha os dados da categoria."}
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
								}}
							>
								<CategoryIcon name="x" size={16} />
							</button>
						</div>
						<div style={{ padding: "0 28px 28px" }}>
							<div style={{ marginBottom: "20px" }}>
								<label
									htmlFor="cat-nome"
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Nome *
								</label>
								<input
									id="cat-nome"
									type="text"
									placeholder="Ex: Alimentação"
									value={nome}
									onChange={(e) => setNome(e.target.value)}
									style={{
										width: "100%",
										background: "#0A0A0B",
										border: `1px solid ${errors.nome ? "#EF4444" : "var(--border)"}`,
										borderRadius: "12px",
										height: "52px",
										color: "#FFF",
										padding: "0 16px",
										fontSize: "15px",
										outline: "none",
									}}
								/>
								{errors.nome && (
									<span
										style={{
											color: "#EF4444",
											fontSize: "12px",
											marginTop: "4px",
											display: "block",
										}}
									>
										{errors.nome}
									</span>
								)}
							</div>
							<div
								style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
							>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="cat-tipo"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Tipo
									</label>
									<select
										id="cat-tipo"
										value={tipo}
										onChange={(e) =>
											setTipo(
												e.target.value as
													| "despesa"
													| "receita"
													| "investimento",
											)
										}
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
										<option value="despesa">Despesa</option>
										<option value="receita">Receita</option>
										<option value="investimento">Investimento</option>
									</select>
								</div>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="cat-pai"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Categoria Pai
									</label>
									<select
										id="cat-pai"
										value={parentId || ""}
										onChange={(e) => setParentId(e.target.value || null)}
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
										{!parentId && (
											<option value="">Nenhuma (Categoria Principal)</option>
										)}
										{categorias
											.filter(
												(c) =>
													c.tipo === tipo && !c.paiId && c.id !== editingId,
											)
											.map((p) => (
												<option key={p.id} value={p.id}>
													{p.nome}
												</option>
											))}
									</select>
								</div>
							</div>
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
									Ícone
								</label>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(8, 1fr)",
										gap: "8px",
									}}
								>
									{ICONS.map((ic) => (
										<button
											key={ic}
											type="button"
											onClick={() => setIcon(ic)}
											style={{
												width: "40px",
												height: "40px",
												borderRadius: "8px",
												background: icon === ic ? `${cor}20` : "var(--bg-item)",
												border: `2px solid ${icon === ic ? cor : "transparent"}`,
												color: icon === ic ? cor : "var(--text-secondary)",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<CategoryIcon name={ic} size={18} />
										</button>
									))}
								</div>
							</div>
							<div>
								<label
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Cor
								</label>
								<div style={{ display: "flex", gap: "10px" }}>
									{COLORS.map((c) => (
										<button
											key={c}
											type="button"
											onClick={() => setCor(c)}
											style={{
												width: "28px",
												height: "28px",
												borderRadius: "50%",
												background: c,
												border:
													cor === c
														? "2px solid #FFF"
														: "2px solid transparent",
												cursor: "pointer",
											}}
										/>
									))}
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
							<button
								type="button"
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
								type="button"
								onClick={saveCategoria}
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
								{editingId ? "Salvar" : "Confirmar"}
							</button>
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
							Excluir Categoria?
						</h2>
						<p
							style={{
								color: "var(--text-muted)",
								fontSize: "14px",
								lineHeight: 1.5,
								marginBottom: "24px",
							}}
						>
							Esta ação excluirá também todas as subcategorias. Deseja
							continuar?
						</p>
						<div
							style={{ display: "flex", gap: "12px", justifyContent: "center" }}
						>
							<button
								type="button"
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
								type="button"
								onClick={deleteCategoria}
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
		</main>
	);
}
