import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

const inputClass = 'w-full bg-surface border border-surface-lighter rounded-xl px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors';
const labelClass = 'text-[10px] font-semibold text-text-muted uppercase tracking-wider';
const smallBtnClass = 'flex items-center gap-1 text-[11px] text-primary hover:text-primary-dark transition-colors';

const CHART_TYPES = ['bar', 'column', 'line', 'area', 'combo', 'scatter', 'funnel', 'treemap'];
const PIE_TYPES = ['pie', 'donut'];

function ColorInput({ value, onChange }) {
  return (
    <input
      type="color"
      value={value || '#0078D4'}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-8 rounded-lg border border-surface-lighter cursor-pointer flex-shrink-0"
    />
  );
}

function SeriesEditor({ series, onChange, isPieType }) {
  const updateSeries = (index, field, value) => {
    const updated = series.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(updated);
  };

  const addSeries = () => {
    onChange([...series, {
      name: `Series ${series.length + 1}`,
      color: '#0078D4',
      values: isPieType ? [50] : series[0]?.values?.map(() => 50) || [50],
    }]);
  };

  const removeSeries = (index) => {
    if (series.length <= 1) return;
    onChange(series.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {series.map((s, i) => (
        <div key={i} className="p-2.5 rounded-lg border border-surface-lighter space-y-2">
          <div className="flex items-center gap-2">
            <ColorInput value={s.color} onChange={(c) => updateSeries(i, 'color', c)} />
            <input
              type="text"
              value={s.name}
              onChange={(e) => updateSeries(i, 'name', e.target.value)}
              className={`${inputClass} flex-1`}
              placeholder="Series name"
            />
            {series.length > 1 && (
              <button onClick={() => removeSeries(i)} className="p-1 text-text-muted hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div>
            <span className="text-[10px] text-text-muted">
              {isPieType ? 'Value' : 'Values (comma-separated)'}
            </span>
            <input
              type="text"
              value={isPieType ? (s.values?.[0] ?? '') : (s.values || []).join(', ')}
              onChange={(e) => {
                if (isPieType) {
                  const num = parseFloat(e.target.value) || 0;
                  updateSeries(i, 'values', [num]);
                } else {
                  const vals = e.target.value.split(',').map(v => {
                    const n = parseFloat(v.trim());
                    return isNaN(n) ? 0 : n;
                  });
                  updateSeries(i, 'values', vals);
                }
              }}
              className={inputClass}
              placeholder={isPieType ? '50' : '10, 20, 30'}
            />
          </div>
        </div>
      ))}
      <button onClick={addSeries} className={smallBtnClass}>
        <Plus size={12} />
        Add {isPieType ? 'segment' : 'series'}
      </button>
    </div>
  );
}

function TableEditor({ headers, rows, onChange }) {
  const updateHeaders = (value) => {
    const newHeaders = value.split(',').map(h => h.trim());
    onChange({ tableHeaders: newHeaders, tableRows: rows });
  };

  const updateRow = (rowIndex, value) => {
    const newRows = rows.map((r, i) =>
      i === rowIndex ? value.split(',').map(c => c.trim()) : r
    );
    onChange({ tableHeaders: headers, tableRows: newRows });
  };

  const addRow = () => {
    const newRow = headers.map(() => '—');
    onChange({ tableHeaders: headers, tableRows: [...rows, newRow] });
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    onChange({ tableHeaders: headers, tableRows: rows.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Headers (comma-separated)</label>
        <input
          type="text"
          value={headers.join(', ')}
          onChange={(e) => updateHeaders(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </div>
      <div>
        <label className={labelClass}>Rows</label>
        <div className="space-y-1.5 mt-1">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                value={row.join(', ')}
                onChange={(e) => updateRow(i, e.target.value)}
                className={`${inputClass} flex-1`}
              />
              {rows.length > 1 && (
                <button onClick={() => removeRow(i)} className="p-1 text-text-muted hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addRow} className={`${smallBtnClass} mt-1.5`}>
          <Plus size={12} />
          Add row
        </button>
      </div>
    </div>
  );
}

export default function VisualPropertiesPanel({ visual, onUpdate }) {
  const spec = visual?.spec;
  if (!spec) return null;

  const updateSpec = (changes) => {
    onUpdate({ spec: { ...spec, ...changes } });
  };

  const { visualType } = spec;
  const isChart = CHART_TYPES.includes(visualType);
  const isPie = PIE_TYPES.includes(visualType);

  return (
    <div className="p-3 space-y-4">
      {/* Title — common to all */}
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={spec.title || ''}
          onChange={(e) => updateSpec({ title: e.target.value })}
          className={`${inputClass} mt-1`}
        />
      </div>

      {/* Chart types: categories + series */}
      {isChart && spec.categories && (
        <div>
          <label className={labelClass}>Categories (comma-separated)</label>
          <input
            type="text"
            value={(spec.categories || []).join(', ')}
            onChange={(e) => {
              const cats = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
              updateSpec({ categories: cats });
            }}
            className={`${inputClass} mt-1`}
          />
        </div>
      )}

      {(isChart || isPie) && spec.series && (
        <div>
          <label className={labelClass}>{isPie ? 'Segments' : 'Series'}</label>
          <div className="mt-1">
            <SeriesEditor
              series={spec.series}
              onChange={(series) => updateSpec({ series })}
              isPieType={isPie}
            />
          </div>
        </div>
      )}

      {/* KPI */}
      {visualType === 'kpi' && (
        <>
          <div>
            <label className={labelClass}>KPI Value</label>
            <input
              type="text"
              value={spec.kpiValue || ''}
              onChange={(e) => updateSpec({ kpiValue: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </div>
          {spec.kpiChange !== undefined && (
            <div>
              <label className={labelClass}>Change</label>
              <input
                type="text"
                value={spec.kpiChange || ''}
                onChange={(e) => updateSpec({ kpiChange: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </div>
          )}
          {spec.kpiTrend !== undefined && (
            <div>
              <label className={labelClass}>Trend</label>
              <select
                value={spec.kpiTrend || 'up'}
                onChange={(e) => updateSpec({ kpiTrend: e.target.value })}
                className={`${inputClass} mt-1 cursor-pointer`}
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          )}
        </>
      )}

      {/* Card */}
      {visualType === 'card' && (
        <div>
          <label className={labelClass}>Card Value</label>
          <input
            type="text"
            value={spec.kpiValue || ''}
            onChange={(e) => updateSpec({ kpiValue: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>
      )}

      {/* Table */}
      {visualType === 'table' && spec.tableHeaders && (
        <TableEditor
          headers={spec.tableHeaders}
          rows={spec.tableRows || []}
          onChange={(tableData) => updateSpec(tableData)}
        />
      )}

      {/* Header */}
      {visualType === 'header' && (
        <div>
          <label className={labelClass}>Subtitle</label>
          <input
            type="text"
            value={spec.subtitle || ''}
            onChange={(e) => updateSpec({ subtitle: e.target.value })}
            className={`${inputClass} mt-1`}
            placeholder="Optional subtitle"
          />
        </div>
      )}

      {/* Filter */}
      {visualType === 'filter' && (
        <div>
          <label className={labelClass}>Options (comma-separated)</label>
          <input
            type="text"
            value={(spec.filterOptions || []).join(', ')}
            onChange={(e) => {
              const opts = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
              updateSpec({ filterOptions: opts });
            }}
            className={`${inputClass} mt-1`}
          />
        </div>
      )}

      {/* Button */}
      {visualType === 'button' && (
        <div>
          <label className={labelClass}>Button Text</label>
          <input
            type="text"
            value={spec.buttonText || ''}
            onChange={(e) => updateSpec({ buttonText: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>
      )}

      {/* Textbox */}
      {visualType === 'textbox' && (
        <div>
          <label className={labelClass}>Content</label>
          <textarea
            value={spec.textContent || ''}
            onChange={(e) => updateSpec({ textContent: e.target.value })}
            className={`${inputClass} mt-1 resize-none`}
            rows={4}
          />
        </div>
      )}

      {/* Gauge */}
      {visualType === 'gauge' && (
        <>
          <div>
            <label className={labelClass}>Value</label>
            <input
              type="number"
              value={spec.gaugeValue ?? 0}
              onChange={(e) => updateSpec({ gaugeValue: parseFloat(e.target.value) || 0 })}
              className={`${inputClass} mt-1`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Min</label>
              <input
                type="number"
                value={spec.gaugeMin ?? 0}
                onChange={(e) => updateSpec({ gaugeMin: parseFloat(e.target.value) || 0 })}
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <label className={labelClass}>Max</label>
              <input
                type="number"
                value={spec.gaugeMax ?? 100}
                onChange={(e) => updateSpec({ gaugeMax: parseFloat(e.target.value) || 100 })}
                className={`${inputClass} mt-1`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
