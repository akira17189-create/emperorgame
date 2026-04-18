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
import { SEED_NPCS } from './data/seed-npcs';

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
    save_slot: 'slot_1',
    game_year: 1,
    real_time_played_ms: 0
  },
  emperor: {
    id: 'emperor_1',
    name: '新帝',
    age: 18,
    generation: 1,
    prestige: 50,
    traits: {
      loyalty: 50,
      ambition: 50,
      greed: 50,
      courage: 50,
      rationality: 50,
      stability: 50
    },
    knowledge: [],
    memory: { trauma: [], key_events: [] },
    wills_received: [],
    visual: { image: null, image_prompt: null }
  },
  world: {
    dynasty: '靖朝',
    era: '永德',
    year: 1,
    tone: '猜忌',
    named_events: [],
    collective_memory: [],
    wills: [],
    weather_this_year: 0.5,
    conflict_ratio: 0.3
  },
  resources: {
    food: 1200,
    population: 12000,
    fiscal: 6000,
    military: 2000,
    morale: 70,
    eunuch: 30,
    threat: 20,
    faction: 40,
    agri_pop: 6000,
    land_fertility: 0.7,
    tax_rate: 0.15,
    military_cost: 200,
    disaster_relief: 100,
    commerce: 300
  },
  policies: { active: [], history: [] },
  npcs: [...SEED_NPCS],
  events: { pending: [], named: [], raw_logs: [], rolling_summary: '' },
  chronicle: { official: [], unofficial: [], pending_segments: [] },
  style_state: { current_tags: [], rules_version: '1.0.0', last_changed_year: 0 }
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

