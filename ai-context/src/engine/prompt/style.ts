export type NarrativeStyle = 'normal' | 'dark' | 'satire' | 'poetic';

export function buildStylePrompt(style: NarrativeStyle = 'normal'): string {
  const stylePrompts: Record<NarrativeStyle, string> = {
    normal: `
【文风要求：标准历史叙事】
- 简洁明了，避免冗余修饰
- 以事实描述为主，适当加入细节
- 语言庄重，符合历史记载风格
- 保持客观中立的叙述视角
- 时间线索清晰，事件逻辑连贯`,
    
    dark: `
【文风要求：黑暗现实主义】
- 压抑沉重的基调，突出权力斗争的残酷
- 冷静客观的描述，避免情感渲染
- 强调决策的代价和后果
- 使用简短有力的句子，增强紧张感
- 突出人物内心的矛盾和挣扎`,
    
    satire: `
【文风要求：讽刺黑色幽默】
- 使用反讽和夸张手法
- 在严肃情境中加入荒诞元素
- 揭示制度与人性之间的矛盾
- 语言可以轻松但内涵深刻
- 保持一定的距离感，像旁观者评论`,
    
    poetic: `
【文风要求：诗意历史叙事】
- 使用富有韵律感的语言
- 适当运用比喻和象征
- 注重意境营造和情感表达
- 语言优美但不过度华丽
- 保持历史感，避免过于现代的表达`
  };

  return stylePrompts[style] || stylePrompts.normal;
}

export function getStyleFromState(state: any): NarrativeStyle {
  // 从游戏状态中获取当前风格标签
  const tags = state?.style_state?.current_tags || [];
  
  if (tags.includes('黑暗') || tags.includes('沉重')) {
    return 'dark';
  } else if (tags.includes('讽刺') || tags.includes('幽默')) {
    return 'satire';
  } else if (tags.includes('诗意') || tags.includes('抒情')) {
    return 'poetic';
  }
  
  return 'normal';
}