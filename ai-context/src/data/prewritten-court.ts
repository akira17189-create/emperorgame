export interface CourtAgenda {
  id: string;
  title: string;
  year_range: [number, number];
  description: string;        // 王公公/太监宣读的开场白（1-2句）
  npc_stances: {
    npc_id: string;           // 对应 seed-npcs.ts 或 seed-npcs-phase45.ts 中的 id
    opening_line: string;     // NPC 固定开场台词（符合其 voice 字段）
    stance: '支持' | '反对' | '中立' | '观望';
    fallback_line: string;    // AI追问异常时的保底台词（1句话，角色化）
  }[];
  emperor_choices: {
    label: string;            // 按钮文字，例如"支持改革"
    result_text: string;      // 皇帝决策后的固定叙事（3-4句，narration.md文风）
    resource_hints: string;   // 简短资源变化提示，例如"国库-200 民心+5"
  }[];
}

export const COURT_AGENDAS: CourtAgenda[] = [
  {
    id: 'commercial_tax_reform',
    title: '商税改革',
    year_range: [1, 10],
    description: '户部呈报：近年商税征收不足，市舶司走私猖獗，国库空虚。众卿有何良策？',
    npc_stances: [
      {
        npc_id: 'xieyuan',
        opening_line: '陛下，臣查阅近年账册，商税实征不足应征四成。数据显示，若将税率从三十税一调至二十税一，同时严查走私，国库岁入可增三成。',
        stance: '支持',
        fallback_line: '此事需从长计议，容臣再核算具体数字。'
      },
      {
        npc_id: 'zhangmeng',
        opening_line: '陛下，兄弟们在前线打仗，哪懂什么商税。不过要是国库有钱了，能不能给边军多发点饷银？',
        stance: '中立',
        fallback_line: '这事儿还是问谢渊吧，他算账比我强。'
      },
      {
        npc_id: 'lijingzhai',
        opening_line: '陛下，臣以为加税之事需谨慎。商贾虽富，然天下苍生皆仰赖市井交易。若税负过重，恐物价飞涨，百姓受苦。',
        stance: '观望',
        fallback_line: '此事关乎民生，臣需再思量。'
      },
      {
        npc_id: 'guoshi',
        opening_line: '陛下可知，贫道在山中修行时，常见商队往来。税制如水，疏则通，堵则溢。',
        stance: '中立',
        fallback_line: '有意思。陛下自有圣断。'
      }
    ],
    emperor_choices: [
      {
        label: '支持改革，严查走私',
        result_text: '皇帝下旨整顿商税，市舶司官员战战兢兢。一月后，国库新增白银二十万两，但江南商户怨声载道。',
        resource_hints: '国库+20万两，民心-5，商业活力-10'
      },
      {
        label: '暂缓改革，安抚商户',
        result_text: '皇帝暂缓商税改革，商户松了口气。但国库依然空虚，边军军饷发放困难。',
        resource_hints: '国库+0，民心+3，边军士气-5'
      },
      {
        label: '彻查走私，不加税',
        result_text: '皇帝下令严查走私，不改变税率。走私减少，但税吏借机敲诈勒索，商户苦不堪言。',
        resource_hints: '国库+10万两，民心-3，腐败度+5'
      }
    ]
  },
  {
    id: 'border_troops',
    title: '边境增兵',
    year_range: [1, 8],
    description: '兵部奏报：北方游牧部落蠢蠢欲动，边军兵力不足。是否增兵？',
    npc_stances: [
      {
        npc_id: 'zhangmeng',
        opening_line: '陛下！北边那些蛮子又不老实了。兄弟们在前线日夜巡逻，就等着陛下一声令下！增兵三万，我亲自带队，保准把他们打回草原！',
        stance: '支持',
        fallback_line: '边关紧急，臣请陛下早做决断。'
      },
      {
        npc_id: 'xieyuan',
        opening_line: '陛下，臣核算过：增兵三万，年需军费八十万两。而国库现存不足五十万，边防拨款已超支。逻辑上，此时增兵恐引发财政危机。',
        stance: '反对',
        fallback_line: '数据不支持此时增兵，臣建议另寻他法。'
      },
      {
        npc_id: 'lijingzhai',
        opening_line: '陛下，圣人云：兵者凶器，圣人不得已而用之。劳民伤财以事边功，非明君所为。臣请陛下三思。',
        stance: '反对',
        fallback_line: '穷兵黷武，非社稷之福。'
      },
      {
        npc_id: 'guoshi',
        opening_line: '陛下可知，北方属水，主兵戈。今年太岁在北，动兵恐非吉兆。',
        stance: '观望',
        fallback_line: '天象如此，陛下圣断。'
      }
    ],
    emperor_choices: [
      {
        label: '增兵三万，主动出击',
        result_text: '皇帝力排众议，调兵三万增援北疆。张猛率军出击，小胜一场，但军费开支巨大，国库告急。',
        resource_hints: '国库-40万两，军事力量+20，民心+5'
      },
      {
        label: '增兵一万，防守为主',
        result_text: '皇帝折中增兵一万，加强防御。边关稳固，但游牧部落见无机可乘，转而劫掠商队。',
        resource_hints: '国库-15万两，军事力量+8，商业活力-5'
      },
      {
        label: '不增兵，加强训练',
        result_text: '皇帝拒绝增兵，下令加强现有边军训练。张猛虽有怨言，但执行命令，边军战力有所提升。',
        resource_hints: '国库-5万两，军事力量+5，张猛忠诚-10'
      }
    ]
  },
  {
    id: 'daoism_policy',
    title: '道教政策',
    year_range: [1, 10],
    description: '礼部奏请：国师玄明请求扩大道教在地方的影响力，设立更多道观。此事如何定夺？',
    npc_stances: [
      {
        npc_id: 'guoshi',
        opening_line: '陛下可知，道教乃靖朝国教。先帝崇道，天下安定。贫道以为，广设道观可教化百姓，安定民心。',
        stance: '支持',
        fallback_line: '道教之事，陛下自有圣断。'
      },
      {
        npc_id: 'lijingzhai',
        opening_line: '陛下，臣以为道教虽为国教，然过犹不及。前朝崇佛灭道，今朝崇道抑佛，皆非中正之道。天下苍生，无论僧道，皆陛下子民。',
        stance: '反对',
        fallback_line: '臣以为此事需谨慎。'
      },
      {
        npc_id: 'xieyuan',
        opening_line: '陛下，数据显示：每座道观年耗银五千两，而地方税收有限。若增设十座道观，年耗银五万两，相当于一个县的年税收。',
        stance: '中立',
        fallback_line: '此事有利有弊，请陛下权衡。'
      },
      {
        npc_id: 'zhangmeng',
        opening_line: '陛下，兄弟们在前线打仗，哪管什么道观。不过要是道士能帮忙祈福打胜仗，也不是坏事。',
        stance: '中立',
        fallback_line: '这事儿还是问别人吧。'
      }
    ],
    emperor_choices: [
      {
        label: '支持扩建道观',
        result_text: '皇帝准奏，在各地增设道观十座。玄明感激，但百姓抱怨劳民伤财，清流派官员上书反对。',
        resource_hints: '国库-5万两，道教影响力+20，民心-8，清流派关系-10'
      },
      {
        label: '暂缓扩建，维持现状',
        result_text: '皇帝暂缓扩建道观，玄明虽有失望，但表示理解。清流派官员松了口气。',
        resource_hints: '国库+0，道教影响力+0，民心+2，清流派关系+5'
      },
      {
        label: '限制道教扩张',
        result_text: '皇帝下旨限制道教扩张，玄明表面顺从，但眼神中闪过一丝不悦。道士们私下议论皇帝不敬神明。',
        resource_hints: '国库+0，道教影响力-10，民心+5，玄明忠诚-15'
      }
    ]
  },
  {
    id: 'land_survey',
    title: '清丈土地',
    year_range: [3, 10],
    description: '户部奏请：世家大族隐瞒田产，逃避赋税。是否清丈土地，重新核定税基？',
    npc_stances: [
      {
        npc_id: 'lijingzhai',
        opening_line: '陛下，臣以为清丈土地乃当务之急。世家大族侵占民田，隐瞒赋税，此乃朝廷之大患。天下苍生，皆盼陛下主持公道。',
        stance: '支持',
        fallback_line: '此事关乎国本，臣坚决支持。'
      },
      {
        npc_id: 'xieyuan',
        opening_line: '陛下，清丈土地理论上可行，但执行困难。世家大族盘根错节，地方官员多为其门生故吏。若强行推进，恐引发地方动荡。',
        stance: '观望',
        fallback_line: '此事需谨慎行事，不可操之过急。'
      },
      {
        npc_id: 'zhangmeng',
        opening_line: '陛下，这清丈土地的事儿，兄弟们不懂。不过要是世家敢闹事，我手下的兵可不是吃素的！',
        stance: '中立',
        fallback_line: '这事儿还是问文官吧。'
      },
      {
        npc_id: 'guoshi',
        opening_line: '陛下可知，土地如人体血脉，堵塞则病。然强行疏通，恐伤及根本。',
        stance: '中立',
        fallback_line: '此事需顺势而为。'
      }
    ],
    emperor_choices: [
      {
        label: '全面清丈，严惩隐瞒',
        result_text: '皇帝下旨清丈土地，派遣钦差大臣前往各地。世家大族强烈反弹，地方官员阳奉阴违，清丈工作困难重重。',
        resource_hints: '国库+30万两（预期），世家关系-30，地方稳定-20'
      },
      {
        label: '试点清丈，稳步推进',
        result_text: '皇帝选择在江南试点清丈土地，谨慎推进。世家大族观望，清丈工作缓慢但稳步推进。',
        resource_hints: '国库+5万两（试点），世家关系-10，地方稳定-5'
      },
      {
        label: '暂缓清丈，安抚世家',
        result_text: '皇帝暂缓清丈土地，世家大族松了口气。但清流派官员失望，李敬斋上书反对。',
        resource_hints: '国库+0，世家关系+10，清流派关系-15'
      }
    ]
  },
  {
    id: 'imperial_exam_reform',
    title: '科举改革',
    year_range: [2, 10],
    description: '礼部奏请：科举考试内容陈旧，选拔人才效率低下。是否改革科举制度？',
    npc_stances: [
      {
        npc_id: 'lijingzhai',
        opening_line: '陛下，臣以为科举乃国家抡才大典，当以经义为本，策论为辅。然近年八股取士，束缚思想，臣请增设实务策论，选拔真才实学之士。',
        stance: '支持',
        fallback_line: '科举改革，关乎天下读书人。'
      },
      {
        npc_id: 'xieyuan',
        opening_line: '陛下，数据显示：近年进士中，寒门子弟不足三成，世家大族垄断科举。若增加实务策论，可打破这种垄断，选拔真正有才能的人。',
        stance: '支持',
        fallback_line: '改革科举，利大于弊。'
      },
      {
        npc_id: 'zhangmeng',
        opening_line: '陛下，这科举的事儿，兄弟们不懂。不过要是能选出几个能打仗的将军，那倒是好事。',
        stance: '中立',
        fallback_line: '这事儿还是问文官吧。'
      },
      {
        npc_id: 'guoshi',
        opening_line: '陛下可知，科举如炼丹，需文武火候适中。过犹不及，改革需谨慎。',
        stance: '观望',
        fallback_line: '此事需循序渐进。'
      }
    ],
    emperor_choices: [
      {
        label: '增设实务策论',
        result_text: '皇帝下旨改革科举，增设实务策论。寒门子弟欢欣鼓舞，但世家大族强烈反对，认为改革动摇国本。',
        resource_hints: '民心+15，世家关系-20，人才选拔效率+20'
      },
      {
        label: '维持现状，微调细节',
        result_text: '皇帝决定维持科举现状，只做微调。世家大族满意，但寒门子弟失望，清流派官员上书反对。',
        resource_hints: '民心-5，世家关系+10，人才选拔效率+5'
      },
      {
        label: '全面改革，废除八股',
        result_text: '皇帝下旨全面改革科举，废除八股文。此举震动朝野，世家大族强烈反弹，但寒门子弟欢欣鼓舞。',
        resource_hints: '民心+25，世家关系-35，人才选拔效率+30'
      }
    ]
  }
];
