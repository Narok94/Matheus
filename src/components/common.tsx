import React, { ReactNode, useEffect, useState } from 'react';
import { InspectionStatus, PaymentStatus, ToastMessage, FinancialRecord, Expense } from '../../types';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  collapsible?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, children, className, actions, collapsible = false, onClick }) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsible); // Collapse by default if collapsible

    const ChevronIcon = ({ isUp }: { isUp: boolean }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isUp ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );

    return (
        <div onClick={onClick} className={`bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md rounded-xl shadow-lg dark:shadow-cyan-900/10 border border-border ${className}`}>
            {(title || actions) && (
                <div 
                    className={`flex justify-between items-center p-4 ${!isCollapsed || !collapsible ? 'border-b border-border' : ''} ${collapsible ? 'cursor-pointer' : ''}`}
                    onClick={collapsible ? (e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); } : undefined}
                >
                    {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
                    <div className="flex items-center space-x-2">
                        {actions}
                        {collapsible && (
                            <button
                                className="p-1 rounded-full text-text-secondary"
                                aria-label={isCollapsed ? 'Expandir' : 'Minimizar'}
                                aria-expanded={!isCollapsed}
                            >
                                <ChevronIcon isUp={isCollapsed} />
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>
    );
};


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click is on the backdrop itself, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  return (
    <div onClick={handleBackdropClick} className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end md:items-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-primary/80 backdrop-blur-lg border border-border rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-2xl max-h-[90dvh] flex flex-col transform transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95'}`}>
        <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-primary/80 z-10">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const FloatingActionButton: React.FC<{ onClick: () => void, icon: ReactNode, className?: string }> = ({ onClick, icon, className }) => (
    <button
        onClick={onClick}
        className={`fixed bottom-6 right-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:brightness-110 transition-transform duration-200 ease-in-out active:scale-95 z-10 ${className}`}
        aria-label="Adicionar"
    >
        {icon}
    </button>
);

export const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }> = ({ isOpen, onClose, onConfirm, title, message }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="text-text-primary">
            <p>{message}</p>
            <div className="flex justify-end space-x-4 mt-6">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={onConfirm} className="bg-status-reproved hover:bg-red-700">Confirmar</Button>
            </div>
        </div>
    </Modal>
);

export const Toast: React.FC<{ toast: ToastMessage, onDismiss: () => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, onDismiss]);

    if (!toast) return null;

    const bgColor = toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600';

    return (
        <div className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg text-white text-sm font-semibold animate-fade-in-down ${bgColor}`}>
            {toast.message}
        </div>
    );
};

export const EmptyState: React.FC<{ message: string, icon: ReactNode, action?: ReactNode }> = ({ message, icon, action }) => (
    <div className="text-center p-10 bg-secondary/50 rounded-lg border border-border">
        <div className="flex justify-center items-center text-accent mb-4">{icon}</div>
        <p className="text-text-secondary mb-6">{message}</p>
        {action}
    </div>
);

export const getStatusBadge = (status: InspectionStatus | PaymentStatus) => {
    let colorClasses = 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
    switch (status) {
        case InspectionStatus.Aprovado:
        case PaymentStatus.Pago:
            colorClasses = 'bg-green-100 text-status-approved border border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30';
            break;
        case InspectionStatus.Reprovado:
            colorClasses = 'bg-red-100 text-status-reproved border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
            break;
        case InspectionStatus.Pendente:
        case PaymentStatus.Pendente:
             colorClasses = 'bg-yellow-100 text-status-pending border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30';
             break;
        case InspectionStatus.Agendada:
            colorClasses = 'bg-cyan-100 text-status-scheduled border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30';
            break;
    }
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{status}</span>;
}

type FinancialStatus = PaymentStatus | 'Atrasado';

export const getFinancialStatus = (record: FinancialRecord | Expense): FinancialStatus => {
    if (record.status === PaymentStatus.Pendente && new Date(record.dueDate) < new Date()) {
        return 'Atrasado';
    }
    return record.status;
};

export const FinancialStatusBadge: React.FC<{ record: FinancialRecord | Expense }> = ({ record }) => {
    const status = getFinancialStatus(record);

    if (status === PaymentStatus.Pago || status === PaymentStatus.Pendente) {
        return getStatusBadge(status);
    }
    
    // Custom style for 'Atrasado'
    const colorClasses = 'bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30';

    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{status}</span>;
}


export const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        enabled ? 'bg-accent' : 'bg-gray-300 dark:bg-slate-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

// Form Components
type ButtonProps = {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    as?: 'button' | 'label';
};

export const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, loading = false, as = 'button' }) => {
    const baseClasses = "px-5 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary inline-flex items-center justify-center space-x-2 text-sm transform active:scale-95";
    const variantClasses = variant === 'primary' 
        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 focus:ring-cyan-400 shadow-lg shadow-cyan-500/20"
        : "bg-secondary/50 text-text-primary border border-border hover:bg-secondary/80 focus:ring-accent";
    const disabledClasses = (disabled || loading) ? "opacity-50 cursor-not-allowed" : "";

    const combinedClasses = `${baseClasses} ${variantClasses} ${disabledClasses} ${className}`;

    const Spinner = () => (
        <svg className={`animate-spin h-5 w-5 ${variant === 'primary' ? 'text-white' : 'text-text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const content = (
        <>
            {loading && <Spinner />}
            {children}
        </>
    );

    if (as === 'label') {
        return (
            <label className={combinedClasses}>
                {content}
            </label>
        );
    }
  
    return (
        <button type={type} onClick={onClick} disabled={disabled || loading} className={combinedClasses}>
            {content}
        </button>
    );
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full mt-1 px-4 py-3 bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-secondary transition-colors" />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full mt-1 px-4 py-3 bg-secondary/30 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
);


export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} rows={4} className="w-full mt-1 px-4 py-3 bg-secondary/30 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-secondary transition-colors" />
);

export const FormField: React.FC<{ label: string, children: ReactNode }> = ({ label, children }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-text-secondary">{label}</label>
        {children}
    </div>
);