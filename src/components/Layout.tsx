import { Link, useLocation } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState } from "react";

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
	const location = useLocation();

	const toggleSubmenu = (label: string) => {
		setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	const toggleTheme = () => {
		setDarkMode(!darkMode);
		document.body.classList.toggle("light-theme", !darkMode);
	};

	const isActive = (href: string) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname.startsWith(href);
	};

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
					<div className="avatar" />
					<div className="user-info">
						<span className="user-name">Lucas Furtado</span>
						<span className="user-email">lucas@email.com</span>
					</div>
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

					<Link to="#" className="nav-item logout">
						<LogOut size={18} />
						<span className="nav-text">Sair</span>
					</Link>
				</div>
			</aside>

			<main className="content">{children}</main>
		</>
	);
}
