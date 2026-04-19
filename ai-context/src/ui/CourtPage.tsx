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

export function CourtPage() {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [narration, setNarration] = useState('');
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [demoMode] = useState(!getLLMConfig());
  const [showPolicyPanel, setShowPolicyPanel] = useState(false);
  const [state, setState] = useState(() => {
    try {
      return getState();
    } catch {
      return null;
    }
  });

  // 从 state.meta.prologue_phase 读取，不单独维护 React state
  const prologuePhase = state?.meta?.prologue_phase ?? 'awakening';
  const [showPrologueOptions, setShowPrologueOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PrologueOption | null>(null);

  // 离线收益通知
  const [offlineEarnings, setOfflineEarnings] = useState<{ hours: number; minutes: number; food: number; fiscal: number; military: number } | null>(null);

  // 事件弹层状态
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [eventNarrative, setEventNarrative] = useState('');

  const narrationRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    return subscribe((newState) => setState(newState));
  }, []);

  // 添加全局键盘事件监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveGame();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 检查是否有待处理的事件
  useEffect(() => {
    if (state?.events?.pending?.length > 0 && !showEventModal) {
      const pendingEvent = state.events.pending[0];
      const template = EVENT_TEMPLATES.find(t => t.id === pendingEvent.template_id);

      if (template) {
        setCurrentEvent({
          template,
          pendingEvent
        });
        setEventNarrative(template.description);
        setShowEventModal(true);
      }
    }
  }, [state?.events?.pending, showEventModal]);

  // 离线收益计算
  useEffect(() => {
    if (!state?.meta?.last_idle_tick_at) return;

    const lastTick = new Date(state.meta.last_idle_tick_at).getTime();
    const now = Date.now();
    const offlineMs = Math.min(now - lastTick, MAX_OFFLINE_HOURS * 3600 * 1000);

    if (offlineMs > IDLE_INTERVAL_MS) {
      const earnings = calcIdleRates(state);
      const hours = Math.floor(offlineMs / 3600000);
      const minutes = Math.floor((offlineMs % 3600000) / 60000);

      setOfflineEarnings({
        hours,
        minutes,
        food: earnings.food * (offlineMs / 60000),
        fiscal: earnings.fiscal * (offlineMs / 60000),
        military: earnings.military * (offlineMs / 60000)
      });

      // 应用离线收益
      const newState = applyIdleAccumulation(state, earnings, offlineMs / 60000);
      setGameState(newState);

      // 更新最后放置时间
      setGameState(draft => {
        draft.meta.last_idle_tick_at = new Date().toISOString();
      });
    }
  }, [state?.meta?.last_idle_tick_at]);

  // 处理事件选择
  const handleEventChoice = (choiceId: string) => {
    if (!currentEvent) return;

    const { template } = currentEvent;
    const result = resolveEventChoice(state, template.id, choiceId);

    setGameState(draft => {
      Object.assign(draft, result.newState);

      // 从pending中移除已处理的事件
      draft.events.pending = draft.events.pending.filter(
        (e: any) => e.template_id !== template.id
      );

      // 添加到史册
      draft.chronicle.official.unshift({
        id: `event-${Date.now()}`,
        year: draft.world.year,
        kind: 'event',
        title: template.name,
        summary: result.narrative,
        impact: template.choices.find(c => c.id === choiceId)?.effects || {}
      });
    });

    setShowEventModal(false);
    setCurrentEvent(null);
    setEventNarrative('');

    addToast('success', `事件已处理：${template.name}`);

    // 显示处理结果
    setNarration(result.narrative);
  };

  // 关闭事件弹层（不处理事件）
  const closeEventModal = () => {
    setShowEventModal(false);
    setCurrentEvent(null);
    setEventNarrative('');
  };

  // 保存游戏
  const saveGame = async () => {
    try {
      await getDefaultAdapter().save('slot-1', getState());
      addToast('success', '游戏已保存');
    } catch (error) {
      addToast('error', '保存失败');
    }
  };

  // 打字机效果
  const typewriterEffect = async (text: string) => {
    let currentText = '';
    for (const char of text) {
      currentText += char;
      setNarration(currentText);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };

  // 提交命令
  const submitCommand = async (overrideCommand?: string) => {
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

      const targetNpc =
        (activeNpcId ? state.npcs.find(n => n.id === activeNpcId && n.status === 'active') : null)
        ?? state.npcs.find(n => n.status === 'active');

      if (!targetNpc) {
        addToast('error', '没有可用的NPC');
        return;
      }
      setActiveNpcId(targetNpc.id);

      const tickResult = await executeTick(state, commandToExecute, { 
        targetNpcId: targetNpc.id 
      });

      setGameState(draft => {
        Object.assign(draft, tickResult.newState);

        if (tickResult.chronicle_entry) {
          const entry = { ...tickResult.chronicle_entry, id: `entry-${Date.now()}` };
          draft.chronicle.official.unshift(entry);
        }

        if (tickResult.decision) {
          draft.events.raw_logs.push({
            year: draft.world.year,
            kind: 'command',
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
            id: `end-${draft.world.year}`,
            triggered_year: draft.world.year,
            template_id: 'game_end',
            severity: 5,
            raw_payload: { reason: endCheck.reason },
            seal: 'bloody',
            narrated: false,
          });
        }
      });

      try {
        await getDefaultAdapter().save('slot-1', getState());
      } catch { /* auto-save best-effort */ }

      if (tickResult.narration) {
        await typewriterEffect(tickResult.narration);
      }

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

  // 渲染开场选项
  const renderPrologueOptions = () => {
    if (prologuePhase === 'complete' || !showPrologueOptions) return null;

    const options = PROLOGUE_OPTIONS[prologuePhase] || [];

    return (
      <div className="prologue-options">
        {options.map((option, index) => (
          <button 
            key={index}
            onClick={() => {
              setSelectedOption(option);
              submitCommand(option.command);
            }}
            disabled={isProcessing}
          >
            {option.text}
          </button>
        ))}
      </div>
    );
  };

  // 渲染行动面板
  const renderActionDashboard = () => {
    if (prologuePhase !== 'complete') return null;

    return (
      <div className="action-dashboard">
        <div className="action-title">{ACTION_PANEL_TITLE}</div>
        <div className="action-buttons">
          <button 
            className="action-button"
            onClick={() => submitCommand('临朝听政')}
            disabled={isProcessing}
          >
            📋 临朝听政
          </button>

          <div className="action-with-submenu">
            <button className="action-button">🏯 前往</button>
            <div className="submenu">
              {LOCATION_OPTIONS.map(loc => (
                <button 
                  key={loc.id}
                  onClick={() => submitCommand(loc.command)}
                  title={loc.description}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="action-with-submenu">
            <button className="action-button">👤 召见</button>
            <div className="submenu">
              {state?.npcs
                ?.filter(npc => npc.status === 'active')
                .map(npc => (
                  <button 
                    key={npc.id}
                    onClick={() => submitCommand(`召见${npc.name}`)}
                    title={`${npc.role} - ${npc.faction}派`}
                  >
                    {npc.name}
                  </button>
                ))
              }
              {state?.npcs?.filter(npc => npc.status === 'active').length === 0 && (
                <button disabled>暂无可用大臣</button>
              )}
            </div>
          </div>

          <button 
            className="action-button"
            onClick={() => location.hash = '/chronicle'}
          >
            📜 查阅史册
          </button>

          <button 
            className="action-button"
            onClick={() => setShowPolicyPanel(true)}
          >
            📋 颁布政策
          </button>
        </div>
      </div>
    );
  };

  // 渲染事件弹层
  const renderEventModal = () => {
    if (!showEventModal || !currentEvent) return null;

    const { template } = currentEvent;
    const severityText = ['', '轻微', '中等', '严重'][template.severity] || '未知';
    const severityColor = ['', '#4a7c59', '#b8922a', '#8b1a1a'][template.severity] || '#6b6b6b';

    return (
      <div className="event-modal-overlay">
        <div className="event-modal">
          <div className="event-modal-header">
            <h2>{template.name}</h2>
            <span 
              className="event-severity"
              style={{ 
                backgroundColor: `${severityColor}22`,
                color: severityColor,
                border: `1px solid ${severityColor}`
              }}
            >
              {severityText}
            </span>
          </div>

          <div className="event-modal-content">
            <p className="event-narrative">{eventNarrative}</p>

            <div className="event-choices">
              <h3>如何应对？</h3>
              {template.choices.map((choice: any) => (
                <button
                  key={choice.id}
                  className="event-choice-button"
                  onClick={() => handleEventChoice(choice.id)}
                  disabled={isProcessing}
                >
                  <div className="choice-label">{choice.label}</div>
                  <div className="choice-description">{choice.description}</div>
                  <div className="choice-effects">
                    {Object.entries(choice.effects).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        morale: '民心', fiscal: '国库', military: '军力', food: '粮食',
                        threat: '外患', commerce: '商业', eunuch: '宦官', faction: '党争',
                        population: '人口', land_fertility: '土地肥力', disaster_relief: '赈灾'
                      };
                      const label = labels[key] || key;
                      const sign = (value as number) > 0 ? '+' : '';
                      return (
                        <span key={key} className="effect-tag">
                          {label} {sign}{value as number}
                        </span>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="event-modal-footer">
            <button 
              className="event-close-button"
              onClick={closeEventModal}
            >
              稍后处理
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染离线收益通知
  const renderOfflineEarnings = () => {
    if (!offlineEarnings) return null;

    return (
      <div className="offline-earnings">
        离开期间（{offlineEarnings.hours}小时{offlineEarnings.minutes}分钟），帝国持续运转——
        粮仓：+{offlineEarnings.food.toFixed(1)} 石　国库：+{offlineEarnings.fiscal.toFixed(1)} 两
        {offlineEarnings.military < 0 && `　军费消耗：${Math.abs(offlineEarnings.military).toFixed(1)} 两`}
      </div>
    );
  };

  return (
    <div className="page-layout">
      <Navbar />

      {renderOfflineEarnings()}

      <div className="court-content">
        <div className="narration-area" ref={narrationRef}>
          {narration || <LoadingShimmer />}
        </div>

        {renderPrologueOptions()}

        {renderActionDashboard()}

        <div className="command-area">
          <textarea
            value={command}
            onChange={(e) => setCommand((e.target as HTMLTextAreaElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitCommand();
              }
            }}
            placeholder="输入你的旨意..."
            disabled={isProcessing || prologuePhase !== 'complete'}
          />
          <button 
            onClick={() => submitCommand()}
            disabled={isProcessing || !command.trim() || prologuePhase !== 'complete'}
          >
            {isProcessing ? '处理中...' : '下旨'}
          </button>
        </div>
      </div>

      {showPolicyPanel && (
        <PolicyPanel 
          state={state}
          onPolicyEnacted={(narrative) => {
            setNarration(narrative);
            setShowPolicyPanel(false);
          }}
          onClose={() => setShowPolicyPanel(false)}
        />
      )}

      {renderEventModal()}
    </div>
  );
}
