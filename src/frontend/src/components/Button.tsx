import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'danger' | 'ghost';
}

export const Button = ({ children, isLoading, variant = 'primary', ...props }: ButtonProps) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-500/20',
        danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25 border border-red-500/20',
        ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white'
    };

    return (
        <button
            disabled={isLoading || props.disabled}
            className={`w-full p-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center tracking-wide ${variants[variant]}`}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : children}
        </button>
    );
};