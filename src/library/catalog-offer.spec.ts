import { describe, expect, it } from 'vitest';
import { resolveExactSku } from './catalog-offer';

describe('Vínculo exato com catálogo', () => {
  it('preserva zeros e não aceita SKU parecido', () => {
    expect(resolveExactSku([{ sku: '00123-GEN' }], '00123-GEN')).toEqual({
      status: 'resolved',
      product: { sku: '00123-GEN' },
    });
    expect(resolveExactSku([{ sku: '123-GEN' }], '00123-GEN')).toEqual({ status: 'missing' });
  });
  it('sinaliza SKU duplicado para revisão', () => {
    expect(resolveExactSku([{ sku: 'ABC' }, { sku: 'ABC' }], 'ABC')).toEqual({
      status: 'duplicate',
    });
  });
});
