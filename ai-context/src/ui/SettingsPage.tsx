import { useState, useEffect } from 'preact/hooks';
import { getLLMConfig, setLLMConfig, clearLLMConfig, llmCall, type ChatMessage } from '../engine/llm';
import { type LLMConfig } from '../engine/types';
import { useToast } from './components/Toast';
import { getDefaultAdapter } from '../engine/save';

export function SettingsPage() {
  const [config, setConfig] = useState<LLMConfig>({
    baseURL: '',
    apiKey: '',
    modelMain: '',
    modelCheap: '',
    maxTokens: 1000,
    temperature: 0.7,
    provider: 'openai'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    getDefaultAdapter().load('slot-1').then(s => setHasSave(!!s)).catch(() => {});
  }, []);
  
  // 加载现有配置
  useEffect(() => {
    const existingConfig = getLLMConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, []);
  
  // 处理表单变化
  const handleChange = (field: keyof LLMConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };
  
  // 测试连接
  const testConnection = async () => {
    if (!config.baseURL || !config.apiKey || !config.modelMain) {
      addToast('error', '请填写所有必填字段');
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // 临时设置配置进行测试
      setLLMConfig(config);
      
      const messages: ChatMessage[] = [
        { role: 'user', content: '回复OK' }
      ];
      
      await llmCall('B', messages, { maxTokens: 10, temperature: 0 });
      setTestResult('success');
      addToast('success', '连接测试成功');
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult('error');
      addToast('error', `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  // 保存配置
  const saveConfig = () => {
    if (!config.baseURL || !config.apiKey || !config.modelMain) {
      addToast('error', '请填写所有必填字段');
      return;
    }
    
    setLLMConfig(config);
    addToast('success', '配置保存成功');
    
    // 跳转到新建档页面
    window.location.hash = '#/new';
  };
  
  // 清除配置
  const clearConfig = () => {
    if (confirm('确定要清除所有LLM配置吗？')) {
      clearLLMConfig();
      setConfig({
        baseURL: '',
        apiKey: '',
        modelMain: '',
        modelCheap: '',
        maxTokens: 1000,
        temperature: 0.7,
        provider: 'openai'
      });
      addToast('success', '配置已清除');
    }
  };
  
  // 检查是否有配置
  const hasConfig = !!getLLMConfig();
  
  return (
    <div className="settings-page">
      {!hasConfig && (
        <div className="settings-page__notice">
          请先配置 LLM 才能开始游戏
        </div>
      )}

      <div className="container">
        <div className="card">
          <div className="settings-page__header">
            <h1 className="card-title">LLM 配置</h1>
            {hasSave && (
              <a href="#/court" className="btn btn-secondary settings-page__back">
                ← 返回游戏
              </a>
            )}
          </div>
          <p className="text-muted">配置 AI 模型以启用游戏叙事功能</p>
          
          <div className="form-group">
            <label className="form-label">API 地址 *</label>
            <input
              type="text"
              className="input"
              value={config.baseURL}
              onChange={(e) => handleChange('baseURL', (e.target as HTMLInputElement).value)}
              placeholder="例如：https://kspmas.ksyun.com/v1"
            />
            <p className="form-hint">
              填到 <code>/v1</code> 为止，不要加 <code>/chat/completions</code>。
              若出现 CORS 错误，请确认 <code>.env.local</code> 中的 <code>VITE_API_BASE_URL</code> 与此处一致，然后重启开发服务器。
            </p>
          </div>
          
          <div className="form-group">
            <label className="form-label">API 密钥 *</label>
            <div className="input-group">
              <input
                type={showApiKey ? 'text' : 'password'}
                className="input"
                value={config.apiKey}
                onChange={(e) => handleChange('apiKey', (e.target as HTMLInputElement).value)}
                placeholder="输入 API 密钥"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">主模型 *</label>
            <input
              type="text"
              className="input"
              value={config.modelMain}
              onChange={(e) => handleChange('modelMain', (e.target as HTMLInputElement).value)}
              placeholder="例如：gpt-4"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">经济模型（可选）</label>
            <input
              type="text"
              className="input"
              value={config.modelCheap || ''}
              onChange={(e) => handleChange('modelCheap', (e.target as HTMLInputElement).value)}
              placeholder="例如：gpt-3.5-turbo"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">最大令牌数</label>
            <input
              type="number"
              className="input"
              value={config.maxTokens}
              onChange={(e) => handleChange('maxTokens', parseInt((e.target as HTMLInputElement).value) || 1000)}
              min="100"
              max="4000"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">温度</label>
            <input
              type="number"
              className="input"
              value={config.temperature}
              onChange={(e) => handleChange('temperature', parseFloat((e.target as HTMLInputElement).value) || 0.7)}
              min="0"
              max="2"
              step="0.1"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">提供商</label>
            <select
              className="input"
              value={config.provider}
              onChange={(e) => handleChange('provider', (e.target as HTMLSelectElement).value)}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          
          <div className="settings-page__actions">
            <button
              className="btn btn-secondary"
              onClick={testConnection}
              disabled={isTesting}
            >
              {isTesting ? '测试中...' : '测试连接'}
              {testResult === 'success' && ' ✓'}
              {testResult === 'error' && ' ✕'}
            </button>
            
            <button
              className="btn btn-primary"
              onClick={saveConfig}
            >
              保存
            </button>
            
            <button
              className="btn btn-danger"
              onClick={clearConfig}
            >
              清除密钥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}