import { useSyncExternalStore } from "react";

export type Transacao = {
	id: string;
	data: Date;
	descricao: string;
	categoriaId: string;
	categoriaNome?: string;
	valor: number;
	tipo: "receita" | "despesa" | "transferencia";
	status: "pendente" | "concluida";
	contaId?: string;
	mes: number;
	ano: number;
};

export type Orcamento = {
	id: string;
	categoriaId: string;
	categoriaNome?: string;
	categoriaCor?: string;
	mes: number;
	ano: number;
	valorPlanejado: number;
};

class AppStore {
	transacoes: Transacao[] = [];
	orcamentos: Orcamento[] = [];
	listeners: Set<() => void> = new Set();

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notify() {
		this.listeners.forEach((l) => l());
	}

	// Transações
	setTransacoes(transacoes: Transacao[]) {
		this.transacoes = transacoes;
		this.notify();
	}

	addTransacao(transacao: Transacao) {
		this.transacoes = [transacao, ...this.transacoes];
		this.notify();
	}

	updateTransacao(id: string, data: Partial<Transacao>) {
		this.transacoes = this.transacoes.map((t) =>
			t.id === id ? { ...t, ...data } : t,
		);
		this.notify();
	}

	deleteTransacao(id: string) {
		this.transacoes = this.transacoes.filter((t) => t.id !== id);
		this.notify();
	}

	// Orçamentos
	setOrcamentos(orcamentos: Orcamento[]) {
		this.orcamentos = orcamentos;
		this.notify();
	}

	addOrcamento(orcamento: Orcamento) {
		this.orcamentos = [...this.orcamentos, orcamento];
		this.notify();
	}

	updateOrcamento(id: string, data: Partial<Orcamento>) {
		this.orcamentos = this.orcamentos.map((o) =>
			o.id === id ? { ...o, ...data } : o,
		);
		this.notify();
	}

	deleteOrcamento(id: string) {
		this.orcamentos = this.orcamentos.filter((o) => o.id !== id);
		this.notify();
	}

	getGastoPorCategoria(categoriaId: string, mes: number, ano: number) {
		return this.transacoes
			.filter(
				(t) =>
					t.categoriaId === categoriaId &&
					t.mes === mes &&
					t.ano === ano &&
					t.tipo === "despesa" &&
					t.status === "concluida",
			)
			.reduce((sum, t) => sum + t.valor, 0);
	}
}

export const appStore = new AppStore();

export function useStore() {
	const state = useSyncExternalStore(
		appStore.subscribe.bind(appStore),
		() => ({}),
		() => ({}),
	);

	return {
		transacoes: appStore.transacoes,
		orcamentos: appStore.orcamentos,
		setTransacoes: appStore.setTransacoes.bind(appStore),
		addTransacao: appStore.addTransacao.bind(appStore),
		updateTransacao: appStore.updateTransacao.bind(appStore),
		deleteTransacao: appStore.deleteTransacao.bind(appStore),
		setOrcamentos: appStore.setOrcamentos.bind(appStore),
		addOrcamento: appStore.addOrcamento.bind(appStore),
		updateOrcamento: appStore.updateOrcamento.bind(appStore),
		deleteOrcamento: appStore.deleteOrcamento.bind(appStore),
		getGastoPorCategoria: appStore.getGastoPorCategoria.bind(appStore),
	};
}
