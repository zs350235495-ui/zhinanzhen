const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const affDomains = [
  'huanqiutiaff.com', 'dalaoyunaff.com', 'yunjiexianaff.com', 'shandianshuaff.com',
  'shenxingaff.com', 'liulianyunaff.com', 'kuailitztz2.sbs', 'guangnianertt1.homes',
  'ztymforedge.lol', 'jichang.best', 'kexintztz2.sbs', 'ytjcok.org',
  'jilianat.homes', 'szjtfp.xyz', 'kunpengjiasu.com'
];

let issues = [];

console.log('=== [审计 1] 扫描全站是否存在残留直连 AFF 外链 ===');
const allFiles = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'scripts') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js|md|json)$/i.test(e.name)) {
      // 允许 go.html, _redirects, nginx-redirects.conf, .htaccess 中包含目标外部映射
      if (!['go.html', '_redirects', 'nginx-redirects.conf', '.htaccess'].includes(e.name)) {
        allFiles.push(p);
      }
    }
  }
}
walk(rootDir);

let leakedCount = 0;
allFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  affDomains.forEach(dom => {
    if (c.includes(dom)) {
      leakedCount++;
      issues.push(`文件 ${path.relative(rootDir, f)} 仍包含未经隔离的外链: ${dom}`);
    }
  });
});

if (leakedCount === 0) {
  console.log('✅ 通过：全站业务文章与数据源中 0 残留直连 AFF 外链！');
} else {
  console.error(`❌ 发现 ${leakedCount} 处残留外链！`);
}

console.log('\n=== [审计 2] 检查 /go.html 内链合规性 (rel="nofollow sponsored noopener noreferrer") ===');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && f !== 'go.html');
let totalGoLinks = 0;
let nonCompliantRelLinks = 0;

htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf8');
  const goLinkRegex = /<a\s+[^>]*href=["']\/go\.html\?id=([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = goLinkRegex.exec(content)) !== null) {
    totalGoLinks++;
    const fullTag = match[0];
    const relMatch = fullTag.match(/rel=["']([^"']*)["']/i);
    const rel = relMatch ? relMatch[1] : '';
    if (!rel.includes('nofollow') || !rel.includes('sponsored') || !rel.includes('noopener') || !rel.includes('noreferrer')) {
      nonCompliantRelLinks++;
      issues.push(`文件 ${f} 中的标签缺少完整 rel: ${fullTag}`);
    }
  }
});

console.log(`全站共检测到 ${totalGoLinks} 处安全跳转内链 (/go.html?id=xxx)。`);
if (nonCompliantRelLinks === 0) {
  console.log('✅ 通过：所有 /go.html 链接 100% 具备 rel="nofollow sponsored noopener noreferrer"！');
} else {
  console.error(`❌ 发现 ${nonCompliantRelLinks} 处 rel 属性不达标！`);
}

console.log('\n=== [审计 3] 验证跳转映射字典与死链防护 ===');
const goHtmlContent = fs.readFileSync(path.join(rootDir, 'go.html'), 'utf8');
const redirectsContent = fs.readFileSync(path.join(rootDir, '_redirects'), 'utf8');
const nginxContent = fs.readFileSync(path.join(rootDir, 'nginx-redirects.conf'), 'utf8');
const htaccessContent = fs.readFileSync(path.join(rootDir, '.htaccess'), 'utf8');

const detectedIds = new Set();
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf8');
  const goLinkRegex = /href=["']\/go\.html\?id=([^"']+)["']/gi;
  let m;
  while ((m = goLinkRegex.exec(content)) !== null) {
    detectedIds.add(m[1]);
  }
});

console.log(`正文中共引用了 ${detectedIds.size} 个唯一机场 ID: ${Array.from(detectedIds).join(', ')}`);

let missingInGoHtml = 0;
let missingInRedirects = 0;
let missingInNginx = 0;
let missingInHtaccess = 0;

detectedIds.forEach(id => {
  if (!goHtmlContent.includes(`'${id}'`)) {
    missingInGoHtml++;
    issues.push(`go.html 缺少 ID 映射: ${id}`);
  }
  if (!redirectsContent.includes(`/go/${id}`) || !redirectsContent.includes(`id=${id}`)) {
    missingInRedirects++;
    issues.push(`_redirects 缺少 ID 映射: ${id}`);
  }
  if (!nginxContent.includes(`/go/${id}`) || !nginxContent.includes(`$arg_id = "${id}"`)) {
    missingInNginx++;
    issues.push(`nginx-redirects.conf 缺少 ID 映射: ${id}`);
  }
  if (!htaccessContent.includes(`go/${id}`)) {
    missingInHtaccess++;
    issues.push(`.htaccess 缺少 ID 映射: ${id}`);
  }
});

if (missingInGoHtml === 0 && missingInRedirects === 0 && missingInNginx === 0 && missingInHtaccess === 0) {
  console.log('✅ 通过：所有引用 ID 在 4 处重定向系统 (go.html, _redirects, nginx, htaccess) 中全部就绪，0 死链！');
} else {
  console.error(`❌ 存在未匹配 ID: goHtml=${missingInGoHtml}, redirects=${missingInRedirects}, nginx=${missingInNginx}, htaccess=${missingInHtaccess}`);
}

console.log('\n=== [审计 4] 搜索引擎爬虫与 robots.txt 规范自检 ===');
const robotsContent = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8');
if (robotsContent.includes('Disallow: /go') || robotsContent.includes('Disallow: /go.html')) {
  issues.push('robots.txt 错误设置了对 /go 或 /go.html 的 Disallow！');
  console.error('❌ robots.txt 包含 Disallow /go');
} else {
  console.log('✅ 通过：robots.txt 未对 /go 或 /go.html 设置 Disallow，避免了 Bing/Google Webmaster 阻断报错！');
}

if (goHtmlContent.includes('<meta name="robots" content="noindex, nofollow')) {
  console.log('✅ 通过：go.html 头部严格包含 <meta name="robots" content="noindex, nofollow...">！');
} else {
  issues.push('go.html 缺少 <meta name="robots" content="noindex, nofollow">！');
  console.error('❌ go.html 缺少 noindex meta 标签');
}

console.log('\n=== [审计结果汇总] ===');
if (issues.length === 0) {
  console.log('🎉 恭喜！全站「AFF 推广链接 301 隔离与合规改造」全部门禁自检项 100% 完美通过！');
} else {
  console.log(`⚠️ 发现 ${issues.length} 个问题:`);
  issues.forEach(i => console.log(' - ' + i));
}
