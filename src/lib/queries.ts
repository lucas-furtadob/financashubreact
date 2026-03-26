import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
	cartoesCredito,
	categorias,
	contasFinanceiras,
	orcamentos,
	tags,
	transacoes,
} from "@/db/schema";

// --- TRANSAÇÕES (LANÇAMENTOS) ---

export async function getTransacoes(
	organizationId: string,
	mes?: number,
	ano?: number,
) {
	const conditions = [eq(transacoes.organizationId, organizationId)];

	if (mes && ano) {
		conditions.push(eq(transacoes.mes, mes));
		conditions.push(eq(transacoes.ano, ano));
	}

	return db
		.select()
		.from(transacoes)
		.where(and(...conditions))
		.orderBy(desc(transacoes.data));
}

export async function createTransacao(data: {
	organizationId: string;
	contaId: string;
	categoriaId: string;
	userId: string;
	descricao: string;
	valor: string | number;
	data: Date;
	tipo: "receita" | "despesa" | "transferencia";
	status?: "pendente" | "concluida";
}) {
	const id = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const mes = data.data.getMonth() + 1;
	const ano = data.data.getFullYear();

	await db.insert(transacoes).values({
		id,
		...data,
		mes,
		ano,
		valor: String(data.valor),
		status: data.status || "pendente",
	} as any);

	return { id, ...data };
}

export async function updateTransacao(
	id: string,
	data: Partial<{
		descricao: string;
		valor: string | number;
		data: Date;
		categoriaId: string;
		contaId: string;
		status: "pendente" | "concluida";
		tipo: "receita" | "despesa" | "transferencia";
	}>,
) {
	const updateData: Record<string, unknown> = { ...data };

	if (data.data) {
		updateData.mes = data.data.getMonth() + 1;
		updateData.ano = data.data.getFullYear();
	}

	if (data.valor !== undefined) {
		updateData.valor = String(data.valor);
	}

	await db.update(transacoes).set(updateData).where(eq(transacoes.id, id));
}

export async function deleteTransacao(id: string) {
	await db.delete(transacoes).where(eq(transacoes.id, id));
}

// --- CATEGORIAS ---

export async function getCategorias(organizationId: string, tipo?: string) {
	const conditions = [eq(categorias.organizationId, organizationId)];
	if (tipo) conditions.push(eq(categorias.tipo, tipo));

	return db
		.select()
		.from(categorias)
		.where(and(...conditions));
}

export async function createCategoria(data: {
	organizationId: string;
	nome: string;
	tipo: "receita" | "despesa" | "investimento";
	cor?: string;
	icon?: string;
	paiId?: string;
}) {
	const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	await db.insert(categorias).values({ id, ...data } as any);
	return { id, ...data };
}

export async function updateCategoria(
	id: string,
	data: Partial<{
		nome: string;
		cor: string;
		icon: string;
		status: string;
	}>,
) {
	await db.update(categorias).set(data).where(eq(categorias.id, id));
}

export async function deleteCategoria(id: string) {
	await db.delete(categorias).where(eq(categorias.id, id));
}

// --- CONTAS FINANCEIRAS ---

export async function getContas(organizationId: string) {
	return db
		.select()
		.from(contasFinanceiras)
		.where(eq(contasFinanceiras.organizationId, organizationId));
}

export async function createConta(data: {
	organizationId: string;
	nome: string;
	tipo: string;
	saldoInicial?: string | number;
	cor?: string;
	icon?: string;
}) {
	const id = `conta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	await db.insert(contasFinanceiras).values({
		id,
		...data,
		saldoInicial:
			data.saldoInicial !== undefined ? String(data.saldoInicial) : "0",
	} as any);
	return { id, ...data };
}

export async function updateConta(
	id: string,
	data: Partial<{
		nome: string;
		saldoInicial: string | number;
		cor: string;
	}>,
) {
	const updateData: Record<string, unknown> = { ...data };
	if (data.saldoInicial !== undefined) {
		updateData.saldoInicial = String(data.saldoInicial);
	}
	await db
		.update(contasFinanceiras)
		.set(updateData)
		.where(eq(contasFinanceiras.id, id));
}

export async function deleteConta(id: string) {
	await db.delete(contasFinanceiras).where(eq(contasFinanceiras.id, id));
}

// --- ORÇAMENTOS ---

export async function getOrcamentos(
	organizationId: string,
	mes?: number,
	ano?: number,
) {
	const conditions = [eq(orcamentos.organizationId, organizationId)];
	if (mes) conditions.push(eq(orcamentos.mes, mes));
	if (ano) conditions.push(eq(orcamentos.ano, ano));

	return db
		.select()
		.from(orcamentos)
		.where(and(...conditions));
}

export async function createOrcamento(data: {
	organizationId: string;
	categoriaId: string;
	mes: number;
	ano: number;
	valorPlanejado: string | number;
}) {
	const id = `orc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	await db.insert(orcamentos).values({
		id,
		...data,
		valorPlanejado: String(data.valorPlanejado),
	} as any);
	return { id, ...data };
}

export async function updateOrcamento(
	id: string,
	data: Partial<{
		valorPlanejado: string | number;
	}>,
) {
	const updateData: Record<string, unknown> = {};
	if (data.valorPlanejado !== undefined) {
		updateData.valorPlanejado = String(data.valorPlanejado);
	}
	await db.update(orcamentos).set(updateData).where(eq(orcamentos.id, id));
}

export async function deleteOrcamento(id: string) {
	await db.delete(orcamentos).where(eq(orcamentos.id, id));
}

// --- CARTÕES ---

export async function getCartoes(organizationId: string) {
	return db
		.select()
		.from(cartoesCredito)
		.where(eq(cartoesCredito.organizationId, organizationId));
}

export async function createCartao(data: {
	organizationId: string;
	nome: string;
	bandeira?: string;
	digitos?: string;
	contaId?: string;
	limite?: string | number;
	diaFechamento?: number;
	diaVencimento?: number;
	cor?: string;
}) {
	const id = `cartao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	await db.insert(cartoesCredito).values({
		id,
		...data,
		limite: data.limite !== undefined ? String(data.limite) : "0",
	} as any);
	return { id, ...data };
}

export async function updateCartao(
	id: string,
	data: Partial<{
		nome: string;
		limite: string | number;
		cor: string;
	}>,
) {
	const updateData: Record<string, unknown> = { ...data };
	if (data.limite !== undefined) {
		updateData.limite = String(data.limite);
	}
	await db
		.update(cartoesCredito)
		.set(updateData)
		.where(eq(cartoesCredito.id, id));
}

export async function deleteCartao(id: string) {
	await db.delete(cartoesCredito).where(eq(cartoesCredito.id, id));
}

// --- TAGS ---

export async function getTags(organizationId: string) {
	return db.select().from(tags).where(eq(tags.organizationId, organizationId));
}

export async function createTag(data: {
	organizationId: string;
	nome: string;
	cor?: string;
}) {
	const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	await db.insert(tags).values({ id, ...data } as any);
	return { id, ...data };
}

export async function deleteTag(id: string) {
	await db.delete(tags).where(eq(tags.id, id));
}
