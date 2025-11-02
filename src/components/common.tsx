
import React, { ReactNode, useEffect, useState } from 'react';
import { InspectionStatus, PaymentStatus, ToastMessage } from '../../types';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  collapsible?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, className, actions, collapsible = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const ChevronIcon = ({ isUp }: { isUp: boolean }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isUp ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );

    return (
        <div className={`bg-secondary rounded-xl shadow-sm border border-border ${className}`}>
            {(title || actions) && (
                <div className="flex justify-between items-center p-4 border-b border-border">
                    {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
                    <div className="flex items-center space-x-2">
                        {actions}
                        {collapsible && title && (
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-1 rounded-full text-text-secondary hover:bg-primary"
                                aria-label={isCollapsed ? 'Expandir' : 'Minimizar'}
                                aria-expanded={!isCollapsed}
                            >
                                <ChevronIcon isUp={isCollapsed} />
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${collapsible && isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
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
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-primary rounded-t-2xl shadow-xl w-full max-w-2xl max-h-[90dvh] flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-primary z-10">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
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
        className={`fixed bottom-24 right-6 bg-accent text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:brightness-110 transition-transform duration-200 ease-in-out active:scale-95 z-10 ${className}`}
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

    const bgColor = toast.type === 'success' ? 'bg-status-approved' : 'bg-status-reproved';

    return (
        <div className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg text-white text-sm font-semibold animate-fade-in-down ${bgColor}`}>
            {toast.message}
        </div>
    );
};

export const EmptyState: React.FC<{ message: string, icon: ReactNode, action?: ReactNode }> = ({ message, icon, action }) => (
    <div className="text-center p-10 bg-secondary rounded-lg border border-border">
        <div className="flex justify-center items-center text-accent mb-4">{icon}</div>
        <p className="text-text-secondary mb-6">{message}</p>
        {action}
    </div>
);

export const getStatusBadge = (status: InspectionStatus | PaymentStatus) => {
    let colorClasses = 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    switch (status) {
        case InspectionStatus.Aprovado:
        case PaymentStatus.Pago:
            colorClasses = 'bg-green-100 text-status-approved border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50';
            break;
        case InspectionStatus.Reprovado:
            colorClasses = 'bg-red-100 text-status-reproved border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50';
            break;
        case InspectionStatus.Pendente:
        case PaymentStatus.Pendente:
             colorClasses = 'bg-yellow-100 text-status-pending border border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50';
             break;
        case InspectionStatus.Agendada:
            colorClasses = 'bg-cyan-100 text-status-scheduled border border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700/50';
            break;
    }
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
        enabled ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
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
export const Button: React.FC<{ children: ReactNode, onClick?: () => void, type?: 'button' | 'submit' | 'reset', variant?: 'primary' | 'secondary', className?: string, disabled?: boolean }> = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
  const baseClasses = "px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary inline-flex items-center justify-center space-x-2 text-sm transform active:scale-95";
  const variantClasses = variant === 'primary' 
    ? "bg-accent text-white hover:brightness-110 focus:ring-accent shadow-lg shadow-blue-500/20 dark:shadow-sky-500/20"
    : "bg-secondary text-text-secondary border border-border hover:bg-primary hover:text-text-primary focus:ring-text-secondary";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}>
      {children}
    </button>
  );
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-secondary" />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
);


export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} rows={4} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-secondary" />
);

export const FormField: React.FC<{ label: string, children: ReactNode }> = ({ label, children }) => (
    <div>
        <label className="text-sm font-medium text-text-secondary">{label}</label>
        {children}
    </div>
);