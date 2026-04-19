import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getLLMConfig } from './engine/llm';
import { initState } from './engine/state';
import { getDefaultAdapter } from './engine/save';
import { SettingsPage } from './ui/SettingsPage';
import { NewGamePage } from './ui/NewGamePage';
import { CourtPage } from './ui/CourtPage';
import { ChroniclePage } from './ui/ChroniclePage';
import { SavesPage } from './ui/SavesPage';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

// hash 路由
type Route = '/settings' | '/new' | '/court' | '/chronicle' | '/saves' | '/';

function getRoute(): Route {
  const hash = location.hash.replace('#', '') || '/';
  const valid: Route[] = ['/settings', '/new', '/court', '/chronicle', '/saves'];
  return valid.includes(hash as Route) ? (hash as Route) : '/';
}

function App() {
  const [route, setRoute] = useState<Route | '/'>(getRoute());

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // 首次进入 / 时决定跳哪里
  useEffect(() => {
    if (route !== '/') return;
    
    if (!getLLMConfig()) {
      location.hash = '/settings';
    } else {
      // 尝试加载最近存档，没有则进新建档页
      getDefaultAdapter().load('slot-1').then(saved => {
        if (saved) {
          initState(saved);
          location.hash = '/court';
        } else {
          location.hash = '/new';
        }
      }).catch(() => { 
        location.hash = '/new'; 
      });
    }
  }, [route]);

  switch (route) {
    case '/settings': return <SettingsPage />;
    case '/new': return <NewGamePage />;
    case '/court': 
        // 检查状态是否已初始化，如果未初始化则自动初始化
        try {
          getState();
        } catch {
          // 状态未初始化，自动初始化新游戏
          initState({
  meta: {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    last_saved_at: new Date().toISOString(),
    save_slot: 'auto',
    game_year: 0,
    real_time_played_ms: 0
  },
  emperor: {
    id: 'emperor-1',
    name: '皇帝',
    age: 20,
    generation: 1,
    prestige: 50,
    traits: { military: 50, diplomacy: 50, intrigue: 50, stewardship: 50 },
    knowledge: [],
    memory: { trauma: [], key_events: [] },
    wills_received: [],
    visual: { portrait_url: '', portrait_prompt: '' }
  },
  world: {
    dynasty: '清朝',
    era: '永德',
    year: 1,
    tone: '肃穆',
    named_events: [],
    collective_memory: [],
    wills: [],
    weather_this_year: 0.5,
    conflict_ratio: 0.3
  },
  resources: {
    food: 1000,
    population: 500,
    fiscal: 500,
    military: 50,
    morale: 70,
    eunuch: 30,
    threat: 20,
    faction: 50,
    agri_pop: 0.6,
    land_fertility: 0.7,
    tax_rate: 0.2,
    military_cost: 0.1,
    disaster_relief: 0.05,
    commerce: 0.3
  },
  policies: {
    active: [],
    history: []
  },
  npcs: [],
  events: {
    pending: [],
    named: [],
    raw_logs: [],
    rolling_summary: ''
  },
  chronicle: {
    official: [],
    unofficial: [],
    pending_segments: []
  },
  style_state: {
    current_tags: ['清朝', '朝堂'],
    rules_version: '1.0',
    last_changed_year: 1
  }
});
          console.log('自动初始化游戏状态');
        }
        return <CourtPage />;
    case '/chronicle': return <ChroniclePage />;
    case '/saves': return <SavesPage />;
    default: return <div style="padding:2rem">加载中…</div>;
  }
}

render(<App />, document.getElementById('app')!);

