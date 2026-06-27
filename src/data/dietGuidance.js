/*
 * 女训 · 饮食建议库 (dietGuidance)
 * --------------------------------------------------------------------------
 * 用于【训练推荐页 · 饮食建议】模块：根据用户当日训练、周期阶段、更年期与状态，
 * 给出方向性的饮食提示与“为什么”。
 *
 * 纪律（沿用知识库统一原则）：
 *   - 文案条目仍只给“方向”，不鼓励极端节食/排毒/酸碱体质等伪科学。
 *   - 涉及疾病饮食治疗（慢病、贫血确诊等）一律引导咨询医生/营养师。
 *   - 每条带 source / sourceFile，用于页尾小灰字出处标注（可信度 + 免责）。
 *   - 【产品需求放宽】原“不写固定克数”的纪律，按产品需求调整为：可以给出
 *     “按体重估算的参考区间 + 食物示例 + 因人而异免责”。仅用于蛋白质参考量
 *     （proteinTargetByWeight / proteinFoodEquivalents），不开补剂剂量、不开方。
 *
 * trigger 字段：该建议适合在何种情境推送（供推荐引擎匹配）。
 *   always           通用，可随训练页常驻
 *   post_workout     训练后
 *   long_or_hot      长时/炎热/大汗训练
 *   menstrual        经期/经后（含铁的食物意识）
 *   luteal_premenstrual  经前/黄体期（易饿、想吃、情绪）
 *   menopause        围绝经/绝经期
 *   low_energy       低能量/疲劳/睡眠差
 *
 * 加载：浏览器全局 window.NvxunDietGuidance；Node module.exports。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NvxunDietGuidance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var NEEDS_REVIEW = '需后续人工核对原始页码';

  var TIPS = [
    // —— 通用大方向 ——
    {
      id: 'diet.balanced_quality_protein',
      trigger: 'always',
      category: 'nutrition',
      tip: '每餐尽量有一份优质蛋白（如蛋、奶、鱼、瘦肉、豆制品），搭配蔬菜与主食，规律三餐。',
      rationale: '充足且优质的蛋白是肌肉、免疫与恢复的基础，规律进食有助稳定能量。',
      evidenceLevel: 'moderate',
      source: '《你是你吃出来的 1》（夏萌）“蛋白质平衡：选对优质蛋白”章节；ROAR 蛋白质大方向',
      sourceFile: '你是你吃出来的：吃对少生病，病了这样吃 (.epub',
      sourcePageOrSection: '蛋白质平衡：选对优质蛋白（动物类蛋白价值优于植物类）',
      safetyNotes: '只给方向，不写固定克数/比例；特殊疾病饮食请遵医嘱。'
    },
    {
      id: 'diet.eat_enough_not_restrict',
      trigger: 'always',
      category: 'nutrition',
      tip: '训练日不要过度节食。吃得太少会拖慢恢复、影响激素与情绪，能量够才练得动、恢复得好。',
      rationale: '长期能量摄入不足会影响女性的激素、骨骼与训练适应。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）女性能量可用性与进食方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '不鼓励极端节食/断食处方；如有进食障碍倾向请寻求专业帮助。'
    },

    // —— 训练后 ——
    {
      id: 'diet.post_workout_protein_carb',
      trigger: 'post_workout',
      category: 'nutrition',
      tip: '训练后尽量吃到一份含优质蛋白 + 碳水的正餐或加餐（如鸡蛋燕麦、鱼/豆腐配米饭），帮助恢复。',
      rationale: '训练后补充蛋白与碳水有助于肌肉修复与糖原恢复。',
      evidenceLevel: 'moderate',
      source: 'ROAR / Next Level（Stacy Sims）训练后补给方向；夏萌优质蛋白方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '给食物示例而非固定克数；无需依赖蛋白粉/补剂。'
    },

    // —— 长时/炎热/大汗 ——
    {
      id: 'diet.hydration_electrolytes',
      trigger: 'long_or_hot',
      category: 'nutrition',
      tip: '训练时间较长、天气炎热或大汗时，注意训练前后补水；大量出汗时可适当补充含电解质的饮品/食物。',
      rationale: '女性的体温调节与补水需求有其特点，长时/炎热训练失水更需关注。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）女性补水与体温调节方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '普通日常训练白水即可；不推荐高糖运动饮料作为日常。'
    },

    // —— 经期/经后：含铁食物意识 ——
    {
      id: 'diet.menstrual_iron_awareness',
      trigger: 'menstrual',
      category: 'nutrition',
      tip: '经期前后可有意识地吃一些富含铁的食物（如瘦红肉、动物肝脏适量、深绿叶菜、豆类），搭配富含维生素 C 的果蔬帮助吸收。',
      rationale: '月经会造成铁的流失，关注膳食铁有助于精力与训练状态；但是否缺铁需由检查判断。',
      evidenceLevel: 'moderate',
      source: 'ROAR（Stacy Sims）女性铁需求方向；夏萌膳食铁方向',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '不自行补铁剂；疑似贫血/月经量过大请就医检查后遵医嘱。'
    },
    {
      id: 'diet.menstrual_warm_comfort',
      trigger: 'menstrual',
      category: 'nutrition',
      tip: '经期想吃点暖的、舒服的很正常。可以选温热、好消化的食物，少量多次，照顾好自己的胃和心情。',
      rationale: '经期不适时，温热、规律、易消化的饮食更友好；这是舒适导向而非治疗处方。',
      evidenceLevel: 'practical',
      source: '通用经期饮食舒适原则（结合 Period Power 的“经期重休整”理念）',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      sourcePageOrSection: 'Menstruation（已改写为舒适导向）',
      safetyNotes: '不夸大某种食物“治痛经”；严重痛经请就医。'
    },

    // —— 经前/黄体期 ——
    {
      id: 'diet.luteal_appetite_normal',
      trigger: 'luteal_premenstrual',
      category: 'nutrition',
      tip: '经前更容易饿、更想吃东西，是常见现象。可以用规律正餐、足量蛋白和复合碳水（全谷、薯类）来稳住食欲和情绪，不必苛责自己。',
      rationale: '黄体期能量与食欲变化常见；规律进食与复合碳水有助稳定血糖与情绪。',
      evidenceLevel: 'moderate',
      source: 'Period Power（Maisie Hill）黄体期描述；ROAR 周期与代谢方向',
      sourceFile: 'Period Power (Maisie Hill) (z-library.sk, 1lib.sk, z-lib.sk).mobi',
      sourcePageOrSection: 'Luteal Phase（已弱化为“常见、因人而异”）',
      safetyNotes: '不把食欲变化病理化；避免“惩罚式节食”。'
    },

    // —— 更年期 ——
    {
      id: 'diet.menopause_protein_bone',
      trigger: 'menopause',
      category: 'nutrition',
      tip: '围绝经/绝经期更要保证足量优质蛋白，并通过食物关注钙与维生素 D（如奶制品、豆制品、深绿叶菜、适度日晒），配合力量训练保护肌肉与骨骼。',
      rationale: '这一阶段肌肉与骨量更易流失，蛋白质 + 力量训练 + 钙/维 D 是公认的保护方向。',
      evidenceLevel: 'strong',
      source: 'Next Level（Stacy Sims）更年期蛋白方向；《炙热的你》骨健康方向；NAMS 2022 骨保护共识',
      sourceFile: 'Next Level Your Guide ... (Stacy T. Sims PhD, Selene Yeager).pdf',
      sourcePageOrSection: '更年期营养与骨健康章节（需后续人工核对页码）',
      safetyNotes: '具体钙/维 D 是否需要补充、剂量多少，请由医生根据个人情况判断。'
    },
    {
      id: 'diet.menopause_brain_pattern',
      trigger: 'menopause',
      category: 'nutrition',
      tip: '多选地中海式的吃法——蔬菜、全谷、豆类、鱼、橄榄油、坚果，少高糖与深加工食品，对中年大脑、情绪与心血管都更友好。',
      rationale: '富含膳食纤维、不饱和脂肪与多酚的饮食模式，与更好的认知与心血管健康相关。',
      evidenceLevel: 'strong',
      source: 'The Menopause Brain / The XX Brain（Lisa Mosconi）护脑饮食方向',
      sourceFile: 'The Menopause Brain (Lisa Mosconi).epub',
      sourcePageOrSection: '护脑饮食章节（需后续人工核对页码）',
      safetyNotes: '科普性饮食模式建议，不替代针对个人疾病的营养治疗。'
    },

    // —— 低能量/疲劳/睡眠差 ——
    {
      id: 'diet.low_energy_regular_fuel',
      trigger: 'low_energy',
      category: 'nutrition',
      tip: '疲劳或睡不好的日子，别靠咖啡和甜食硬撑。规律吃正餐、加一份蛋白和水果，把今天的训练调轻一点，先把能量和睡眠补回来。',
      rationale: '稳定的进食节律比高糖高咖啡因更能支持当天的能量与恢复。',
      evidenceLevel: 'practical',
      source: 'ROAR（Stacy Sims）恢复与进食节律方向 + 通用营养原则',
      sourceFile: 'ROAR (Stacy Sims) (Z-Library).epub',
      sourcePageOrSection: NEEDS_REVIEW,
      safetyNotes: '长期疲劳/失眠请就医排查原因。'
    }
  ];

  var DIET_DISCLAIMERS = {
    directionOnly: '以上为方向性饮食建议，不含固定克数、固定比例或补剂剂量。',
    notMedicalNutrition: '这是一般生活方式建议，不替代医生或注册营养师针对个人情况的方案。',
    seekHelp: '涉及慢病、贫血、孕产、进食障碍或明显症状时，请咨询专业人士后再调整饮食。'
  };

  var byTrigger = {};
  TIPS.forEach(function (t) {
    (byTrigger[t.trigger] = byTrigger[t.trigger] || []).push(t);
  });

  // 按体重估算每日蛋白参考区间。活跃女性常用 1.2–1.6 g/kg；
  // 围绝经/绝经阶段更强调保肌护骨，取偏上限（1.4–1.6）。
  function proteinTargetByWeight(weightKg, opts) {
    var w = Number(weightKg);
    if (!Number.isFinite(w) || w <= 0) return null;
    var menopause = !!(opts && opts.menopause);
    var lo = menopause ? 1.4 : 1.2;
    var hi = 1.6;
    return { minG: Math.round(w * lo), maxG: Math.round(w * hi), weightKg: Math.round(w), perKg: { min: lo, max: hi } };
  }

  // 把目标克数换算成常见食物示例（标准蛋白含量取通用值）。
  var PROTEIN_FOODS = [
    { name: '鸡蛋', unit: '个', grams: 7 },
    { name: '鸡胸肉', unit: 'g', grams: 27, per: 100 },
    { name: '牛奶', unit: 'ml', grams: 8, per: 250 },
    { name: '北豆腐', unit: 'g', grams: 12, per: 100 }
  ];
  function proteinFoodEquivalents(grams) {
    var g = Number(grams);
    if (!Number.isFinite(g) || g <= 0) return '';
    // 用一份「鸡蛋 + 鸡胸 + 牛奶」的组合示例覆盖约 g 克，按整数取整呈现。
    var eggs = 3;                       // 3 个鸡蛋 ≈ 21g
    var remain = g - eggs * 7;
    var chickenG = Math.max(0, Math.round((remain * 0.6) / 27 * 100 / 50) * 50); // 50g 取整的鸡胸
    var chickenP = chickenG / 100 * 27;
    var milkBoxes = Math.max(1, Math.round((g - eggs * 7 - chickenP) / 8)); // 每盒 250ml ≈ 8g
    return '约 ' + eggs + ' 个鸡蛋 + ' + chickenG + 'g 鸡胸 + ' + milkBoxes + ' 盒牛奶（250ml）';
  }
  var PROTEIN_DISCLAIMER = '按体重估算的参考区间，因人而异；孕产、肾病或特殊情况请遵医嘱。';
  var PROTEIN_SOURCE = 'ROAR / Next Level（Stacy Sims）+ 一般运动营养';

  return {
    TIPS: TIPS,
    DIET_DISCLAIMERS: DIET_DISCLAIMERS,
    PROTEIN_FOODS: PROTEIN_FOODS,
    PROTEIN_DISCLAIMER: PROTEIN_DISCLAIMER,
    PROTEIN_SOURCE: PROTEIN_SOURCE,
    proteinTargetByWeight: proteinTargetByWeight,
    proteinFoodEquivalents: proteinFoodEquivalents,
    /** 按情境取建议；triggers 可为字符串或数组，总是包含 always 通用项。 */
    getTips: function (triggers) {
      var keys = Array.isArray(triggers) ? triggers.slice() : [triggers];
      if (keys.indexOf('always') === -1) keys.push('always');
      var out = [];
      keys.forEach(function (k) { (byTrigger[k] || []).forEach(function (t) { if (out.indexOf(t) === -1) out.push(t); }); });
      return out;
    }
  };
});
