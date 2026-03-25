import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	showCloseButton?: boolean;
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
	sm: "modal-sm",
	md: "modal-md",
	lg: "modal-lg",
	xl: "modal-xl",
	full: "modal-full",
};

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	showCloseButton = true,
	closeOnOverlayClick = true,
	closeOnEscape = true,
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (closeOnEscape && e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose, closeOnEscape]);

	if (!isOpen) return null;

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div
				ref={modalRef}
				className={`modal-container ${sizeClasses[size]}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? "modal-title" : undefined}
			>
				{(title || showCloseButton) && (
					<div className="modal-header">
						{title && (
							<h2 id="modal-title" className="modal-title">
								{title}
							</h2>
						)}
						{showCloseButton && (
							<button
								type="button"
								className="modal-close"
								onClick={onClose}
								aria-label="Fechar modal"
							>
								<X size={20} />
							</button>
						)}
					</div>
				)}
				<div className="modal-content">{children}</div>
			</div>
		</div>
	);
}

interface ModalFooterProps {
	children: ReactNode;
	align?: "left" | "center" | "right" | "between";
}

export function ModalFooter({ children, align = "right" }: ModalFooterProps) {
	return <div className={`modal-footer modal-footer-${align}`}>{children}</div>;
}
