/**
 * GLM Coding Plan API 客户端
 * 用于获取使用量数据
 */

const https = require('https');

// API 端点配置
const PLATFORMS = {
  ZHIPU: {
    baseUrl: 'open.bigmodel.cn',
    endpoints: {
      modelUsage: '/api/monitor/usage/model-usage',
      toolUsage: '/api/monitor/usage/tool-usage',
      quotaLimit: '/api/monitor/usage/quota/limit'
    }
  },
  ZAI: {
    baseUrl: 'api.z.ai',
    endpoints: {
      modelUsage: '/api/monitor/usage/model-usage',
      toolUsage: '/api/monitor/usage/tool-usage',
      quotaLimit: '/api/monitor/usage/quota/limit'
    }
  }
};

/**
 * 检测当前平台
 */
function detectPlatform() {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
  if (baseUrl.includes('api.z.ai')) {
    return 'ZAI';
  }
  return 'ZHIPU'; // 默认使用智谱
}

/**
 * 发送 HTTPS GET 请求
 */
function fetch(apiUrl, queryParams = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(apiUrl);
    const authToken = process.env.ANTHROPIC_AUTH_TOKEN || '';

    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + queryParams,
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Accept-Language': 'en-US,en',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * 格式化日期时间
 */
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取当月使用量数据
 */
async function fetchMonthlyUsage() {
  const platform = detectPlatform();
  const config = PLATFORMS[platform];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const queryParams = `?startTime=${encodeURIComponent(formatDateTime(monthStart))}&endTime=${encodeURIComponent(formatDateTime(monthEnd))}`;

  const url = `https://${config.baseUrl}${config.endpoints.modelUsage}`;
  const data = await fetch(url, queryParams);

  return {
    totalTokens: data?.data?.totalUsage?.totalTokensUsage || 0,
    totalCalls: data?.data?.totalUsage?.totalModelCallCount || 0
  };
}

/**
 * 获取当日使用量数据 (过去24小时)
 */
async function fetchDailyUsage() {
  const platform = detectPlatform();
  const config = PLATFORMS[platform];

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59);

  const queryParams = `?startTime=${encodeURIComponent(formatDateTime(startDate))}&endTime=${encodeURIComponent(formatDateTime(endDate))}`;

  const url = `https://${config.baseUrl}${config.endpoints.modelUsage}`;
  const data = await fetch(url, queryParams);

  // 计算今日 token
  const today = now.toISOString().split('T')[0];
  const times = data?.data?.x_time || [];
  const tokens = data?.data?.tokensUsage || [];

  let dailyTokens = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] && times[i].startsWith(today)) {
      dailyTokens += tokens[i] || 0;
    }
  }

  return {
    dailyTokens,
    hourlyData: data?.data || {}
  };
}

/**
 * 获取 MCP 配额限制
 */
async function fetchQuotaLimit() {
  const platform = detectPlatform();
  const config = PLATFORMS[platform];

  const url = `https://${config.baseUrl}${config.endpoints.quotaLimit}`;
  const data = await fetch(url);

  const limits = data?.data?.limits || data?.limits || [];

  let mcpUsage = { percentage: 0, current: 0, total: 1000 };
  let tokenUsage = { percentage: 0 };

  for (const limit of limits) {
    if (limit.type === 'TIME_LIMIT') {
      mcpUsage = {
        percentage: limit.percentage || 0,
        current: limit.currentValue || 0,
        total: limit.usage || 1000,
        details: limit.usageDetails || []
      };
    }
    if (limit.type === 'TOKENS_LIMIT') {
      tokenUsage = {
        percentage: limit.percentage || 0
      };
    }
  }

  return {
    mcpUsage,
    tokenUsage,
    level: data?.data?.level || data?.level || 'pro'
  };
}

/**
 * 获取所有使用量数据
 */
async function fetchAllUsageData() {
  try {
    const [monthly, daily, quota] = await Promise.all([
      fetchMonthlyUsage(),
      fetchDailyUsage(),
      fetchQuotaLimit()
    ]);

    return {
      monthly,
      daily,
      quota,
      platform: detectPlatform()
    };
  } catch (error) {
    return {
      error: error.message,
      platform: detectPlatform()
    };
  }
}

module.exports = {
  detectPlatform,
  fetchMonthlyUsage,
  fetchDailyUsage,
  fetchQuotaLimit,
  fetchAllUsageData
};
