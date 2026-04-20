import { useState, useEffect, useRef } from 'preact/hooks';
import { getState, subscribe, setState as setGameState } from '../engine/state';
import { DYNASTY_CONFIG } from '../data/lore-bridge';
import { executeTick } from '../engine/tick';
import { checkGameEndConditions } from '../engine/phases/narration';
import { NpcCard } from './components/NpcCard';
import { LoadingShimmer } from './components/LoadingShimmer';
import { Navbar } from './components/Navbar';
import { useToast } from './components/Toast';
import { getDefaultAdapter } from '../engine/save';
import { NoLLMConfigError, getLLMConfig } from '../engine/llm';
import { renderTemplate } from '../engine/templates';
import { PolicyPanel } from './PolicyPanel';
import { EVENT_TEMPLATES, resolveEventChoice } from '../engine/event-engine';
import { calcIdleRates, applyIdleAccumulation } from '../engine/idle-engine';
import { IDLE_INTERVAL_MS, MAX_OFFLINE_HOURS } from '../engine/idle-config';
import {
  PROLOGUE_AWAKENING,
  PROLOGUE_GUOSHI_ENTRY,
  PROLOGUE_GUOSHI_NOTICE,
  PROLOGUE_OPTIONS,
  PROLOGUE_TRANSITION,
  ACTION_PANEL_TITLE,
  LOCATION_OPTIONS,
  PrologueOption
} from '../data/prologue';

// ─── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  cream:   '#f7f4ed',
  ink:     '#1c1c1c',
  offwhite:'#fcfbf8',
  muted:   '#5f5f5d',
  border:  '#eceae4',
  borderI: 'rgba(28,28,28,0.4)',
  ink82:   'rgba(28,28,28,0.82)',
  ink04:   'rgba(28,28,28,0.04)',
  danger:  '#8b1a1a',
  warn:    '#b8922a',
  safe:    '#4a7c59',
};
const SHADOW_BTN   = 'rgba(255,255,255,0.18) 0 0.5px 0 0 inset,rgba(0,0,0,0.18) 0 0 0 0.5px inset,rgba(0,0,0,0.05) 0 1px 2px 0';
const SHADOW_FOCUS = 'rgba(0,0,0,0.10) 0 4px 12px';
const FONT = '"Noto Serif SC","Source Han Serif SC",Georgia,serif';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${C.cream};font-family:${FONT};color:${C.ink}}

.court-scroll{border:1px solid ${C.border};border-radius:12px;padding:48px 56px;min-height:280px;position:relative;background:${C.cream}}
.court-scroll::before,.court-scroll::after{content:'';position:absolute;left:48px;right:48px;height:1px;background:${C.border}}
.court-scroll::before{top:22px}
.court-scroll::after{bottom:22px}
.narration-text{font-size:16px;line-height:2;color:${C.ink82};white-space:pre-wrap;min-height:160px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.cursor-blink{animation:blink 1s step-end infinite}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fade-up{animation:fadeUp 0.3s ease both}

.btn-dark{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;background:${C.ink};color:${C.offwhite};border:none;border-radius:6px;cursor:pointer;font-family:${FONT};font-size:14px;box-shadow:${SHADOW_BTN};transition:opacity 0.15s}
.btn-dark:hover{opacity:0.84}
.btn-dark:active{opacity:0.68}
.btn-dark:disabled{opacity:0.38;cursor:not-allowed}

.btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;background:transparent;color:${C.ink};border:1px solid ${C.borderI};border-radius:6px;cursor:pointer;font-family:${FONT};font-size:14px;transition:background 0.15s}
.btn-ghost:hover{background:${C.ink04}}
.btn-ghost:active{opacity:0.7}
.btn-ghost:disabled{opacity:0.38;cursor:not-allowed}

.btn-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:${C.cream};color:${C.ink};border:1px solid ${C.border};border-radius:9999px;cursor:pointer;font-family:${FONT};font-size:12px;transition:background 0.15s,border-color 0.15s}
.btn-pill:hover{border-color:${C.borderI};background:${C.ink04}}

