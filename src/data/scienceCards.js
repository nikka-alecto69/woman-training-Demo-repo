/*
 * 女训 · 科普卡片库 (scienceCards)
 * --------------------------------------------------------------------------
 * 用于【F2 科普小知识】功能：根据用户当日状态随机推送一张适配的女本位科普卡片。
 *
 * 纪律：
 *   - 全部为改写后的原创科普文案，不直接引用原书原文（版权）。
 *   - 每张卡带 source / sourceFile / evidenceLevel，用于页尾小灰字出处标注（可信度 + 免责）。
 *   - 不含医疗诊断、用药/剂量建议；HRT、补剂等只中立科普并引导就医。
 *   - 经《知识库综合评估报告》过滤：男性作者（The Better Half）仅取免疫/寿命等可核实点；
 *     伪科学/性别对立/确定性周期处方一律不入卡。
 *
 * trigger：卡片适合推送的用户状态（推荐引擎据此匹配；general 可常驻随机池）。
 *   general / on_period / premenstrual / follicular / low_mood / low_energy /
 *   menopause_stage / strength_day / post_workout / sleep_poor
 *
 * 加载：浏览器全局 window.NvxunScienceCards；Node module.exports。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NvxunScienceCards = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CARDS = [
    // —— 周期 ——
    {
      id: 'card.cycle_whole_body', category: 'cycle', trigger: 'on_period',
      title: '月经周期影响的，远不止子宫',
      body: '大型研究在女性血浆里发现近 200 种蛋白会随月经周期变化，牵涉免疫、代谢和心血管。所以经期前后状态起伏，是全身性的，不是“妳想多了”。',
      evidenceLevel: 'strong',
      source: 'Riishede et al., Nature Medicine 2026《人类月经周期的血浆蛋白质组特征》',
      sourceFile: 's41591-026-04326-5.pdf',
      safetyNotes: '这是生物标志物研究，不用于预测个人表现或开训练处方。'
    },
    {
      id: 'card.cycle_four_seasons', category: 'cycle', trigger: 'general',
      title: '把周期想象成妳的“四季”',
      body: '从月经到排卵像内在的春天，能量渐长；排卵后到下次月经像秋冬，更想收一收。把它当作读懂自己的参考，而不是必须遵守的时刻表。',
      evidenceLevel: 'moderate',
      source: 'Period Power（Maisie Hill）周期四阶段/四季框架',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      safetyNotes: '阶段感受因人而异，不预测一定更强或更弱。'
    },
    {
      id: 'card.hormones_mood', category: 'cycle', trigger: 'low_mood',
      title: '激素真的会影响情绪和大脑',
      body: '雌激素、孕激素的起伏会影响神经递质，进而影响情绪、专注与压力反应。经前情绪波动很常见——这是生理，不是妳的错。',
      evidenceLevel: 'moderate',
      source: 'This Is Your Brain on Birth Control（Sarah Hill）激素-大脑视角',
      sourceFile: 'This Is Your Brain on Birth Control (Sarah E. Hill) (z-library.sk, 1lib.sk, z-lib.sk).epub',
      safetyNotes: '持续低落或影响生活时，请寻求专业帮助。'
    },
    {
      id: 'card.premenstrual_normal', category: 'cycle', trigger: 'premenstrual',
      title: '经前更累、更饿，都很正常',
      body: '黄体期身体代谢和食欲会有变化，更想吃、更易疲劳是常见现象。规律吃饭、把训练调温和，比苛责自己有用得多。',
      evidenceLevel: 'moderate',
      source: 'Period Power（Maisie Hill）黄体期描述；ROAR 周期与代谢方向',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      safetyNotes: '不把正常波动病理化。'
    },

    // —— 运动 / 训练 ——
    {
      id: 'card.not_small_man', category: 'training', trigger: 'general',
      title: '女性不是“缩小版的男人”',
      body: '女性在代谢、体温调节、补水和恢复上都有自己的特点。照搬男性的训练和营养模板，未必适合妳——这正是“女本位”的意义。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）核心主张',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      safetyNotes: '强调个体化，不做绝对化性别二分。'
    },
    {
      id: 'card.strength_bone', category: 'training', trigger: 'strength_day',
      title: '力量训练是女性的“骨骼银行”',
      body: '规律的阻抗训练能帮助维持肌肉和骨密度，越早开始越受益，对更年期之后尤其重要。今天练的每一下，都是在为未来存本钱。',
      evidenceLevel: 'strong',
      source: 'ROAR / Next Level（Stacy Sims）力量与骨健康方向',
      sourceFile: 'Next Level Your Guide ... (Stacy T. Sims PhD, Selene Yeager).pdf',
      safetyNotes: '循序渐进，有不适即调整；不替代骨质疏松的医疗管理。'
    },
    {
      id: 'card.recovery_is_training', category: 'training', trigger: 'low_energy',
      title: '恢复也是训练的一部分',
      body: '睡不好、压力大、太累的时候降量，不是偷懒，而是聪明。身体是在恢复里变强的，不是在硬撑里。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）恢复与负荷管理方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      safetyNotes: '支持性表达，避免让用户产生失败感。'
    },
    {
      id: 'card.exercise_brain', category: 'brain', trigger: 'low_mood',
      title: '动一动，对大脑也有好处',
      body: '规律运动与更好的认知、情绪和睡眠相关，对女性中年及之后的大脑健康尤其有帮助。心情差的时候，一点点活动也算数。',
      evidenceLevel: 'strong',
      source: 'The Menopause Brain / The XX Brain（Lisa Mosconi）',
      sourceFile: 'The Menopause Brain (Lisa Mosconi).epub',
      safetyNotes: '科普陈述，不替代精神科/神经科诊疗。'
    },

    // —— 营养 ——
    {
      id: 'card.quality_protein', category: 'nutrition', trigger: 'post_workout',
      title: '蛋白质，挑“优质”的吃',
      body: '蛋、奶、鱼、瘦肉、豆制品都是优质蛋白来源，对肌肉、免疫和恢复都重要。训练后吃一份，比纠结补剂实在得多。',
      evidenceLevel: 'moderate',
      source: '《你是你吃出来的 1》（夏萌）蛋白质平衡章节',
      sourceFile: '你是你吃出来的：吃对少生病，病了这样吃 (.epub',
      safetyNotes: '只给方向，不写固定克数；特殊疾病饮食遵医嘱。'
    },
    {
      id: 'card.iron_for_women', category: 'nutrition', trigger: 'on_period',
      title: '女性更要关注“铁”',
      body: '月经会带走一部分铁，缺铁会让人累、没劲。瘦红肉、深绿叶菜、豆类配点维生素 C，是友好的补铁组合。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）女性铁需求方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      safetyNotes: '不自行补铁剂；疑似贫血/经量过大请就医检查。'
    },
    {
      id: 'card.mediterranean_brain', category: 'nutrition', trigger: 'menopause_stage',
      title: '“地中海式”吃法，身心都受益',
      body: '蔬菜、全谷、豆类、鱼、橄榄油、坚果为主，少高糖深加工，对中年的大脑、情绪和心血管都更友好。',
      evidenceLevel: 'strong',
      source: 'The Menopause Brain / The XX Brain（Lisa Mosconi）护脑饮食',
      sourceFile: 'The Menopause Brain (Lisa Mosconi).epub',
      safetyNotes: '饮食模式建议，不替代个人疾病的营养治疗。'
    },

    // —— 更年期 ——
    {
      id: 'card.menopause_normal', category: 'menopause', trigger: 'menopause_stage',
      title: '更年期是阶段，不是故障',
      body: '围绝经/更年期是正常的生命阶段。了解它、用生活方式（睡眠、运动、营养）好好管理，妳完全可以过得有力量、有质量。',
      evidenceLevel: 'strong',
      source: '《炙热的你：关于了不起的女性更年期的一切》（Sheila de Liz）；The Lancet 2024 更年期系列',
      sourceFile: '炙热的你 ：关于了不起的女性更年期的一切 =.epub',
      safetyNotes: '中立科普；症状明显或影响生活时建议就医评估。'
    },
    {
      id: 'card.menopause_not_overmedical', category: 'menopause', trigger: 'menopause_stage',
      title: '既不必恐慌，也不必神化',
      body: '更年期不该被当成“必须用药修复的病”，也不必默默硬扛。掌握高质量信息、和医生一起做决定，才是赋权的方式。',
      evidenceLevel: 'strong',
      source: 'The Lancet 2024 Menopause Series（赋权管理、反过度医疗化）',
      sourceFile: 'Lancet_2024_Menopause_Series_4papers.pdf',
      safetyNotes: '不站队、不开方；是否使用 HRT 由本人与医生共同决定。'
    },
    {
      id: 'card.hrt_talk_to_doctor', category: 'menopause', trigger: 'menopause_stage',
      title: '关于激素治疗（HRT）',
      body: '对很多人来说，HRT 是缓解潮热等症状、保护骨骼的有效选择，但它有适应证也有禁忌证。它适不适合妳，需要和医生一起评估。',
      evidenceLevel: 'strong',
      source: 'NAMS 2022 激素治疗立场声明；Estrogen Matters（并列平衡视角）',
      sourceFile: 'NAMS_2022_Hormone_Therapy_Position_Statement.pdf',
      safetyNotes: 'App 不提供具体用药、剂量或方案，请咨询医生。'
    },
    {
      id: 'card.symptom_az', category: 'menopause', trigger: 'menopause_stage',
      title: '更年期的症状，远不止潮热',
      body: '关节痛、脑雾、睡眠差、情绪起伏、心悸……很多看似无关的不适都可能和激素变化有关。把它们记下来，和医生沟通会更清楚。',
      evidenceLevel: 'moderate',
      source: 'The New Menopause（Mary Claire Haver）症状 A–Z',
      sourceFile: 'The New Menopause (Mary Claire Haver, MD).epub',
      safetyNotes: '帮助觉察，不用于自我诊断；商业化补剂/饮食主张未采纳。'
    },
    {
      id: 'card.bust_myths', category: 'menopause', trigger: 'general',
      title: '警惕“更年期神药”',
      body: '凡是宣称能一招解决所有更年期问题、或贩卖排毒/抗衰神器的，多半是生意而非科学。可信的建议，通常朴素又愿意承认“因人而异”。',
      evidenceLevel: 'strong',
      source: 'The Menopause Manifesto（Jen Gunter）反伪科学',
      sourceFile: 'The menopause manifesto (Jen Gunter).pdf',
      safetyNotes: '提醒辨别营销，不点名具体产品。'
    },

    // —— 女本位 / 性别医学 ——
    {
      id: 'card.gender_data_gap', category: 'women_centric', trigger: 'general',
      title: '医学曾把“男性”当成默认人体',
      body: '很多药物剂量、诊断标准最初主要基于男性身体研究，女性的差异长期被忽略。所以一个真正“为女性设计”的健康工具，本就该存在。',
      evidenceLevel: 'strong',
      source: '看不见的女性 / Invisible Women（Caroline Criado Perez）',
      sourceFile: '看不见的女性.epub',
      safetyNotes: '陈述数据差距，不渲染对立。'
    },
    {
      id: 'card.same_disease_diff_signs', category: 'women_centric', trigger: 'general',
      title: '同一种病，女性的信号可能不一样',
      body: '比如心脏病，女性的症状常和教科书里的“典型”不同，更容易被忽视。了解这些差异，是在关键时刻保护自己。',
      evidenceLevel: 'strong',
      source: 'Sex Matters（Alyson McGregor, MD）',
      sourceFile: 'Sex Matters (Alyson J. McGregor, MD).pdf',
      safetyNotes: '科普差异意识，不替代急症就医判断。'
    },
    {
      id: 'card.bust_brain_myth', category: 'women_centric', trigger: 'general',
      title: '“女性天生不擅长XX”？多半是误读',
      body: '不少所谓“男女大脑天生大不同”的说法，被后续研究证明被夸大了。别让过时的刻板印象，定义妳能成为谁。',
      evidenceLevel: 'strong',
      source: '逊色 / Inferior（Angela Saini）反神经性别论',
      sourceFile: '逊色：科学对女性做错了什么 = Inferior (Angela Saini).epub',
      safetyNotes: '用于校准刻板化，不做相反的绝对化。'
    },
    {
      id: 'card.evolution_of_menstruation', category: 'women_centric', trigger: 'on_period',
      title: '月经，是写进进化里的设计',
      body: '在演化的长河里，月经与女性身体的诸多特性塑造了人类。妳身体里的这套节律，本身就是一件了不起的事。',
      evidenceLevel: 'moderate',
      source: 'Eve（Cat Bohannon）女性身体进化',
      sourceFile: 'Eve How the Female Body Drove 200 Million Years (Cat Bohannon).epub',
      safetyNotes: '趣味科普；进化叙事部分存学界讨论，措辞不绝对。'
    },
    {
      id: 'card.immune_longevity', category: 'women_centric', trigger: 'general',
      title: '女性的免疫与寿命优势',
      body: '平均而言，女性的免疫应答更强、寿命更长，这与 X 染色体的“双拷贝”等机制有关。好好照顾身体，把这份底子发挥出来。',
      evidenceLevel: 'moderate',
      source: 'The Better Half（Sharon Moalem）——仅取免疫/寿命/X 冗余等可核实点',
      sourceFile: 'The Better Half On the Genetic Superiority of Women (Sharon Moalem) (z-library.sk, 1lib.sk, z-lib.sk).epub',
      safetyNotes: '只取可核实点，不采“基因更优越/碾压男性”等价值判断。'
    },

    // —— 睡眠 / 恢复 ——
    {
      id: 'card.sleep_matters', category: 'recovery', trigger: 'sleep_poor',
      title: '睡眠，是被低估的“训练装备”',
      body: '睡不好会拖慢恢复、影响食欲和情绪。如果最近睡眠差，今天对自己宽容一点，把强度调低，先把觉补回来。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）恢复方向；Mosconi 睡眠与脑健康方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      safetyNotes: '长期失眠请就医排查。'
    }
  ];

  var SCIENCE_DISCLAIMERS = {
    eduOnly: '以上为科普信息，不构成医疗诊断或个体化治疗建议。',
    rewritten: '内容为基于书目的原创改写，关键结论以原始出处为准。',
    seekHelp: '出现明显或持续症状时，请咨询医生等专业人士。'
  };

  var byTrigger = {};
  CARDS.forEach(function (c) { (byTrigger[c.trigger] = byTrigger[c.trigger] || []).push(c); });

  return {
    CARDS: CARDS,
    SCIENCE_DISCLAIMERS: SCIENCE_DISCLAIMERS,
    /** 按状态取卡；trigger 缺省回退到 general 池 + 全量随机。 */
    getCardsForState: function (trigger) {
      return byTrigger[trigger] || byTrigger.general || CARDS;
    },
    getRandomCard: function (trigger) {
      var pool = (trigger && byTrigger[trigger]) ? byTrigger[trigger] : CARDS;
      return pool[Math.floor(Math.random() * pool.length)];
    }
  };
});
