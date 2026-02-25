/**
 * GLM Coding Plan Statusline
 * 主入口模块
 */

const api = require('./api');
const formatter = require('./formatter');
const cache = require('./cache');

/**
 * 生成状态栏
 * @param {string|object} input - Claude Code 传递的上下文 JSON
 * @param {object} options - 配置选项
 * @returns {string} 状态栏输出
 */
async function generateStatusLine(input, options = {}) {
  // 解析上下文
  const context = formatter.parseContext(input);

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

    // 写入缓存（跳过错误数据）
    if (!cachedMonthly && monthly && !monthly._error) cache.writeCache('monthly', monthly);
    if (!cachedDaily && daily && !daily._error) cache.writeCache('daily', daily);
    if (!cachedQuota && quota && !quota._error) cache.writeCache('quota', quota);

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
  cache
};
