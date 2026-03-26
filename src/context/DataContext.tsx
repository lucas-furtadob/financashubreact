import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import * as queries from "@/lib/queries";

interface Transacao {
	id: string;
	descricao: string;
	valor: string;
	data: Date;
	mes: number;
	ano: number;
	tipo: string;
	status: string | null;
	categoriaId: string;
	contaId: string;
}

interface Orcamento {
	id: string;
	categoriaId: string;
	mes: number;
	ano: number;
	valorPlanejado: string;
}

interface Categoria {
	id: string;
	nome: string;
	tipo: string;
	cor: string | null;
	icon: string | null;
	paiId: string | null;
	status: string | null;
}

interface Conta {
	id: string;
	nome: string;
	tipo: string;
	saldoInicial: string;
	cor: string | null;
	icon: string | null;
}

interface Cartao {
	id: string;
	nome: string;
	bandeira: string | null;
	digitos: string | null;
	limite: string;
	contaId: string | null;
	cor: string | null;
}

interface Tag {
	id: string;
	nome: string;
	cor: string | null;
}

interface DataContextType {
	transacoes: Transacao[];
	orcamentos: Orcamento[];
	categorias: Categoria[];
	contas: Conta[];
	cartoes: Cartao[];
	tags: Tag[];
	loading: boolean;
	refresh: () => Promise<void>;
	addTransacao: (data: Omit<Transacao, "id">) => Promise<void>;
	updateTransacao: (id: string, data: Partial<Transacao>) => Promise<void>;
	deleteTransacao: (id: string) => Promise<void>;
	addOrcamento: (data: Omit<Orcamento, "id">) => Promise<void>;
	updateOrcamento: (id: string, data: Partial<Orcamento>) => Promise<void>;
	deleteOrcamento: (id: string) => Promise<void>;
	addCategoria: (data: Omit<Categoria, "id">) => Promise<void>;
	updateCategoria: (id: string, data: Partial<Categoria>) => Promise<void>;
	deleteCategoria: (id: string) => Promise<void>;
	addConta: (data: Omit<Conta, "id">) => Promise<void>;
	updateConta: (id: string, data: Partial<Conta>) => Promise<void>;
	deleteConta: (id: string) => Promise<void>;
	addCartao: (data: Omit<Cartao, "id">) => Promise<void>;
	deleteCartao: (id: string) => Promise<void>;
	addTag: (data: Omit<Tag, "id">) => Promise<void>;
	deleteTag: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error("useData must be used within DataProvider");
	}
	return context;
}

interface DataProviderProps {
	children: ReactNode;
}

export type { Transacao, Orcamento, Categoria, Conta, Cartao, Tag };

