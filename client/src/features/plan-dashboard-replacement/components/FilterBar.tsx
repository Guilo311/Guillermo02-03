import { Filters } from '../data/mockData';
import { useTranslation } from '../i18n';

interface FilterOptions {
  channels: string[];
  professionals: string[];
  procedures: string[];
  units: string[];
  statuses: string[];
  severities: string[];
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showUnit?: boolean;
  options?: FilterOptions;
}

const defaultOptions: FilterOptions = {
  channels: [],
  professionals: [],
  procedures: [],
  units: [],
  statuses: ['Realizada', 'No-Show', 'Cancelada', 'Confirmada'],
  severities: ['P1', 'P2', 'P3'],
};

export default function FilterBar({ filters, onChange, showUnit = false, options = defaultOptions }: FilterBarProps) {
  const { t } = useTranslation();
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clear = () => {
    onChange({
      period: '30d', channel: '', professional: '', procedure: '',
      status: '', unit: '', severity: '',
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar-title"><span className="dot" /> {t('Filtros globais')}</div>
      <div className="filter-row">
        <select className="filter-select" value={filters.period} onChange={e => update('period', e.target.value)}>
          <option value="7d">7d</option>
          <option value="15d">15d</option>
          <option value="30d">30d</option>
          <option value="3m">{t('3 meses')}</option>
          <option value="6m">{t('6 meses')}</option>
          <option value="1 ano">{t('1 ano')}</option>
        </select>

        <select className="filter-select" value={filters.channel} onChange={e => update('channel', e.target.value)}>
          <option value="">{t('Canal (todos)')}</option>
          {options.channels.map(c => <option key={c} value={c}>{t(c)}</option>)}
        </select>

        <select className="filter-select" value={filters.professional} onChange={e => update('professional', e.target.value)}>
          <option value="">{t('Profissional (todos)')}</option>
          {options.professionals.map(p => <option key={p} value={p}>{t(p)}</option>)}
        </select>

        <select className="filter-select" value={filters.procedure} onChange={e => update('procedure', e.target.value)}>
          <option value="">{t('Procedimento (todos)')}</option>
          {options.procedures.map(p => <option key={p} value={p}>{t(p)}</option>)}
        </select>

        <select className="filter-select" value={filters.status} onChange={e => update('status', e.target.value)}>
          <option value="">{t('Status (todos)')}</option>
          {options.statuses.map(s => <option key={s} value={s}>{t(s)}</option>)}
        </select>

        {showUnit && <select className="filter-select" value={filters.unit} onChange={e => update('unit', e.target.value)}>
          <option value="">{t('Unidade (todas)')}</option>
          {options.units.map(u => <option key={u} value={u}>{t(u)}</option>)}
        </select>}

        <select className="filter-select" value={filters.severity} onChange={e => update('severity', e.target.value)}>
          <option value="">{t('Severidade')}</option>
          {options.severities.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button className="filter-clear" onClick={clear}>{t('Limpar')}</button>
      </div>
    </div>
  );
}
