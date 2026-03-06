import { describe, expect, it } from 'vitest';
import { resolveKpiMeta } from './kpiMeta';

describe('resolveKpiMeta', () => {
  it('resolves NPS metadata with formula and integrated sources', () => {
    const meta = resolveKpiMeta('NPS Geral', 'integrated');

    expect(meta.formula).toContain('promotores');
    expect(meta.sources[0]).toContain('Pesquisa NPS');
    expect(meta.fields).toContain('score');
  });

  it('marks fallback mode when real integrations are not available', () => {
    const meta = resolveKpiMeta('Receita Líquida', 'fallback');

    expect(meta.sources[0]).toContain('Fallback interno');
    expect(meta.formula).toContain('Bruto');
  });

  it('returns a generic explanation for unknown KPIs', () => {
    const meta = resolveKpiMeta('Indicador Proprietário GLX', 'integrated');

    expect(meta.formula).toContain('Indicador calculado');
    expect(meta.note).toBeTruthy();
  });
});
