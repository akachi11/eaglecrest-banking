export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://eaglecrest-banking.onrender.com/api');

// ─── low-level fetch wrapper ─────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

const get  = <T>(path: string, token?: string | null) => request<T>('GET',    path, undefined, token);
const post = <T>(path: string, body: unknown, token?: string | null) => request<T>('POST',   path, body,      token);
const patch = <T>(path: string, body: unknown, token?: string | null) => request<T>('PATCH',  path, body,      token);
const del  = <T>(path: string, token?: string | null) => request<T>('DELETE', path, undefined, token);

// ─── types ───────────────────────────────────────────────────────────────────

export interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dob: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  idType: 'passport' | 'driver_license' | 'state_id';
  ssnLast4: string;
  employmentStatus: string;
  employer?: string;
  annualIncome: number;
  accountType: 'checking' | 'savings' | 'private';
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  memberSince: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  hasTransactionPin?: boolean;
  preferences: {
    currency: string;
    twoFactor: boolean;
    biometric: boolean;
    txnAlerts: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  };
}

export interface ApiAccount {
  _id: string;
  number: string;
  type: string;
  balance: number;
  currency: string;
  cardType: 'visa' | 'mastercard';
  cardExpiry: string;
}

export interface ApiTransaction {
  _id: string;
  name: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed' | 'processing';
  date: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  note?: string;
  reference?: string;
}

export interface ApiRecipient {
  _id: string;
  name: string;
  handle?: string;
  initials: string;
  bank?: string;
  accountNumber?: string;
}

export interface ApiCard {
  _id: string;
  lastFour: string;
  cardType: 'visa' | 'mastercard';
  cardName: string;
  expiry: string;
  isVirtual: boolean;
  isFrozen: boolean;
  spendingLimit?: number;
  color?: string;
  status: 'pending' | 'active' | 'frozen' | 'cancelled';
  account: { _id: string; number: string; balance: number };
}

export interface ApiSavingsGoal {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
  target: number;
  saved: number;
  deadline?: string;
  isCompleted: boolean;
}

export interface ApiLoan {
  _id: string;
  name: string;
  type: string;
  lender?: string;
  principal: number;
  balance: number;
  rate: number;
  monthlyPayment: number;
  nextDue?: string;
  icon?: string;
  color?: string;
  status: 'pending' | 'active' | 'paid_off' | 'delinquent';
}

export interface ApiNotification {
  _id: string;
  title: string;
  body: string;
  type: 'card' | 'loan' | 'transfer' | 'security' | 'system';
  read: boolean;
  icon: string;
  iconColor: string;
  createdAt: string;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface CashFlowEntry {
  month: string;
  income: number;
  expenses: number;
}

// ─── auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: ApplicationData) =>
    post<{ message: string; applicationId: string }>('/auth/register', data),

  login: (email: string, password: string) =>
    post<{ token: string; user: ApiUser }>('/auth/login', { email, password }),

  getMe: (token: string) =>
    get<{ user: ApiUser }>('/auth/me', token),

  updateProfile: (token: string, data: { name?: string; email?: string; phone?: string }) =>
    patch<{ user: ApiUser }>('/auth/me', data, token),

