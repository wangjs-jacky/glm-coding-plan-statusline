/**
 * GLM Coding Plan Statusline
 * 主入口模块
 */

const api = require('./api');
const formatter = require('./formatter');
const cache = require('./cache');
const bridge = require('./bridge');

/**
 * 从原始输入中提取会话信息
 * @param {string|object} input - Claude Code 传递的上下文 JSON
 * @returns {{sessionId: string, remainingPercentage: number, usedPct: number}}
 */
function extractSessionInfo(input) {
  try {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    const sessionId = data?.session_id || '';
    const remaining = data?.context_window?.remaining_percentage;

    // 计算已使用百分比（与 GSD 逻辑一致）
    // Claude Code 预留 ~16.5% 用于 autocompact 缓冲区
    const AUTO_COMPACT_BUFFER_PCT = 16.5;
    let usedPct = 0;
    if (remaining != null) {
      const usableRemaining = Math.max(0, ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100);
      usedPct = Math.max(0, Math.min(100, Math.round(100 - usableRemaining)));
    }

    return { sessionId, remainingPercentage: remaining || 0, usedPct };
  } catch (e) {
    return { sessionId: '', remainingPercentage: 0, usedPct: 0 };
  }
}

/**
 * 生成状态栏
 * @param {string|object} input - Claude Code 传递的上下文 JSON
 * @param {object} options - 配置选项
 * @returns {string} 状态栏输出
 */
async function generateStatusLine(input, options = {}) {
  // 解析上下文
  const context = formatter.parseContext(input);

  // 提取会话信息并写入 bridge 文件（供 GSD context-monitor 读取）
  const sessionInfo = extractSessionInfo(input);
  if (sessionInfo.sessionId) {
    bridge.writeBridge({
      sessionId: sessionInfo.sessionId,
      remainingPercentage: sessionInfo.remainingPercentage,
      usedPct: sessionInfo.usedPct
    });
  }

  // 获取使用量数据 (带缓存)
  const usageData = await fetchUsageDataWithCache();

  // 生成状态栏
  return formatter.formatStatusLine(context, usageData, options);
}

/**
 * 带缓存的使用量数据获取
 */
async function fetchUsageDataWithCache() {
  try {
    // 尝试从缓存获取完整数据
    const cachedQuota = cache.readCache('quota');
    const cachedDaily = cache.readCache('daily');
    const cachedMonthly = cache.readCache('monthly');

    // 如果所有缓存都存在，直接使用
    if (cachedQuota && cachedDaily && cachedMonthly) {
      return {
        monthly: cachedMonthly,
        daily: cachedDaily,
        quota: cachedQuota,
        platform: api.detectPlatform()
      };
    }

    // 否则并行获取缺失的数据
    const [monthly, daily, quota] = await Promise.all([
      cachedMonthly ? Promise.resolve(cachedMonthly) : api.fetchMonthlyUsage().catch(() => ({ totalTokens: 0, _error: true })),
      cachedDaily ? Promise.resolve(cachedDaily) : api.fetchDailyUsage().catch(() => ({ dailyTokens: 0, _error: true })),
      cachedQuota ? Promise.resolve(cachedQuota) : api.fetchQuotaLimit().catch(() => ({ mcpUsage: { percentage: 0 }, _error: true }))
    ]);

    // 写入缓存（跳过错误数据，保护关键字段不丢失）
    if (!cachedMonthly && monthly && !monthly._error) cache.writeCache('monthly', monthly);
    if (!cachedDaily && daily && !daily._error) cache.writeCache('daily', daily);
    if (!cachedQuota && quota && !quota._error) {
      // 新数据缺少 nextResetTime 时，从已过期缓存中保留
      const oldQuota = cache.readCacheIgnoreTTL('quota');
      if (oldQuota) {
        if (!quota.mcpUsage?.nextResetTime && oldQuota.mcpUsage?.nextResetTime) {
          quota.mcpUsage = { ...quota.mcpUsage, nextResetTime: oldQuota.mcpUsage.nextResetTime };
        }
        if (!quota.fiveHourQuota?.nextResetTime && oldQuota.fiveHourQuota?.nextResetTime) {
          quota.fiveHourQuota = { ...quota.fiveHourQuota, nextResetTime: oldQuota.fiveHourQuota.nextResetTime };
        }
      }
      cache.writeCache('quota', quota);
    }

    return {
      monthly,
      daily,
      quota,
      platform: api.detectPlatform()
    };
  } catch (error) {
    return {
      error: error.message,
      platform: api.detectPlatform()
    };
  }
}

/**
 * 仅使用上下文数据生成状态栏 (无网络请求)
 */
function generateLocalStatusLine(input, options = {}) {
  const context = formatter.parseContext(input);
  return formatter.formatStatusLine(context, {}, { ...options, showMCP: false, showMonthly: false, showDaily: false });
}

module.exports = {
  generateStatusLine,
  generateLocalStatusLine,
  fetchUsageDataWithCache,
  api,
  formatter,
  cache,
  bridge
};
