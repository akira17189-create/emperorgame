import { type NPC } from '../../engine/types';
import { VisualSlot } from './VisualSlot';

export interface NpcCardProps {
  npc: NPC;
  isActive?: boolean;    // 当前正在说话
  onClick?: () => void;
}

export function NpcCard({ npc, isActive = false, onClick }: NpcCardProps) {
  const pressurePercentage = Math.min(100, Math.max(0, npc.state.pressure));
  
  // 压力条颜色
  const getPressureColor = (pressure: number): string => {
    if (pressure < 30) return 'var(--status-success)';
    if (pressure < 70) return 'var(--status-warning)';
    return 'var(--status-danger)';
  };
  
  // 行为倾向徽章样式
  const getBehaviorBadgeClass = (modifier: string): string => {
    const modifierMap: Record<string, string> = {
      '谨慎': 'badge-secondary',
      '激进': 'badge-danger',
      '阴险': 'badge-warning',
      '正常': 'badge-secondary',
      '积极': 'badge-success'
    };
    return modifierMap[modifier] || 'badge-secondary';
  };
  
  return (
    <div 
      className={`npc-card card ${isActive ? 'npc-card--active' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="npc-card__header">
        <VisualSlot 
          visual={npc.visual} 
          kind="npc" 
          alt={npc.name}
          className="npc-card__visual"
        />
        <div className="npc-card__info">
          <h3 className="npc-card__name">{npc.name}</h3>
          <p className="npc-card__role">{npc.role}</p>
          <span className={`badge ${getBehaviorBadgeClass(npc.state.behavior_modifier)}`}>
            {npc.state.behavior_modifier}
          </span>
        </div>
      </div>
      
      <div className="npc-card__stats">
        <div className="npc-card__pressure">
          <div className="npc-card__pressure-label">
            <span>压力</span>
            <span>{npc.state.pressure}/100</span>
          </div>
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${pressurePercentage}%`,
                backgroundColor: getPressureColor(pressurePercentage)
              }}
            />
          </div>
        </div>
        
        <div className="npc-card__satisfaction">
          <div className="npc-card__satisfaction-label">
            <span>满足感</span>
            <span>{npc.state.satisfaction}/100</span>
          </div>
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${npc.state.satisfaction}%`,
                backgroundColor: 'var(--accent-ink)'
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="npc-card__faction">
        <span className="npc-card__faction-label">派系：</span>
        <span className="npc-card__faction-value">{npc.faction}</span>
      </div>
      
      {isActive && (
        <div className="npc-card__active-indicator">
          正在发言...
        </div>
      )}
    </div>
  );
}