const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

// Read data.js directly to find all ladder services
const dataContent = fs.readFileSync(path.join(rootDir, 'data.js'), 'utf8');

// Parse items in topFeaturedServices and airportReviews or similar
console.log('--- Inspecting data.js ---');
const serviceRegex = /name:\s*["']([^"']+)["'][\s\S]*?url:\s*["']([^"']+)["']/g;
let m;
const airportMap = new Map();
while ((m = serviceRegex.exec(dataContent)) !== null) {
  airportMap.set(m[1], m[2]);
  console.log(`Airport: ${m[1]} -> ${m[2]}`);
}

// Also check all <a> tags across all html files
console.log('\n--- Scanning <a> tags in HTML files ---');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const externalLinks = new Map(); // href -> count & examples

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const aTagRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let aMatch;
  while ((aMatch = aTagRegex.exec(content)) !== null) {
    const href = aMatch[1];
    const fullTag = aMatch[0];
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.includes('tiziznz.com')) {
        if (!externalLinks.has(href)) {
          externalLinks.set(href, { count: 0, files: new Set(), sampleTags: [] });
        }
        const item = externalLinks.get(href);
        item.count++;
        item.files.add(file);
        if (item.sampleTags.length < 2) {
          item.sampleTags.push(fullTag);
        }
      }
    }
  }
}

console.log(`Found ${externalLinks.size} unique external links in <a> tags:\n`);
for (const [href, data] of externalLinks.entries()) {
  console.log(`HREF: ${href}`);
  console.log(`  Count: ${data.count}, Files: ${Array.from(data.files).join(', ')}`);
  console.log(`  Sample: ${data.sampleTags[0]}`);
}
