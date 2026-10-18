const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOST = 'tiziznz.com';
const ROOT_DIR = path.resolve(__dirname, '..');

// 自动检测根目录下的 32 位 hex 格式 key 文件（如 c53c8e3660c64e5b80cd900a5f64bf44.txt）
function detectIndexNowKey() {
  try {
    const files = fs.readdirSync(ROOT_DIR);
    const keyFile = files.find(f => /^[0-9a-fA-F]{32}\.txt$/.test(f));
    if (keyFile) {
      const keyContent = fs.readFileSync(path.join(ROOT_DIR, keyFile), 'utf-8').trim();
      return keyContent || keyFile.replace(/\.txt$/, '');
    }
  } catch (e) {}
  return '897b66d11fe2405e809d7dc51a97780c';
}

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || detectIndexNowKey();
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_API = 'https://api.indexnow.org/IndexNow';
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');

// 支持环境变量或命令行参数控制模式: 'auto' | 'commit' | 'sitemap'
const args = process.argv.slice(2);
let mode = process.env.INDEXNOW_SOURCE || 'auto';
if (args.includes('--sitemap')) mode = 'sitemap';
if (args.includes('--commit')) mode = 'commit';

/**
 * 从 Git 中获取最近一次 commit 中新增(A)、修改(M)、重命名(R)的文件列表
 */
