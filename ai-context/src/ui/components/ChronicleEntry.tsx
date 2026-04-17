import { useState } from 'preact/hooks';
import { type ChronicleEntry as ChronicleEntryType } from '../../engine/types';

export interface ChronicleEntryProps {
  entry: ChronicleEntryType;
  className?: string;
}

export function ChronicleEntry({ entry, className = '' }: ChronicleEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 获取类型徽章样式
  const getKindBadgeClass = (kind: string): string => {
    const kindMap: Record<string, string> = {
      '本纪': 'badge-primary',
      '列传': 'badge-secondary',
      '平准': 'badge-warning',
      '野史': 'badge-danger'
    };
    return kindMap[kind] || 'badge-secondary';
  };
  
  // 获取摘要（前80字）
  const getSummary = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };
  
  // 格式化年份范围
  const formatYearRange = (yearRange: [number, number]): string => {
    if (yearRange[0] === yearRange[1]) {
      return `永德${yearRange[0]}年`;
    }
    return `永德${yearRange[0]}-${yearRange[1]}年`;
  };
  
  return (
    <div className={`chronicle-entry card ${className}`}>
      <div className="chronicle-entry__header">
        <div className="chronicle-entry__badges">
          <span className="badge badge-secondary">
            {formatYearRange(entry.year_range)}
          </span>
          <span className={`badge ${getKindBadgeClass(entry.kind)}`}>
            {entry.kind}
          </span>
        </div>
      </div>
      
      <div className="chronicle-entry__content">
        <p className="chronicle-entry__summary">
          {getSummary(entry.text)}
        </p>
        
        {entry.text.length > 80 && (
          <button 
            className="btn btn-secondary chronicle-entry__toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        )}
        
        {isExpanded && (
          <div className="chronicle-entry__details">
            <div className="chronicle-entry__full-text">
              {entry.text}
            </div>
            
            {entry.style_tags.length > 0 && (
              <div className="chronicle-entry__tags">
                <span className="chronicle-entry__tags-label">风格标签：</span>
                {entry.style_tags.map((tag, index) => (
                  <span key={index} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {entry.source_logs.length > 0 && (
              <div className="chronicle-entry__source">
                <span className="chronicle-entry__source-label">决策依据：</span>
                <ul className="chronicle-entry__source-list">
                  {entry.source_logs.map((log, index) => (
                    <li key={index} className="chronicle-entry__source-item">
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}