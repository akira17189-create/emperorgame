import { useState } from 'preact/hooks';
import type { GameState } from '../engine/types';
import { interpretPolicy, POLICY_PRESETS, checkPolicyConflicts, applyPresetPolicy, registerActivePolicy, getPolicyDescription, getPolicyNarrative, NPCReaction } from '../engine/policy-engine';
import { setState as setGameState, getState } from '../engine/state';

interface PolicyPanelProps {
  state: GameState;
  onPolicyEnacted?: (narrative: string) => void;
}

export function PolicyPanel({ state, onPolicyEnacted }: PolicyPanelProps) {
  const [tab, setTab] = useState<'preset' | 'custom' | 'active'>('preset');
  const [customInput, setCustomInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastNarrative, setLastNarrative] = useState<string | null>(null);
  const [lastNPCReactions, setLastNPCReactions] = useState<NPCReaction[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const presetGroups = {
    '内政': ['减税惠民', '加征赋税', '整顿吏治', '广开言路', '兴建水利', '开仓赈灾'],
    '军事': ['扩充禁军', '裁汰冗兵', '边疆屯田', '和亲邦交', '御驾亲征'],
    '仙道': ['祭天祈福', '召仙炼丹', '观星问天', '敕封龙虎', '禁绝方术', '丹药普赐'],
    '工业': ['推广活字印刷', '开设钱庄', '官道驿路', '火器营制', '开海通商', '蒸汽奇器']
  };

  async function handlePresetPolicy(name: string) {
    const conflicts = checkPolicyConflicts(
      { id: '', tags: (POLICY_PRESETS as any)[name]?.tags || [], enacted_year: state.world.year, enacted_by: 'emperor', description: name, visual: { image: null, image_prompt: null } },
      state.policies.active
    );
    if (conflicts.length > 0) {
      setErrors(conflicts);
      return;
    }
    setErrors([]);
    setIsProcessing(true);
    setLastNPCReactions([]);

    try {
      // 使用快速通道，不调用LLM
      const { policy, immediateChanges, narrative, npc_reactions } = applyPresetPolicy(name as any, state);
      const current = getState();
      const newResources = { ...current.resources };

      // 应用立即效果
      for (const [k, v] of Object.entries(immediateChanges)) {
        if (k in newResources) {
          (newResources as any)[k] = Math.max(0, ((newResources as any)[k] ?? 0) + (v ?? 0));
        }
      }

      // 更新游戏状态
      const newState = {
        ...current,
        resources: newResources,
        policies: {
          ...current.policies,
          active: [...current.policies.active, policy],
          history: [...current.policies.history, { 
            policy_id: policy.id, 
            action: 'enact' as const, 
            year: current.world.year, 
            reason: name 
          }]
        }
      };

      setGameState(newState);
      setLastNarrative(narrative);
      setLastNPCReactions(npc_reactions);
      setLastResult(`${name}政策已颁布，效果将持续生效。`);
      setSelectedPolicy(name);
      onPolicyEnacted?.(narrative);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCustomPolicy() {
    if (!customInput.trim() || isProcessing) return;
    setIsProcessing(true);
    setLastResult(null);
    setLastNarrative(null);
    setLastNPCReactions([]);

    try {
      const result = await interpretPolicy(customInput.trim(), state);
      if (result.success) {
        const current = getState();
        const newResources = { ...current.resources };

        // 应用立即效果
        for (const [k, v] of Object.entries(result.effect.resource_change)) {
          if (k in newResources) {
            (newResources as any)[k] = Math.max(0, ((newResources as any)[k] ?? 0) + (v ?? 0));
          }
        }

        // 更新游戏状态
        const newState = {
          ...current,
          resources: newResources,
          policies: {
            ...current.policies,
            active: [...current.policies.active, result.policy],
            history: [...current.policies.history, { 
              policy_id: result.policy.id, 
              action: 'enact' as const, 
              year: current.world.year, 
              reason: result.policy.description 
            }]
          }
        };

        setGameState(newState);
        setLastNarrative(result.narrative);
        setLastNPCReactions(result.effect.npc_reactions);
        setLastResult(`政策已颁布，效果将持续生效。`);
        setCustomInput('');
        onPolicyEnacted?.(result.narrative);
      } else {
        setErrors([result.error || '政策解析失败']);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function getPolicyTooltip(presetName: string): string {
    const preset = (POLICY_PRESETS as any)[presetName];
    if (!preset) return '';

    const tickChanges = preset.tick_change || {};
    const duration = preset.duration ?? -1;
    const parts = [];

    for (const [key, value] of Object.entries(tickChanges)) {
      const labels: Record<string, string> = {
        morale: '民心', fiscal: '国库', military: '军力', food: '粮食',
        threat: '外患', commerce: '商业', eunuch: '宦官', faction: '党争'
      };
      const label = labels[key] || key;
      const sign = value > 0 ? '+' : '';
      parts.push(`${label}${sign}${value}`);
    }

    const durationText = duration === -1 ? '永久' : `持续${duration}年`;
    return `每年效果：${parts.join('，')} | ${durationText}`;
  }

  function renderNPCReactions() {
    if (lastNPCReactions.length === 0) return null;

    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          color: '#b8922a', 
          fontSize: '10px', 
          letterSpacing: '3px', 
          fontFamily: 'sans-serif', 
          marginBottom: '8px' 
        }}>
          朝堂反应
        </div>
        {lastNPCReactions.map((reaction, index) => {
          const npc = state.npcs.find(n => n.id === reaction.npc_id);
          const npcName = npc?.name || reaction.npc_id;
          const attitudeColor = reaction.attitude === '支持' ? '#4a7c59' : 
                               reaction.attitude === '反对' ? '#8b1a1a' : '#6b6b6b';

          return (
            <div key={index} style={{ 
              background: 'rgba(184,146,42,0.05)', 
              border: '1px solid rgba(184,146,42,0.15)',
              padding: '10px 12px',
              marginBottom: '8px',
              borderLeft: `3px solid ${attitudeColor}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ 
                  color: '#b8922a', 
                  fontSize: '12px', 
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold'
                }}>
                  {npcName}
                </span>
                <span style={{ 
                  color: attitudeColor, 
                  fontSize: '10px', 
                  fontFamily: 'sans-serif',
                  padding: '2px 6px',
                  background: `${attitudeColor}22`,
                  borderRadius: '2px'
                }}>
                  {reaction.attitude}
                </span>
              </div>
              <div style={{ 
                color: 'rgba(245,239,226,0.85)', 
                fontSize: '13px', 
                fontFamily: 'serif',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "{reaction.speech}"
              </div>
              {reaction.hidden_action && (
                <div style={{ 
                  color: 'rgba(245,239,226,0.4)', 
                  fontSize: '10px', 
                  fontFamily: 'sans-serif',
                  marginTop: '6px',
                  fontStyle: 'italic'
                }}>
                  （暗中行动：{reaction.hidden_action}）
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: '#1a1208', border: '1px solid rgba(184,146,42,0.3)', padding: '20px' }}>
      {/* Tab 切换 */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '16px', borderBottom: '1px solid rgba(184,146,42,0.2)' }}>
        {(['preset', 'custom', 'active'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            style={{
              background: tab === t ? 'rgba(184,146,42,0.15)' : 'transparent',
              border: 'none', 
              borderBottom: tab === t ? '2px solid #b8922a' : '2px solid transparent',
              color: tab === t ? '#d4a93a' : 'rgba(245,239,226,0.5)',
              padding: '8px 20px', 
              cursor: 'pointer', 
              fontFamily: 'sans-serif', 
              fontSize: '12px', 
              letterSpacing: '2px'
            }}
          >
            {t === 'preset' ? '预设政策' : t === 'custom' ? '自由颁布' : '活跃政策'}
          </button>
        ))}
      </div>

      {/* 预设政策面板 */}
      {tab === 'preset' && (
        <div>
          {Object.entries(presetGroups).map(([group, policies]) => (
            <div key={group} style={{ marginBottom: '16px' }}>
              <div style={{ 
                color: '#b8922a', 
                fontSize: '10px', 
                letterSpacing: '3px', 
                marginBottom: '8px', 
                fontFamily: 'sans-serif' 
              }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {policies.map(p => (
                  <button 
                    key={p} 
                    onClick={() => handlePresetPolicy(p)} 
                    disabled={isProcessing}
                    title={getPolicyTooltip(p)}
                    style={{
                      background: selectedPolicy === p ? 'rgba(184,146,42,0.25)' : 'rgba(184,146,42,0.1)', 
                      border: selectedPolicy === p ? '1px solid #b8922a' : '1px solid rgba(184,146,42,0.3)',
                      color: 'rgba(245,239,226,0.85)', 
                      padding: '6px 14px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      fontFamily: 'sans-serif', 
                      fontSize: '12px',
                      opacity: isProcessing ? 0.5 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 自由输入面板 */}
      {tab === 'custom' && (
        <div>
          <div style={{ 
            color: 'rgba(245,239,226,0.5)', 
            fontSize: '12px', 
            fontFamily: 'sans-serif', 
            marginBottom: '8px' 
          }}>
            以圣旨口吻颁布任意政策，AI将解析效果并生成朝堂反应
          </div>
          <textarea
            value={customInput}
            onInput={(e) => setCustomInput((e.target as HTMLTextAreaElement).value)}
            placeholder="示例：在全国推行一田两主制，允许佃农获得土地所有权..."
            rows={3}
            style={{
              width: '100%', 
              background: 'rgba(245,239,226,0.05)',
              border: '1px solid rgba(184,146,42,0.3)', 
              color: 'rgba(245,239,226,0.85)',
              padding: '10px', 
              fontFamily: 'sans-serif', 
              fontSize: '13px', 
              resize: 'none'
            }}
          />
          <button 
            onClick={handleCustomPolicy} 
            disabled={isProcessing || !customInput.trim()}
            style={{
              marginTop: '10px', 
              background: '#b8922a', 
              border: 'none',
              color: '#1a1208', 
              padding: '8px 24px', 
              cursor: 'pointer',
              fontFamily: 'sans-serif', 
              fontSize: '12px', 
              letterSpacing: '2px',
              opacity: (isProcessing || !customInput.trim()) ? 0.5 : 1
            }}
          >
            {isProcessing ? '正在颁布...' : '颁布圣旨 ✦'}
          </button>
        </div>
      )}

      {/* 活跃政策面板 */}
      {tab === 'active' && (
        <div>
          <div style={{ 
            color: 'rgba(184,146,42,0.6)', 
            fontSize: '10px', 
            letterSpacing: '3px', 
            fontFamily: 'sans-serif', 
            marginBottom: '12px' 
          }}>
            当前生效政策 ({state.policies.active.length})
          </div>
          {state.policies.active.length === 0 ? (
            <div style={{ 
              color: 'rgba(245,239,226,0.5)', 
              fontSize: '12px', 
              fontFamily: 'sans-serif', 
              padding: '20px', 
              textAlign: 'center' 
            }}>
              暂无生效政策
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {state.policies.active.map(p => {
                const preset = (POLICY_PRESETS as any)[p.description];
                const tickChanges = preset?.tick_change || p.tick_change || {};
                const duration = preset?.duration ?? p.duration_years ?? -1;
                const expiryYear = duration === -1 ? '永久' : `${p.enacted_year + duration}年`;
                const remainingYears = duration === -1 ? '永久' : `${Math.max(0, p.enacted_year + duration - state.world.year)}年`;

                return (
                  <div key={p.id} style={{ 
                    background: 'rgba(184,146,42,0.08)', 
                    border: '1px solid rgba(184,146,42,0.2)',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#b8922a', 
                        fontSize: '12px', 
                        fontFamily: 'sans-serif', 
                        marginBottom: '4px' 
                      }}>
                        {p.description}
                      </div>
                      <div style={{ 
                        color: 'rgba(245,239,226,0.6)', 
                        fontSize: '10px', 
                        fontFamily: 'sans-serif' 
                      }}>
                        颁布于 {p.enacted_year}年 · 剩余: {remainingYears} · 预计到期: {expiryYear}
                      </div>
                      <div style={{ 
                        color: 'rgba(245,239,226,0.7)', 
                        fontSize: '11px', 
                        fontFamily: 'sans-serif', 
                        marginTop: '4px' 
                      }}>
                        {Object.entries(tickChanges).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            morale: '民心', fiscal: '国库', military: '军力', food: '粮食',
                            threat: '外患', commerce: '商业', eunuch: '宦官', faction: '党争'
                          };
                          const label = labels[key] || key;
                          const sign = value > 0 ? '+' : '';
                          return (
                            <span key={key} style={{ marginRight: '8px' }}>
                              {label} {sign}{value}/年
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        // 废除政策逻辑
                        const current = getState();
                        const newActive = current.policies.active.filter(activePolicy => activePolicy.id !== p.id);
                        const newHistory = [...current.policies.history, { 
                          policy_id: p.id, 
                          action: 'repeal' as const, 
                          year: current.world.year, 
                          reason: '皇帝废除' 
                        }];
                        setGameState({
                          ...current,
                          policies: {
                            active: newActive,
                            history: newHistory
                          }
                        });
                        onPolicyEnacted?.(`「${p.description}」政策已被废除。`);
                      }}
                      style={{
                        background: 'rgba(139,26,26,0.3)',
                        border: '1px solid rgba(139,26,26,0.5)',
                        color: '#c05050',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif',
                        fontSize: '10px',
                        marginLeft: '10px'
                      }}
                    >
                      废除
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {errors.length > 0 && (
        <div style={{ 
          marginTop: '12px', 
          background: 'rgba(139,26,26,0.15)', 
          padding: '10px', 
          borderLeft: '3px solid #8b1a1a' 
        }}>
          {errors.map((e, i) => (
            <div key={i} style={{ 
              color: '#c05050', 
              fontFamily: 'sans-serif', 
              fontSize: '12px' 
            }}>
              ⚠ {e}
            </div>
          ))}
        </div>
      )}

      {/* 政策效果叙事展示 */}
      {lastNarrative && (
        <div style={{ 
          marginTop: '16px', 
          background: 'rgba(184,146,42,0.06)', 
          borderLeft: '3px solid #b8922a', 
          padding: '14px 16px', 
          fontFamily: 'serif', 
          fontSize: '14px', 
          lineHeight: '2', 
          color: 'rgba(245,239,226,0.85)' 
        }}>
          {lastNarrative}
        </div>
      )}

      {/* NPC反应列表 */}
      {renderNPCReactions()}

      {/* 操作结果提示 */}
      {lastResult && (
        <div style={{ 
          marginTop: '12px', 
          color: '#4a7c59', 
          fontSize: '12px', 
          fontFamily: 'sans-serif',
          padding: '8px',
          background: 'rgba(74,124,89,0.1)',
          borderLeft: '3px solid #4a7c59'
        }}>
          ✓ {lastResult}
        </div>
      )}
    </div>
  );
}
