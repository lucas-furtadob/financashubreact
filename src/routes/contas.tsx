import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import * as Select from "@/components/ui/select";
import { CategoryIcon } from "@/lib/category-icons";
import {
	formatCurrency,
	formatCurrencyInput,
	parseCurrency,
} from "@/lib/formatters";
import { ActionButton } from "../components/ds/ActionMenu";
import { Button } from "../components/ds/Button";
import { Card } from "../components/ds/Card";
import { PageActions } from "../components/ds/PageActions";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ds/Table";

export const Route = createFileRoute("/contas")({
	component: ContasPage,
});

interface Conta {
	id: string;
	nome: string;
	banco: string;
	tipo: string;
	saldo: number;
	status: string;
	principal?: boolean;
}

const MOCK_CONTAS: Conta[] = [
	{
		id: "1",
		nome: "Nubank PJ",
		banco: "Nubank",
		tipo: "Conta Corrente",
		saldo: 15420.5,
		status: "ativa",
		principal: true,
	},
	{
		id: "2",
		nome: "Banco do Brasil",
		banco: "Banco do Brasil",
		tipo: "Conta Corrente",
		saldo: 8750.0,
		status: "ativa",
	},
	{
		id: "3",
		nome: "Caixa Econômica",
		banco: "Caixa",
		tipo: "Conta Poupança",
		saldo: 25000.0,
		status: "ativa",
	},
	{
		id: "4",
		nome: "Itaú PF",
		banco: "Itaú",
		tipo: "Conta Corrente",
		saldo: 3200.0,
		status: "ativa",
	},
];

