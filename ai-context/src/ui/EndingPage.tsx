import { useState, useEffect } from 'preact/hooks';
import { getState, initState } from '../engine/state';
import { checkEndings, renderEndingNarrative, type Ending } from '../engine/ending-engine';
import { Navbar } from './components/Navbar';

export function EndingPage() {
  const [ending, setEnding] = useState<Ending | null>(null);
  const [narrative, setNarrative] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查是否触发了结局
    const state = getState();
    const triggeredEnding = checkEndings(state);

    if (triggeredEnding) {
      setEnding(triggeredEnding);
      setNarrative(renderEndingNarrative(triggeredEnding, state));
    } else {
      // 如果没有触发结局，返回游戏
      window.location.hash = '#/court';
    }

    setIsLoading(false);
  }, []);

  const handlePlayAgain = () => {
    // 清空存档，返回新游戏页面
    localStorage.removeItem('emperor-game-save');
    initState();
    window.location.hash = '#/new-game';
  };

  const handleViewChronicle = () => {
    // 跳转到史册页面
    window.location.hash = '#/chronicle';
  };

  if (isLoading) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4a93a',
        fontFamily: 'serif',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  if (!ending) {
    return null;
  }

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(184, 146, 42, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(184, 146, 42, 0.03) 0%, transparent 50%),
        linear-gradient(180deg, #0a0a0a 0%, #12100a 50%, #0a0a0a 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 卷轴纹理背景 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 50px,
            rgba(184, 146, 42, 0.02) 50px,
            rgba(184, 146, 42, 0.02) 51px
          )
        `,
        pointerEvents: 'none'
      }} />

      <Navbar />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 结局标题 */}
        <h1 style={{
          color: '#d4a93a',
          fontFamily: 'serif',
          fontSize: 'clamp(36px, 8vw, 72px)',
          letterSpacing: '8px',
          textAlign: 'center',
          marginBottom: '60px',
          textShadow: '0 0 20px rgba(212, 169, 58, 0.3)',
          fontWeight: 'normal'
        }}>
          {ending.title}
        </h1>

        {/* 叙事正文 */}
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: 'rgba(184, 146, 42, 0.05)',
          border: '1px solid rgba(184, 146, 42, 0.2)',
          borderRadius: '4px',
          padding: '40px',
          marginBottom: '40px'
        }}>
          <div style={{
            color: 'rgba(245, 239, 226, 0.85)',
            fontFamily: 'serif',
            fontSize: '16px',
            lineHeight: '2',
            whiteSpace: 'pre-wrap',
            textAlign: 'justify'
          }}>
            {narrative}
          </div>

          {/* 分割线 */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(184, 146, 42, 0.5), transparent)',
            margin: '30px 0'
          }} />

          {/* 史官评语 */}
          <div style={{
            color: 'rgba(245, 239, 226, 0.7)',
            fontFamily: 'serif',
            fontSize: '14px',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: '1.8',
            padding: '20px'
          }}>
            {ending.epilogue}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={handlePlayAgain}
            style={{
              background: 'rgba(184, 146, 42, 0.1)',
              border: '1px solid rgba(184, 146, 42, 0.3)',
              color: '#d4a93a',
              padding: '12px 32px',
              fontFamily: 'serif',
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(184, 146, 42, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(184, 146, 42, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(184, 146, 42, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(184, 146, 42, 0.3)';
            }}
          >
            再次游玩
          </button>

          <button
            onClick={handleViewChronicle}
            style={{
              background: 'rgba(184, 146, 42, 0.1)',
              border: '1px solid rgba(184, 146, 42, 0.3)',
              color: '#d4a93a',
              padding: '12px 32px',
              fontFamily: 'serif',
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(184, 146, 42, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(184, 146, 42, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(184, 146, 42, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(184, 146, 42, 0.3)';
            }}
          >
            查看史册
          </button>
        </div>
      </main>

      {/* 底部装饰 */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, transparent, #b8922a, transparent)',
        opacity: 0.3
      }} />
    </div>
  );
}
