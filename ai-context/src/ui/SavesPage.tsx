import { useState, useEffect } from 'preact/hooks';
import { getDefaultAdapter, type SaveMeta } from '../engine/save';
import { initState } from '../engine/state';
import { useToast } from './components/Toast';
import { Navbar } from './components/Navbar';

export function SavesPage() {
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  
  // 加载存档列表
  useEffect(() => {
    loadSaves();
  }, []);
  
  const loadSaves = async () => {
    setIsLoading(true);
    try {
      const adapter = getDefaultAdapter();
      const saveList = await adapter.list();
      setSaves(saveList);
    } catch (error) {
      console.error('Failed to load saves:', error);
      addToast('error', '加载存档失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 读取存档
  const loadSave = async (slot: string) => {
    try {
      const adapter = getDefaultAdapter();
      const gameState = await adapter.load(slot);
      
      if (!gameState) {
        addToast('error', '存档数据为空');
        return;
      }
      
      // 初始化状态
      initState(gameState);
      addToast('success', '存档读取成功');
      
      // 跳转到金銮殿
      window.location.hash = '#/court';
    } catch (error) {
      console.error('Failed to load save:', error);
      addToast('error', `读取存档失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 删除存档
  const deleteSave = async (slot: string) => {
    if (!confirm('确定要删除这个存档吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const adapter = getDefaultAdapter();
      await adapter.delete(slot);
      addToast('success', '存档删除成功');
      loadSaves(); // 重新加载列表
    } catch (error) {
      console.error('Failed to delete save:', error);
      addToast('error', `删除存档失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  // 生成存档槽位
  const generateSlots = () => {
    const slots = [];
    const maxSlots = 3;
    
    for (let i = 1; i <= maxSlots; i++) {
      const slotId = `slot-${i}`;
      const save = saves.find(s => s.slot === slotId);
      
      slots.push(
        <div key={slotId} className="card saves-page__slot">
          {save ? (
            <>
              <div className="saves-page__slot-header">
                <h3 className="saves-page__slot-title">存档 {i}</h3>
                <span className="badge badge-success">已保存</span>
              </div>
              
              <div className="saves-page__slot-info">
                <div className="saves-page__slot-detail">
                  <span className="saves-page__detail-label">剧本：</span>
                  <span className="saves-page__detail-value">{save.dynasty}</span>
                </div>
                
                <div className="saves-page__slot-detail">
                  <span className="saves-page__detail-label">年份：</span>
                  <span className="saves-page__detail-value">永德{save.game_year}年</span>
                </div>
                
                <div className="saves-page__slot-detail">
                  <span className="saves-page__detail-label">最后保存：</span>
                  <span className="saves-page__detail-value">{formatDate(save.last_saved_at)}</span>
                </div>
              </div>
              
              <div className="saves-page__slot-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => loadSave(slotId)}
                >
                  读取
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteSave(slotId)}
                >
                  删除
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="saves-page__slot-header">
                <h3 className="saves-page__slot-title">存档 {i}</h3>
                <span className="badge badge-secondary">空</span>
              </div>
              
              <div className="saves-page__slot-empty">
                <p className="text-muted">暂无存档数据</p>
                <p className="text-muted">开始新游戏后，进度将自动保存在此</p>
              </div>
            </>
          )}
        </div>
      );
    }
    
    return slots;
  };
  
  return (
    <div className="page-layout">
      <Navbar />
    <div className="saves-page">
      <div className="container">
        <div className="saves-page__header">
          <h1 className="saves-page__title">存档管理</h1>
          <p className="saves-page__subtitle">管理您的游戏进度</p>
        </div>
        
        {isLoading ? (
          <div className="saves-page__loading card">
            <p>加载存档中...</p>
          </div>
        ) : (
          <div className="saves-page__slots">
            {generateSlots()}
          </div>
        )}
        
        <div className="saves-page__footer">
          <button
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            返回
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={loadSaves}
          >
            刷新列表
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}