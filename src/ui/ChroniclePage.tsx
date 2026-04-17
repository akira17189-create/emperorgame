import { useState, useEffect, useMemo } from 'preact/hooks';
import { getState, subscribe } from '../engine/state';
import { ChronicleEntry } from './components/ChronicleEntry';

export function ChroniclePage() {
  const [state, setState] = useState(getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKind, setSelectedKind] = useState<string>('all');
  
  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
    });
    
    return unsubscribe;
  }, []);
  
  // 按游戏年倒序排列
  const sortedEntries = useMemo(() => {
    return [...state.chronicle.official].sort((a, b) => {
      return b.year_range[0] - a.year_range[0];
    });
  }, [state.chronicle.official]);
  
  // 过滤条目
  const filteredEntries = useMemo(() => {
    return sortedEntries.filter(entry => {
      // 类型过滤
      if (selectedKind !== 'all' && entry.kind !== selectedKind) {
        return false;
      }
      
      // 搜索过滤
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesText = entry.text.toLowerCase().includes(searchLower);
        const matchesSubject = entry.subject_id?.toLowerCase().includes(searchLower);
        const matchesTags = entry.style_tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        
        if (!matchesText && !matchesSubject && !matchesTags) {
          return false;
        }
      }
      
      return true;
    });
  }, [sortedEntries, selectedKind, searchTerm]);
  
  // 获取所有类型
  const allKinds = useMemo(() => {
    const kinds = new Set(state.chronicle.official.map(entry => entry.kind));
    return ['all', ...Array.from(kinds)];
  }, [state.chronicle.official]);
  
  return (
    <div className="chronicle-page">
      <div className="container">
        <div className="chronicle-page__header">
          <h1 className="chronicle-page__title">史册</h1>
          <p className="chronicle-page__subtitle">记录{state.world.dynasty}的兴衰荣辱</p>
        </div>
        
        {/* 搜索和过滤 */}
        <div className="chronicle-page__filters card">
          <div className="chronicle-page__search">
            <input
              type="text"
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              placeholder="搜索史册内容..."
            />
          </div>
          
          <div className="chronicle-page__kind-filter">
            <label className="form-label">按类型筛选：</label>
            <div className="chronicle-page__kind-buttons">
              {allKinds.map(kind => (
                <button
                  key={kind}
                  className={`btn ${selectedKind === kind ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedKind(kind)}
                >
                  {kind === 'all' ? '全部' : kind}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 史册条目列表 */}
        <div className="chronicle-page__entries">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <ChronicleEntry
                key={entry.id}
                entry={entry}
              />
            ))
          ) : (
            <div className="chronicle-page__empty card">
              <div className="chronicle-page__empty-content">
                <h3>暂无史册记录</h3>
                <p className="text-muted">
                  {searchTerm || selectedKind !== 'all' 
                    ? '没有找到匹配的记录，请尝试其他搜索条件。'
                    : '史册将记录您统治期间的重要事件。开始游戏后，您的决策和事件将被记录在此。'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* 统计信息 */}
        <div className="chronicle-page__stats card">
          <h3>史册统计</h3>
          <div className="chronicle-page__stats-grid">
            <div className="chronicle-page__stat">
              <span className="chronicle-page__stat-label">总记录数：</span>
              <span className="chronicle-page__stat-value">{state.chronicle.official.length}</span>
            </div>
            <div className="chronicle-page__stat">
              <span className="chronicle-page__stat-label">本纪：</span>
              <span className="chronicle-page__stat-value">
                {state.chronicle.official.filter(e => e.kind === '本纪').length}
              </span>
            </div>
            <div className="chronicle-page__stat">
              <span className="chronicle-page__stat-label">列传：</span>
              <span className="chronicle-page__stat-value">
                {state.chronicle.official.filter(e => e.kind === '列传').length}
              </span>
            </div>
            <div className="chronicle-page__stat">
              <span className="chronicle-page__stat-label">平准：</span>
              <span className="chronicle-page__stat-value">
                {state.chronicle.official.filter(e => e.kind === '平准').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}