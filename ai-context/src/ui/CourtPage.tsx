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

  // 放置积累系统 - 把资源变化放进 setGameState 的 updater
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(draft => {
        if (draft.meta.prologue_complete) {
          const rates = calcIdleRates(draft);
          applyIdleAccumulation(draft, rates, IDLE_INTERVAL_MS / 60_000);
          draft.meta.last_idle_tick_at = new Date().toISOString();
        }
      });
    }, IDLE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // 离线补算逻辑
  useEffect(() => {
    const initOfflineEarnings = async () => {
      try {
        const currentState = getState();
        if (!currentState.meta.prologue_complete) return;

        const lastTick = new Date(currentState.meta.last_idle_tick_at).getTime();
        const now = Date.now();
        let offlineMs = now - lastTick;

        // 上限截断：24小时
        const maxOfflineMs = MAX_OFFLINE_HOURS * 60 * 60 * 1000;
        offlineMs = Math.min(offlineMs, maxOfflineMs);

        if (offlineMs > 60_000) {  // 超过1分钟才计算
          const minutes = offlineMs / 60_000;

          // 把资源变化放进 setGameState 的 updater
          setGameState(draft => {
            const rates = calcIdleRates(draft);
            applyIdleAccumulation(draft, rates, minutes);
            draft.meta.last_idle_tick_at = new Date().toISOString();
          });

          // 为通知显示预先计算收益
          const rates = calcIdleRates(currentState);
          const foodGained = rates.food * minutes;
          const fiscalGained = rates.fiscal * minutes;
          const militaryDrained = rates.military * minutes;

          const hours = Math.floor(minutes / 60);
          const mins = Math.floor(minutes % 60);
          setOfflineEarnings({
            hours,
            minutes: mins,
            food: foodGained,
            fiscal: fiscalGained,
            military: militaryDrained
          });

          // 5秒后自动消失
          setTimeout(() => setOfflineEarnings(null), 5000);
        }
      } catch (error) {
        console.error('离线补算失败:', error);
      }
    };

    initOfflineEarnings();
  }, []);

  // 游戏初始化
  useEffect(() => {
    const initGame = async () => {
      let currentState;
      try {
        currentState = getState();
      } catch (error) {
        console.log('游戏状态未初始化，跳过自动触发');
        return;
      }

      // 阶段一：穿越内心戏
      if (currentState.meta.prologue_phase === 'awakening') {
        setTimeout(async () => {
          try {
            await typewriterEffect(PROLOGUE_AWAKENING);
            // 切换到国师介绍阶段
            setGameState(draft => {
              draft.meta.prologue_phase = 'guoshi_intro';
            });
            // 显示国师出场 + 察觉台词
            await typewriterEffect('\n\n' + PROLOGUE_GUOSHI_ENTRY);
            await typewriterEffect('\n\n' + PROLOGUE_GUOSHI_NOTICE);
            setShowPrologueOptions(true);
          } catch (error) {
            console.error('开场显示失败:', error);
          }
        }, 500);
        return;
      }

      // 阶段二：国师引导对话
      if (currentState.meta.prologue_phase === 'guoshi_intro') {
        setShowPrologueOptions(true);
        return;
      }

      // 阶段三：开场已完成，执行正常初始化
      setTimeout(async () => {
        try {
          console.log('游戏初始化：触发第一个 tick');
          setIsProcessing(true);

          const tickResult = await executeTick(getState(), '');

          if (tickResult.narration) {
            await typewriterEffect(tickResult.narration);
          } else if (demoMode) {
            const fallback = renderTemplate('weather_good', { year: getState().world.year });
            if (fallback) await typewriterEffect(fallback);
          }

          setIsProcessing(false);
        } catch (error) {
          console.error('游戏初始化失败:', error);
          setIsProcessing(false);
        }
      }, 1000);
    };

    initGame();
  }, []);

  // 处理开场选项选择
  const handlePrologueOption = async (option: PrologueOption) => {
    setShowPrologueOptions(false);
    setSelectedOption(option);

    // 显示玩家选择的选项（内心独白）
    await typewriterEffect('\n\n' + option.innerThought);

    // 显示国师回应
    await typewriterEffect('\n\n' + option.monkResponse);

    // 显示过渡句
    await typewriterEffect('\n\n' + PROLOGUE_TRANSITION);

    // 标记开场完成
    setGameState(draft => {
      draft.meta.prologue_phase = 'complete';
      draft.meta.prologue_complete = true;
    });
  };

  const saveGame = async () => {
    try {
      await getDefaultAdapter().save('slot-1', getState());
      addToast('success', '已保存 ✓');
    } catch {
      addToast('error', '保存失败');
    }
  };

  // submitCommand 接受可选的 override 参数
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

  const typewriterEffect = async (text: string) => {
    let currentText = '';
    for (const char of text) {
      currentText += char;
      setNarration(currentText);
      if (narrationRef.current) {
        narrationRef.current.scrollTop = narrationRef.current.scrollHeight;
      }
      await new Promise(resolve => setTimeout(resolve, 28));
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveGame();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitCommand();
    }
  };

  // 如果状态未初始化，显示加载状态
  if (!state) {
    return (
      <div className="court-page">
        <div className="loading-container">
          <p>游戏加载中...</p>
        </div>
      </div>
    );
  }

  // 渲染开场选项
  const renderPrologueOptions = () => {
    if (!showPrologueOptions || prologuePhase !== 'guoshi_intro') return null;

    return (
      <div className="prologue-options">
        <p className="prologue-prompt">你决定：</p>
        {PROLOGUE_OPTIONS.map(option => (
          <button 
            key={option.id}
            className="prologue-option"
            onClick={() => handlePrologueOption(option)}
          >
            <span className="option-inner">{option.innerThought}</span>
            <span className="option-text">{option.text}</span>
          </button>
        ))}
      </div>
    );
  };

  // 渲染执行面板
  const renderActionDashboard = () => {
    if (prologuePhase !== 'complete') return null;

    return (
      <div className="action-dashboard">
        <h3>{ACTION_PANEL_TITLE}</h3>
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

          <button 
            className="action-button"
            onClick={() => submitCommand('召见大臣')}
          >
            👤 召见
          </button>

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
            onKeyDown={handleKeyDown}
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
        <PolicyPanel onClose={() => setShowPolicyPanel(false)} />
      )}
    </div>
  );
}
