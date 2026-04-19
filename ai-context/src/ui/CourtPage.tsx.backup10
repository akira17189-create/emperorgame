import { useState, useEffect, useRef } from 'preact/hooks';
import { getState, subscribe, setState as setGameState } from '../engine/state';
import { executeTick } from '../engine/tick';
import { checkGameEndConditions } from '../engine/phases/narration';
import { NpcCard } from './components/NpcCard';
import { LoadingShimmer } from './components/LoadingShimmer';
import { Navbar } from './components/Navbar';
import { useToast } from './components/Toast';
import { getDefaultAdapter } from '../engine/save';
import { NoLLMConfigError, getLLMConfig } from '../engine/llm';
import { renderTemplate } from '../engine/templates';

export function CourtPage() {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [narration, setNarration] = useState('');
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [demoMode] = useState(!getLLMConfig());
  const [state, setState] = useState(() => {
    try {
      return getState();
    } catch {
      return null;
    }
  });
  const narrationRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    return subscribe((newState) => setState(newState));
  }, []);

// 游戏初始化时自动触发第一个 tick，让NPC主动发言
useEffect(() => {
  const initGame = async () => {
    // 检查状态是否已初始化
    let currentState;
    try {
      currentState = getState();
    } catch (error) {
      console.log('游戏状态未初始化，跳过自动触发');
      return;
    }
    
    if (!currentState.narration || currentState.narration.trim() === '') {
      // 延迟一点执行，让界面先渲染完成
      setTimeout(async () => {
        try {
          console.log('游戏初始化：触发第一个 tick');
          setIsProcessing(true);

          const tickResult = await executeTick(getState(), '');

          // 显示叙事文本
          if (tickResult.narration) {
            await typewriterEffect(tickResult.narration);
          } else if (demoMode) {
            // 演示模式使用模板
            const fallback = renderTemplate('weather_good', { year: getState().world.year });
            if (fallback) await typewriterEffect(fallback);
          }

          setIsProcessing(false);
        } catch (error) {
          console.error('游戏初始化失败:', error);
          setIsProcessing(false);
        }
      }, 1000);
    }
  };
  
  initGame();
}, []); // 空依赖数组，只在组件挂载时执行一次

  const saveGame = async () => {
    try {
      await getDefaultAdapter().save('slot-1', getState());
      addToast('success', '已保存 ✓');
    } catch {
      addToast('error', '保存失败');
    }
  };

  const submitCommand = async () => {
    if (!command.trim() || isProcessing) return;

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

      // 优先使用已选中的 NPC，否则取第一个活跃 NPC
      const targetNpc =
        (activeNpcId ? state.npcs.find(n => n.id === activeNpcId && n.status === 'active') : null)
        ?? state.npcs.find(n => n.status === 'active');

      if (!targetNpc) {
        addToast('error', '没有可用的NPC');
        return;
      }
      setActiveNpcId(targetNpc.id);

      // 使用统一的入口调用gameTick
      const tickResult = await executeTick(state, command, { 
        targetNpcId: targetNpc.id 
      });

      // 应用游戏状态更新
      setGameState(draft => {
        // 1. 更新游戏状态
        Object.assign(draft, tickResult.newState);

        // 2. 写入chronicle（如果有）
        if (tickResult.chronicle_entry) {
          const entry = { ...tickResult.chronicle_entry, id: `entry-${Date.now()}` };
          draft.chronicle.official.unshift(entry);
        }

        // 3. 写入原始日志
        if (tickResult.decision) {
          draft.events.raw_logs.push({
            year: draft.world.year,
            kind: 'command',
            payload: { command, decision: tickResult.decision }
          });
        }

        // 4. 将 tick 事件追加进待叙述队列
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

        // 5. 检查游戏结束
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

      // 自动保存
      try {
        await getDefaultAdapter().save('slot-1', getState());
      } catch { /* auto-save best-effort */ }

      // 显示叙事文本
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

  return (
    <div className="page-layout">
      <Navbar />

      <main className="court-page">
        <div className="container">
          {demoMode && (
            <div className="banner banner--warning">
              演示模式 — 未配置 LLM，叙事将使用模板文案。
              <a href="#/settings" className="banner__link">立即配置 →</a>
            </div>
          )}

          {/* 场景描述 */}
          <div className="scene-card">
            <div className="scene-card__ornament" />
            <p className="scene-card__text">
              {state.world.dynasty}·{state.world.era}{state.world.year}年，金銮殿上，皇帝端坐龙椅，目光扫过殿下群臣。空气中弥漫着<em>{state.world.tone}</em>的气息。
            </p>
            <div className="scene-card__ornament scene-card__ornament--right" />
          </div>

          {/* NPC 卡片 */}
          <div className="court-page__npcs">
            {state.npcs.filter(npc => npc.status === 'active').slice(0, 3).map(npc => (
              <NpcCard
                key={npc.id}
                npc={npc}
                isActive={activeNpcId === npc.id}
                onClick={async () => {
                // 切换选中状态
                setActiveNpcId(npc.id === activeNpcId ? null : npc.id);

                // 如果点击的是未激活的NPC，触发该NPC发言
                if (npc.id !== activeNpcId && npc.status === 'active' && !isProcessing) {
                  try {
                    setIsProcessing(true);
                    setNarration('');

                    const currentState = getState();
                    const tickResult = await executeTick(currentState, '', {
                      targetNpcId: npc.id
                    });

                    // 更新全局状态
                    const { setState: updateGlobalState } = await import('../engine/state');
                    updateGlobalState(tickResult.state);

                    // 显示叙事文本
                    if (tickResult.narration) {
                      await typewriterEffect(tickResult.narration);
                    }

                    setIsProcessing(false);
                  } catch (error) {
                    console.error('NPC发言失败:', error);
                    setIsProcessing(false);
                  }
                }
              }}
              />
            ))}
          </div>

          {/* 叙事卷轴 */}
          <div className="scroll-panel" ref={narrationRef}>
            <div className="scroll-panel__inner">
              {isProcessing && !narration ? (
                <LoadingShimmer lines={5} />
              ) : narration ? (
                <p className="scroll-panel__text">{narration}</p>
              ) : (
                <p className="scroll-panel__placeholder">请下达您的旨意……</p>
              )}
            </div>
          </div>

          {/* 指令输入 */}
          <div className="command-bar">
            <textarea
              className="input command-bar__input"
              value={command}
              onChange={(e) => setCommand((e.target as HTMLTextAreaElement).value)}
              onKeyDown={handleKeyDown}
              placeholder="请示陛下……（Enter 发送，Shift+Enter 换行）"
              disabled={isProcessing}
              rows={3}
            />
            <div className="command-bar__actions">
              <button
                className="btn btn-primary"
                onClick={submitCommand}
                disabled={isProcessing || !command.trim()}
              >
                {isProcessing ? '处理中…' : '下达旨意'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={saveGame}
                disabled={isProcessing}
              >
                存档
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}