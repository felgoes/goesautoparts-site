export type ExactSkuResult<T> =
  { status: 'resolved'; product: T } | { status: 'missing' } | { status: 'duplicate' };

export function resolveExactSku<T extends { sku: string }>(
  products: T[],
  sku: string,
): ExactSkuResult<T> {
  const exact = products.filter((product) => product.sku === sku);
  if (exact.length === 1) return { status: 'resolved', product: exact[0] };
  return exact.length ? { status: 'duplicate' } : { status: 'missing' };
}
