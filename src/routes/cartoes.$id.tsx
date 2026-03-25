import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/cartoes/$id")({
	component: CartaoDetalhePage,
});

const MOCK_CARTOES: Record<string, any> = {
	cc1: {
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
	cc2: {
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
	cc3: {
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
};

const MOCK_FATURAS: Record<string, any[]> = {
	cc1: [
		{ id: "f1", mes: "Março 2026", valor: 3450.0, status: "aberta" },
		{ id: "f2", mes: "Fevereiro 2026", valor: 2890.5, status: "paga" },
		{ id: "f3", mes: "Janeiro 2026", valor: 1740.0, status: "paga" },
	],
	cc2: [
		{ id: "f4", mes: "Março 2026", valor: 12800.0, status: "aberta" },
		{ id: "f5", mes: "Fevereiro 2026", valor: 9400.0, status: "paga" },
	],
	cc3: [
		{ id: "f6", mes: "Março 2026", valor: 720.0, status: "aberta" },
		{ id: "f7", mes: "Fevereiro 2026", valor: 340.0, status: "paga" },
	],
};

const MOCK_PARCELAS: Record<string, any[]> = {
	cc1: [
		{ nome: "MacBook Pro M3", parcela: "3/12", valor: 983.34, cor: "#8B5CF6" },
		{ nome: "Adobe Creative", parcela: "2/6", valor: 298.0, cor: "#EC4899" },
		{ nome: "Seguro Celular", parcela: "5/12", valor: 49.9, cor: "#14B8A6" },
	],
	cc2: [
		{ nome: "TV OLED LG", parcela: "6/12", valor: 1250.0, cor: "#3B82F6" },
		{ nome: "Passagem Aérea", parcela: "2/3", valor: 870.0, cor: "#F97316" },
	],
	cc3: [{ nome: "Curso Online", parcela: "1/4", valor: 180.0, cor: "#22C55E" }],
};

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

function CartaoDetalhePage() {
	const params = Route.useParams();
	const cartao = MOCK_CARTOES[params.id] || MOCK_CARTOES["cc1"];
	const faturas = MOCK_FATURAS[params.id] || [];
	const parcelas = MOCK_PARCELAS[params.id] || [];

	const pct =
		cartao.limite > 0
			? Math.min(Math.round((cartao.utilizado / cartao.limite) * 100), 100)
			: 0;
	const disponivel = cartao.limite - cartao.utilizado;
	const barColor =
		pct >= 90
			? "#EF4444"
			: pct >= 70
				? "#F97316"
				: pct >= 50
					? "#F59E0B"
					: "#22C55E";

	return (
		<main
			style={{ padding: "24px 48px", maxWidth: "1200px", margin: "0 auto" }}
		>
			{/* Back button */}
			<Link
				to="/cartoes"
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "8px",
					color: "var(--text-secondary)",
					textDecoration: "none",
					marginBottom: "24px",
					fontSize: "14px",
					fontWeight: 500,
				}}
			>
				<span style={{ width: "16px", height: "16px", display: "flex" }}></span>
				Voltar para Cartões
			</Link>

			{/* Hero Header */}
			<div
				style={{
					background: `linear-gradient(135deg, ${cartao.cor}, ${cartao.cor}99)`,
					borderRadius: "20px",
					padding: "32px",
					marginBottom: "24px",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: "32px",
					}}
				>
					<div>
						<div
							style={{
								fontSize: "24px",
								fontWeight: 700,
								color: "#FFF",
								marginBottom: "8px",
							}}
						>
							{cartao.nome}
						</div>
						<div
							style={{
								fontSize: "14px",
								color: "rgba(255,255,255,0.7)",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							<span
								style={{
									background: "rgba(255,255,255,0.12)",
									borderRadius: "3px",
									padding: "2px 8px",
									fontSize: "11px",
									fontWeight: 700,
									textTransform: "uppercase",
								}}
							>
								{cartao.bandeira}
							</span>
							<span>• {cartao.conta}</span>
						</div>
						<div
							style={{
								fontSize: "16px",
								color: "rgba(255,255,255,0.5)",
								fontFamily: "'Inter', sans-serif",
								letterSpacing: "2px",
								marginTop: "16px",
							}}
						>
							•••• •••• •••• {cartao.digitos}
						</div>
					</div>
					<div style={{ display: "flex", gap: "24px" }}>
						<div>
							<div
								style={{
									fontSize: "11px",
									color: "rgba(255,255,255,0.5)",
									textTransform: "uppercase",
									fontWeight: 600,
								}}
							>
								Limite Total
							</div>
							<div style={{ fontSize: "20px", fontWeight: 700, color: "#FFF" }}>
								{formatCurrency(cartao.limite)}
							</div>
						</div>
						<div>
							<div
								style={{
									fontSize: "11px",
									color: "rgba(255,255,255,0.5)",
									textTransform: "uppercase",
									fontWeight: 600,
								}}
							>
								Disponível
							</div>
							<div
								style={{ fontSize: "20px", fontWeight: 700, color: "#22C55E" }}
							>
								{formatCurrency(disponivel)}
							</div>
						</div>
						<div>
							<div
								style={{
									fontSize: "11px",
									color: "rgba(255,255,255,0.5)",
									textTransform: "uppercase",
									fontWeight: 600,
								}}
							>
								Utilizado
							</div>
							<div
								style={{ fontSize: "20px", fontWeight: 700, color: barColor }}
							>
								{formatCurrency(cartao.utilizado)}
							</div>
						</div>
					</div>
				</div>

				<div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "8px",
						}}
					>
						<span
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "rgba(255,255,255,0.7)",
							}}
						>
							Uso do limite
						</span>
						<span
							style={{
								fontSize: "12px",
								fontWeight: 700,
								color: "#FFF",
								background: barColor,
								padding: "2px 8px",
								borderRadius: "4px",
							}}
						>
							{pct}%
						</span>
					</div>
					<div
						style={{
							width: "100%",
							height: "6px",
							background: "rgba(255,255,255,0.2)",
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
			</div>

			<div
				style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}
			>
				{/* Faturas */}
				<div
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "16px",
						padding: "24px",
					}}
				>
					<h3
						style={{
							fontSize: "14px",
							fontWeight: 700,
							color: "var(--text-muted)",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							marginBottom: "16px",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						Faturas ({faturas.length})
					</h3>

					{faturas.map((f) => {
						const isAberta = f.status === "aberta";
						return (
							<div
								key={f.id}
								style={{
									background: "var(--bg-main)",
									border: "1px solid var(--border)",
									borderRadius: "12px",
									padding: "16px",
									marginBottom: "12px",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div>
										<div
											style={{
												fontSize: "16px",
												fontWeight: 600,
												color: "#FFF",
											}}
										>
											{f.mes}
										</div>
										<span
											style={{
												display: "inline-flex",
												alignItems: "center",
												gap: "4px",
												padding: "3px 8px",
												borderRadius: "20px",
												fontSize: "11px",
												fontWeight: 700,
												background: isAberta
													? "rgba(245,158,11,0.15)"
													: "rgba(34,197,94,0.12)",
												color: isAberta ? "#F59E0B" : "#22C55E",
												marginTop: "4px",
											}}
										>
											{isAberta ? "Em aberto" : "Paga"}
										</span>
									</div>
									<div
										style={{
											fontSize: "18px",
											fontWeight: 700,
											fontFamily: "'Inter', sans-serif",
											color: isAberta ? "#F59E0B" : "#FFF",
										}}
									>
										{formatCurrency(f.valor)}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Parcelas */}
				<div
					style={{
						background: "var(--bg-card)",
						border: "1px solid var(--border)",
						borderRadius: "16px",
						padding: "24px",
					}}
				>
					<h3
						style={{
							fontSize: "14px",
							fontWeight: 700,
							color: "var(--text-muted)",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							marginBottom: "16px",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						Parcelas em Aberto
					</h3>

					{parcelas.length === 0 ? (
						<p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
							Nenhuma parcela em aberto.
						</p>
					) : (
						<>
							{parcelas.map((p, i) => (
								<div
									key={i}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "12px 0",
										borderBottom: "1px solid var(--border)",
									}}
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
												width: "36px",
												height: "36px",
												borderRadius: "10px",
												background: `${p.cor}20`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<span style={{ width: "16px", height: "16px" }}></span>
										</div>
										<div>
											<div
												style={{
													fontSize: "13px",
													fontWeight: 600,
													color: "#FFF",
												}}
											>
												{p.nome}
											</div>
											<div
												style={{ fontSize: "11px", color: "var(--text-muted)" }}
											>
												Parcela {p.parcela}
											</div>
										</div>
									</div>
									<div
										style={{
											fontFamily: "'Inter', sans-serif",
											fontSize: "14px",
											fontWeight: 600,
											color: "#EF4444",
										}}
									>
										-{formatCurrency(p.valor)}
									</div>
								</div>
							))}
							<div
								style={{
									marginTop: "16px",
									padding: "12px",
									background: "rgba(239,68,68,0.08)",
									borderRadius: "8px",
									display: "flex",
									justifyContent: "space-between",
								}}
							>
								<span
									style={{
										fontSize: "12px",
										fontWeight: 600,
										color: "var(--text-muted)",
									}}
								>
									Total/mês
								</span>
								<span
									style={{
										fontFamily: "'Inter', sans-serif",
										fontSize: "14px",
										fontWeight: 700,
										color: "#EF4444",
									}}
								>
									{formatCurrency(
										parcelas.reduce((acc, p) => acc + p.valor, 0),
									)}
								</span>
							</div>
						</>
					)}
				</div>
			</div>
		</main>
	);
}
