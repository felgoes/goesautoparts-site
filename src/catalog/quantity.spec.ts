import { formatQuantity } from './quantity';

describe('formatQuantity', () => {
  it('removes unnecessary decimal zeros', () => {
    expect(formatQuantity('7.000')).toBe('7');
    expect(formatQuantity(15)).toBe('15');
  });

  it('keeps fractional quantities with Brazilian formatting', () => {
    expect(formatQuantity('7.500')).toBe('7,5');
    expect(formatQuantity('1234.250')).toBe('1.234,25');
  });

  it('shows a dash for missing or invalid values', () => {
    expect(formatQuantity(null)).toBe('—');
    expect(formatQuantity('inválido')).toBe('—');
  });
});