function ContasPage() {
	const [contas, setContas] = useState<Conta[]>(MOCK_CONTAS);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [nome, setNome] = useState("");
	const [tipo, setTipo] = useState("");
	const [banco, setBanco] = useState("");
	const [saldo, setSaldo] = useState("");
	const [principal, setPrincipal] = useState(false);
	const [errors, setErrors] = useState<{ nome?: string; tipo?: string }>({});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const totalGeral = contas.reduce((sum, c) => sum + c.saldo, 0);
	const totalCorrente = contas
		.filter((c) => c.tipo === "Conta Corrente")
		.reduce((sum, c) => sum + c.saldo, 0);
	const totalPoupanca = contas
		.filter(
			(c) => c.tipo === "Conta Poupança" || c.tipo === "Conta Investimento",
		)
		.reduce((sum, c) => sum + c.saldo, 0);

	const openModal = (conta?: Conta) => {
		if (conta) {
			setEditingId(conta.id);
			setNome(conta.nome);
			setTipo(conta.tipo);
			setBanco(conta.banco);
			setSaldo(conta.saldo.toString());
			setPrincipal(conta.principal || false);
		} else {
			setEditingId(null);
			setNome("");
			setTipo("");
			setBanco("");
			setSaldo("");
			setPrincipal(false);
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
		const newErrors: { nome?: string; tipo?: string } = {};
		if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
		if (!tipo) newErrors.tipo = "Tipo é obrigatório";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const saveConta = () => {
		if (!validate()) return;

		const saldoNum = parseCurrency(saldo);

		if (editingId) {
			setContas(
				contas.map((c) =>
					c.id === editingId
						? { ...c, nome, tipo, banco, saldo: saldoNum, principal }
						: principal
							? { ...c, principal: false }
							: c,
				),
			);
		} else {
			const newConta: Conta = {
				id: `conta_${Date.now()}`,
				nome,
				tipo,
				banco,
				saldo: saldoNum,
				status: "ativa",
				principal,
			};
			if (principal) {
				setContas(contas.map((c) => ({ ...c, principal: false })));
			}
			setContas([...contas, newConta]);
		}
		closeModal();
	};

	const toggleStatus = (id: string) => {
		setContas(
			contas.map((c) =>
				c.id === id
					? { ...c, status: c.status === "ativa" ? "inativa" : "ativa" }
					: c,
			),
		);
	};

	const confirmDelete = (id: string) => {
		if (contas.length === 1) {
			alert("Não é possível excluir a última conta");
			return;
		}
		setDeleteId(id);
		setShowDeleteModal(true);
	};

	const deleteConta = () => {
		if (deleteId) {
			setContas(contas.filter((c) => c.id !== deleteId));
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
						Contas Financeiras
					</h1>
					<p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
						Gerencie todos os seus saldos, instituições e carteiras.
					</p>
				</div>
				<PageActions>
					<ActionButton
						icon={<Plus size={18} />}
						label="Nova Conta"
						onClick={() => openModal()}
						variant="primary"
					/>
				</PageActions>
			</header>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "24px",
					marginBottom: "32px",
				}}
			>
				<div
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
						<CategoryIcon name="dollar-sign" size={20} />
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
							Saldo Total Geral
						</span>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
								color: "var(--accent)",
							}}
						>
							{formatCurrency(totalGeral)}
						</span>
						<span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
							{contas.length} contas cadastradas
						</span>
					</div>
				</div>
				<div
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
						<CategoryIcon name="dollar-sign" size={20} />
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
							Saldo em Conta Corrente
						</span>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalCorrente)}
						</span>
						<span style={{ fontSize: "12px", color: "#22C55E" }}>
							Disponível para uso
						</span>
					</div>
				</div>
				<div
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
							background: "rgba(245,158,11,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#F59E0B",
						}}
					>
						<CategoryIcon name="dollar-sign" size={20} />
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
							Investimentos / Poupança
						</span>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 700,
								fontFamily: "'Inter', sans-serif",
							}}
						>
							{formatCurrency(totalPoupanca)}
						</span>
						<span style={{ fontSize: "12px", color: "#F59E0B" }}>
							Rendimento passivo
						</span>
					</div>
				</div>
			</div>

			<Card padding="none">
				<Table scroll>
					<TableHead sticky>
						<TableRow>
							<TableHeader>Banco</TableHeader>
							<TableHeader>Nome da Conta</TableHeader>
							<TableHeader>Tipo</TableHeader>
							<TableHeader style={{ textAlign: "right" }}>
								Saldo Atual
							</TableHeader>
							<TableHeader>Situação</TableHeader>
							<TableHeader style={{ width: "120px" }}>Ações</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{contas.map((conta) => (
							<TableRow key={conta.id}>
								<TableCell>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
										}}
									>
										<span>{conta.banco}</span>
										{conta.principal && (
											<span
												style={{
													background: "var(--accent)",
													color: "#FFF",
													fontSize: "10px",
													padding: "2px 6px",
													borderRadius: "4px",
													fontWeight: 600,
												}}
											>
												Principal
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>{conta.nome}</TableCell>
								<TableCell>
									<span style={{ color: "var(--text-secondary)" }}>
										{conta.tipo}
									</span>
								</TableCell>
								<TableCell>
									<span
										style={{
											fontFamily: "'Inter', sans-serif",
											fontSize: "14px",
											color: "#22C55E",
										}}
									>
										{formatCurrency(conta.saldo)}
									</span>
								</TableCell>
								<TableCell>
									<button
										type="button"
										onClick={() => toggleStatus(conta.id)}
										style={{
											padding: "4px 10px",
											borderRadius: "20px",
											fontSize: "11px",
											fontWeight: 600,
											background:
												conta.status === "ativa"
													? "rgba(34,197,94,0.1)"
													: "rgba(107,107,112,0.2)",
											color: conta.status === "ativa" ? "#22C55E" : "#6B6B70",
											border: "none",
											cursor: "pointer",
										}}
									>
										{conta.status === "ativa" ? "Ativa" : "Inativa"}
									</button>
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
											onClick={() => openModal(conta)}
											tooltip="Editar"
										>
											<Pencil size={16} />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => confirmDelete(conta.id)}
											tooltip="Excluir"
										>
											<Trash2 size={16} />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
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
							maxWidth: "600px",
							width: "100%",
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
									{editingId ? "Editar conta" : "Nova conta"}
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									{editingId
										? "Edite os dados da conta."
										: "Cadastre uma conta bancária ou carteira."}
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
									htmlFor="nome-conta"
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Nome da conta *
								</label>
								<input
									id="nome-conta"
									type="text"
									placeholder="Ex: Nubank PJ"
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
										htmlFor="tipo-conta"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Tipo da conta *
									</label>
									<Select.Select
										value={tipo}
										onValueChange={(value) => setTipo(value)}
									>
										<Select.SelectTrigger
											style={{
												width: "100%",
												background: "#0A0A0B",
												border: `1px solid ${errors.tipo ? "#EF4444" : "var(--border)"}`,
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
											<Select.SelectItem
												value="Conta Corrente"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Conta Corrente
											</Select.SelectItem>
											<Select.SelectItem
												value="Conta Poupança"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Conta Poupança
											</Select.SelectItem>
											<Select.SelectItem
												value="Conta Investimento"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Conta Investimento
											</Select.SelectItem>
										</Select.SelectContent>
									</Select.Select>
									{errors.tipo && (
										<span
											style={{
												color: "#EF4444",
												fontSize: "12px",
												marginTop: "4px",
												display: "block",
											}}
										>
											{errors.tipo}
										</span>
									)}
								</div>
								<div style={{ flex: 1 }}>
									<label
										htmlFor="banco-conta"
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Banco
									</label>
									<Select.Select
										value={banco}
										onValueChange={(value) => setBanco(value)}
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
											<Select.SelectItem
												value="Nubank"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Nubank
											</Select.SelectItem>
											<Select.SelectItem
												value="Banco do Brasil"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Banco do Brasil
											</Select.SelectItem>
											<Select.SelectItem
												value="Itaú"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Itaú
											</Select.SelectItem>
											<Select.SelectItem
												value="Caixa"
												style={{
													color: "#FFF",
													padding: "10px 12px",
													borderRadius: "8px",
												}}
											>
												Caixa Econômica
											</Select.SelectItem>
										</Select.SelectContent>
									</Select.Select>
								</div>
							</div>
							<div style={{ marginBottom: "20px" }}>
								<label
									htmlFor="saldo-conta"
									style={{
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										display: "block",
										marginBottom: "8px",
									}}
								>
									Saldo inicial
								</label>
								<input
									id="saldo-conta"
									type="text"
									placeholder="R$ 0,00"
									value={saldo}
									onChange={(e) =>
										setSaldo(formatCurrencyInput(e.target.value))
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
										outline: "none",
									}}
								/>
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
									id="conta-principal"
									type="checkbox"
									checked={principal}
									onChange={(e) => setPrincipal(e.target.checked)}
									style={{
										width: "18px",
										height: "18px",
										cursor: "pointer",
										accentColor: "var(--accent)",
									}}
								/>
								<label
									htmlFor="conta-principal"
									style={{
										fontSize: "14px",
										fontWeight: 500,
										color: "var(--text-secondary)",
										cursor: "pointer",
									}}
								>
									Conta Principal
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
								onClick={saveConta}
								style={{
									background: "#22C55E",
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
							Excluir Conta?
						</h2>
						<p
							style={{
								color: "var(--text-muted)",
								fontSize: "14px",
								lineHeight: 1.5,
								marginBottom: "24px",
							}}
						>
							Esta ação removerá a conta. Deseja continuar?
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
								onClick={deleteConta}
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
