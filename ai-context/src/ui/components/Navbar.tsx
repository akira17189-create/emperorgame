import { getState } from '../../engine/state';
import { getLLMConfig } from '../../engine/llm';

type NavRoute = '/court' | '/chronicle' | '/saves' | '/settings' | '/new';

const NAV_ITEMS: { route: NavRoute; label: string }[] = [
  { route: '/court',      label: '金銮殿' },
  { route: '/chronicle',  label: '史册' },
  { route: '/saves',      label: '存档' },
];

function currentHash(): string {
  return location.hash.replace('#', '') || '/';
}

export function Navbar() {
  const hash = currentHash();
  const hasConfig = !!getLLMConfig();

  let dynasty = '';
  let yearLabel = '';
  try {
    const state = getState();
    dynasty = state.world.dynasty;
    yearLabel = `${state.world.era}${state.world.year}年`;
  } catch { /* state not yet initialized (e.g. first-time settings page) */ }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">
          {dynasty || '皇帝游戏'}
          {yearLabel && <span className="navbar-year">{yearLabel}</span>}
        </span>
      </div>

      <div className="navbar-center">
        {NAV_ITEMS.map(({ route, label }) => (
          <a
            key={route}
            href={`#${route}`}
            className={`navbar-link${hash === route ? ' navbar-link--active' : ''}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="navbar-right">
        <a
          href="#/settings"
          className={`navbar-link navbar-link--settings${hash === '/settings' ? ' navbar-link--active' : ''}${!hasConfig ? ' navbar-link--warn' : ''}`}
          title="模型配置"
        >
          ⚙ 设置{!hasConfig ? ' !' : ''}
        </a>
      </div>
    </nav>
  );
}
