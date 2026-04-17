import { useState, useEffect, useRef } from 'preact/hooks';
import { getState, subscribe, setState as setGameState } from '../engine/state';
import { processCommand } from '../engine/narrator';
import { NpcCard } from './components/NpcCard';
import { LoadingShimmer } from './components/LoadingShimmer';
import { useToast } from './components/Toast';
import { getDefaultAdapter } from '../engine/save';
import { NoLLMConfigError } from '../engine/llm';
import { renderTemplate } from '../engine/templates';
import { getLLMConfig } from '../engine/llm';

export function CourtPage() {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [narration, setNarration] = useState('');
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [state, setState] = useState(getState());
  const narrationRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  
  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
    });
    
    return unsubscribe;

  }, []);

  const saveGame = async () => {
    try {
      const adapter = getDefaultAdapter();
      await adapter.save('slot-1', getState());
      addToast('success', '已保存 ✓');
    } catch (error) {
      console.error('Save failed:', error);
      addToast('error', '保存失败');
    }
  };

  // 检查LLM配置
  useEffect(() => {
    if (!getLLMConfig()) {
      setDemoMode(true);
    }
  }, []);
  
  // 提交指令
  const submitCommand = async () => {
    if (!command.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setNarration('');

    try {
    // 降级模式检查
    if (demoMode) {
      // 直接从 TEMPLATES 取一条 C 档文案显示
      const fallback = renderTemplate('weather_good', { year: state.world.year });
      if (fallback) await typewriterEffect(fallback);
      setCommand('');
      addToast('info', '当前为演示模式');
      return;
    }
      // 选目标 NPC（MVP 简单策略：取第一个 active NPC）
      const targetNpc = state.npcs.find(n => n.status === 'active');
      if (!targetNpc) {
        addToast('error', '没有可用的NPC');
        return;
      }
      setActiveNpcId(targetNpc.id);

      // 调用 processCommand
      const result = await processCommand(command, state, targetNpc.id);

      // 更新 state
      setGameState(draft => {
        // 写入史册
        const entry = { ...result.chronicle_entry, id: `entry-${Date.now()}` };
        draft.chronicle.official.unshift(entry);  // 最新的在前

        // 写入 raw_log
        draft.events.raw_logs.push({
          year: draft.world.year,
          kind: 'command',
          payload: { command, decision: result.decision }
        });

        // 更新 NPC 状态（简单示例）
        const npc = draft.npcs.find(n => n.id === targetNpc.id);
        if (npc) {
          npc.state.recent_events.unshift(`${draft.world.year}年：${result.decision.final_action}`);
          if (npc.state.recent_events.length > 3) npc.state.recent_events.pop();
        }

        // 推进年份
        draft.world.year += 1;
      });

      // 自动保存
      try {
    // 降级模式检查
    if (demoMode) {
      // 直接从 TEMPLATES 取一条 C 档文案显示
      const fallback = renderTemplate('weather_good', { year: state.world.year });
      if (fallback) await typewriterEffect(fallback);
      setCommand('');
      addToast('info', '当前为演示模式');
      return;
    }
        const adapter = getDefaultAdapter();
        await adapter.save('slot-1', getState());
      } catch (saveError) {
        console.error('Auto-save failed:', saveError);
      }

      // 打字机显示叙事
      await typewriterEffect(result.narration);

      // 清空输入框
      setCommand('');

      addToast('success', '指令已处理');
    } catch (error) {
      console.error('Failed to process command:', error);

      if (error instanceof NoLLMConfigError) {
        // 跳转设置页
        location.hash = '/settings';
      } else {
        // 显示错误 toast
        addToast('error', `生成失败: ${error instanceof Error ? error.message : '未知错误'}`);

        // 降级：从 TEMPLATES 取一条 C 档文案显示
        const fallback = renderTemplate('weather_good', { year: getState().world.year });
        if (fallback) await typewriterEffect(fallback);
      }
    } finally {
      setIsProcessing(false);
      setActiveNpcId(null);
    }
  };
  
  // 打字机效果
  const typewriterEffect = async (text: string) => {
    const chars = text.split('');
    let currentText = '';
    
    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i];
      setNarration(currentText);
      
      // 滚动到底部
      if (narrationRef.current) {
        narrationRef.current.scrollTop = narrationRef.current.scrollHeight;
      }
      
      // 控制速度
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };
  
  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitCommand();
    }
  };
  
  return (
    <div className="court-page">
      <div className="container">
        {demoMode && (
          <div className="court-page__demo-warning" style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
            当前为只读演示模式，请先配置 LLM
          </div>
        )}
        {/* 场景文字区 */}
        <div className="court-page__scene card">
          <p className="court-page__scene-text">
            {state.world.dynasty}·{state.world.era}{state.world.year}年，金銮殿上，皇帝端坐龙椅，目光扫过殿下群臣。空气中弥漫着{state.world.tone}的气息。
          </p>
        </div>
        
        {/* NPC 卡片行 */}
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
        
        {/* 叙事输出区 */}
        <div className="court-page__narration card" ref={narrationRef}>
          {isProcessing && !narration ? (
            <LoadingShimmer lines={5} />
          ) : narration ? (
            <div className="court-page__narration-text">
              {narration}
            </div>
          ) : (
            <div className="court-page__narration-placeholder">
              <p>请下达您的旨意...</p>
              <p className="text-muted">例如："加税三成"、"任命张三为兵部尚书"、"调兵北疆"</p>
            </div>
          )}
        </div>
        
        {/* 指令输入框 */}
        <div className="court-page__input">
          <textarea
            className="input court-page__command-input"
            value={command}
            onChange={(e) => setCommand((e.target as HTMLTextAreaElement).value)}
            onKeyDown={handleKeyDown}
            placeholder="请示陛下……"
            disabled={isProcessing}
            rows={3}
          />
          <button
            className="btn btn-primary court-page__submit-btn"
            onClick={submitCommand}
            disabled={isProcessing || !command.trim()}
          >
            {isProcessing ? '处理中...' : '下达旨意'}
          </button>
          <button
            className="btn btn-secondary court-page__save-btn"
            onClick={saveGame}
            disabled={isProcessing}
            style="margin-left: 8px;"
          >
            存档
          </button>
        </div>
      </div>
    </div>
  );
}

  // 保存游戏
