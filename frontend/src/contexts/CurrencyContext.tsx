import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CurrencyCode = 'BDT';

interface CurrencyRate {
    code: CurrencyCode;
    symbol: string;
    rate: number;
    label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
    BDT: { code: 'BDT', symbol: 'Tk ', rate: 1.0, label: 'BDT (Tk)' },
};

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatAmount: (amount: number) => string;
    currentCurrency: CurrencyRate;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency] = useState<CurrencyCode>('BDT');

    const setCurrency = () => {};

    const currentCurrency = CURRENCIES.BDT;

    const formatAmount = (amount: number): string => {
        const num = Number(amount) || 0;
        return `${currentCurrency.symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, currentCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
