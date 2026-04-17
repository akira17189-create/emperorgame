import { useState, useEffect, useRef } from 'preact/hooks';
import { getState, subscribe, setState as setGameState } from '../engine/state';
import { processCommand } from '../engine/narrator';
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
  const [state, setState] = useState(getState());
  const narrationRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    return subscribe((newState) => setState(newState));
  }, []);

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

      const targetNpc = state.npcs.find(n => n.status === 'active');
      if (!targetNpc) {
        addToast('error', '没有可用的NPC');
        return;
      }
      setActiveNpcId(targetNpc.id);

      const result = await processCommand(command, state, targetNpc.id);

      setGameState(draft => {
        const entry = { ...result.chronicle_entry, id: `entry-${Date.now()}` };
        draft.chronicle.official.unshift(entry);

        draft.events.raw_logs.push({
          year: draft.world.year,
          kind: 'command',
          payload: { command, decision: result.decision }
        });

        const npc = draft.npcs.find(n => n.id === targetNpc.id);
        if (npc) {
          npc.state.recent_events.unshift(`${draft.world.year}年：${result.decision.final_action}`);
          if (npc.state.recent_events.length > 3) npc.state.recent_events.pop();
        }

        draft.world.year += 1;
      });

      try {
        await getDefaultAdapter().save('slot-1', getState());
      } catch { /* auto-save best-effort */ }

      await typewriterEffect(result.narration);
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
      setActiveNpcId(null);
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
                onClick={() => setActiveNpcId(npc.id)}
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
