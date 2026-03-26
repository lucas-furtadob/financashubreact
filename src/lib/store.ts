import { useState, useSyncExternalStore } from "react";

type Transacao = {
	id: string;
	data: string;
	descricao: string;
	categoria: string;
	status: string;
	valor: number;
	tipo: "despesa" | "receita" | "transferencia";
	conta?: string;
};

type Store = {
	transacoes: Transacao[];
	setTransacoes: (transacoes: Transacao[]) => void;
	addTransacao: (transacao: Transacao) => void;
	updateTransacao: (id: string, transacao: Partial<Transacao>) => void;
	deleteTransacao: (id: string) => void;
};

const store = {
	transacoes: [] as Transacao[],
	listeners: new Set<() => void>(),

	getState() {
		return this.transacoes;
	},

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	},

	setTransacoes(transacoes: Transacao[]) {
		this.transacoes = transacoes;
		this.listeners.forEach((l) => l());
	},

	addTransacao(transacao: Transacao) {
		this.transacoes = [transacao, ...this.transacoes];
		this.listeners.forEach((l) => l());
	},

	updateTransacao(id: string, data: Partial<Transacao>) {
		this.transacoes = this.transacoes.map((t) =>
			t.id === id ? { ...t, ...data } : t,
		);
		this.listeners.forEach((l) => l());
	},

	deleteTransacao(id: string) {
		this.transacoes = this.transacoes.filter((t) => t.id !== id);
		this.listeners.forEach((l) => l());
	},
};

export function useStore() {
	const [state, setState] = useState(0);

	return {
		transacoes: useSyncExternalStore(
			store.subscribe.bind(store),
			() => store.getState(),
			() => [],
		),
		setTransacoes: store.setTransacoes.bind(store),
		addTransacao: store.addTransacao.bind(store),
		updateTransacao: store.updateTransacao.bind(store),
		deleteTransacao: store.deleteTransacao.bind(store),
		refresh: () => setState((s) => s + 1),
	};
}
