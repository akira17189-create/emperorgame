import { NARRATIVE_STYLE_RULES_PROMPT } from '../../data/lore-bridge';

export type NarrativeStyle = 'normal' | 'dark' | 'satire' | 'poetic';

/** 额外的tone修饰符，叠加在15条规则之上 */
const TONE_MODIFIERS: Record<NarrativeStyle, string> = {
  normal: '',
  dark:   `\n【本段附加指令·黑暗现实主义】压抑基调。强调决策代价。不要柔化后果。`,
  satire: `\n【本段附加指令·讽刺黑色幽默】反讽和夸张手法。严肃情境中加入荒诞元素。距离感如旁观者评论。`,
  poetic: `\n【本段附加指令·诗意叙事】意境营造。比喻和象征。但历史感不能丢失。`
};

export function buildStylePrompt(style: NarrativeStyle = 'normal'): string {
  return NARRATIVE_STYLE_RULES_PROMPT + (TONE_MODIFIERS[style] || '');
}

export function getStyleFromState(state: any): NarrativeStyle {
  const tags = state?.style_state?.current_tags || [];
  if (tags.includes('黑暗') || tags.includes('沉重')) return 'dark';
  if (tags.includes('讽刺') || tags.includes('幽默')) return 'satire';
  if (tags.includes('诗意') || tags.includes('抒情')) return 'poetic';
  return 'normal';
}
