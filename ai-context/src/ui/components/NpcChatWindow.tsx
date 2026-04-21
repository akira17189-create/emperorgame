
// [改造-Phase4] NPC 追问弹窗组件
import { useState } from 'preact/hooks';
import { getState } from '../../engine/state';
import { callWithSceneAnchor, buildSceneAnchor } from '../../engine/llm';
import { seedNpcs } from '../../data/seed-npcs';
import { seedNpcsPhase45 } from '../../data/seed-npcs-phase45';
import type { CourtAgenda } from '../../data/prewritten-court';
import { LoadingShimmer } from './LoadingShimmer';

// 导入 prompt 模板（Vite ?raw 导入）
import npcChatWindowPrompt from '../../prompts/npc-chat-window.md?raw';

// 颜色常量（与 CourtPage.tsx 完全一致，不要修改这些值）
const C = {
  cream: '#f7f4ed', ink: '#1c1c1c', offwhite: '#fcfbf8',
  muted: '#5f5f5d', border: '#eceae4', borderI: 'rgba(28,28,28,0.4)',
  ink82: 'rgba(28,28,28,0.82)', ink04: 'rgba(28,28,28,0.04)',
  danger: '#8b1a1a', warn: '#b8922a', safe: '#4a7c59',
};
const FONT = '"Noto Serif SC","Source Han Serif SC",Georgia,serif';
const SHADOW_BTN = 'rgba(255,255,255,0.18) 0 0.5px 0 0 inset,rgba(0,0,0,0.18) 0 0 0 0.5px inset,rgba(0,0,0,0.05) 0 1px 2px 0';

interface NpcChatWindowProps {
  npcId: string;
  agenda: CourtAgenda;               // 当前朝会议题（用于获取 opening_line、stance、fallback_line）
  maxRounds?: number;                // 默认 3，路遇场景传 5
  onClose: () => void;
}

interface Message {
  role: 'npc' | 'player';
  content: string;
  emotion?: string;
}

export function NpcChatWindow({ npcId, agenda, maxRounds = 3, onClose }: NpcChatWindowProps) {
  const allNpcs = [...seedNpcs, ...seedNpcsPhase45];
  const npc = allNpcs.find(n => n.id === npcId);
  const agendaStance = agenda.npc_stances.find(s => s.npc_id === npcId);

  // NPC 不存在则直接不渲染
  if (!npc || !agendaStance) return null;

  const [messages, setMessages] = useState<Message[]>([
    // 第一条是 NPC 的开场语（预写，不调 LLM）
    { role: 'npc', content: agendaStance.opening_line, emotion: '平静' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);       // 玩家已发言轮数
  const [canFollowUp, setCanFollowUp] = useState(true);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !canFollowUp) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'player', content: userMsg }]);
    setIsLoading(true);

    const state = getState();
    const sceneAnchor = buildSceneAnchor(state, agenda.title);

    // 构建历史（只传 role:'user'|'assistant'，不含 NPC 开场语）
    const history = messages
      .filter(m => m.role !== 'npc' || messages.indexOf(m) > 0)
      .map(m => ({
        role: (m.role === 'player' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }));

    // 推断知识范围（基于 bias 字段）
    const topBias = Object.entries(npc.bias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k)
      .join('、');
    const knowledgeScope = `主要了解${topBias}相关事务，对其他领域知之甚少`;

    const result = await callWithSceneAnchor({
      systemPromptTemplate: npcChatWindowPrompt,
      npcData: {
        name: npc.name,
        role: npc.role,
        faction: npc.faction,
        traitsJson: JSON.stringify(npc.traits),
        voiceFeatures: npc.voice.features.join('、'),
        forbiddenPhrases: npc.voice.forbidden_phrases.join('、'),
        biasJson: JSON.stringify(npc.bias),
        knowledgeScope,
        refusalTemplates: agendaStance.fallback_line,
        fallbackLine: agendaStance.fallback_line,
      },
      sceneAnchor,
      history,
      userMessage: userMsg,
      turnIndex: turnCount,
    });

    setIsLoading(false);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    setCanFollowUp(result.allows_followup && newTurn < maxRounds);
    setMessages(prev => [...prev, {
      role: 'npc', content: result.dialogue, emotion: result.emotion
    }]);
  };

  const emotionColorMap: Record<string, string> = {
    '激动': C.danger, '愤怒': C.danger,
    '忧虑': C.warn, '算计': C.warn,
    '神秘': C.muted, '冷漠': C.muted,
    '平静': C.safe,
  };

  return (
    // 使用与 eventModal 一致的遮罩层样式
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(28,28,28,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        background: C.cream, border: `1px solid ${C.border}`, borderRadius: '12px',
        padding: '28px 32px', maxWidth: '520px', width: '100%',
        fontFamily: FONT, maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: C.ink }}>{npc.name}</span>
            <span style={{ fontSize: '12px', color: C.muted, marginLeft: '8px' }}>{npc.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: C.muted }}>
              {canFollowUp ? `还可追问 ${maxRounds - turnCount} 轮` : '已无话可说'}
            </span>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '18px', lineHeight: 1 }}
            >×</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.role === 'player' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}>
              {msg.role === 'npc' && msg.emotion && (
                <div style={{ fontSize: '10px', color: emotionColorMap[msg.emotion] ?? C.muted, marginBottom: '3px' }}>
                  【{msg.emotion}】
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                background: msg.role === 'player' ? C.ink : C.offwhite,
                color: msg.role === 'player' ? C.offwhite : C.ink82,
                borderRadius: msg.role === 'player' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                fontSize: '14px', lineHeight: 1.7,
                border: msg.role === 'npc' ? `1px solid ${C.border}` : 'none',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <LoadingShimmer />}
        </div>

        {/* Input or close button */}
        {canFollowUp ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={inputValue}
              onInput={(e) => setInputValue((e.target as HTMLTextAreaElement).value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="向此人追问…"
              rows={2}
              disabled={isLoading}
              style={{
                flex: 1, padding: '10px 14px', border: `1px solid ${C.border}`,
                borderRadius: '6px', background: C.cream, fontFamily: FONT,
                fontSize: '14px', color: C.ink, resize: 'none', outline: 'none',
                opacity: isLoading ? 0.5 : 1,
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '0 16px', background: C.ink, color: C.offwhite,
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontFamily: FONT, fontSize: '13px', boxShadow: SHADOW_BTN,
                opacity: (isLoading || !inputValue.trim()) ? 0.38 : 1,
              }}
            >问</button>
          </div>
        ) : (
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '11px', background: C.ink, color: C.offwhite,
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontFamily: FONT, fontSize: '14px', boxShadow: SHADOW_BTN,
            }}
          >继续朝会</button>
        )}
      </div>
    </div>
  );
}
