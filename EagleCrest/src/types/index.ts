export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing';

export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface Account {
  id: string;
  name: string;
  number: string;
  balance: number;
  currency: string;
  cardExpiry: string;
  cardType: 'visa' | 'mastercard';
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CashFlowEntry {
  month: string;
  income: number;
  expenses: number;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';