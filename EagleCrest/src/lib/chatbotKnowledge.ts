// Knowledge base for the Crestmark live chat assistant.
// This is a lightweight, fully client-side "AI" — it scores each entry
// against the user's message using keyword overlap and returns the
// best match. No external API, account, or API key required.

export interface ChatTopic {
  id: string;
  /** Words/phrases that indicate this topic. Lowercase. */
  keywords: string[];
  /** Short title shown as a quick-reply suggestion. */
  title: string;
  /** The answer shown to the user. */
  answer: string;
}

export const CHAT_TOPICS: ChatTopic[] = [
  {
    id: 'open-account',
    title: 'Opening an account',
    keywords: [
      'open account', 'open an account', 'new account', 'create account',
      'sign up', 'register', 'apply for account', 'checking account',
      'savings account', 'how to open',
    ],
    answer:
      "To open a new account, go to the Sign Up page and fill out the application form (personal details, ID, and employment info). " +
      "Once submitted, your application status will show as 'pending' until it's reviewed and approved. " +
      "After approval, you can log in and your account will appear on your Home dashboard.",
  },
  {
    id: 'loan-repayment',
    title: 'Loan repayments',
    keywords: [
      'loan repayment', 'repay loan', 'pay loan', 'loan payment', 'pay off loan',
      'monthly payment', 'loan balance', 'next due', 'loan due date', 'pay my loan',
    ],
    answer:
      "You can manage loan repayments from the Loans page. Each loan card shows the balance, monthly payment, interest rate, and next due date. " +
      "Click 'Make Payment' on a loan to pay the next installment from your account balance — it will update your loan balance and account balance instantly.",
  },
  {
    id: 'apply-loan',
    title: 'Applying for a loan',
    keywords: [
      'apply for loan', 'new loan', 'get a loan', 'loan application', 'request loan',
      'apply loan', 'take a loan', 'loan types',
    ],
    answer:
      "To apply for a loan, go to the Loans page and click 'Apply for Loan'. Choose a loan type (e.g. personal, auto, mortgage, student), enter the principal amount, interest rate, and term in months. " +
      "Your application will be added with a 'pending' status until it's processed.",
  },
  {
    id: 'transfer-money',
    title: 'Sending money / transfers',
    keywords: [
      'transfer money', 'send money', 'wire transfer', 'transfer funds', 'send funds',
      'pay someone', 'transfer to', 'recipient', 'add recipient',
    ],
    answer:
      "Go to the Transfer page to send money. Select an existing recipient or add a new one (name, bank, account number), enter the amount and an optional note, then confirm. " +
      "The amount is deducted from your account balance immediately and recorded in your Transactions history.",
  },
  {
    id: 'cards',
    title: 'Cards (virtual & physical)',
    keywords: [
      'card', 'cards', 'virtual card', 'freeze card', 'unfreeze card', 'spending limit',
      'apply for card', 'new card', 'card frozen', 'lost card', 'block card',
    ],
    answer:
      "On the Cards page you can apply for a new virtual or physical card, freeze/unfreeze a card instantly, and set a spending limit. " +
      "If your card is lost or stolen, freeze it immediately from the Cards page, then contact support to request a replacement.",
  },
  {
    id: 'savings-goals',
    title: 'Savings goals',
    keywords: [
      'savings goal', 'savings', 'save money', 'deposit to savings', 'create goal',
      'savings target', 'goal deadline',
    ],
    answer:
      "The Savings page lets you create savings goals with a target amount, optional deadline, icon, and color. " +
      "Use the 'Deposit' action on a goal to add funds toward it from your account balance. Progress is shown as a percentage of your target.",
  },
  {
    id: 'transactions',
    title: 'Transaction history',
    keywords: [
      'transaction history', 'transactions', 'recent transactions', 'spending history',
      'where is my money', 'cash flow', 'spending breakdown', 'statement',
    ],
    answer:
      "The Transactions page lists all your account activity with filters by category and status (completed, pending, failed, processing). " +
      "The Analytics page shows spending breakdowns by category and a monthly cash flow chart of income vs. expenses.",
  },
  {
    id: 'balance',
    title: 'Account balance',
    keywords: [
      'balance', 'account balance', 'how much money', 'check balance', 'my funds',
    ],
    answer:
      "Your current balance is shown at the top of the Home dashboard, along with your account number and card details. " +
      "If you have multiple accounts, each one's balance is listed individually.",
  },
  {
    id: 'login-issues',
    title: 'Login / sign-in issues',
    keywords: [
      'cant login', "can't log in", 'login issue', 'sign in problem', 'forgot password',
      'reset password', 'wrong password', 'locked out', 'login error',
    ],
    answer:
      "If you're having trouble signing in, double-check your email and password are correct. " +
      "Password reset isn't available in-app yet — please contact support and we'll help you regain access to your account.",
  },
  {
    id: 'profile-settings',
    title: 'Profile & settings',
    keywords: [
      'change name', 'update email', 'update phone', 'change password', 'profile',
      'settings', 'preferences', 'notifications settings', 'two factor', '2fa', 'biometric',
    ],
    answer:
      "Go to Settings to update your name, email, or phone number, change your password, and manage preferences like currency, two-factor authentication, biometric login, and notification alerts.",
  },
  {
    id: 'notifications',
    title: 'Notifications',
    keywords: [
      'notification', 'notifications', 'alerts', 'unread', 'mark as read',
    ],
    answer:
      "Notifications about cards, loans, transfers, and security appear in the bell icon in the top bar. " +
      "Click a notification to mark it as read, or use 'Mark all as read' to clear them all at once.",
  },
  {
    id: 'security',
    title: 'Account security',
    keywords: [
      'security', 'is my money safe', 'fraud', 'suspicious activity', 'unauthorized',
      'hacked', 'scam',
    ],
    answer:
      "Crestmark takes security seriously — your session is protected with token-based authentication. " +
      "If you notice suspicious activity or an unauthorized transaction, freeze any affected cards immediately from the Cards page and contact support right away.",
  },
];

export const CHAT_GREETING =
  "Hi! I'm the Crestmark assistant. Ask me about opening accounts, loan repayments, transfers, cards, savings goals, and more.";

/** Suggested quick-reply prompts shown when the chat opens. */
export const CHAT_SUGGESTIONS = [
  'How do I repay a loan?',
  'How do I open an account?',
  'How do I send money?',
  'How do I freeze my card?',
];