function getChangedFilesFromGit() {
  const commands = [];

  // 如果在 GitHub Actions push 事件中且有 before commit sha
  if (
    process.env.GITHUB_EVENT_BEFORE &&
    process.env.GITHUB_EVENT_BEFORE !== '0000000000000000000000000000000000000000'
  ) {
    commands.push(`git diff --name-only --diff-filter=AMR ${process.env.GITHUB_EVENT_BEFORE} HEAD`);
  }

  // 检查最近一次 commit 与前一次的 diff
  commands.push('git diff --name-only --diff-filter=AMR HEAD~1 HEAD');
  // 针对单 commit 仓库或浅克隆环境的 diff-tree
  commands.push('git diff-tree --no-commit-id --name-only -r --diff-filter=AMR HEAD');

  for (const cmd of commands) {
    try {
      const output = execSync(cmd, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();
      if (output) {
        return output
          .split(/\r?\n/)
          .map(f => f.trim().replace(/\\/g, '/'))
          .filter(Boolean);
      }
    } catch (e) {
      // 忽略错误并尝试下一个备选命令
    }
  }

  // 本地开发调试：若工作区有未提交变更也可作为辅助检查
  try {
    const statusOutput = execSync('git status --porcelain', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (statusOutput) {
      return statusOutput
        .split(/\r?\n/)
        .map(line => line.slice(3).trim().replace(/\\/g, '/'))
        .filter(Boolean);
    }
  } catch (e) {}

  return [];
}

/**
 * 从 sitemap.xml 中提取所有 <loc> 链接
 */
function getUrlsFromSitemaps() {
  const urls = [];
  if (fs.existsSync(SITEMAP_PATH)) {
    try {
      const content = fs.readFileSync(SITEMAP_PATH, 'utf-8');
      const matches = [...content.matchAll(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/g)];
      for (const m of matches) {
        urls.push(m[1].trim());
      }
    } catch (err) {
      console.warn(`⚠️ 读取 sitemap.xml 失败:`, err.message);
    }
  }
  return urls;
}

/**
 * 收集待提交的目标 URL 列表
 */
function collectUrls() {
  let urlList = [];
  let sourceDescription = '';

  if (mode !== 'sitemap') {
    const changedFiles = getChangedFilesFromGit();
    const candidateFiles = changedFiles.filter(file => {
      // 仅包含 html 页面
      if (!file.endsWith('.html') && !file.endsWith('.htm')) return false;
      // 排除 404 等无需提交的错误页
      if (file.toLowerCase().includes('404.html')) return false;
      // 确保本地文件真实存在（排除已删除文件）
      const absPath = path.join(ROOT_DIR, file);
      return fs.existsSync(absPath);
    });

    if (candidateFiles.length > 0) {
      sourceDescription = `Git 最近一次提交变更 (共 ${candidateFiles.length} 个页面)`;
      console.log(`🔍 [Git Diff] 发现变更文件:`);
      candidateFiles.forEach(f => console.log(`   - ${f}`));

      for (const file of candidateFiles) {
        const url = `https://${HOST}/${file}`;
        urlList.push(url);
        // 如果根目录 index.html 发生变更，同时提交主域名 /
        if (file === 'index.html') {
          urlList.push(`https://${HOST}/`);
        }
      }
    } else {
      console.log('ℹ️ [Git Diff] 最近一次 commit 中未检测到新增或修改的文章/HTML页面。');
    }
  }

  // 若通过 commit 未提取到链接，或指定了 sitemap 模式，则从 sitemap.xml 读取
  if (urlList.length === 0 || mode === 'sitemap') {
    console.log('📄 [Sitemap] 正在从 sitemap.xml 读取全站链接...');
    const sitemapUrls = getUrlsFromSitemaps();
    if (sitemapUrls.length > 0) {
      sourceDescription = `Sitemap 读取 (共 ${sitemapUrls.length} 个链接)`;
      urlList = sitemapUrls;
    } else {
      console.warn('⚠️ 未能从 sitemap 读取到链接，使用核心基础路径作为保底。');
      sourceDescription = '核心基础页面保底';
      urlList = [
        `https://${HOST}/`,
        `https://${HOST}/index.html`,
        `https://${HOST}/blog.html`,
        `https://${HOST}/tutorials.html`,
        `https://${HOST}/airport-reviews.html`
      ];
    }
  }

  // 去重
  const uniqueUrls = Array.from(new Set(urlList));
  return { urls: uniqueUrls, sourceDescription };
}

/**
 * 向 IndexNow API 发起 POST 提交
 */
async function submitIndexNow() {
  console.log('====================================================');
  console.log('🚀 IndexNow 自动化提交任务启动');
  console.log(`📌 目标 Host:        ${HOST}`);
  console.log(`🔑 提交密钥 (Key):   ${INDEXNOW_KEY}`);
  console.log(`🌐 验证链接:         ${KEY_LOCATION}`);
  console.log(`📡 运行模式:         ${mode}`);
  console.log('====================================================');

  const { urls, sourceDescription } = collectUrls();

  console.log(`\n📋 数据来源: ${sourceDescription}`);
  console.log(`🎯 准备提交 URL 总数: ${urls.length} 条`);
  console.log('📝 推送 URL 清单:');
  urls.slice(0, 30).forEach((u, i) => console.log(`   [${i + 1}] ${u}`));
  if (urls.length > 30) {
    console.log(`   ... 以及其他 ${urls.length - 30} 条 URL`);
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  try {
    console.log(`\n📤 正在向 IndexNow API (${INDEXNOW_API}) 发送 POST 请求...`);
    const startTime = Date.now();

    const response = await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    });

    const duration = Date.now() - startTime;
    const statusCode = response.status;
    const statusText = response.statusText;
    const responseBody = await response.text();

    console.log(`\n⏱️ 请求耗时: ${duration}ms`);
    console.log(`📊 HTTP 状态码: ${statusCode} ${statusText}`);

    if (statusCode === 200) {
      console.log('✅【提交成功】HTTP 200 OK: IndexNow 已成功接收并处理 URL 列表。');
    } else if (statusCode === 202) {
      console.log('✅【提交成功】HTTP 202 Accepted: IndexNow 已接收请求，正在异步校验密钥文件有效性。');
    } else if (statusCode === 400) {
      console.error('❌【提交失败】HTTP 400 Bad Request: 提交格式不正确。详情:', responseBody);
      process.exit(1);
    } else if (statusCode === 403) {
      console.error('❌【提交失败】HTTP 403 Forbidden: 密钥无效或 keyLocation 验证文件无法访问。详情:', responseBody);
      process.exit(1);
    } else if (statusCode === 422) {
      console.error('❌【提交失败】HTTP 422 Unprocessable Entity: URL 列表不属于指定 host，或者 key 不匹配。详情:', responseBody);
      process.exit(1);
    } else if (statusCode === 429) {
      console.warn('⚠️【提交告警】HTTP 429 Too Many Requests: 提交频率过快，已被限制。详情:', responseBody);
    } else {
      console.log(`ℹ️ IndexNow 响应 [${statusCode}]:`, responseBody || '(空响应体)');
    }

    console.log('\n🎉 IndexNow 工作流执行完毕！');
  } catch (err) {
    console.error('❌ IndexNow 请求异常:', err.message);
    process.exit(1);
  }
}

submitIndexNow();
