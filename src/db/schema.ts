import {
	boolean,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// --- AUTH TABLES (Better Auth) ---
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// --- MULTI-TENANCY (Organizations) ---
export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const member = pgTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role").notNull(), // 'owner', 'admin', 'member'
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// --- FINANCIAL DATA ---
export const categorias = pgTable("categoria", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	nome: text("nome").notNull(),
	tipo: text("tipo").notNull(), // 'receita', 'despesa', 'investimento'
	cor: text("cor").default("#CBD5E1"),
	icon: text("icon").default("tag"),
	paiId: text("pai_id").references((): any => categorias.id), // Auto-referência
	status: text("status").default("ativa"), // 'ativa', 'inativa'
	relatorio: boolean("relatorio").default(true),
	descricao: text("descricao"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const contasFinanceiras = pgTable("conta_financeira", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	nome: text("nome").notNull(),
	tipo: text("tipo").notNull(), // 'corrente', 'poupanca', 'investimento', 'carteira'
	saldoInicial: numeric("saldo_inicial", { precision: 12, scale: 2 }).default(
		"0",
	),
	cor: text("cor").default("#3B82F6"),
	icon: text("icon").default("bank"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const transacoes = pgTable("transacao", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	contaId: text("conta_id")
		.notNull()
		.references(() => contasFinanceiras.id),
	categoriaId: text("categoria_id")
		.notNull()
		.references(() => categorias.id),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	descricao: text("descricao").notNull(),
	valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
	data: timestamp("data", { withTimezone: true }).notNull(),
	mes: integer("mes").notNull(),
	ano: integer("ano").notNull(),
	tipo: text("tipo").notNull(),
	status: text("status").default("pendente"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const orcamentos = pgTable("orcamento", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	categoriaId: text("categoria_id")
		.notNull()
		.references(() => categorias.id),
	mes: integer("mes").notNull(),
	ano: integer("ano").notNull(),
	valorPlanejado: numeric("valor_planejado", {
		precision: 12,
		scale: 2,
	}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const cartoesCredito = pgTable("cartao_credito", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	nome: text("nome").notNull(),
	bandeira: text("bandeira"),
	digitos: text("digitos"),
	contaId: text("conta_id").references(() => contasFinanceiras.id),
	limite: numeric("limite", { precision: 12, scale: 2 }).default("0"),
	diaFechamento: integer("dia_fechamento"),
	diaVencimento: integer("dia_vencimento"),
	cor: text("cor").default("#8B5CF6"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const tags = pgTable("tag", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	nome: text("nome").notNull(),
	cor: text("cor").default("#6B7280"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
