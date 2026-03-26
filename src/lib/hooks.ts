import { useCallback, useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";
import * as queries from "#/lib/queries";

export function useTransacoes(mes?: number, ano?: number) {
	const [transacoes, setTransacoes] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const { data: activeOrg } = authClient.useActiveOrganization();

	const fetchTransacoes = useCallback(async () => {
		if (!activeOrg?.id) return;

		try {
			setLoading(true);
			const data = await queries.getTransacoes(activeOrg.id, mes, ano);
			setTransacoes(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [activeOrg?.id, mes, ano]);

	useEffect(() => {
		fetchTransacoes();
	}, [fetchTransacoes]);

	const addTransacao = async (data: any) => {
		if (!activeOrg?.id) return;
		await queries.createTransacao({
			...data,
			organizationId: activeOrg.id,
		});
		await fetchTransacoes();
	};

	const updateTransacao = async (id: string, data: any) => {
		await queries.updateTransacao(id, data);
		await fetchTransacoes();
	};

	const removeTransacao = async (id: string) => {
		await queries.deleteTransacao(id);
		await fetchTransacoes();
	};

	return {
		transacoes,
		loading,
		error,
		refresh: fetchTransacoes,
		addTransacao,
		updateTransacao,
		removeTransacao,
	};
}

export function useCategorias(tipo?: string) {
	const [categorias, setCategorias] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const { data: activeOrg } = authClient.useActiveOrganization();

	const fetchCategorias = useCallback(async () => {
		if (!activeOrg?.id) return;

		try {
			setLoading(true);
			const data = await queries.getCategorias(activeOrg.id, tipo);
			setCategorias(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [activeOrg?.id, tipo]);

	useEffect(() => {
		fetchCategorias();
	}, [fetchCategorias]);

	const addCategoria = async (data: any) => {
		if (!activeOrg?.id) return;
		await queries.createCategoria({
			...data,
			organizationId: activeOrg.id,
		});
		await fetchCategorias();
	};

	const removeCategoria = async (id: string) => {
		await queries.deleteCategoria(id);
		await fetchCategorias();
	};

	return {
		categorias,
		loading,
		error,
		refresh: fetchCategorias,
		addCategoria,
		removeCategoria,
	};
}

export function useContas() {
	const [contas, setContas] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const { data: activeOrg } = authClient.useActiveOrganization();

	const fetchContas = useCallback(async () => {
		if (!activeOrg?.id) return;

		try {
			setLoading(true);
			const data = await queries.getContas(activeOrg.id);
			setContas(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [activeOrg?.id]);

	useEffect(() => {
		fetchContas();
	}, [fetchContas]);

	const addConta = async (data: any) => {
		if (!activeOrg?.id) return;
		await queries.createConta({
			...data,
			organizationId: activeOrg.id,
		});
		await fetchContas();
	};

	const updateConta = async (id: string, data: any) => {
		await queries.updateConta(id, data);
		await fetchContas();
	};

	const removeConta = async (id: string) => {
		await queries.deleteConta(id);
		await fetchContas();
	};

	return {
		contas,
		loading,
		error,
		refresh: fetchContas,
		addConta,
		updateConta,
		removeConta,
	};
}

export function useOrcamentos(mes?: number, ano?: number) {
	const [orcamentos, setOrcamentos] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const { data: activeOrg } = authClient.useActiveOrganization();

	const fetchOrcamentos = useCallback(async () => {
		if (!activeOrg?.id) return;

		try {
			setLoading(true);
			const data = await queries.getOrcamentos(activeOrg.id, mes, ano);
			setOrcamentos(data);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [activeOrg?.id, mes, ano]);

	useEffect(() => {
		fetchOrcamentos();
	}, [fetchOrcamentos]);

	const addOrcamento = async (data: any) => {
		if (!activeOrg?.id) return;
		await queries.createOrcamento({
			...data,
			organizationId: activeOrg.id,
		});
		await fetchOrcamentos();
	};

	const updateOrcamento = async (id: string, data: any) => {
		await queries.updateOrcamento(id, data);
		await fetchOrcamentos();
	};

	const removeOrcamento = async (id: string) => {
		await queries.deleteOrcamento(id);
		await fetchOrcamentos();
	};

	return {
		orcamentos,
		loading,
		error,
		refresh: fetchOrcamentos,
		addOrcamento,
		updateOrcamento,
		removeOrcamento,
	};
}