.prologue-choice{width:100%;text-align:left;padding:16px 20px;background:${C.cream};color:${C.ink};border:1px solid ${C.border};border-radius:8px;cursor:pointer;font-family:${FONT};font-size:15px;line-height:1.7;transition:border-color 0.15s,background 0.15s,box-shadow 0.15s}
.prologue-choice:hover{border-color:${C.borderI};background:${C.ink04};box-shadow:${SHADOW_FOCUS}}
.prologue-choice:disabled{opacity:0.45;cursor:not-allowed}

.submenu-wrap{position:relative;display:inline-block}
.submenu{position:absolute;top:calc(100% + 6px);left:0;z-index:50;background:${C.cream};border:1px solid ${C.border};border-radius:8px;padding:6px;min-width:140px;box-shadow:0 4px 16px rgba(0,0,0,0.07);display:none;flex-direction:column;gap:2px}
.submenu.open{display:flex}
.submenu button{width:100%;text-align:left;padding:8px 12px;background:none;border:none;border-radius:6px;cursor:pointer;font-family:${FONT};font-size:13px;color:${C.ink};transition:background 0.12s}
.submenu button:hover{background:${C.ink04}}
.submenu button:disabled{opacity:0.4;cursor:not-allowed}
.rate-badge{font-size:10px;color:${C.safe};margin-left:4px}

.court-input{width:100%;padding:12px 16px;border:1px solid ${C.border};border-radius:6px;background:${C.cream};font-family:${FONT};font-size:15px;color:${C.ink};resize:none;outline:none;line-height:1.7;transition:border-color 0.15s,box-shadow 0.15s}
.court-input:focus{border-color:${C.borderI};box-shadow:${SHADOW_FOCUS}}
.court-input::placeholder{color:${C.muted}}
.court-input:disabled{opacity:0.5}

.res-bar-track{height:3px;background:${C.border};border-radius:99px;overflow:hidden}
.res-bar-fill{height:100%;border-radius:99px;transition:width 0.6s ease}

.choice-btn{width:100%;text-align:left;padding:16px 20px;margin-bottom:8px;background:${C.cream};border:1px solid ${C.border};border-radius:8px;cursor:pointer;font-family:${FONT};transition:border-color 0.15s,background 0.15s}
.choice-btn:hover{border-color:${C.borderI};background:${C.ink04}}
.choice-btn:disabled{opacity:0.45;cursor:not-allowed}

.event-overlay{position:fixed;inset:0;z-index:200;background:rgba(28,28,28,0.45);display:flex;align-items:center;justify-content:center;padding:24px}
.event-card{background:${C.cream};border:1px solid ${C.border};border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding:36px}

