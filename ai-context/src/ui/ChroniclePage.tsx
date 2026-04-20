import { useState, useEffect, useMemo } from 'preact/hooks';
import { getState, subscribe } from '../engine/state';
import { ChronicleEntry } from './components/ChronicleEntry';
import { Navbar } from './components/Navbar';

export function ChroniclePage() {
  const [state, setState] = useState(getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
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

  // 分页计算
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);
  
  // 获取所有类型
  const allKinds = useMemo(() => {
    const kinds = new Set(state.chronicle.official.map(entry => entry.kind));
    return ['all', ...Array.from(kinds)];
  }, [state.chronicle.official]);
  
  return (
    <div className="page-layout">
      <Navbar />
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
              paginatedEntries.map(entry => (
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
            
            {/* 分页控件 */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(184,146,42,0.05)',
                border: '1px solid rgba(184,146,42,0.2)'
              }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: currentPage === 1 ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.2)',
                    border: '1px solid rgba(184,146,42,0.3)',
                    color: currentPage === 1 ? 'rgba(245,239,226,0.3)' : 'rgba(245,239,226,0.8)',
                    padding: '8px 16px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontFamily: 'sans-serif',
                    fontSize: '12px'
                  }}
                >
                  ← 上一页
                </button>

                <span style={{
                  color: 'rgba(245,239,226,0.7)',
                  fontFamily: 'sans-serif',
                  fontSize: '12px'
                }}>
                  第 {currentPage} 页 / 共 {totalPages} 页
                </span>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: currentPage === totalPages ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.2)',
                    border: '1px solid rgba(184,146,42,0.3)',
                    color: currentPage === totalPages ? 'rgba(245,239,226,0.3)' : 'rgba(245,239,226,0.8)',
                    padding: '8px 16px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontFamily: 'sans-serif',
                    fontSize: '12px'
                  }}
                >
                  下一页 →
                </button>
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
    </div>
  );
}