  updatePreferences: (token: string, data: Partial<ApiUser['preferences']>) =>
    patch<{ user: ApiUser }>('/auth/me/preferences', data, token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    patch<{ message: string }>('/auth/me/password', { currentPassword, newPassword }, token),

  setTransactionPin: (token: string, pin: string) =>
    patch<{ message: string; user: ApiUser }>('/auth/me/pin', { pin }, token),
};

// ─── accounts ────────────────────────────────────────────────────────────────

export const accountApi = {
  getPrimary: (token: string) =>
    get<{ account: ApiAccount }>('/accounts/primary', token),

  getAll: (token: string) =>
    get<{ accounts: ApiAccount[] }>('/accounts', token),
};

// ─── transactions ─────────────────────────────────────────────────────────────

export const transactionApi = {
  list: (token: string, params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return get<{ transactions: ApiTransaction[]; total: number; page: number; pages: number }>(
      `/transactions${qs}`,
      token,
    );
  },

  get: (token: string, id: string) =>
    get<{ transaction: ApiTransaction }>(`/transactions/${id}`, token),

  cashFlow: (token: string) =>
    get<{ cashFlow: CashFlowEntry[] }>('/transactions/cash-flow', token),

  spending: (token: string) =>
    get<{ spending: SpendingCategory[]; total: number }>('/transactions/spending', token),
};

// ─── transfers ───────────────────────────────────────────────────────────────

export const transferApi = {
  send: (token: string, recipientId: string, amount: number, pin: string, note?: string) =>
    post<{ transaction: ApiTransaction; balance: number }>(
      '/transfers/send',
      { recipientId, amount, pin, note },
      token,
    ),

  getRecipients: (token: string) =>
    get<{ recipients: ApiRecipient[] }>('/transfers/recipients', token),

  addRecipient: (
    token: string,
    data: { name: string; handle?: string; bank?: string; accountNumber?: string },
  ) => post<{ recipient: ApiRecipient }>('/transfers/recipients', data, token),

  deleteRecipient: (token: string, id: string) =>
    del<{ message: string }>(`/transfers/recipients/${id}`, token),
};

// ─── cards ───────────────────────────────────────────────────────────────────

export const cardApi = {
  list: (token: string) =>
    get<{ cards: ApiCard[] }>('/cards', token),

  apply: (
    token: string,
    data: {
      cardType?: 'visa' | 'mastercard';
      cardName?: string;
      isVirtual?: boolean;
      spendingLimit?: number;
      color?: string;
    },
  ) => post<{ card: ApiCard }>('/cards/apply', data, token),

  issueVirtual: (token: string, cardName?: string) =>
    post<{ card: ApiCard }>('/cards/virtual', { cardName }, token),

  toggleFreeze: (token: string, id: string) =>
    patch<{ card: ApiCard }>(`/cards/${id}/freeze`, {}, token),

  updateLimit: (token: string, id: string, limit: number) =>
    patch<{ card: ApiCard }>(`/cards/${id}/limit`, { limit }, token),
};

// ─── savings ─────────────────────────────────────────────────────────────────

export const savingsApi = {
  list: (token: string) =>
    get<{ goals: ApiSavingsGoal[] }>('/savings', token),

  create: (
    token: string,
    data: { name: string; target: number; icon?: string; color?: string; deadline?: string },
  ) => post<{ goal: ApiSavingsGoal }>('/savings', data, token),

  deposit: (token: string, id: string, amount: number) =>
    patch<{ goal: ApiSavingsGoal }>(`/savings/${id}/deposit`, { amount }, token),

  delete: (token: string, id: string) =>
    del<{ message: string }>(`/savings/${id}`, token),
};

// ─── loans ───────────────────────────────────────────────────────────────────

export const loanApi = {
  list: (token: string) =>
    get<{ loans: ApiLoan[] }>('/loans', token),

  apply: (
    token: string,
    data: {
      name: string;
      type: string;
      lender?: string;
      principal: number;
      rate: number;
      termMonths: number;
    },
  ) => post<{ loan: ApiLoan }>('/loans/apply', data, token),

  pay: (token: string, id: string) =>
    post<{ loan: ApiLoan }>(`/loans/${id}/pay`, {}, token),
};

// ─── notifications ────────────────────────────────────────────────────────────

export const notificationApi = {
  list: (token: string) =>
    get<{ notifications: ApiNotification[]; unreadCount: number }>('/notifications', token),

  markRead: (token: string, id: string) =>
    patch<{ notification: ApiNotification }>(`/notifications/${id}/read`, {}, token),

  markAllRead: (token: string) =>
    patch<{ message: string }>('/notifications/read-all', {}, token),

  delete: (token: string, id: string) =>
    del<{ message: string }>(`/notifications/${id}`, token),
};
