export interface Categoria {
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

export const CATEGORIAS: Categoria[] = [
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

export function getCategoriaById(id: string): Categoria | undefined {
	return CATEGORIAS.find((c) => c.id === id);
}

export function getCategoriasFormatadas(): {
	id: string;
	nome: string;
	nivel: number;
	nomePai?: string;
}[] {
	const result: {
		id: string;
		nome: string;
		nivel: number;
		nomePai?: string;
	}[] = [];

	const principais = CATEGORIAS.filter(
		(c) => c.paiId === null && c.status === "ativa",
	);

	principais.forEach((cat) => {
		result.push({
			id: cat.id,
			nome: cat.nome,
			nivel: 0,
		});

		const subcategorias = CATEGORIAS.filter(
			(c) => c.paiId === cat.id && c.status === "ativa",
		);

		subcategorias.forEach((sub) => {
			result.push({
				id: sub.id,
				nome: sub.nome,
				nivel: 1,
				nomePai: cat.nome,
			});
		});
	});

	return result;
}

export function getCategoriasDespesas(): {
	id: string;
	nome: string;
	nivel: number;
	nomePai?: string;
}[] {
	const result: {
		id: string;
		nome: string;
		nivel: number;
		nomePai?: string;
	}[] = [];

	const principais = CATEGORIAS.filter(
		(c) => c.paiId === null && c.status === "ativa" && c.tipo === "despesa",
	);

	principais.forEach((cat) => {
		result.push({
			id: cat.id,
			nome: cat.nome,
			nivel: 0,
		});

		const subcategorias = CATEGORIAS.filter(
			(c) => c.paiId === cat.id && c.status === "ativa" && c.tipo === "despesa",
		);

		subcategorias.forEach((sub) => {
			result.push({
				id: sub.id,
				nome: sub.nome,
				nivel: 1,
				nomePai: cat.nome,
			});
		});
	});

	return result;
}