export function DataProvider({ children }: DataProviderProps) {
	const { data: activeOrg } = authClient.useActiveOrganization();
	const { data: session } = authClient.useSession();

	const [transacoes, setTransacoes] = useState<Transacao[]>([]);
	const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [contas, setContas] = useState<Conta[]>([]);
	const [cartoes, setCartoes] = useState<Cartao[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);

	const orgId = activeOrg?.id;
	const userId = session?.user?.id;

	const fetchAll = useCallback(async () => {
		if (!orgId) {
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const [transData, orcData, catData, contaData, cartaoData, tagData] =
				await Promise.all([
					queries.getTransacoes(orgId),
					queries.getOrcamentos(orgId),
					queries.getCategorias(orgId),
					queries.getContas(orgId),
					queries.getCartoes(orgId),
					queries.getTags(orgId),
				]);

			setTransacoes(
				transData.map((t) => ({
					...t,
					valor: String(t.valor),
					data: new Date(t.data),
				})),
			);
			setOrcamentos(
				orcData.map((o) => ({
					...o,
					valorPlanejado: String(o.valorPlanejado),
				})),
			);
			setCategorias(catData);
			setContas(
				contaData.map((c) => ({
					...c,
					saldoInicial: String(c.saldoInicial),
				})),
			);
			setCartoes(
				cartaoData.map((c) => ({
					...c,
					limite: String(c.limite),
				})),
			);
			setTags(tagData);
		} catch (err) {
			console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	}, [orgId]);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	const addTransacao = async (data: Omit<Transacao, "id">) => {
		if (!orgId || !userId) return;
		await queries.createTransacao({
			organizationId: orgId,
			userId,
			contaId: data.contaId || "nubank",
			categoriaId: data.categoriaId,
			descricao: data.descricao,
			valor: data.valor,
			data: data.data,
			tipo: data.tipo as "receita" | "despesa" | "transferencia",
			status: data.status as "pendente" | "concluida",
		});
		await fetchAll();
	};

	const updateTransacao = async (id: string, data: Partial<Transacao>) => {
		const updateData: any = { ...data };
		if (data.valor) updateData.valor = String(data.valor);
		if (data.data) updateData.data = data.data;
		await queries.updateTransacao(id, updateData);
		await fetchAll();
	};

	const deleteTransacao = async (id: string) => {
		await queries.deleteTransacao(id);
		await fetchAll();
	};

	const addOrcamento = async (data: Omit<Orcamento, "id">) => {
		if (!orgId) return;
		await queries.createOrcamento({
			organizationId: orgId,
			categoriaId: data.categoriaId,
			mes: data.mes,
			ano: data.ano,
			valorPlanejado: data.valorPlanejado,
		});
		await fetchAll();
	};

	const updateOrcamento = async (id: string, data: Partial<Orcamento>) => {
		const updateData: any = { ...data };
		if (data.valorPlanejado)
			updateData.valorPlanejado = String(data.valorPlanejado);
		await queries.updateOrcamento(id, updateData);
		await fetchAll();
	};

	const deleteOrcamento = async (id: string) => {
		await queries.deleteOrcamento(id);
		await fetchAll();
	};

	const addCategoria = async (data: Omit<Categoria, "id">) => {
		if (!orgId) return;
		await queries.createCategoria({
			organizationId: orgId,
			nome: data.nome,
			tipo: data.tipo as "receita" | "despesa" | "investimento",
			cor: data.cor || undefined,
			icon: data.icon || undefined,
		});
		await fetchAll();
	};

	const updateCategoria = async (id: string, data: Partial<Categoria>) => {
		await queries.updateCategoria(id, data as any);
		await fetchAll();
	};

	const deleteCategoria = async (id: string) => {
		await queries.deleteCategoria(id);
		await fetchAll();
	};

	const addConta = async (data: Omit<Conta, "id">) => {
		if (!orgId) return;
		await queries.createConta({
			organizationId: orgId,
			nome: data.nome,
			tipo: data.tipo,
			saldoInicial: data.saldoInicial,
			cor: data.cor || undefined,
			icon: data.icon || undefined,
		});
		await fetchAll();
	};

	const updateConta = async (id: string, data: Partial<Conta>) => {
		const updateData: any = { ...data };
		if (data.saldoInicial) updateData.saldoInicial = String(data.saldoInicial);
		await queries.updateConta(id, updateData);
		await fetchAll();
	};

	const deleteConta = async (id: string) => {
		await queries.deleteConta(id);
		await fetchAll();
	};

	const addCartao = async (data: Omit<Cartao, "id">) => {
		if (!orgId) return;
		await queries.createCartao({
			organizationId: orgId,
			nome: data.nome,
			bandeira: data.bandeira || undefined,
			digitos: data.digitos || undefined,
			limite: data.limite,
			cor: data.cor || undefined,
		});
		await fetchAll();
	};

	const deleteCartao = async (id: string) => {
		await queries.deleteCartao(id);
		await fetchAll();
	};

	const addTag = async (data: Omit<Tag, "id">) => {
		if (!orgId) return;
		await queries.createTag({
			organizationId: orgId,
			nome: data.nome,
			cor: data.cor || undefined,
		});
		await fetchAll();
	};

	const deleteTag = async (id: string) => {
		await queries.deleteTag(id);
		await fetchAll();
	};

	const value: DataContextType = {
		transacoes,
		orcamentos,
		categorias,
		contas,
		cartoes,
		tags,
		loading,
		refresh: fetchAll,
		addTransacao,
		updateTransacao,
		deleteTransacao,
		addOrcamento,
		updateOrcamento,
		deleteOrcamento,
		addCategoria,
		updateCategoria,
		deleteCategoria,
		addConta,
		updateConta,
		deleteConta,
		addCartao,
		deleteCartao,
		addTag,
		deleteTag,
	};

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
