import { apiFetch } from '@/lib/fetch';
import { useQuery } from '@tanstack/react-query';
import type {
  MovementExpense,
  MovementIncome,
  MovementExchange,
  ExpenseTemplate,
} from '@/types/movement';

export const useGetExpenses = (from: string, to: string) => {
  const { data: expenses = [], isLoading } = useQuery<MovementExpense[]>({
    queryKey: ['expenses', from],
    queryFn: () =>
      apiFetch<MovementExpense[]>(`/api/expenses?from=${from}&to=${to}`).then((items) =>
        items.map((e) => ({ ...e, type: 'expense' as const }))
      ),
  });

  return { expenses, isLoading };
};

export const useGetIncomes = (from: string, to: string) => {
  const { data: incomes = [], isLoading } = useQuery<MovementIncome[]>({
    queryKey: ['incomes', from],
    queryFn: () =>
      apiFetch<MovementIncome[]>(`/api/incomes?from=${from}&to=${to}`).then((items) =>
        items.map((i) => ({ ...i, type: 'income' as const }))
      ),
  });
  return { incomes, isLoading };
};

export const useGetExchanges = (from: string, to: string) => {
  const { data: exchanges = [], isLoading } = useQuery<MovementExchange[]>({
    queryKey: ['exchanges', from],
    queryFn: () =>
      apiFetch<MovementExchange[]>(`/api/exchanges?from=${from}&to=${to}`).then((items) =>
        items.map((x) => ({ ...x, type: 'exchange' as const }))
      ),
  });
  return { exchanges, isLoading };
};

export const useGetExpensesTemplate = () => {
  const { data: templates = [], isLoading } = useQuery<ExpenseTemplate[]>({
    queryKey: ['expenses', 'templates'],
    queryFn: () => apiFetch<ExpenseTemplate[]>('/api/expenses?templates=true'),
  });

  return { templates, isLoading };
};
