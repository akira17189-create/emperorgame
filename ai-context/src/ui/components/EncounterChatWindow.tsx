// [改造-Phase4] 路遇场景追问弹窗组件
import { useState } from 'preact/hooks';
import { getState } from '../../engine/state';
import { callWithSceneAnchor, buildSceneAnchor } from '../../engine/llm';
import type { EncounterTemplate } from '../../data/prewritten-encounters';
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

interface EncounterChatWindowProps {
  encounter: EncounterTemplate;
  maxRounds?: number;   // 默认 5
  onClose: () => void;
}

interface Message {
  role: 'npc' | 'player';
  content: string;
  emotion?: string;
}

export function EncounterChatWindow({ encounter, maxRounds = 5, onClose }: EncounterChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    // 第一条是 NPC 的开场语（预写，不调 LLM）
    { role: 'npc', content: encounter.npc_opening_line, emotion: '平静' }
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
    const sceneAnchor = buildSceneAnchor(state, encounter.npc_type + '路遇');

    // 构建历史（只传 role:'user'|'assistant'，不含 NPC 开场语）
    const history = messages
      .filter(m => m.role !== 'npc' || messages.indexOf(m) > 0)
      .map(m => ({
        role: (m.role === 'player' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }));

    // 构建 npcData
    const npcData = {
      name: encounter.chat_npc_profile.display_name,
      role: encounter.npc_type,
      faction: '路遇',
      traitsJson: JSON.stringify({}),
      voiceFeatures: encounter.chat_npc_profile.voice_features.join('、'),
      forbiddenPhrases: '',
      biasJson: JSON.stringify({}),
      knowledgeScope: encounter.chat_npc_profile.knowledge_scope,
      refusalTemplates: encounter.chat_npc_profile.fallback_line,
      fallbackLine: encounter.chat_npc_profile.fallback_line,
    };

    const result = await callWithSceneAnchor({
      systemPromptTemplate: npcChatWindowPrompt,
      npcData,
      sceneAnchor,
      history,
      userMessage: userMsg,
      turnIndex: turnCount,
    });

    setMessages(prev => [...prev, { role: 'npc', content: result.dialogue, emotion: result.emotion }]);
    setTurnCount(prev => prev + 1);
    setCanFollowUp(result.allows_followup);
    setIsLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: C.cream, borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '90%',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column', fontFamily: FONT,
      }}>
        {/* 标题 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.1em' }}>
              {encounter.location_type} · 路遇
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: C.ink }}>
              {encounter.chat_npc_profile.display_name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: C.muted,
            }}
          >
            ×
          </button>
        </div>

        {/* 消息列表 */}
        <div style={{
          flex: 1, overflowY: 'auto', marginBottom: '16px', padding: '12px',
          background: C.offwhite, borderRadius: '8px', border: `1px solid ${C.border}`,
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              marginBottom: '12px', textAlign: msg.role === 'npc' ? 'left' : 'right',
            }}>
              <div style={{
                display: 'inline-block', maxWidth: '80%', padding: '8px 12px',
                borderRadius: '8px', fontSize: '14px', lineHeight: 1.6,
                background: msg.role === 'npc' ? C.cream : C.ink,
                color: msg.role === 'npc' ? C.ink82 : C.offwhite,
                border: msg.role === 'npc' ? `1px solid ${C.border}` : 'none',
              }}>
                {msg.content}
                {msg.emotion && msg.role === 'npc' && (
                  <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                    [{msg.emotion}]
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ textAlign: 'left' }}>
              <LoadingShimmer width="120px" height="24px" />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        {canFollowUp && turnCount < maxRounds ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="说点什么..."
              style={{
                flex: 1, padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: '6px',
                fontFamily: FONT, fontSize: '14px', background: C.offwhite, color: C.ink,
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '8px 16px', background: C.ink, color: C.offwhite, border: 'none',
                borderRadius: '6px', cursor: 'pointer', fontFamily: FONT, fontSize: '14px',
                opacity: (isLoading || !inputValue.trim()) ? 0.38 : 1,
              }}
            >
              问
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '11px', background: C.ink, color: C.offwhite,
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontFamily: FONT, fontSize: '14px', boxShadow: SHADOW_BTN,
            }}
          >
            继续前行
          </button>
        )}
      </div>
    </div>
  );
}
