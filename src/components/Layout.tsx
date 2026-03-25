import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	ArrowRightLeft,
	BarChart3,
	Briefcase,
	CalendarRange,
	ChevronDown,
	CreditCard,
	HelpCircle,
	LayoutDashboard,
	LayoutGrid,
	LogOut,
	Moon,
	Settings,
	Sun,
	Wallet,
	Building2,
    Plus,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";

interface LayoutProps {
	children: React.ReactNode;
}

const navItems = [
	{ icon: LayoutDashboard, label: "Visão Geral", href: "/" },
	{ icon: ArrowRightLeft, label: "Lançamentos", href: "/lancamentos" },
	{
		label: "Agenda Financeira",
		icon: CalendarRange,
		hasSubmenu: true,
		submenu: ["Contas a pagar", "Contas a receber"],
	},
	{ icon: Wallet, label: "Contas financeiras", href: "/contas" },
	{ icon: CreditCard, label: "Cartão de crédito", href: "/cartoes" },
	{
		label: "Planejamento",
		icon: Briefcase,
		hasSubmenu: true,
		submenu: ["Objetivos", { label: "Orçamento Mensal", href: "/orcamento" }],
	},
	{ icon: BarChart3, label: "Relatórios", href: "#" },
	{
		label: "Cadastros",
		icon: LayoutGrid,
		hasSubmenu: true,
		submenu: [
			{ label: "Categorias", href: "/categorias" },
			{ label: "Tags", href: "/tags" },
		],
	},
];

export default function Layout({ children }: LayoutProps) {
	const [collapsed, setCollapsed] = useState(false);
	const [darkMode, setDarkMode] = useState(true);
	const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
    const [showOrgSelect, setShowOrgSelect] = useState(false);
	const location = useLocation();
    const navigate = useNavigate();

    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { data: userOrgs } = authClient.useListOrganizations();

	const toggleSubmenu = (label: string) => {
		setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	const toggleTheme = () => {
		setDarkMode(!darkMode);
		document.body.classList.toggle("light-theme", !darkMode);
	};

    const handleLogout = async () => {
        await authClient.signOut();
        navigate({ to: "/login" });
    };

	const isActive = (href: string) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname.startsWith(href);
	};

    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    if (isAuthPage) {
        return <main className="w-full">{children}</main>;
    }

	return (
		<>
			<aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
				<button
					type="button"
					className="sidebar-toggle"
					onClick={() => setCollapsed(!collapsed)}
				>
					<span className="toggle-icon">‹</span>
				</button>

				<div className="logo-container">
					<span className="logo-text">HUB</span>
					<span className="logo-short">H</span>
				</div>

				<div className="user-profile">
					<div className="avatar">
                        {session?.user?.name?.charAt(0) || "U"}
                    </div>
					<div className="user-info">
						<span className="user-name">{session?.user?.name || "Usuário"}</span>
						<span className="user-email text-[10px] opacity-70">{session?.user?.email}</span>
					</div>
				</div>

                {/* Seletor de Organização (Ambiente) */}
                <div className="px-4 mb-4">
                    <div 
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setShowOrgSelect(!showOrgSelect)}
                    >
                        <Building2 size={16} className="text-teal-400" />
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <span className="block text-xs font-medium truncate">
                                    {activeOrg?.name || "Selecionar Ambiente"}
                                </span>
                            </div>
                        )}
                        {!collapsed && <ChevronDown size={14} className={`transition-transform ${showOrgSelect ? 'rotate-180' : ''}`} />}
                    </div>

                    {showOrgSelect && !collapsed && (
                        <div className="mt-1 p-1 rounded-lg bg-[#1a2234] border border-white/10 shadow-xl space-y-1">
                            {userOrgs?.map((org) => (
                                <div 
                                    key={org.id} 
                                    className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:bg-white/5 ${activeOrg?.id === org.id ? 'text-teal-400 font-bold' : 'text-slate-300'}`}
                                    onClick={async () => {
                                        await authClient.organization.setActive({ organizationId: org.id });
                                        setShowOrgSelect(false);
                                    }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {org.name}
                                </div>
                            ))}
                            <div className="flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:bg-white/5 text-slate-400 border-t border-white/5 mt-1">
                                <Plus size={14} />
                                Novo Ambiente
                            </div>
                        </div>
                    )}
                </div>

				<nav className="nav-menu">
					<div className="nav-label">MENU</div>

					{navItems.map((item, index) => (
						<div key={index}>
							{item.hasSubmenu ? (
								<div className="nav-group">
									<div
										className="nav-item"
										onClick={() => item.label && toggleSubmenu(item.label)}
									>
										<item.icon size={18} />
										<span className="nav-text">{item.label}</span>
										<ChevronDown
											size={16}
											className={`chevron ${openSubmenus[item.label] ? "rotated" : ""}`}
											style={{
												marginLeft: "auto",
												transition: "transform 0.2s",
												transform: openSubmenus[item.label]
													? "rotate(180deg)"
													: "rotate(0deg)",
											}}
										/>
									</div>
									<div
										className="submenu-wrapper"
										style={{
											maxHeight: openSubmenus[item.label] ? "200px" : "0",
										}}
									>
										{item.submenu?.map((subItem: any, subIndex: number) =>
											typeof subItem === "string" ? (
												<div key={subIndex} className="submenu-item">
													{subItem}
												</div>
											) : (
												<Link
													key={subIndex}
													to={subItem.href}
													className="submenu-item"
												>
													{subItem.label}
												</Link>
											),
										)}
									</div>
								</div>
							) : (
								<Link
									to={item.href || "#"}
									className={`nav-item ${item.href && isActive(item.href) ? "active" : ""}`}
								>
									<item.icon size={18} />
									<span className="nav-text">{item.label}</span>
								</Link>
							)}
						</div>
					))}
				</nav>

				<div className="nav-footer">
					<div className="nav-item" onClick={toggleTheme}>
						{darkMode ? <Moon size={18} /> : <Sun size={18} />}
						<span className="nav-text">
							{darkMode ? "Modo Escuro" : "Modo Claro"}
						</span>
					</div>

					<div className="nav-divider" />

					<Link to="#" className="nav-item">
						<Settings size={18} />
						<span className="nav-text">Configurações</span>
					</Link>

					<Link to="#" className="nav-item">
						<HelpCircle size={18} />
						<span className="nav-text">Ajuda</span>
					</Link>

					<div className="nav-item logout" onClick={handleLogout}>
						<LogOut size={18} />
						<span className="nav-text">Sair</span>
					</div>
				</div>
			</aside>

			<main className="content">{children}</main>
		</>
	);
}
