import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
    return (
        <div className="flex flex-col w-full mb-5">
            {label && (
                <label className="text-slate-300 text-sm font-medium mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`w-full bg-slate-900/50 border ${
                    error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'
                } text-slate-100 p-3 rounded-xl focus:outline-none focus:ring-4 ${
                    error ? 'focus:ring-red-500/10' : 'focus:ring-blue-500/10'
                } transition-all duration-300 placeholder:text-slate-600 shadow-inner`}
                {...props}
            />
            {error && (
                <span className="text-red-400 text-xs font-medium mt-1.5 ml-1 animate-in slide-in-from-top-1">
                    {error}
                </span>
            )}
        </div>
    );
};