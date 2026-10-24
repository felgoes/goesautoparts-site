const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 3,
});

export function formatQuantity(quantity: number | string | null | undefined): string {
  if (quantity === null || quantity === undefined || quantity === '') return '—';

  const value = typeof quantity === 'number' ? quantity : Number(quantity);
  return Number.isFinite(value) ? quantityFormatter.format(value) : '—';
}
