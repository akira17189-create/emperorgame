import { useState } from 'preact/hooks';
import { Navbar } from './components/Navbar';
import { createEmptyGameState } from '../engine/types';
import { initState } from '../engine/state';
import { getDefaultAdapter } from '../engine/save';
import { useToast } from './components/Toast';
import { SEED_SCENARIO_DESCRIPTION } from '../data/seed-scenario';
import { SEED_NPCS } from '../data/seed-npcs';

export function NewGamePage() {
  const [isStarting, setIsStarting] = useState(false);
  const { addToast } = useToast();
  
  // 开始新游戏
  const startNewGame = async () => {
    setIsStarting(true);
    
    try {
      // 创建新的游戏状态
      const newState = createEmptyGameState();
      
      // 应用种子数据
      newState.npcs = [...SEED_NPCS];
      
      // 初始化状态
      initState(newState);
      
      // 保存到存档
      const saveAdapter = getDefaultAdapter();
      await saveAdapter.save('slot_1', newState);
      
      addToast('success', '新游戏已创建');
      
      // 跳转到金銮殿
      window.location.hash = '#/court';
    } catch (error) {
      console.error('Failed to start new game:', error);
      addToast('error', `创建游戏失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsStarting(false);
    }
  };
  
  return (
    <div className="page-layout">
      <Navbar />
    <div className="new-game-page">
      <div className="container">
        <div className="new-game-page__header">
          <h1 className="new-game-page__title">开始新游戏</h1>
          <p className="new-game-page__subtitle">选择剧本，开启你的帝王之路</p>
        </div>
        
        <div className="new-game-page__scenarios">
          <div className="card new-game-page__scenario">
            <div className="new-game-page__scenario-header">
              <h2 className="new-game-page__scenario-title">[剧本名待填入]</h2>
              <span className="badge badge-primary">默认剧本</span>
            </div>
            
            <div className="new-game-page__scenario-content">
              <p className="new-game-page__scenario-description">
                {SEED_SCENARIO_DESCRIPTION}
              </p>
              
              <div className="new-game-page__scenario-details">
                <div className="new-game-page__scenario-detail">
                  <span className="new-game-page__detail-label">初始NPC：</span>
                  <span className="new-game-page__detail-value">
                    {SEED_NPCS.map(npc => npc.name).join('、')}
                  </span>
                </div>
                
                <div className="new-game-page__scenario-detail">
                  <span className="new-game-page__detail-label">世界基调：</span>
                  <span className="new-game-page__detail-value">猜忌</span>
                </div>
                
                <div className="new-game-page__scenario-detail">
                  <span className="new-game-page__detail-label">起始年份：</span>
                  <span className="new-game-page__detail-value">永德元年</span>
                </div>
              </div>
            </div>
            
            <div className="new-game-page__scenario-actions">
              <button
                className="btn btn-primary"
                onClick={startNewGame}
                disabled={isStarting}
              >
                {isStarting ? '创建中...' : '开始游戏'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="new-game-page__footer">
          <p className="text-muted">
            已有存档？
            <a href="#/saves" className="new-game-page__saves-link">
              读取存档
            </a>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}