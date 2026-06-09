import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  accountApi,
  transactionApi,
  type ApiAccount,
  type ApiTransaction,
  type CashFlowEntry,
  type SpendingCategory,
} from '../lib/api';
import { useAuth } from './AuthContext';

interface BankingContextValue {
  account: ApiAccount | null;
  recentTransactions: ApiTransaction[];
  cashFlow: CashFlowEntry[];
  spending: SpendingCategory[];
  spendingTotal: number;
  loading: boolean;
  refreshAccount: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const BankingContext = createContext<BankingContextValue | null>(null);

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<ApiTransaction[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [spending, setSpending] = useState<SpendingCategory[]>([]);
  const [spendingTotal, setSpendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const [accountRes, txnRes, cashFlowRes, spendingRes] = await Promise.all([
        accountApi.getPrimary(token),
        transactionApi.list(token, { limit: 10 }),
        transactionApi.cashFlow(token),
        transactionApi.spending(token),
      ]);
      setAccount(accountRes.account);
      setRecentTransactions(txnRes.transactions);
      setCashFlow(cashFlowRes.cashFlow);
      setSpending(spendingRes.spending);
      setSpendingTotal(spendingRes.total);
    } catch {
      // account may not exist yet for brand-new users on first load race
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const refreshAccount = useCallback(async () => {
    if (!token) return;
    try {
      const { account } = await accountApi.getPrimary(token);
      setAccount(account);
    } catch {}
  }, [token]);

  const refreshTransactions = useCallback(async () => {
    if (!token) return;
    try {
      const { transactions } = await transactionApi.list(token, { limit: 10 });
      setRecentTransactions(transactions);
      const [cashFlowRes, spendingRes] = await Promise.all([
        transactionApi.cashFlow(token),
        transactionApi.spending(token),
      ]);
      setCashFlow(cashFlowRes.cashFlow);
      setSpending(spendingRes.spending);
      setSpendingTotal(spendingRes.total);
    } catch {}
  }, [token]);

  return (
    <BankingContext.Provider
      value={{ account, recentTransactions, cashFlow, spending, spendingTotal, loading, refreshAccount, refreshTransactions }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = (): BankingContextValue => {
  const ctx = useContext(BankingContext);
  if (!ctx) throw new Error('useBanking must be used inside BankingProvider');
  return ctx;
};
