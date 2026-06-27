/*
 * 女训 · 推荐规则层 (recommendationRules)
 * --------------------------------------------------------------------------
 * 把"在什么用户状态下产生什么推荐效果"显式化，每条规则带：优先级、命中条件、
 * 效果、关联知识声明（claimId，用于回溯证据）、面向用户的依据与安全注记。
 *
 * 优先级（数值越小越优先，与产品规范一致）：
 *   1 安全风险与疼痛
 *   2 疲劳、睡眠、恢复状态
 *   3 用户目标与可用时间
 *   4 训练经验
 *   5 周期阶段或更年期状态
 *   6 偏好与历史反馈
 *
 * 强度档约定：0=恢复, 1=轻量, 2=标准, 3=进阶。
 */
(function (root, factory) {
  var Knowledge = (typeof require === 'function')
    ? require('./knowledgeClaims.js')
    : (root && root.NvxunKnowledge);
  var api = factory(Knowledge);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NvxunRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Knowledge) {
  'use strict';

  var INTENSITY = { RECOVERY: 0, LIGHT: 1, STANDARD: 2, ADVANCED: 3 };

  /** @type {import('../types/healthRecommendation.js').RecommendationRule[]} */
  var RULES = [
    // ===== 优先级 1：安全与疼痛 =====
    {
      id: 'safety.obvious_pain',
      category: 'pain_or_rehab',
      priority: 1,
      claimId: 'pain.no_load_on_pain',
      evidenceLevel: 'practical',
      when: function (c) { return c.pain === '明显'; },
      effect: {
        intensityCap: INTENSITY.RECOVERY,
        focus: '今天以舒缓活动和恢复为主',
        safetyFlag: true,
        safetyText: '明显疼痛时请避免加重动作，必要时咨询专业人士。'
      },
      userFacingReason: '妳标记了明显疼痛，所以今天避开了高冲击和大负荷，保留舒缓与恢复选项。',
      safetyNotes: '不诊断疾病；持续或加重时建议就医。'
    },
    {
      id: 'safety.soreness_or_minor_pain',
      category: 'pain_or_rehab',
      priority: 1,
      claimId: 'pain.no_load_on_pain',
      evidenceLevel: 'practical',
      when: function (c) { return c.soreness === '明显' || c.pain === '轻微'; },
      effect: {
        intensityCap: INTENSITY.LIGHT,
        focus: '控制幅度、优先动作质量'
      },
      userFacingReason: '妳反馈了酸痛或轻微不适，因此降低了今天的强度与冲击。'
    },

    // ===== 优先级 2：疲劳、睡眠、恢复 =====
    {
      id: 'recovery.poor_sleep_low_energy',
      category: 'recovery',
      priority: 2,
      claimId: 'recovery.fatigue_room',
      evidenceLevel: 'moderate',
      when: function (c) { return c.sleep === '差' && c.energy === '低'; },
      effect: {
        intensityCap: INTENSITY.LIGHT,
        durationCapMin: 20,
        focus: '给身体留余地的轻量训练',
        tipBucket: 'recovery',
        tip: '完成一个轻量版本也算训练；今天可以给身体留一点余地。'
      },
      userFacingReason: '妳反馈睡眠和精力都偏低，因此把训练总量调轻，并保留短时完成版。'
    },
    {
      id: 'recovery.high_stress',
      category: 'recovery',
      priority: 2,
      claimId: 'recovery.fatigue_room',
      evidenceLevel: 'moderate',
      when: function (c) { return c.stressMood === '压力很大 / 情绪波动明显'; },
      effect: {
        intensityCap: INTENSITY.STANDARD,
        tipBucket: 'recovery',
        tip: '压力较大时，规律但不过量的训练通常更可持续。'
      },
      userFacingReason: '妳反馈压力较大，因此今天不安排冲刺强度。'
    },
    {
      id: 'recovery.low_intent',
      category: 'recovery',
      priority: 2,
      claimId: 'training.quality_over_proving',
      evidenceLevel: 'practical',
      when: function (c) { return c.trainingIntent === '只想轻轻动一下'; },
      effect: {
        intensityCap: INTENSITY.LIGHT,
        focus: '用轻活动维持训练习惯'
      },
      userFacingReason: '妳今天只想轻轻动一下，所以我们准备了轻量、低门槛的版本。'
    },

    // ===== 优先级 3：目标与可用时间 =====
    {
      id: 'goal.strength_focus',
      category: 'training',
      priority: 3,
      claimId: 'training.strength_bone_health',
      evidenceLevel: 'strong',
      when: function (c) { return c.goals.indexOf('提升力量') >= 0 || c.goals.indexOf('增肌') >= 0; },
      effect: { focus: '以力量基础为主' },
      userFacingReason: '妳选择了力量/增肌目标，力量训练也有助于长期肌肉与骨骼健康。'
    },
    {
      id: 'goal.fatloss_focus',
      category: 'training',
      priority: 3,
      evidenceLevel: 'practical',
      when: function (c) { return c.goals.indexOf('减脂') >= 0; },
      effect: { focus: '力量为底、配合可持续的有氧' },
      userFacingReason: '妳选择了减脂目标，我们以力量为底、搭配低冲击有氧，避免极端节食抵消训练。'
    },
    {
      id: 'time.short_session',
      category: 'training',
      priority: 3,
      evidenceLevel: 'practical',
      when: function (c) { return c.availableTime === '10—15 分钟'; },
      effect: { durationCapMin: 15, focus: '短时高质量的关键动作' },
      userFacingReason: '妳今天可用时间较短，因此把训练压缩为 10–15 分钟的关键动作。'
    },
    {
      id: 'time.medium_session',
      category: 'training',
      priority: 3,
      evidenceLevel: 'practical',
      when: function (c) { return c.availableTime === '20—30 分钟'; },
      effect: { durationCapMin: 30 },
      userFacingReason: '妳今天约有 20–30 分钟，训练时长据此安排。'
    },

    // ===== 优先级 4：训练经验 =====
    {
      id: 'experience.beginner',
      category: 'training',
      priority: 4,
      claimId: 'training.quality_over_proving',
      evidenceLevel: 'practical',
      when: function (c) { return c.isBeginner; },
      effect: { intensityCap: INTENSITY.STANDARD, focus: '先把基础动作做稳' },
      userFacingReason: '妳的训练基础以入门为主，因此优先安排可控、易上手的动作。'
    },

    // ===== 优先级 5：周期与更年期 =====
    {
      id: 'cycle.menstrual_flexible',
      category: 'cycle',
      priority: 5,
      claimId: 'cycle.self_perception_first',
      evidenceLevel: 'moderate',
      when: function (c) { return c.phaseKey === 'menstrual' || c.cycleStatus === '正在出血'; },
      effect: {
        focus: '按当天感受灵活调整',
        tipBucket: 'recovery',
        tip: '经期可以正常训练、降低强度或选择恢复，取决于妳今天的疼痛、出血量和感受。'
      },
      userFacingReason: '妳处于（或感觉处于）经期，今天的建议以妳的疼痛和感受为准，而不是默认必须休息。'
    },
    {
      id: 'cycle.follicular_quality',
      category: 'cycle',
      priority: 5,
      claimId: 'cycle.self_perception_first',
      evidenceLevel: 'moderate',
      when: function (c) {
        return (c.phaseKey === 'follicular' || c.phaseKey === 'ovulation') &&
          !c.hasPain && !c.highFatigue;
      },
      effect: { focus: '状态允许时可尝试较高质量训练' },
      userFacingReason: '周期推算与妳今天的状态都较稳定，可以尝试一次高质量训练；过程中仍以身体感受为准。'
    },
    {
      id: 'cycle.luteal_premenstrual_recovery',
      category: 'cycle',
      priority: 5,
      claimId: 'recovery.fatigue_room',
      evidenceLevel: 'moderate',
      when: function (c) { return c.phaseKey === 'luteal' || c.phaseKey === 'premenstrual'; },
      effect: {
        tipBucket: 'recovery',
        tip: '部分人在这一阶段恢复变慢，可优先关注睡眠、补水与适度降低强度。'
      },
      userFacingReason: '周期推算提示妳可能在黄体/经前阶段，部分人此时更需要恢复，但这只是参考，以妳的感受为准。'
    },
    {
      id: 'menopause.strength_priority',
      category: 'menopause',
      priority: 5,
      claimId: 'menopause.strength_balance_impact',
      evidenceLevel: 'moderate',
      when: function (c) { return c.isPerimenoOrMeno; },
      effect: {
        focus: '力量、平衡与骨健康优先',
        tipBucket: 'menopause',
        tip: '在状态允许且无不适时，可优先安排力量与平衡训练，并加入温和的负重，关注骨健康与睡眠。'
      },
      userFacingReason: '妳选择了围绝经/绝经阶段，这一阶段力量、平衡与骨健康尤其重要。',
      safetyNotes: '这是生活方式建议，不替代医疗建议；温和冲击仅限无禁忌和状态允许时。'
    },

    // ===== 优先级 6：偏好与历史反馈 =====
    {
      id: 'feedback.wants_easier',
      category: 'recovery',
      priority: 6,
      evidenceLevel: 'practical',
      when: function (c) { return c.feedback && (c.feedback.nextPreference === 'decrease' || c.feedback.lastIntensityFeel === '偏累'); },
      effect: { intensityCap: INTENSITY.LIGHT },
      userFacingReason: '上次妳觉得偏累或希望降低，所以这次默认调轻了一些。'
    },
    {
      id: 'feedback.wants_harder',
      category: 'training',
      priority: 6,
      evidenceLevel: 'practical',
      when: function (c) {
        return c.feedback && c.feedback.nextPreference === 'increase' &&
          c.feedback.lastBodyFeel !== '更不舒服' && !c.hasPain && !c.highFatigue;
      },
      effect: { focus: '在安全前提下小幅提升' },
      userFacingReason: '上次妳希望增加，且今天状态允许，因此在安全前提下小幅提升。'
    },

    // ===== 始终适用的生活方式提示（不改变强度，只补充提示） =====
    {
      id: 'lifestyle.hydration',
      category: 'nutrition',
      priority: 7,
      claimId: 'nutrition.hydration_electrolytes',
      evidenceLevel: 'moderate',
      when: function (c) { return true; },
      effect: { tipBucket: 'hydration', tip: '训练前后记得补水；大汗或炎热环境下可关注电解质。' },
      userFacingReason: ''
    },
    {
      id: 'lifestyle.nutrition',
      category: 'nutrition',
      priority: 7,
      claimId: 'nutrition.protein_carb_meal',
      evidenceLevel: 'moderate',
      when: function (c) { return true; },
      effect: { tipBucket: 'nutrition', tip: '训练后可优先吃到含优质蛋白和碳水的正餐或加餐，保持规律饮食，不用极端节食抵消训练。' },
      userFacingReason: ''
    }
  ];

  return { RULES: RULES, INTENSITY: INTENSITY };
});
