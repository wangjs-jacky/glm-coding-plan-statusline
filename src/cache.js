/**
 * 缓存管理器
 * 用于缓存 API 响应，减少请求频率
 */

const fs = require('fs');
const path = require('path');

// 缓存目录
const CACHE_DIR = '/tmp/.glm-statusline-cache';

// 缓存文件路径
const CACHE_FILES = {
  monthly: path.join(CACHE_DIR, 'monthly.json'),
  daily: path.join(CACHE_DIR, 'daily.json'),
  quota: path.join(CACHE_DIR, 'quota.json')
};

// 缓存过期时间 (秒)
const CACHE_TTL = {
  monthly: 600,  // 10 分钟
  daily: 120,    // 2 分钟
  quota: 120     // 2 分钟
};

/**
 * 确保缓存目录存在
 */
function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (e) {
    // 忽略错误
  }
}

/**
 * 读取缓存
 */
function readCache(type) {
  try {
    const filePath = CACHE_FILES[type];
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stat = fs.statSync(filePath);
    const now = Date.now();
    const fileTime = stat.mtimeMs;
    const age = (now - fileTime) / 1000;

    // 检查是否过期
    if (age > CACHE_TTL[type]) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

/**
 * 写入缓存
 */
function writeCache(type, data) {
  try {
    ensureCacheDir();
    const filePath = CACHE_FILES[type];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    // 忽略错误
  }
}

/**
 * 清除所有缓存
 */
function clearAllCache() {
  try {
    for (const file of Object.values(CACHE_FILES)) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
  } catch (e) {
    // 忽略错误
  }
}

/**
 * 带缓存的 API 调用包装器
 */
async function withCache(type, fetchFn) {
  // 尝试读取缓存
  const cached = readCache(type);
  if (cached !== null) {
    return cached;
  }

  // 获取新数据
  const data = await fetchFn();

  // 写入缓存
  if (data && !data.error) {
    writeCache(type, data);
  }

  return data;
}

module.exports = {
  readCache,
  writeCache,
  clearAllCache,
  withCache,
  CACHE_TTL
};
