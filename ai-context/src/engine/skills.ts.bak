// SKILL_ROUTES 常量（占位，待 mimo 素材填充）
export const SKILL_ROUTES: Record<string, string[]> = {
  // 意图类型: [技能ID列表]
  '加税': ['tax_increase'],
  '减税': ['tax_decrease'],
  '调兵': ['military_move'],
  '任命': ['appointment'],
  '赦免': ['pardon'],
  '征召': ['conscription'],
  '修筑': ['construction'],
  '禁令': ['prohibition'],
  '下诏': ['decree'],
  '其他': ['general']
};

// 获取技能内容
export function getSkillContent(skillId: string): string {
  // TODO: 替换为 mimo 生成的技能内容
  const placeholderContent: Record<string, string> = {
    'tax_increase': '增加税收的技能内容',
    'tax_decrease': '减少税收的技能内容',
    'military_move': '调动军队的技能内容',
    'appointment': '任命官员的技能内容',
    'pardon': '赦免罪犯的技能内容',
    'conscription': '征召士兵的技能内容',
    'construction': '修筑建筑的技能内容',
    'prohibition': '颁布禁令的技能内容',
    'decree': '下达诏书的技能内容',
    'general': '通用处理技能内容'
  };
  
  return placeholderContent[skillId] || '';
}