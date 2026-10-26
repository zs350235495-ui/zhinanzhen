const fs = require('fs');
const path = require('path');

const AFF_MAP = [
  { id: 'huanqiuti', url: 'https://123pps01.huanqiutiaff.com/#/?code=j5VBUvw0' },
  { id: 'dalaoyun', url: 'https://ppsvip01.dalaoyunaff.com/#/?code=Iz1GlCVa' },
  { id: 'yunjiexian', url: 'https://pp01.yunjiexianaff.com/#/?code=bp0ZSKBV' },
  { id: 'shandianshu', url: 'https://ppsvip01.shandianshuaff.com/#/?code=QbLF8tjB' },
  { id: 'shenxing', url: 'https://pps123.shenxingaff.com/#/?code=6tQ7zHUc' },
  { id: 'liulianyun', url: 'https://123pp01.liulianyunaff.com/#/?code=MsZP3u7G' },
  { id: 'kuaili', url: 'https://iasfa.kuailitztz2.sbs/#/?code=e0cAmK7F' },
  { id: 'guangnianti', url: 'https://bk1dvc.guangnianertt1.homes/#/?code=PQhPFDhO' },
  { id: 'edgenode', url: 'https://zvbghs02.ztymforedge.lol/#/?code=mLLL6h6F' },
  { id: 'shunyun', url: 'https://ddd.jichang.best/#/register?code=nldUZaYc' },
  { id: 'kexinyun', url: 'https://asfasf.kexintztz2.sbs/#/?code=sFKkfEYs' },
  { id: 'yuntu', url: 'https://super.ytjcok.org/#/register?code=poKwFVtv' },
  { id: 'jilianyun', url: 'https://poajufr.jilianat.homes/#/?code=jwCMOvQO' },
  { id: 'sujie', url: 'https://momlise.szjtfp.xyz/#/?code=kcoensXG' },
  { id: 'kunpeng', url: 'https://kunpengjiasu.com/#/register?code=WPugVZUe' }
];

// Helper to escape regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to update an <a> tag to use safe link & required rel
function transformAnchorTag(fullTag, targetUrl, id) {
  let newTag = fullTag;
  
  // Replace the href
  const safeHref = `/go.html?id=${id}`;
  newTag = newTag.replace(targetUrl, safeHref);
  
  // Handle rel attribute
  const relRegex = /rel=["']([^"']*)["']/i;
  const standardRel = 'rel="nofollow sponsored noopener noreferrer"';
  
  if (relRegex.test(newTag)) {
    newTag = newTag.replace(relRegex, standardRel);
  } else {
    // Add rel before the closing >
    newTag = newTag.replace(/>$/, ` ${standardRel}>`);
  }
  
  // Ensure target="_blank"
  if (!/target=["']_blank["']/i.test(newTag)) {
    newTag = newTag.replace(/>$/, ' target="_blank">');
  }

  return newTag;
}

// Process HTML files
const rootDir = process.cwd();
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && f !== 'go.html');

let totalHtmlReplacements = 0;
const fileStats = {};

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let replacedCount = 0;

  AFF_MAP.forEach(({ id, url }) => {
    // Search for <a> tags containing this URL
    // Regex matches <a ... href="..." ... >
    const aTagRegex = new RegExp(`<a\\s+[^>]*href=["']${escapeRegExp(url)}["'][^>]*>`, 'gi');
    content = content.replace(aTagRegex, (match) => {
      replacedCount++;
      totalHtmlReplacements++;
      return transformAnchorTag(match, url, id);
    });

    // Also check if any href exists with reversed quotes or spaces
    const anyHrefRegex = new RegExp(`href=["']${escapeRegExp(url)}["']`, 'gi');
    if (anyHrefRegex.test(content)) {
      // In case there were any non-<a> or missed occurrences
      console.log(`Warning: remaining href of ${url} in ${file}`);
    }
  });

  if (replacedCount > 0) {
    fileStats[file] = replacedCount;
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('=== HTML Files Replacement Summary ===');
for (const [f, cnt] of Object.entries(fileStats)) {
  console.log(`${f}: ${cnt} links replaced`);
}
console.log(`Total HTML anchor links replaced: ${totalHtmlReplacements}\n`);

// Update data.js
const dataPath = path.join(rootDir, 'data.js');
let dataContent = fs.readFileSync(dataPath, 'utf8');
let dataReplacements = 0;

AFF_MAP.forEach(({ id, url }) => {
  const urlRegex = new RegExp(escapeRegExp(url), 'g');
  const safeUrl = `/go.html?id=${id}`;
  const matches = dataContent.match(urlRegex);
  if (matches) {
    dataReplacements += matches.length;
    dataContent = dataContent.replace(urlRegex, safeUrl);
  }
});

fs.writeFileSync(dataPath, dataContent, 'utf8');
console.log(`=== data.js Replacement Summary ===`);
console.log(`Total URLs replaced in data.js: ${dataReplacements}\n`);

// Check main.js
const mainPath = path.join(rootDir, 'main.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');
let mainUpdated = false;

// Ensure main.js renders rel="nofollow sponsored noopener noreferrer" for dynamic ladder cards
if (mainContent.includes('rel="noopener noreferrer" class="rounded-lg bg-blue-600')) {
  mainContent = mainContent.replace(
    'rel="noopener noreferrer" class="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white text-center shadow-xs transition-colors flex items-center justify-center gap-1"',
    'rel="nofollow sponsored noopener noreferrer" class="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white text-center shadow-xs transition-colors flex items-center justify-center gap-1"'
  );
  mainUpdated = true;
}

if (mainContent.includes('rel="noopener noreferrer" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600')) {
  mainContent = mainContent.replace(
    'rel="noopener noreferrer" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs transition-colors shrink-0"',
    'rel="nofollow sponsored noopener noreferrer" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs transition-colors shrink-0"'
  );
  mainUpdated = true;
}

if (mainUpdated) {
  fs.writeFileSync(mainPath, mainContent, 'utf8');
  console.log('main.js updated with rel="nofollow sponsored noopener noreferrer" for dynamic render cards.');
}