.offline-banner{background:${C.ink04};border:1px solid ${C.border};border-radius:8px;padding:12px 20px;font-size:13px;color:${C.muted};display:flex;align-items:center;gap:10px;margin-bottom:20px}
.demo-banner{background:#b8922a15;border:1px solid #b8922a55;border-radius:8px;padding:10px 16px;margin-bottom:20px;font-size:13px;color:${C.warn};display:flex;align-items:center;gap:8px}
`;

// ─── Component ─────────────────────────────────────────────────────────────────
export function CourtPage() {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [narration, setNarration] = useState('');
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [courtMode, setCourtMode] = useState(false);
  const [demoMode] = useState(!getLLMConfig());
  const [showPolicyPanel, setShowPolicyPanel] = useState(false);
  const [state, setState] = useState(() => {
    try { return getState(); } catch { return null; }
  });

  const prologuePhase = state?.meta?.prologue_phase ?? 'awakening';
  const [showPrologueOptions, setShowPrologueOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PrologueOption | null>(null);
  const [isPrologueRunning, setIsPrologueRunning] = useState(false);
  const prologueCancelledRef = useRef(false);

  const [offlineEarnings, setOfflineEarnings] = useState<{
    hours: number; minutes: number; food: number; fiscal: number; military: number;
  } | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [eventNarrative, setEventNarrative] = useState('');

  const narrationRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // state subscription
  useEffect(() => subscribe((s) => setState(s)), []);

  // 开场序幕自动播放
  useEffect(() => {
    const currentPhase = state?.meta?.prologue_phase ?? 'awakening';
    if (currentPhase === 'complete') return;

    prologueCancelledRef.current = false;
    setIsPrologueRunning(true);
    setShowPrologueOptions(false);

    const DIVIDER = '\n\n──── 【国师玄明】 ────\n\n';
    const fullText = PROLOGUE_AWAKENING + DIVIDER + PROLOGUE_GUOSHI_ENTRY + '\n\n' + PROLOGUE_GUOSHI_NOTICE;
    let i = 0;
    let currentText = '';
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const finishPrologue = () => {
      setNarration(fullText);
      setIsPrologueRunning(false);
      setShowPrologueOptions(true);
      setGameState((draft: any) => { draft.meta.prologue_phase = 'guoshi_intro'; });
    };

    const tick = () => {
      if (prologueCancelledRef.current) return;
      if (i < fullText.length) {
        currentText += fullText[i++];
        setNarration(currentText);
        timerId = setTimeout(tick, 22);
      } else {
        finishPrologue();
      }
    };

    timerId = setTimeout(tick, 400);

    const skipHandler = () => {
      if (prologueCancelledRef.current) return;
      if (timerId) clearTimeout(timerId);
      prologueCancelledRef.current = true;
      finishPrologue();
    };

    const el = document.querySelector('.court-scroll');
    el?.addEventListener('click', skipHandler);

    return () => {
      prologueCancelledRef.current = true;
      if (timerId) clearTimeout(timerId);
      el?.removeEventListener('click', skipHandler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 点外部关闭下拉菜单
  useEffect(() => {
    if (!openMenu) return;
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenu]);

  // Ctrl+S 快速保存
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveGame(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 检查待处理事件
  useEffect(() => {
    if (state?.events?.pending?.length > 0 && !showEventModal) {
      const pendingEvent = state.events.pending[0];
      const template = EVENT_TEMPLATES.find(t => t.id === pendingEvent.template_id);
      if (template) {
        setCurrentEvent({ template, pendingEvent });
        setEventNarrative(template.description);
        setShowEventModal(true);
      }
    }
  }, [state?.events?.pending, showEventModal]);

  // 离线收益（仅挂载时计算一次）
  useEffect(() => {
    if (!state?.meta?.last_idle_tick_at) return;
    const lastTick = new Date(state.meta.last_idle_tick_at).getTime();
    const now = Date.now();
    const offlineMs = Math.min(now - lastTick, MAX_OFFLINE_HOURS * 3600 * 1000);
    if (offlineMs > IDLE_INTERVAL_MS * 2) {
      const rates = calcIdleRates(getState());
      setOfflineEarnings({
        hours:    Math.floor(offlineMs / 3600000),
        minutes:  Math.floor((offlineMs % 3600000) / 60000),
        food:     rates.food    * (offlineMs / 60000),
        fiscal:   rates.fiscal  * (offlineMs / 60000),
        military: rates.military * (offlineMs / 60000),
      });
      setGameState(draft => {
        applyIdleAccumulation(draft, rates, offlineMs / 60000);
        draft.meta.last_idle_tick_at = new Date().toISOString();
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 实时放置积累（每10秒）
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(draft => {
        const rates = calcIdleRates(draft);
        applyIdleAccumulation(draft, rates, IDLE_INTERVAL_MS / 60000);
        draft.meta.last_idle_tick_at = new Date().toISOString();
      });
    }, IDLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────────
  const handleEventChoice = (choiceId: string) => {
    if (!currentEvent) return;
    const { template } = currentEvent;
    const result = resolveEventChoice(state, template.id, choiceId);
    setGameState(draft => {
      Object.assign(draft, result.newState);
      draft.events.pending = draft.events.pending.filter((e: any) => e.template_id !== template.id);
      draft.chronicle.official.unshift({
        id: `event-${Date.now()}`, year: draft.world.year, kind: 'event',
        title: template.name, summary: result.narrative,
        impact: template.choices.find((c: any) => c.id === choiceId)?.effects || {}
      });
    });
    setShowEventModal(false); setCurrentEvent(null); setEventNarrative('');
    addToast('success', `事件已处理：${template.name}`);
    setNarration(result.narrative);
  };

  const closeEventModal = () => { setShowEventModal(false); setCurrentEvent(null); setEventNarrative(''); };

  const saveGame = async () => {
    try { await getDefaultAdapter().save('slot-1', getState()); addToast('success', '游戏已保存'); }
    catch { addToast('error', '保存失败'); }
  };

  const typewriterEffect = async (text: string) => {
    let current = '';
    for (const char of text) {
      current += char;
      setNarration(current);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };

  // Bug 2 & 3 fix: overrideNpcId 参数，召见时直接传入正确 NPC id
  const submitCommand = async (overrideCommand?: string, overrideNpcId?: string) => {
    const commandToExecute = overrideCommand ?? command;
    if (!commandToExecute.trim() || isProcessing) return;

    setIsProcessing(true);
    setNarration('');

    try {
      if (demoMode) {
        const fallback = renderTemplate('weather_good', { year: state.world.year });
        if (fallback) await typewriterEffect(fallback);
        setCommand('');
        addToast('info', '当前为演示模式，请先配置 LLM');
        return;
      }

      const resolvedNpcId = overrideNpcId || activeNpcId;
      const targetNpc =
        (resolvedNpcId ? state.npcs.find(n => n.id === resolvedNpcId && n.status === 'active') : null)
        ?? state.npcs.find(n => n.status === 'active');

      if (!targetNpc) { addToast('error', '没有可用的NPC'); return; }
      setActiveNpcId(targetNpc.id);

      const tickResult = await executeTick(state, commandToExecute, { targetNpcId: targetNpc.id });

      setGameState(draft => {
        Object.assign(draft, tickResult.newState);
        if (tickResult.chronicle_entry) {
          draft.chronicle.official.unshift({ ...tickResult.chronicle_entry, id: `entry-${Date.now()}` });
        }
        if (tickResult.decision) {
          draft.events.raw_logs.push({
            year: draft.world.year, kind: 'command',
            payload: { command: commandToExecute, decision: tickResult.decision }
          });
        }
        if (tickResult.events.length > 0) {
          draft.events.pending.push(
            ...tickResult.events.map((e, i) => ({
              id: `tick-${draft.world.year}-${i}`,
              triggered_year: draft.world.year,
              template_id: 'tick_event',
              severity: tickResult.warnings.length > 0 ? 2 : 1,
              raw_payload: { text: e },
              seal: 'normal' as const,
              narrated: false,
            }))
          );
        }
        const endCheck = checkGameEndConditions(draft);
        if (endCheck.isEnded) {
          draft.events.pending.push({
            id: `end-${draft.world.year}`, triggered_year: draft.world.year,
            template_id: 'game_end', severity: 5,
            raw_payload: { reason: endCheck.reason }, seal: 'bloody', narrated: false,
          });
        }
      });

      try { await getDefaultAdapter().save('slot-1', getState()); } catch { /* best-effort */ }

      if (tickResult.narration) await typewriterEffect(tickResult.narration);
      setCommand('');
      addToast('success', '指令已处理');
    } catch (error) {
      if (error instanceof NoLLMConfigError) {
        location.hash = '/settings';
      } else {
        addToast('error', `生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
        const fallback = renderTemplate('weather_good', { year: getState().world.year });
        if (fallback) await typewriterEffect(fallback);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────────
  const r = state?.resources ?? ({} as any);
  const fmt = (n: number) => Math.round(n ?? 0).toLocaleString('zh-CN');

  const threatColor = (v: number) => v > 70 ? C.danger : v > 40 ? C.warn : C.safe;
  const moraleColor = (v: number) => v < 30 ? C.danger : v < 60 ? C.warn : C.safe;
  const loyalColor  = (v: number) => v > 70 ? C.safe   : v > 40 ? C.warn : C.danger;

  const EFFECT_LABELS: Record<string, string> = {
    morale: '民心', fiscal: '国库', military: '军力', food: '粮食',
    threat: '外患', commerce: '商业', eunuch: '宦官', faction: '党争',
    population: '人口', land_fertility: '土地肥力', disaster_relief: '赈灾',
  };
  const SEV_LABELS = ['', '轻微', '中等', '严重'];
  const SEV_COLORS = [C.muted, C.safe, C.warn, C.danger];

  // 计算实时积累速率（每分钟）
  const idleRates = state ? calcIdleRates(state) : null;
  const fmtRate = (r: number) => r > 0 ? `+${r.toFixed(1)}/分` : r < 0 ? `${r.toFixed(1)}/分` : '';

  // ─── Sidebar ───────────────────────────────────────────────────────────────────
  const sidebar = (
    <aside style={{
      border: `1px solid ${C.border}`, borderRadius: '12px',
      padding: '28px 24px', background: C.cream,
      position: 'sticky', top: '24px', alignSelf: 'start',
    }}>
      {/* Dynasty & year */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {state?.world?.dynasty ?? '未知朝代'}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 600, color: C.ink, letterSpacing: '-0.4px', lineHeight: 1.15 }}>
          {state?.world?.year ? `永德${state.world.year}年` : '—'}
        </div>
        {state?.world?.tone && (
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '5px' }}>{state.world.tone}</div>
        )}
      </div>

      <div style={{ height: '1px', background: C.border, marginBottom: '18px' }} />

      {/* Morale bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px', color: C.muted }}>民心</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: C.ink }}>{fmt(r.morale)} / 100</span>
        </div>
        <div className="res-bar-track">
          <div className="res-bar-fill" style={{ width: `${Math.min(100, r.morale ?? 0)}%`, background: moraleColor(r.morale ?? 0) }} />
        </div>
      </div>

      {/* Threat meters */}
      {([
        { label: '宦官势力', key: 'eunuch' },
        { label: '外患指数', key: 'threat' },
        { label: '派系张力', key: 'faction' },
      ]).map(({ label, key }) => {
        const val = r[key] ?? 0;
        return (
          <div key={key} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: C.muted }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: C.ink }}>{fmt(val)}</span>
            </div>
            <div className="res-bar-track">
              <div className="res-bar-fill" style={{ width: `${Math.min(100, val)}%`, background: threatColor(val) }} />
            </div>
          </div>
        );
      })}

      <div style={{ height: '1px', background: C.border, margin: '18px 0' }} />

      {/* Numeric resources */}
      {([
        { label: '国库',   key: 'fiscal',     unit: '万两',  rateKey: 'fiscal' },
        { label: '粮食',   key: 'food',       unit: '石',    rateKey: 'food' },
        { label: '军力',   key: 'military',   unit: '',      rateKey: 'military' },
        { label: '人口',   key: 'population', unit: '',      rateKey: 'population' },
        { label: '商税',   key: 'commerce',   unit: '两/年', rateKey: 'commerce' },
      ]).map(({ label, key, unit, rateKey }) => {
        const rate = idleRates ? (idleRates as any)[rateKey] : 0;
        const rateStr = fmtRate(rate);
        return (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '9px' }}>
          <span style={{ fontSize: '12px', color: C.muted }}>
            {label}
            {rateStr && <span className="rate-badge">{rateStr}</span>}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: C.ink }}>
            {fmt(r[key])}
            {unit && <span style={{ fontSize: '11px', color: C.muted, marginLeft: '2px' }}>{unit}</span>}
          </span>
        </div>
        );
      })}

      {/* Active NPCs */}
      {prologuePhase === 'complete' && (state?.npcs?.filter((n: any) => n.status === 'active')?.length ?? 0) > 0 && (
        <>
          <div style={{ height: '1px', background: C.border, margin: '18px 0' }} />
          <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.08em', marginBottom: '12px' }}>在朝官员</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {state.npcs.filter((n: any) => n.status === 'active').map((npc: any) => {
              const loyalty = npc.state?.loyalty_to_emperor ?? 50;
              const lc = loyalColor(loyalty);
              return (
                <div key={npc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', color: C.offwhite, fontWeight: 600,
                  }}>
                    {npc.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: C.ink, lineHeight: 1.2 }}>{npc.name}</div>
                    <div style={{ fontSize: '11px', color: C.muted }}>{npc.role}</div>
                  </div>
                  <span style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '9999px', flexShrink: 0,
                    color: lc, background: `${lc}18`, border: `1px solid ${lc}40`,
                  }}>
                    忠{Math.round(loyalty)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );

  // ─── Main content ──────────────────────────────────────────────────────────────
  const mainContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Narration scroll */}
      <div className="court-scroll" ref={narrationRef} style={{ cursor: isPrologueRunning ? 'pointer' : 'default' }}>
        <div className="narration-text">
          {narration
            ? narration
            : isProcessing
              ? <LoadingShimmer />
              : <span style={{ color: C.muted, fontSize: '14px', fontStyle: 'italic' }}>
                  {prologuePhase === 'complete' ? '候旨……' : ''}
                </span>
          }
          {isPrologueRunning && <span className="cursor-blink" style={{ marginLeft: '1px' }}>▌</span>}
        </div>
      </div>

      {/* ── Prologue choices (visually distinct from narration) ── */}
      {prologuePhase !== 'complete' && showPrologueOptions && (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.1em', textAlign: 'center', padding: '4px 0' }}>
            — 圣 意 —
          </div>
          {PROLOGUE_OPTIONS.map((option, index) => (
            <button
              key={index}
              className="prologue-choice"
              disabled={isProcessing}
              onClick={async () => {
                setShowPrologueOptions(false);
                setSelectedOption(option);
                const response = option.innerThought + '\n\n' + option.monkResponse + '\n\n' + PROLOGUE_TRANSITION;
                await typewriterEffect(response);
                setGameState((draft: any) => {
                  draft.meta.prologue_phase = 'complete';
                  draft.meta.prologue_complete = true;
                });
              }}
            >
              <span style={{ fontSize: '12px', color: C.muted, marginRight: '10px' }}>
                {['一', '二', '三', '四'][index] ?? String(index + 1)}
              </span>
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* ── Action dashboard (after prologue, not in court mode) ── */}
      {prologuePhase === 'complete' && !courtMode && (
        <div className="fade-up">
          <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.1em', marginBottom: '12px' }}>
            {ACTION_PANEL_TITLE}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>

            {/* 临朝听政 → opens court mode AND triggers briefing */}
            <button
              className="btn-dark"
              disabled={isProcessing}
              onClick={() => {
                setCourtMode(true);
                submitCommand('临朝听政');
              }}
            >
              📋 临朝听政
            </button>

            {/* 前往 submenu */}
            <div className="submenu-wrap">
              <button className="btn-ghost" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'location' ? null : 'location'); }}>
                🏯 前往 ▾
              </button>
              <div className={`submenu${openMenu === 'location' ? ' open' : ''}`}>
                {LOCATION_OPTIONS.map(loc => (
                  <button key={loc.id} onClick={() => { submitCommand(loc.command); setOpenMenu(null); }} title={loc.description}>
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 召见 submenu */}
            <div className="submenu-wrap">
              <button className="btn-ghost" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'summon' ? null : 'summon'); }}>
                👤 召见 ▾
              </button>
              <div className={`submenu${openMenu === 'summon' ? ' open' : ''}`}>
                {(state?.npcs?.filter((n: any) => n.status === 'active') ?? []).length > 0
                  ? state.npcs
                      .filter((n: any) => n.status === 'active')
                      .map((npc: any) => (
                        <button
                          key={npc.id}
                          title={`${npc.role} · ${npc.faction}派`}
                          onClick={() => { submitCommand(`召见${npc.name}`, npc.id); setOpenMenu(null); }}
                        >
                          {npc.name}
                        </button>
                      ))
                  : <button disabled>暂无可用大臣</button>
                }
              </div>
            </div>

            <button className="btn-ghost" onClick={() => location.hash = '/chronicle'}>
              📜 史册
            </button>

            <button className="btn-ghost" onClick={() => setShowPolicyPanel(true)}>
              📋 颁布政策
            </button>
          </div>
        </div>
      )}

      {/* ── Court input: only visible in court mode ── */}
      {prologuePhase === 'complete' && courtMode && (
        <div className="fade-up" style={{
          border: `1px solid ${C.borderI}`, borderRadius: '12px',
          padding: '22px 28px', background: C.cream,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: C.muted, letterSpacing: '0.06em' }}>
              临朝听政 · 下达旨意
            </span>
            <button
              className="btn-pill"
              onClick={() => { setCourtMode(false); setCommand(''); }}
            >
              退朝
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              className="court-input"
              rows={2}
              value={command}
              placeholder="输入你的旨意……（Enter 送达，Shift+Enter 换行）"
              disabled={isProcessing}
              onChange={(e) => setCommand((e.target as HTMLTextAreaElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitCommand();
                }
              }}
            />
            <button
              className="btn-dark"
              style={{ whiteSpace: 'nowrap', padding: '0 22px' }}
              disabled={isProcessing || !command.trim()}
              onClick={() => submitCommand()}
            >
              {isProcessing ? '处理中…' : '下旨'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Event modal ────────────────────────────────────────────────────────────────
  const eventModal = showEventModal && currentEvent && (() => {
    const { template } = currentEvent;
    const sc = SEV_COLORS[template.severity] ?? C.muted;
    return (
      <div className="event-overlay">
        <div className="event-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.ink, marginBottom: '8px' }}>
                {template.name}
              </h2>
              <span style={{
                fontSize: '12px', padding: '3px 10px', borderRadius: '9999px',
                color: sc, background: `${sc}18`, border: `1px solid ${sc}40`,
              }}>
                {SEV_LABELS[template.severity] ?? '未知'}
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '15px', lineHeight: 1.9, color: C.ink82, whiteSpace: 'pre-wrap',
            padding: '20px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
            marginBottom: '22px',
          }}>
            {eventNarrative}
          </div>

          <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.08em', marginBottom: '12px' }}>
            — 如何应对 —
          </div>

          {template.choices.map((choice: any) => (
            <button key={choice.id} className="choice-btn" disabled={isProcessing} onClick={() => handleEventChoice(choice.id)}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink, marginBottom: '4px' }}>
                {choice.label}
              </div>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '10px' }}>
                {choice.description}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(choice.effects ?? {}).map(([key, val]) => {
                  const v = val as number;
                  const pos = v > 0;
                  const ec = pos ? C.safe : C.danger;
                  return (
                    <span key={key} style={{
                      fontSize: '12px', padding: '2px 8px', borderRadius: '9999px',
                      color: ec, background: `${ec}18`, border: `1px solid ${ec}35`,
                    }}>
                      {EFFECT_LABELS[key] ?? key} {pos ? '+' : ''}{v}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button className="btn-ghost" onClick={closeEventModal}>稍后处理</button>
          </div>
        </div>
      </div>
    );
  })();

  // ─── Root render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: FONT, color: C.ink }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Demo mode warning */}
        {demoMode && (
          <div className="demo-banner">
            <span>⚠</span>
            <span>演示模式 — 前往</span>
            <button
              style={{ color: C.warn, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: '13px', padding: '0 2px' }}
              onClick={() => location.hash = '/settings'}
            >
              设置
            </button>
            <span>配置 LLM 后即可开始</span>
          </div>
        )}

        {/* Offline earnings */}
        {offlineEarnings && (
          <div className="offline-banner">
            <span style={{ flexShrink: 0 }}>💤</span>
            <span>
              离开 {offlineEarnings.hours > 0 ? `${offlineEarnings.hours}小时` : ''}
              {offlineEarnings.minutes}分钟，
              粮仓 +{offlineEarnings.food.toFixed(1)} 石，
              国库 +{offlineEarnings.fiscal.toFixed(1)} 两
              {offlineEarnings.military < 0 ? `，军费 -${Math.abs(offlineEarnings.military).toFixed(1)} 两` : ''}
            </span>
            <button className="btn-pill" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={() => setOfflineEarnings(null)}>
              知道了
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,260px) 1fr',
          gap: '28px',
          alignItems: 'start',
        }}>
          {sidebar}
          {mainContent}
        </div>
      </main>

      {/* Policy panel */}
      {showPolicyPanel && (
        <PolicyPanel
          state={state}
          onPolicyEnacted={(narrative) => { setNarration(narrative); setShowPolicyPanel(false); }}
          onClose={() => setShowPolicyPanel(false)}
        />
      )}

      {/* Event modal */}
      {eventModal}
    </div>
  );
}
