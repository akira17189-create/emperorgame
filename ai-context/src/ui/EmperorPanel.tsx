import { useState } from 'preact/hooks';
import type { GameState } from '../engine/types';
import { EMPEROR_STAT_DEFS, getStatTier } from '../data/emperor-stats';

interface EmperorPanelProps {
  state: GameState;
  onClose: () => void;
}

const C = {
  cream:   '#f7f4ed',
  ink:     '#1c1c1c',
  muted:   '#5f5f5d',
  border:  '#eceae4',
  borderI: 'rgba(28,28,28,0.4)',
  ink04:   'rgba(28,28,28,0.04)',
  ink82:   'rgba(28,28,28,0.82)',
  gold:    '#b8922a',
  goldFg:  '#7a5c12',
  safe:    '#4a7c59',
  warn:    '#b8922a',
  danger:  '#8b1a1a',
};
const FONT = '"Noto Serif SC","Source Han Serif SC",Georgia,serif';

function statColor(value: number): string {
  if (value >= 61) return C.safe;
  if (value >= 41) return C.warn;
  return C.muted;
}

export function EmperorPanel({ state, onClose }: EmperorPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const emperor = state.emperor;

  const statValues: Record<string, number> = {
    prestige:   emperor.prestige   ?? 10,
    virtue:     emperor.virtue     ?? 10,
    subtlety:   emperor.subtlety   ?? 10,
    statecraft: emperor.statecraft ?? 10,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(28,28,28,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: FONT,
    }} onClick={onClose}>
      <div style={{
        background: C.cream, border: `1px solid ${C.border}`,
        borderRadius: '16px', width: '100%', maxWidth: '540px',
        maxHeight: '90vh', overflowY: 'auto', padding: '36px',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.12em', marginBottom: '4px' }}>
              皇帝 · 个人修为
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.ink, margin: 0 }}>
              {emperor.name ?? '新帝'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '18px', color: C.muted, padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '12px', color: C.muted, marginBottom: '28px' }}>
          登基第 {state.world.year} 年 · 年龄 {(emperor.age ?? 18) + (state.world.year - 1)} 岁
        </div>

        <div style={{ height: '1px', background: C.border, marginBottom: '24px' }} />

        {/* Stat cards */}
        {EMPEROR_STAT_DEFS.map(def => {
          const value = statValues[def.field] ?? 10;
          const tier = getStatTier(def, value);
          const isOpen = expanded === def.field;
          const fillColor = statColor(value);

          return (
            <div key={def.field} style={{ marginBottom: '20px' }}>
              {/* Stat header */}
              <div
                style={{ cursor: 'pointer', marginBottom: '8px' }}
                onClick={() => setExpanded(isOpen ? null : def.field)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>{def.label}</span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '9999px',
                      color: fillColor, background: `${fillColor}18`, border: `1px solid ${fillColor}40`,
                    }}>
                      {tier.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.ink }}>{value}</span>
                    <span style={{ fontSize: '11px', color: C.muted }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Bar */}
                <div style={{ height: '4px', background: C.border, borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    width: `${Math.min(100, value)}%`,
                    background: fillColor,
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px', fontStyle: 'italic' }}>
                  {def.definition}
                </div>
              </div>

              {/* Expanded: tier description */}
              {isOpen && (
                <div style={{
                  background: C.ink04, border: `1px solid ${C.border}`,
                  borderRadius: '8px', padding: '16px 18px',
                  animation: 'fadeUp 0.2s ease both',
                }}>
                  <div style={{ fontSize: '13px', color: C.ink82, lineHeight: 1.9, marginBottom: '14px' }}>
                    {tier.description}
                  </div>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px' }}>
                    {def.effects.map((eff, i) => (
                      <div key={i} style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>
                        · {eff.narrative}
                      </div>
                    ))}
                  </div>
                  {/* Tier progression hint */}
                  <div style={{ marginTop: '10px', fontSize: '11px', color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: '8px' }}>
                    {value < 100 && (
                      <span>下一阶段：{def.tiers.find(t => t.min > value)?.title ?? '已至巅峰'} · 需达 {def.tiers.find(t => t.min > value)?.min ?? 100} 点</span>
                    )}
                    {value >= 100 && <span style={{ color: C.safe }}>已至巅峰</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer note */}
        <div style={{ marginTop: '8px', padding: '12px 16px', background: `${C.gold}10`, borderRadius: '8px', border: `1px solid ${C.gold}30` }}>
          <div style={{ fontSize: '12px', color: C.goldFg, lineHeight: 1.7 }}>
            各项修为随政务历练自然增长。威望因铁腕行事而立，德行因仁政待民而积，心性因处事历练而深，手腕因庶务磨砺而熟。
          </div>
        </div>
      </div>
    </div>
  );
}
