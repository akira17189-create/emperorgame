import { type Visual } from '../../engine/types';

export interface VisualSlotProps {
  visual: Visual;
  kind: 'npc' | 'event' | 'place' | 'policy';
  alt?: string;
  className?: string;
}

export function VisualSlot({ visual, kind, alt, className = '' }: VisualSlotProps) {
  // 三态：image存在 → <img>；只有prompt → 占位SVG+tooltip；都无 → 纯文字卡片
  if (visual.image) {
    return (
      <div className={`visual-slot visual-slot--image ${className}`}>
        <img 
          src={visual.image} 
          alt={alt || `${kind} 图片`} 
          loading="lazy"
          className="visual-slot__img"
        />
      </div>
    );
  }
  
  if (visual.image_prompt) {
    return (
      <div className={`visual-slot visual-slot--placeholder ${className}`} title={visual.image_prompt}>
        <div className="visual-slot__placeholder">
          <img 
            src="/assets/ui/placeholder-npc.svg" 
            alt={`${kind} 占位图`}
            className="visual-slot__placeholder-img"
          />
          <div className="visual-slot__tooltip">
            图片提示：{visual.image_prompt}
          </div>
        </div>
      </div>
    );
  }
  
  // 纯文字卡片
  const kindLabels: Record<string, string> = {
    npc: '人物',
    event: '事件',
    place: '地点',
    policy: '政策'
  };
  
  return (
    <div className={`visual-slot visual-slot--text ${className}`}>
      <div className="visual-slot__text-card">
        <span className="visual-slot__text-icon">
          {kind === 'npc' && '👤'}
          {kind === 'event' && '📜'}
          {kind === 'place' && '🏛️'}
          {kind === 'policy' && '⚖️'}
        </span>
        <span className="visual-slot__text-label">
          {kindLabels[kind] || kind}
        </span>
      </div>
    </div>
  );
}