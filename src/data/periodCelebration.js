/*
 * 女训 · 月经祝贺文案库 (periodCelebration)
 * --------------------------------------------------------------------------
 * 用于【F3 月经祝贺】功能：用户每个周期填写一次“月经开始”时，App 自动弹出恭喜，
 * 并从本库随机抽取一条暖心、热情、赋权的祝贺/鼓励文案。
 *
 * 设计原则（依据产品定位）：
 *   - 热情、暖、有力量；庆祝而非负担；可甜可飒可灵性。
 *   - 全部为原创文案；其“女本位赋权/周期即四季/身体的进化智慧”等语气，
 *     灵感来源标注在 inspiration 字段，用于页尾小灰字出处展示（提高可信度 + 免责）。
 *   - 不含任何医疗诊断、用药或确定性健康承诺；支持性语言（疼就休息）允许出现。
 *
 * 风格 styles：
 *   quest    游戏/闯关/副本风（造物主、重启副本、Buff）
 *   goddess  神圣/月亮/潮汐/灵性风（姐妹、神圣力量、净化）
 *   toast    庆祝/举杯/热闹风（开月、横着走、举杯、嘿）
 *   gentle   日常温柔陪伴风（深长呼吸、吃到喜欢的食物）
 *   warrior  历练/勇士/带日历或八卦的应景风（动态模板）
 *
 * 加载：浏览器全局 window.NvxunPeriodCelebration；Node module.exports。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NvxunPeriodCelebration = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STYLES = [
    { id: 'quest', name: '闯关副本风', tone: '俏皮、有劲、游戏化' },
    { id: 'goddess', name: '神圣月亮风', tone: '灵性、温柔、赋权' },
    { id: 'toast', name: '举杯庆祝风', tone: '热闹、上扬、带梗' },
    { id: 'gentle', name: '日常陪伴风', tone: '轻柔、贴心、生活化' },
    { id: 'warrior', name: '应景勇士风', tone: '应日历/节气、鼓劲（可动态生成）' }
  ];

  // —— 固定文案池（随机抽取）——
  var MESSAGES = [
    // quest 游戏/副本风
    {
      id: 'quest.reboot',
      style: 'quest',
      lengthTier: 'medium',
      text: '恭喜妳，造物主！红潮开闸，身体正式进入「重启副本」。妳和身体一起掌舵，先顶住这一轮历练，回血之后准备继续大干一场。',
      inspiration: '原创文案；赋权基调参考 Inferior（Angela Saini）/ 看不见的女性（Caroline Criado Perez）'
    },
    {
      id: 'quest.new_loop',
      style: 'quest',
      lengthTier: 'short',
      text: '新一圈开始啦！这一格血条是身体在好好运转的信号。今天先安心刷「恢复任务」，蓄好能量再上分。',
      inspiration: '原创文案；“周期即新一圈”灵感参考 Period Power（Maisie Hill）周期四阶段框架'
    },
    {
      id: 'quest.buff_loading',
      style: 'quest',
      lengthTier: 'short',
      text: '叮——「月经 Buff」加载中。这几天不用硬冲关，给自己开个慢速模式，等满状态了再去横扫地图。',
      inspiration: '原创文案；弹性调整理念参考 ROAR（Stacy Sims）'
    },

    // goddess 神圣/月亮/潮汐风
    {
      id: 'goddess.tide',
      style: 'goddess',
      lengthTier: 'long',
      text: '亲爱的姐妹，当月经到来时，请记得这不是负担，而是妳体内潮汐般的力量。每一次流动，都是月亮在妳身体里运行一圈的印记。它让妳直觉敏锐、情绪丰沛，能在疲惫中依然生长、依然发光。妳是完整的，是自然最骄傲的循环。疼就休息，累就允许自己停下——妳从不孤单。',
      inspiration: '原创文案；“月相—周期”意象参考 Period Power（Maisie Hill）；身体智慧叙事参考 Eve（Cat Bohannon）'
    },
    {
      id: 'goddess.moon_circle',
      style: 'goddess',
      lengthTier: 'medium',
      text: '月亮又在妳身体里走完了一圈。这股温柔而笃定的力量，提醒妳拥有创造与更新的节律。今天，请像对待最珍贵的人那样，温柔地对待自己。',
      inspiration: '原创文案；月相意象参考 Period Power（Maisie Hill）'
    },
    {
      id: 'goddess.worthy',
      style: 'goddess',
      lengthTier: 'short',
      text: '妳的身体值得被认真对待，今天也是。让这几天慢一点、暖一点，把照顾留给自己。',
      inspiration: '原创文案；“女性身体值得被认真对待”参考 看不见的女性（Caroline Criado Perez）'
    },

    // toast 庆祝/举杯/热闹风
    {
      id: 'toast.open_moon',
      style: 'toast',
      lengthTier: 'medium',
      text: '恭喜妳今日开月！身体重新点燃内在潮汐，让我们为妳的生命力举杯：愿这几天顺、暖、少痛，愿妳一路带着「血色 Buff」继续横着走。全体说一声有力气的“嘿”！',
      inspiration: '原创文案；庆祝/赋权语气参考 The Better Half（Sharon Moalem，仅取“了不起的女性身体”正向片段）'
    },
    {
      id: 'toast.cheers',
      style: 'toast',
      lengthTier: 'short',
      text: '开月快乐！为妳身体如约而至的节律干一杯～愿妳今天少痛、好睡、被温柔以待。',
      inspiration: '原创文案'
    },
    {
      id: 'toast.strong',
      style: 'toast',
      lengthTier: 'short',
      text: '月经报到，说明这台精密的身体在好好工作。妳依然强壮、依然了不起，先歇口气，江湖等妳回来。',
      inspiration: '原创文案；“妳依然强壮”参考 ROAR / Next Level（Stacy Sims）'
    },

    // gentle 日常温柔陪伴风
    {
      id: 'gentle.deep_breath',
      style: 'gentle',
      lengthTier: 'medium',
      text: '恭喜妳！今天身体在自己的节律里做了一次深长的呼吸，谢谢她温柔而笃定地运转。希望妳今天有吃到喜欢的食物、见到喜欢的人、做着喜欢的事。',
      inspiration: '原创文案'
    },
    {
      id: 'gentle.permission_rest',
      style: 'gentle',
      lengthTier: 'short',
      text: '新的周期到了。今天的待办里，请把“好好休息”放在第一条。想躺就躺，想暖就暖，身体会谢谢妳。',
      inspiration: '原创文案；恢复优先理念参考 ROAR（Stacy Sims）'
    },
    {
      id: 'gentle.warm_company',
      style: 'gentle',
      lengthTier: 'short',
      text: '嗨，又见面啦。这几天如果累、如果情绪起伏，都很正常。喝点热的，对自己宽容一点，我一直在。',
      inspiration: '原创文案；情绪随激素波动属正常，参考 This Is Your Brain on Birth Control（Sarah Hill）'
    },
    {
      id: 'gentle.little_joys',
      style: 'gentle',
      lengthTier: 'short',
      text: '周期翻篇，恭喜妳。给自己安排一件小确幸吧——一杯热可可、一首老歌、一个早点的睡眠。',
      inspiration: '原创文案'
    },

    // warrior 历练/勇士（静态版，动态版见 DYNAMIC_TEMPLATES）
    {
      id: 'warrior.passed',
      style: 'warrior',
      lengthTier: 'medium',
      text: '恭喜妳，勇士！妳又闯过了一道历练。血会慢慢收住，力气正在回来——先让自己好好休息，等身体满血，再去大干一场。',
      inspiration: '原创文案；“弹性恢复后再发力”参考 ROAR（Stacy Sims）'
    },
    {
      id: 'warrior.rhythm',
      style: 'warrior',
      lengthTier: 'short',
      text: '又一程稳稳走完。身体的节律从不缺席，这本身就值得骄傲。今天，慢下来也是一种厉害。',
      inspiration: '原创文案'
    }
  ];

  // —— 动态模板（可注入日期/节气/星座等，运行时拼接）——
  // 占位符：{solar} 阳历，{lunar} 农历，{extra} 可选应景短语（星座/节气，留空也成立）。
  var DYNAMIC_TEMPLATES = [
    {
      id: 'warrior.calendar',
      style: 'warrior',
      template: '恭喜妳，造物主！妳又成功闯过了一道历练。今天{solar}{lunar}{extra}：血会慢慢收住，力气正在回来，先让自己好好休息——妳的身体已经准备好再次出发了。加油，勇士！',
      vars: ['solar', 'lunar', 'extra'],
      note: '{extra} 仅作氛围点缀（如“双子座的风正旺”），不做任何运势/命理健康暗示；缺省可为空。',
      inspiration: '原创文案；应景叙事为产品风格，不含命理或医疗主张'
    }
  ];

  // 全 App 复用的 F3 安全边界（祝贺场景）。
  var CELEBRATION_GUARDRAILS = {
    noMedical: '祝贺文案不含医疗诊断、用药建议或确定性健康承诺。',
    supportiveOk: '可使用支持性语言（疼就休息、允许停下），但不替代专业医疗意见。',
    originalCopy: '全部为原创文案，仅借鉴书目的“赋权/周期即四季/身体智慧”语气，不抄录原文（版权）。',
    inclusiveTone: '保持轻松、鼓励、不说教；不把月经描述成负担或麻烦。'
  };

  function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]; }

  return {
    STYLES: STYLES,
    MESSAGES: MESSAGES,
    DYNAMIC_TEMPLATES: DYNAMIC_TEMPLATES,
    CELEBRATION_GUARDRAILS: CELEBRATION_GUARDRAILS,
    /** 随机取一条静态祝贺；可传 style 限定风格。 */
    getRandomMessage: function (style) {
      var pool = style ? MESSAGES.filter(function (m) { return m.style === style; }) : MESSAGES;
      if (!pool.length) pool = MESSAGES;
      return pickRandom(pool);
    },
    /** 用变量渲染一条动态模板（如应景日历版）。 */
    renderDynamic: function (templateId, vars) {
      var t = DYNAMIC_TEMPLATES.filter(function (x) { return x.id === templateId; })[0];
      if (!t) return null;
      var out = t.template;
      (t.vars || []).forEach(function (k) {
        out = out.replace('{' + k + '}', (vars && vars[k]) ? vars[k] : '');
      });
      return out;
    }
  };
});
