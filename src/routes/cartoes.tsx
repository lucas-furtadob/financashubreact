import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/cartoes")({
	component: CartoesPage,
});

const MOCK_CARTOES = [
	{
		id: "cc1",
		nome: "Nubank Roxinho",
		bandeira: "Mastercard",
		digitos: "4829",
		conta: "Nubank PJ",
		limite: 10000,
		utilizado: 3450,
		fechamento: 5,
		vencimento: 12,
		cor: "#8B5CF6",
	},
	{
		id: "cc2",
		nome: "Cartão BB Visa Platinum",
		bandeira: "Visa",
		digitos: "1234",
		conta: "Banco do Brasil S.A.",
		limite: 15000,
		utilizado: 12800,
		fechamento: 20,
		vencimento: 28,
		cor: "#3B82F6",
	},
	{
		id: "cc3",
		nome: "Caixa Elo Empresarial",
		bandeira: "Elo",
		digitos: "9871",
		conta: "Caixa Econômica",
		limite: 5000,
		utilizado: 720,
		fechamento: 10,
		vencimento: 17,
		cor: "#F97316",
	},
];

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

function CartoesPage() {
	const [cartoes] = useState(MOCK_CARTOES);
	const [showModal, setShowModal] = useState(false);
	const [editingCartao, setEditingCartao] = useState<any>(null);
	const [nome, setNome] = useState("");
	const [bandeira, setBandeira] = useState("");
	const [digitos, setDigitos] = useState("");
	const [limite, setLimite] = useState("");
	const [conta, setConta] = useState("");
	const [fechamento, setFechamento] = useState("");
	const [vencimento, setVencimento] = useState("");
	const [selectedCor, setSelectedCor] = useState("#8B5CF6");

	const totalLimite = cartoes.reduce((acc, c) => acc + c.limite, 0);
	const totalUtilizado = cartoes.reduce((acc, c) => acc + c.utilizado, 0);
	const totalDisponivel = totalLimite - totalUtilizado;
	const percentualGeral =
		totalLimite > 0 ? Math.round((totalUtilizado / totalLimite) * 100) : 0;

	const openModal = (cartao?: any) => {
		if (cartao) {
			setEditingCartao(cartao.id);
			setNome(cartao.nome);
			setBandeira(cartao.bandeira);
			setDigitos(cartao.digitos);
			setLimite(cartao.limite.toString());
			setConta(cartao.conta);
			setFechamento(cartao.fechamento.toString());
			setVencimento(cartao.vencimento.toString());
			setSelectedCor(cartao.cor);
		} else {
			setEditingCartao(null);
			setNome("");
			setBandeira("");
			setDigitos("");
			setLimite("");
			setConta("");
			setFechamento("");
			setVencimento("");
			setSelectedCor("#8B5CF6");
		}
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingCartao(null);
	};

	const CORES = [
		"#8B5CF6",
		"#EF4444",
		"#3B82F6",
		"#22C55E",
		"#F97316",
		"#EC4899",
		"#14B8A6",
		"#1F1F23",
	];

	return (
		<main className="page-wrap px-4 pb-8 pt-8" style={{ padding: "40px 48px" }}>
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
						Cartões de Crédito
					</h1>
					<p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
						Gerencie seus cartões, limites e faturas.
					</p>
				</div>
				<button
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
					<span
						style={{
							width: "16px",
							height: "16px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						+
					</span>
					Novo Cartão
				</button>
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
							background: "rgba(239,68,68,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#EF4444",
						}}
					>
						<span style={{ width: "20px", height: "20px" }}></span>
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
							Limite Total
						</span>
						<span style={{ fontSize: "22px", fontWeight: 700, color: "#FFF" }}>
							{formatCurrency(totalLimite)}
						</span>
						<span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
							em todos os cartões
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
							background: "rgba(239,68,68,0.12)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#EF4444",
						}}
					>
						<span style={{ width: "20px", height: "20px" }}></span>
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
							Total Utilizado
						</span>
						<span
							style={{ fontSize: "22px", fontWeight: 700, color: "#EF4444" }}
						>
							{formatCurrency(totalUtilizado)}
						</span>
						<span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
							{percentualGeral}% do limite
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
							background: "rgba(34,197,94,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#22C55E",
						}}
					>
						<span style={{ width: "20px", height: "20px" }}></span>
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
							Limite Disponível
						</span>
						<span
							style={{ fontSize: "22px", fontWeight: 700, color: "#22C55E" }}
						>
							{formatCurrency(totalDisponivel)}
						</span>
						<span style={{ fontSize: "12px", color: "#22C55E" }}>
							disponível para uso
						</span>
					</div>
				</div>
			</div>

			{/* Cards Grid */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
					gap: "20px",
				}}
			>
				{cartoes.map((c) => {
					const pct =
						c.limite > 0
							? Math.min(Math.round((c.utilizado / c.limite) * 100), 100)
							: 0;
					const disponivel = c.limite - c.utilizado;
					const barColor =
						pct >= 90
							? "#EF4444"
							: pct >= 70
								? "#F97316"
								: pct >= 50
									? "#F59E0B"
									: "#22C55E";

					return (
						<div
							key={c.id}
							style={{
								background: "var(--bg-card)",
								border: "1px solid var(--border)",
								borderRadius: "20px",
								overflow: "hidden",
								cursor: "pointer",
								transition: "transform 0.2s",
							}}
						>
							<div
								style={{
									padding: "22px",
									background: `linear-gradient(135deg, ${c.cor}, ${c.cor}AA)`,
									minHeight: "100px",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: "24px",
									}}
								>
									<div>
										<div
											style={{
												fontSize: "17px",
												fontWeight: 700,
												color: "#FFF",
												marginBottom: "4px",
											}}
										>
											{c.nome}
										</div>
										<div
											style={{
												fontSize: "12px",
												color: "rgba(255,255,255,0.65)",
												display: "flex",
												alignItems: "center",
												gap: "5px",
											}}
										>
											<span
												style={{
													background: "rgba(255,255,255,0.12)",
													borderRadius: "3px",
													padding: "1px 6px",
													fontSize: "10px",
													fontWeight: 700,
													letterSpacing: "0.5px",
													textTransform: "uppercase",
												}}
											>
												{c.bandeira}
											</span>
											<span>•</span>
											<span>{c.conta}</span>
										</div>
									</div>
									<div
										style={{
											width: "32px",
											height: "24px",
											background: "linear-gradient(135deg, #D4AF37, #F5DC7A)",
											borderRadius: "4px",
										}}
									></div>
								</div>
								<div
									style={{
										color: "rgba(255,255,255,0.5)",
										fontSize: "13px",
										fontFamily: "'Inter', sans-serif",
										letterSpacing: "2px",
									}}
								>
									•••• •••• •••• {c.digitos}
								</div>
							</div>

							<div style={{ padding: "16px 22px 0" }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: "7px",
									}}
								>
									<span
										style={{
											fontSize: "11px",
											fontWeight: 600,
											color: "var(--text-muted)",
											textTransform: "uppercase",
										}}
									>
										Uso do limite
									</span>
									<span
										style={{
											fontSize: "12px",
											fontWeight: 700,
											fontFamily: "'Inter', sans-serif",
											color: barColor,
										}}
									>
										{pct}%
									</span>
								</div>
								<div
									style={{
										width: "100%",
										height: "5px",
										background: "rgba(255,255,255,0.08)",
										borderRadius: "100px",
										overflow: "hidden",
									}}
								>
									<div
										style={{
											height: "100%",
											width: `${pct}%`,
											background: barColor,
											borderRadius: "100px",
										}}
									></div>
								</div>
							</div>

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "10px",
									padding: "14px 22px",
								}}
							>
								<div
									style={{
										background: "rgba(0,0,0,0.25)",
										border: "1px solid rgba(255,255,255,0.06)",
										borderRadius: "10px",
										padding: "12px 14px",
									}}
								>
									<div
										style={{
											fontSize: "10px",
											fontWeight: 600,
											color: "var(--text-muted)",
											textTransform: "uppercase",
											marginBottom: "5px",
										}}
									>
										Disponível
									</div>
									<div
										style={{
											fontFamily: "'Inter', sans-serif",
											fontSize: "15px",
											fontWeight: 600,
											color: "#22C55E",
										}}
									>
										{formatCurrency(disponivel)}
									</div>
								</div>
								<div
									style={{
										background: "rgba(0,0,0,0.25)",
										border: "1px solid rgba(255,255,255,0.06)",
										borderRadius: "10px",
										padding: "12px 14px",
									}}
								>
									<div
										style={{
											fontSize: "10px",
											fontWeight: 600,
											color: "var(--text-muted)",
											textTransform: "uppercase",
											marginBottom: "5px",
										}}
									>
										Utilizado
									</div>
									<div
										style={{
											fontFamily: "'Inter', sans-serif",
											fontSize: "15px",
											fontWeight: 600,
											color: barColor,
										}}
									>
										{formatCurrency(c.utilizado)}
									</div>
								</div>
							</div>

							<div
								style={{
									display: "flex",
									gap: "20px",
									padding: "0 22px 16px",
									borderBottom: "1px solid var(--border)",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "6px" }}
								>
									<span
										style={{ fontSize: "12px", color: "var(--text-secondary)" }}
									>
										Fechamento:{" "}
										<strong style={{ color: "#FFF" }}>
											dia {c.fechamento}
										</strong>
									</span>
								</div>
								<div
									style={{ display: "flex", alignItems: "center", gap: "6px" }}
								>
									<span
										style={{ fontSize: "12px", color: "var(--text-secondary)" }}
									>
										Vencimento:{" "}
										<strong style={{ color: "#FFF" }}>
											dia {c.vencimento}
										</strong>
									</span>
								</div>
							</div>

							<div
								style={{ display: "flex", gap: "8px", padding: "14px 22px" }}
							>
								<Link
									to="/cartoes/$id"
									params={{ id: c.id }}
									style={{
										flex: 1,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: "7px",
										height: "34px",
										background: "var(--accent-soft)",
										border: "1px solid rgba(255,92,0,0.2)",
										borderRadius: "8px",
										color: "var(--accent)",
										fontSize: "13px",
										fontWeight: 600,
										cursor: "pointer",
										textDecoration: "none",
									}}
								>
									Ver Detalhes
								</Link>
								<button
									onClick={() => openModal(c)}
									style={{
										width: "34px",
										height: "34px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										background: "rgba(255,255,255,0.04)",
										border: "1px solid var(--border)",
										borderRadius: "8px",
										color: "var(--text-secondary)",
										cursor: "pointer",
									}}
								>
									<span style={{ width: "13px", height: "13px" }}></span>
								</button>
							</div>
						</div>
					);
				})}
			</div>

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
					onClick={(e) => e.target === e.currentTarget && closeModal()}
				>
					<div
						style={{
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "20px",
							maxWidth: "660px",
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
							}}
						>
							<div>
								<h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
									{editingCartao ? "Editar Cartão" : "Novo cartão de crédito"}
								</h2>
								<p
									style={{
										color: "var(--text-muted)",
										fontSize: "13px",
										marginTop: "4px",
									}}
								>
									Cadastre um cartão e use nas despesas parceladas ou
									recorrentes.
								</p>
							</div>
							<button
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
								<span style={{ width: "16px", height: "16px" }}></span>
							</button>
						</div>
						<div style={{ padding: "0 28px 28px" }}>
							<div
								style={{ display: "flex", gap: "20px", marginBottom: "24px" }}
							>
								<div style={{ flex: 2 }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Nome do cartão
									</label>
									<input
										type="text"
										value={nome}
										onChange={(e) => setNome(e.target.value)}
										placeholder="Ex: Nubank Roxinho"
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
								<div style={{ flex: 1 }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Bandeira
									</label>
									<select
										value={bandeira}
										onChange={(e) => setBandeira(e.target.value)}
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
										<option value="Visa">Visa</option>
										<option value="Mastercard">Mastercard</option>
										<option value="Elo">Elo</option>
										<option value="American Express">American Express</option>
									</select>
								</div>
								<div style={{ width: "140px" }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										4 últimos dígitos
									</label>
									<input
										type="text"
										value={digitos}
										onChange={(e) => setDigitos(e.target.value)}
										placeholder="Ex: 1234"
										maxLength={4}
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
							</div>
							<div
								style={{ display: "flex", gap: "20px", marginBottom: "24px" }}
							>
								<div style={{ flex: 1 }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Limite
									</label>
									<input
										type="text"
										value={limite}
										onChange={(e) => setLimite(e.target.value)}
										placeholder="R$ 0,00"
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
								<div style={{ flex: 1 }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Conta vinculada
									</label>
									<select
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
										<option value="">Selecione a Conta...</option>
										<option value="Nubank PJ">Nubank PJ</option>
										<option value="Banco do Brasil S.A.">
											Banco do Brasil
										</option>
										<option value="Caixa Econômica">Caixa Econômica</option>
									</select>
								</div>
								<div style={{ width: "140px" }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Dia fechamento
									</label>
									<input
										type="number"
										value={fechamento}
										onChange={(e) => setFechamento(e.target.value)}
										placeholder="20"
										min={1}
										max={31}
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
								<div style={{ width: "140px" }}>
									<label
										style={{
											fontSize: "13px",
											fontWeight: 500,
											color: "var(--text-secondary)",
											display: "block",
											marginBottom: "8px",
										}}
									>
										Dia vencimento
									</label>
									<input
										type="number"
										value={vencimento}
										onChange={(e) => setVencimento(e.target.value)}
										placeholder="28"
										min={1}
										max={31}
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
							</div>
							<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
								{CORES.map((cor) => (
									<button
										key={cor}
										onClick={() => setSelectedCor(cor)}
										style={{
											width: "28px",
											height: "28px",
											borderRadius: "50%",
											background: cor,
											border:
												selectedCor === cor
													? "2px solid #FFF"
													: "2px solid transparent",
											cursor: "pointer",
										}}
									/>
								))}
							</div>
						</div>
						<div
							style={{
								padding: "20px 28px",
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
								Salvar Cartão
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
