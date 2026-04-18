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
    case '/court': return <CourtPage />;
    case '/chronicle': return <ChroniclePage />;
    case '/saves': return <SavesPage />;
    default: return <div style="padding:2rem">加载中…</div>;
  }
}

render(<App />, document.getElementById('app')!);

