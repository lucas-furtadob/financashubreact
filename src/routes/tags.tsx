import { createFileRoute } from "@tanstack/react-router";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ds/Badge";
import { Button } from "../components/ds/Button";
import { Card } from "../components/ds/Card";
import { Input } from "../components/ds/Input";
import { Modal, ModalFooter } from "../components/ds/Modal";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ds/Table";
import { PageHeader } from "../components/layout/PageHeader";

export const Route = createFileRoute("/tags")({
	component: TagsPage,
});

const DEFAULT_TAGS = [
	{ id: "tag1", nome: "Fixo", icon: "pin", cor: "#6366F1", status: "ativa" },
	{
		id: "tag2",
		nome: "Parcelado",
		icon: "calendar",
		cor: "#F59E0B",
		status: "ativa",
	},
	{
		id: "tag3",
		nome: "Recorrente",
		icon: "repeat",
		cor: "#10B981",
		status: "ativa",
	},
	{ id: "tag4", nome: "PIX", icon: "send", cor: "#3B82F6", status: "ativa" },
	{
		id: "tag5",
		nome: "Boleto",
		icon: "file-text",
		cor: "#EF4444",
		status: "ativa",
	},
	{
		id: "tag6",
		nome: "Débito",
		icon: "credit-card",
		cor: "#8B5CF6",
		status: "ativa",
	},
	{
		id: "tag7",
		nome: "Crédito",
		icon: "layers",
		cor: "#EC4899",
		status: "ativa",
	},
	{
		id: "tag8",
		nome: "Dinheiro",
		icon: "banknote",
		cor: "#14B8A6",
		status: "ativa",
	},
	{
		id: "tag9",
		nome: "Trabalho",
		icon: "briefcase",
		cor: "#F97316",
		status: "ativa",
	},
	{
		id: "tag10",
		nome: "Pessoal",
		icon: "user",
		cor: "#06B6D4",
		status: "ativa",
	},
];

const COLORS = [
	"#6366F1",
	"#8B5CF6",
	"#A855F7",
	"#D946EF",
	"#EC4899",
	"#F43F5E",
	"#EF4444",
	"#F97316",
	"#F59E0B",
	"#EAB308",
	"#84CC16",
	"#22C55E",
	"#10B981",
	"#14B8A6",
	"#06B6D4",
	"#0EA5E9",
	"#3B82F6",
	"#6366F1",
];

function TagsPage() {
	const [tags, setTags] = useState(DEFAULT_TAGS);
	const [currentStatus, setCurrentStatus] = useState("ativa");
	const [showModal, setShowModal] = useState(false);
	const [editingTag, setEditingTag] = useState<string | null>(null);
	const [nome, setNome] = useState("");
	const [cor, setCor] = useState("#6366F1");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const filteredTags = tags.filter((t) => t.status === currentStatus);

	const openModal = (tag?: (typeof DEFAULT_TAGS)[0]) => {
		if (tag) {
			setEditingTag(tag.id);
			setNome(tag.nome);
			setCor(tag.cor);
		} else {
			setEditingTag(null);
			setNome("");
			setCor("#6366F1");
		}
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingTag(null);
	};

	const saveTag = () => {
		if (!nome.trim()) return;

		if (editingTag) {
			setTags(tags.map((t) => (t.id === editingTag ? { ...t, nome, cor } : t)));
		} else {
			const newTag = {
				id: `tag${Date.now()}`,
				nome,
				cor,
				icon: "tag",
				status: "ativa",
			};
			setTags([...tags, newTag]);
		}
		closeModal();
	};

	const toggleStatus = (id: string) => {
		setTags(
			tags.map((t) =>
				t.id === id
					? { ...t, status: t.status === "ativa" ? "arquivada" : "ativa" }
					: t,
			),
		);
	};

	const confirmDelete = (id: string) => {
		setDeleteId(id);
		setShowDeleteModal(true);
	};

	const deleteTag = () => {
		if (deleteId) {
			setTags(tags.filter((t) => t.id !== deleteId));
			setShowDeleteModal(false);
			setDeleteId(null);
		}
	};

	return (
		<main className="page-content-padding-md">
			<PageHeader
				title="Tags"
				description="Gerencie as tags para organizar seus lançamentos."
			>
				<Button icon={<Plus size={16} />} onClick={() => openModal()}>
					Nova Tag
				</Button>
			</PageHeader>

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					marginBottom: "24px",
				}}
			>
				<div className="tabs">
					<button
						type="button"
						className={`tab-btn ${currentStatus === "ativa" ? "active" : ""}`}
						onClick={() => setCurrentStatus("ativa")}
					>
						Ativas
					</button>
					<button
						type="button"
						className={`tab-btn ${currentStatus === "arquivada" ? "active" : ""}`}
						onClick={() => setCurrentStatus("arquivada")}
					>
						Arquivadas
					</button>
				</div>
			</div>

			<Card padding="none">
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>Nome</TableHeader>
							<TableHeader style={{ width: "140px" }}>Ações</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredTags.length === 0 ? (
							<TableEmpty colSpan={2} message="Nenhuma tag encontrada." />
						) : (
							filteredTags.map((tag) => (
								<TableRow key={tag.id}>
									<TableCell>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "12px",
											}}
										>
											<div
												style={{
													background: `${tag.cor}18`,
													color: tag.cor,
													width: "36px",
													height: "36px",
													borderRadius: "8px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Badge
													variant="accent"
													style={{ background: tag.cor, color: "#FFF" }}
												>
													{tag.nome.charAt(0)}
												</Badge>
											</div>
											<span style={{ fontWeight: 600 }}>{tag.nome}</span>
										</div>
									</TableCell>
									<TableCell>
										<div style={{ display: "flex", gap: "4px" }}>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openModal(tag)}
												tooltip="Editar tag"
											>
												<Pencil size={16} />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => toggleStatus(tag.id)}
												tooltip={
													tag.status === "ativa" ? "Arquivar" : "Desarquivar"
												}
											>
												<Archive size={16} />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => confirmDelete(tag.id)}
												tooltip="Excluir"
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			<Modal
				isOpen={showModal}
				onClose={closeModal}
				title={editingTag ? "Editar Tag" : "Nova Tag"}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					<Input
						label="Nome"
						placeholder="Ex: Trabalho"
						value={nome}
						onChange={(e) => setNome(e.target.value)}
					/>
					<div>
						<label
							htmlFor="color-picker"
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
						<div
							id="color-picker"
							style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
						>
							{COLORS.map((color) => (
								<button
									key={color}
									type="button"
									onClick={() => setCor(color)}
									style={{
										width: "32px",
										height: "32px",
										borderRadius: "8px",
										background: color,
										border:
											cor === color
												? "2px solid #FFF"
												: "2px solid transparent",
										cursor: "pointer",
									}}
								/>
							))}
						</div>
					</div>
				</div>
				<ModalFooter>
					<Button variant="ghost" onClick={closeModal}>
						Cancelar
					</Button>
					<Button onClick={saveTag}>Salvar</Button>
				</ModalFooter>
			</Modal>

			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title="Excluir Tag"
			>
				<p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
					Tem certeza que deseja excluir esta tag? Esta ação não pode ser
					desfeita.
				</p>
				<ModalFooter>
					<Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
						Cancelar
					</Button>
					<Button variant="danger" onClick={deleteTag}>
						Excluir
					</Button>
				</ModalFooter>
			</Modal>
		</main>
	);
}
