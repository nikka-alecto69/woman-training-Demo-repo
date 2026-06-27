/*
 * 女训 · 知识声明层 (knowledgeClaims)
 * --------------------------------------------------------------------------
 * 唯一的"循证知识真相源"。每条声明都：
 *   - 经《书籍内容评估报告.md》过滤，只保留 ✅ 可用方向；
 *   - 已改写为原创、中立、可执行的产品文案（不直接引用书中原文）；
 *   - 标注来源文件与证据等级，能定位章节才写，否则标"需后续人工核对"。
 *
 * 被明确排除的内容（性别优越论、伪科学、按周期强处方、HRT 用药、大剂量补剂等）
 * 集中登记在 EXCLUDED_CONTENT 中，供"内容边界"页与文档展示，也作为审计清单。
 *
 * 加载方式：浏览器中作为全局 window.NvxunKnowledge；Node 中作为 module.exports，
 * 供单元测试直接引用，无需构建步骤。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NvxunKnowledge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var NEEDS_REVIEW = '需后续人工核对原始页码';

  /** @type {import('../types/healthRecommendation.js').KnowledgeClaim[]} */
  var CLAIMS = [
    // —— 周期 cycle ——
    {
      id: 'cycle.individual_variation',
      category: 'cycle',
      statement: '月经周期对运动表现的平均影响很小且个体差异极大，不支持按阶段做精确强处方。',
      userFacingReason: '月经周期可能影响部分人的感受和恢复，但影响因人而异，所以我们只把它当作可选参考。',
      evidenceLevel: 'strong',
      source: 'McNulty et al. 2020, Sports Medicine（meta 分析）/ Elliott-Sale et al. 2021（经 ROAR 评估报告转述）',
      sourceType: 'peer_reviewed_paper',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '不可据此预测某人一定会表现更差或更强。'
    },
    {
      id: 'cycle.self_perception_first',
      category: 'cycle',
      statement: '以自我感受为主、弹性调整，优于按阶段安排固定训练。',
      userFacingReason: '我们用"自我感受 + 弹性调整"，而不是按周期阶段强制安排训练。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）经评估报告过滤后的"弹性调整"理念',
      sourceType: 'book',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW
    },
    {
      id: 'cycle.systemic_signal',
      category: 'cycle',
      statement: '月经周期与全身血浆蛋白质组（免疫/代谢/心血管相关）存在系统性关联。',
      userFacingReason: '研究显示月经周期与全身多个系统相关，这是把周期纳入参考的科学背书，但它不直接给出训练处方。',
      evidenceLevel: 'strong',
      source: 'Riishede et al., Nature Medicine 32:2311-2318 (2026), Plasma proteomic signature of the human menstrual cycle',
      sourceType: 'peer_reviewed_paper',
      sourceFile: 's41591-026-04326-5.pdf',
      sourcePageOrSection: 'Nature Medicine 2026, 32:2311-2318',
      safetyNotes: '这是生物标志物研究，不可外推为具体动作或强度建议。'
    },

    // —— 训练 training ——
    {
      id: 'training.strength_bone_health',
      category: 'training',
      statement: '力量训练是女性长期肌肉、功能能力与骨骼健康的重要基础。',
      userFacingReason: '力量训练有助于长期的肌肉、功能能力和骨骼健康。',
      evidenceLevel: 'strong',
      source: 'ROAR（Stacy Sims）/《你是你吃出来的》中力量与骨健康方向',
      sourceType: 'book',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW
    },
    {
      id: 'training.quality_over_proving',
      category: 'training',
      statement: '动作质量与身体感受优先于"证明自己"。',
      userFacingReason: '状态好时也以动作质量和身体感受为准，不需要为了证明自己而硬冲。',
      evidenceLevel: 'practical',
      source: '通用力量训练实践原则',
      sourceType: 'practical_guidance',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW
    },

    // —— 恢复 recovery ——
    {
      id: 'recovery.fatigue_room',
      category: 'recovery',
      statement: '睡眠差、疲劳高、压力大或酸痛明显时，降低训练总量或强度有助于长期节奏。',
      userFacingReason: '妳反馈的睡眠/疲劳/压力让今天的恢复空间变小，所以我们把训练总量调轻一些。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）恢复方向 + 通用训练负荷管理',
      sourceType: 'book',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '用支持性语言，避免让用户产生失败感；保留短时完成版。'
    },

    // —— 营养 nutrition ——
    {
      id: 'nutrition.protein_carb_meal',
      category: 'nutrition',
      statement: '训练后安排含优质蛋白与碳水的正餐/加餐、规律饮食，是合理的大方向。',
      userFacingReason: '训练后可以优先吃到含优质蛋白和碳水的正餐或加餐，帮助恢复。',
      evidenceLevel: 'moderate',
      source: '《你是你吃出来的 1/2》（夏萌）均衡营养与优质蛋白方向；ROAR 蛋白质大方向',
      sourceType: 'book',
      sourceFile: '你是你吃出来的：吃对少生病，病了这样吃 (.epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '只给方向，不写固定克数、固定比例或补剂剂量；不鼓励极端节食。'
    },
    {
      id: 'nutrition.hydration_electrolytes',
      category: 'nutrition',
      statement: '出汗多、天气炎热或训练时间较长时，关注补水与电解质。',
      userFacingReason: '今天的训练出汗或时长较多，记得训练前后补水；大汗或炎热时可关注电解质。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）女性补水与体温调节方向',
      sourceType: 'book',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW
    },

    // —— 更年期 menopause ——
    {
      id: 'menopause.normal_stage',
      category: 'menopause',
      statement: '围绝经/更年期是正常生命阶段，可通过生活方式、睡眠、骨健康与力量训练管理。',
      userFacingReason: '围绝经/更年期是正常阶段，力量训练、平衡与恢复对这一阶段尤其有帮助。',
      evidenceLevel: 'strong',
      source: '《炙热的你：关于了不起的女性更年期的一切》（Sheila de Liz，妇科医生）',
      sourceType: 'book',
      sourceFile: '炙热的你 ：关于了不起的女性更年期的一切 =.epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '只做中立科普与生活方式建议；HRT 仅引导就医，不推荐具体药物、剂量或方案。'
    },
    {
      id: 'menopause.strength_balance_impact',
      category: 'menopause',
      statement: '围绝经/绝经阶段可提高力量训练优先级，并在无禁忌、状态允许时加入平衡与温和负重/冲击。',
      userFacingReason: '在状态允许且无不适时，这一阶段适合优先安排力量、平衡与温和的负重训练，关注骨健康。',
      evidenceLevel: 'moderate',
      source: '《炙热的你》骨健康与运动方向 + ROAR 更年期运动方向',
      sourceType: 'book',
      sourceFile: '炙热的你 ：关于了不起的女性更年期的一切 =.epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '仅限无禁忌和当天状态允许时；这是生活方式建议，不替代医疗建议。'
    },

    // —— 疼痛与康复 pain_or_rehab ——
    {
      id: 'pain.no_load_on_pain',
      category: 'pain_or_rehab',
      statement: '明显疼痛、功能受限或伤后恢复时，避免高冲击、高负荷、爆发力训练。',
      userFacingReason: '妳标记了疼痛/不适，所以今天避开了高冲击和大负荷动作，保留更舒缓的选择。',
      evidenceLevel: 'practical',
      source: '通用运动安全与康复原则',
      sourceType: 'practical_guidance',
      sourceFile: '通用运动安全与康复原则',
      sourcePageOrSection: '通用安全原则（无单一书目来源）',
      safetyNotes: '不诊断疾病；持续或加重时建议咨询合格专业人士。'
    },
    {
      id: 'pain.seek_help_red_flags',
      category: 'pain_or_rehab',
      statement: '持续疼痛、明显功能受限、创伤后疼痛、异常出血、严重头晕或胸痛等，应停止自行加练并就医。',
      userFacingReason: '出现持续疼痛、异常出血、严重头晕或胸痛等情况时，请停止自行加练并寻求专业帮助。',
      evidenceLevel: 'practical',
      source: '通用医疗安全提示（综合循证更年期医学与运动安全原则）',
      sourceType: 'practical_guidance',
      sourceFile: '通用医疗安全提示',
      sourcePageOrSection: '通用安全原则（无单一书目来源）',
      safetyNotes: '本提示不替代医疗诊断。'
    },

    // —— 周期四阶段（自我觉察框架，非确定性处方）cycle ——
    {
      id: 'cycle.four_phase_frame',
      category: 'cycle',
      statement: '月经周期可粗分为卵泡期（月经至排卵）与黄体期（排卵至下次月经），可作为自我觉察的“四季”框架，但不应作为确定性处方。',
      userFacingReason: '我们把周期看作一个“四季”节奏：有时精力更足、有时更想休整。这只是帮妳读懂自己的参考，不是规定。',
      evidenceLevel: 'moderate',
      source: 'Period Power（Maisie Hill）的周期四阶段/四季框架（已去除确定性同步处方）',
      sourceType: 'book',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      sourcePageOrSection: 'Part 1: The Menstrual Cycle / Follicular Phase: Menstruation to Ovulation',
      safetyNotes: '阶段划分因人而异；仅作自我觉察，不预测某人一定更强或更弱。'
    },
    {
      id: 'cycle.follicular_capacity_optional',
      category: 'cycle',
      statement: '部分人在卵泡期（月经结束后到排卵前）自觉精力与训练意愿较高，可在状态允许时尝试稍高强度；但个体差异极大。',
      userFacingReason: '如果这几天妳感觉精力不错，可以在舒服的前提下安排稍有挑战的训练——以妳的真实感受为准。',
      evidenceLevel: 'moderate',
      source: 'Period Power（Maisie Hill）卵泡期描述 + ROAR 弹性调整理念',
      sourceType: 'book',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      sourcePageOrSection: 'Follicular Phase（已弱化为“可选、因人而异”）',
      safetyNotes: '不强制；不让用户因“没感觉更强”而自责。'
    },
    {
      id: 'cycle.menstrual_luteal_recovery_optional',
      category: 'cycle',
      statement: '部分人在经期或经前（黄体期后段）更易疲劳，可优先安排恢复性、低冲击训练或缩短时长。',
      userFacingReason: '如果今天经期/经前让妳更累，我们就把训练调得更温和一些，以舒适和恢复为先。',
      evidenceLevel: 'moderate',
      source: 'Period Power（Maisie Hill）经期/黄体期描述 + ROAR 恢复方向',
      sourceType: 'book',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      sourcePageOrSection: 'Menstruation / Luteal Phase（已弱化为“可选、因人而异”）',
      safetyNotes: '不暗示经期必须停训；运动对部分人反而缓解经期不适。'
    },

    // —— 更年期训练 menopause（Next Level）——
    {
      id: 'menopause.strength_and_intensity_priority',
      category: 'menopause',
      statement: '围绝经/绝经期可优先安排阻抗（力量）训练，并在无禁忌、状态允许时加入较高强度的短时刺激，以维持肌肉、力量与骨骼。',
      userFacingReason: '这一阶段，力量训练和（在妳状态允许时的）短时较高强度，对维持肌肉、骨骼和精力特别有帮助。',
      evidenceLevel: 'moderate',
      source: 'Next Level（Stacy Sims）围绝经/绝经训练方向（已去精确处方）',
      sourceType: 'book',
      sourceFile: 'Next Level Your Guide ... (Stacy T. Sims PhD, Selene Yeager).pdf',
      sourcePageOrSection: '更年期力量与强度章节（需后续人工核对页码）',
      safetyNotes: '仅限无禁忌与当天状态允许；强度循序渐进，出现不适即降量。'
    },

    // —— 大脑与运动 brain（Lisa Mosconi）——
    {
      id: 'brain.exercise_supports_brain',
      category: 'brain',
      statement: '规律的身体活动与运动有助于女性中年及之后的大脑健康（认知、情绪、睡眠）。',
      userFacingReason: '坚持动起来，不只对身体好，对大脑、情绪和睡眠也有帮助。',
      evidenceLevel: 'strong',
      source: 'The Menopause Brain / The XX Brain（Lisa Mosconi）运动与脑健康方向',
      sourceType: 'book',
      sourceFile: 'The Menopause Brain (Lisa Mosconi).epub',
      sourcePageOrSection: '运动与大脑章节（需后续人工核对页码）',
      safetyNotes: '科普性陈述，不替代神经科或精神科诊疗。'
    }
  ];

  /**
   * 明确排除 / 限制使用的内容清单（来自评估报告的 ❌ 与 ⚠️ 行）。
   * 用于"内容边界"页与 docs/knowledge-source-map.md，确保这些方向不会进入推荐。
   */
  var EXCLUDED_CONTENT = [
    { topic: '按月经周期阶段做精确、强制、固定比例的训练处方', reason: '主流 meta 分析显示周期对表现影响小且个体差异极大，强处方证据不足。', sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub' },
    { topic: '用周期预测某人一定表现更差或更强', reason: '证据不支持确定性预测。', sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub' },
    { topic: '“女性基因上更优越”“女性碾压男性”等价值判断', reason: '价值表述而非科学结论，易引发性别对立；仅取免疫/寿命/X 嵌合冗余等可核实点。', sourceFile: 'The Better Half On the Genetic Superiority of Women (Sharon Moalem) (z-library.sk, 1lib.sk, z-lib.sk).epub' },
    { topic: '“按月经阶段精确同步化训练/工作”的确定性处方（cycle syncing 强主张）', reason: '周期分阶段叙事可做自我觉察框架，但其因果收益证据有限，不做确定性处方。', sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi' },
    { topic: '“男女天生大不同”的夸大性别二分（神经性别论 neurosexism）', reason: '多项复核研究显示男女脑差异被夸大；用 Inferior/Menopause Manifesto 校准，避免刻板化。', sourceFile: '逊色：科学对女性做错了什么 = Inferior (Angela Saini).epub' },
    { topic: 'HRT / 激素的具体用药建议、剂量或替代方案', reason: 'HRT 有适应证与禁忌证，App 只做中立科普与就医引导；以 NAMS 2022 立场声明为事实准绳。', sourceFile: '炙热的你 ：关于了不起的女性更年期的一切 =.epub' },
    { topic: '大剂量维生素、抗氧化补剂、排毒、酸碱体质、旧石器饮食决定论', reason: '超出主流证据或属伪科学。', sourceFile: '你是你吃出来的2：慢病康复的饮食密码 (夏萌.epub' },
    { topic: '固定克数、固定补剂剂量、精确营养比例', reason: '方向合理但精确数字属个人外推，不做绝对化处方。', sourceFile: '你是你吃出来的：吃对少生病，病了这样吃 (.epub' }
  ];

  /** 主要来源列表（用于"内容来源原则"页）。 */
  var SOURCES = [
    { name: 'ROAR（Stacy Sims）', file: 'ROAR (Stacy Sims) (Z-Library).epub', usedFor: '弹性调整、补水与电解质、力量与恢复、蛋白质大方向（已过滤精确处方）。', evidenceLevel: 'moderate' },
    { name: '炙热的你·关于女性更年期的一切（Sheila de Liz）', file: '炙热的你 ：关于了不起的女性更年期的一切 =.epub', usedFor: '更年期基础科普、生活方式管理、骨健康与就医提示（HRT 仅中立科普）。', evidenceLevel: 'strong' },
    { name: '你是你吃出来的 1 / 2（夏萌）', file: '你是你吃出来的：吃对少生病，病了这样吃 (.epub', usedFor: '均衡营养、优质蛋白、规律饮食大方向（去精确比例）。', evidenceLevel: 'moderate' },
    { name: 'Riishede et al., Nature Medicine 2026', file: 's41591-026-04326-5.pdf', usedFor: '说明月经周期与全身系统存在关联的科学背书，不外推训练处方。', evidenceLevel: 'strong' },
    { name: 'Period Power（Maisie Hill）', file: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi', usedFor: '月经周期四阶段（四季隐喻）的自我觉察框架，用于训练节奏与祝贺文案语气（去除确定性同步处方）。', evidenceLevel: 'moderate' },
    { name: 'Next Level（Stacy Sims）', file: 'Next Level ... (Stacy T. Sims PhD, Selene Yeager).pdf', usedFor: '围绝经/绝经期力量优先、蛋白质与恢复方向（去精确处方）。', evidenceLevel: 'moderate' },
    { name: 'The Menopause Brain / The XX Brain（Lisa Mosconi）', file: 'The Menopause Brain (Lisa Mosconi).epub', usedFor: '雌激素-大脑-认知轴、护脑饮食与运动护脑的科普方向。', evidenceLevel: 'strong' },
    { name: 'The Menopause Manifesto（Jen Gunter）', file: 'The menopause manifesto (Jen Gunter).pdf', usedFor: '更年期循证科普 + 作为整库“反伪科学”质检标尺。', evidenceLevel: 'strong' },
    { name: 'The New Menopause（Mary Claire Haver）', file: 'The New Menopause (Mary Claire Haver, MD).epub', usedFor: '更年期症状 A–Z 索引，用于科普卡片信息架构（补剂/饮食主张需对照指南）。', evidenceLevel: 'moderate' },
    { name: 'Eve（Cat Bohannon）', file: 'Eve How the Female Body Drove 200 Million Years (Cat Bohannon).epub', usedFor: '月经/女性身体的进化意义，用于趣味科普与月经祝贺文案语气。', evidenceLevel: 'moderate' },
    { name: 'This Is Your Brain on Birth Control（Sarah Hill）', file: 'This Is Your Brain on Birth Control (Sarah E. Hill).epub', usedFor: '激素如何影响情绪/认知的科普视角（不对避孕给指导结论）。', evidenceLevel: 'moderate' },
    { name: 'Invisible Women / 看不见的女性（Caroline Criado Perez）', file: '看不见的女性.epub', usedFor: '性别数据鸿沟，用于“女本位”价值观科普与赋权语气。', evidenceLevel: 'strong' },
    { name: 'Inferior / 逊色（Angela Saini）', file: '逊色：科学对女性做错了什么 = Inferior (Angela Saini).epub', usedFor: '破除“女性身体迷思”，校准过度性别二分表述（质检标尺之一）。', evidenceLevel: 'strong' },
    { name: 'Sex Matters（Alyson McGregor）', file: 'Sex Matters (Alyson J. McGregor, MD).pdf', usedFor: '男女在用药/心血管/疼痛上的临床差异科普。', evidenceLevel: 'strong' },
    { name: 'The Lancet 2024 Menopause Series（4 篇）', file: 'Lancet_2024_Menopause_Series_4papers.pdf', usedFor: '更年期“赋权管理、反过度医疗化”的科普基调与一级证据。', evidenceLevel: 'strong' },
    { name: 'NAMS 2022 Hormone Therapy Position Statement', file: 'NAMS_2022_Hormone_Therapy_Position_Statement.pdf', usedFor: 'HRT 官方循证立场，作为激素相关科普的事实准绳（App 不开方）。', evidenceLevel: 'strong' },
    { name: 'Estrogen Matters（Bluming & Tavris）', file: 'Estrogen Matters (Carol Tavris, Avrum Bluming).epub', usedFor: '与 Lancet 2024 并列呈现 HRT 争议的平衡视角（不开方）。', evidenceLevel: 'moderate' },
    { name: 'Period Repair / Hormone Repair Manual（Lara Briden）', file: 'Hormone Repair Manual (Lara Briden).epub', usedFor: '黄体期/经前“降量、重恢复”的弹性理念与周期身体变化科普（去具体补剂剂量）。', evidenceLevel: 'moderate' }
  ];

  /** 全 App 统一复用的边界与免责声明。 */
  var DISCLAIMERS = {
    notDiagnosis: '这是基于妳的记录生成的弹性建议，不是医疗诊断。',
    cycleVaries: '周期影响存在明显个体差异，请以自己的感受为准。',
    lifestyleNotMedical: '这是生活方式建议，不替代医生、营养师或康复治疗师的专业意见。',
    seekHelp: '出现持续疼痛、异常出血、严重头晕、胸痛、呼吸困难或明显功能受限时，请停止自行加练并及时寻求专业帮助。'
  };

  var byId = {};
  CLAIMS.forEach(function (c) { byId[c.id] = c; });

  return {
    CLAIMS: CLAIMS,
    EXCLUDED_CONTENT: EXCLUDED_CONTENT,
    SOURCES: SOURCES,
    DISCLAIMERS: DISCLAIMERS,
    /** @param {string} id @returns {import('../types/healthRecommendation.js').KnowledgeClaim|undefined} */
    getClaim: function (id) { return byId[id]; }
  };
});
