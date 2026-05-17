import React from 'react';

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({
    label,
    error,
    ...props
}: InputProps) => {
    return (
        <div className="mb-5 flex w-full flex-col">
            {label && (
                <label className="mb-2 ml-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {label}
                </label>
            )}

            <input
                className={`w-full rounded-2xl border bg-slate-950/90 px-4 py-3 text-sm text-slate-100 shadow-inner outline-none transition-all duration-200 placeholder:text-slate-600
                ${
                    error
                        ? 'border-red-500/40 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-800 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5'
                }`}
                {...props}
            />

            {error && (
                <span className="mt-2 ml-1 text-xs font-medium text-red-400 animate-in slide-in-from-top-1">
                    {error}
                </span>
            )}
        </div>
    );
};