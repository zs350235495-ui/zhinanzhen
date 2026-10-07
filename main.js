/* ==========================================================================
   TechCompass / 梯子指南针 - Data-Driven Renderer & Dynamic Interaction Logic
   ========================================================================== */

import { topFeaturedServices, airportsData, featuredToolsData, articlesData, faqData } from './data.js';

// Global state for filtering
const state = {
  os: 'all',
  protocol: 'all',
  scene: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initStatusPill();
  renderTopFeaturedCard();
  renderFeaturedTools();
  renderArticles();
  renderFAQAccordion();
  initFilterPills();
  initSearchModal();
  initTGJumper();
});

/* --------------------------------------------------------------------------
   0. Render TOP 1 ~ TOP 15 Featured Airport Services Cards
   -------------------------------------------------------------------------- */
function renderTopFeaturedCard() {
  const container = document.getElementById('top-featured-container');
  if (!container) return;

  const top3 = topFeaturedServices.slice(0, 3);
  const rest = topFeaturedServices.slice(3);

  container.innerHTML = `
    <div class="mb-6 flex flex-wrap items-end justify-between gap-2">
      <div>
        <span class="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">EDITOR'S CHOICE & COMPARISON</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">2026年度精选梯子与机场推荐榜</h2>
      </div>
      <span class="text-xs text-slate-500 dark:text-slate-400">实测稳定性、线路类型、资费明细与专属通道</span>
    </div>

    <!-- 🥇 TOP 1 ~ TOP 3 编辑精选推荐大卡片（现代极简科技风） -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      ${top3.map((service, index) => {
        const isTop1 = index === 0;
        const startPrice = service.plans && service.plans[1] ? service.plans[1].price.split(' ')[0] : (service.plans && service.plans[0] ? service.plans[0].price.split(' ')[0] : '¥18.00');
        return `
          <div class="rounded-2xl border ${isTop1 ? 'border-amber-300/80 dark:border-amber-600/40 ring-1 ring-amber-400/20' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative group">
            
            <div>
              <!-- 头部：排名 Badge、名字、评分 -->
              <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div class="flex items-center space-x-2">
                  <span class="rounded-md ${isTop1 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/50' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'} px-2.5 py-0.5 text-xs font-bold">
                    ${service.rank.split(' ')[0]}
                  </span>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">${service.name}</h3>
                </div>
                <div class="flex items-center text-sm font-bold text-amber-500">
                  ★ ${service.rating} <span class="ml-1 text-[11px] text-slate-400 font-normal hidden sm:inline">(极高评价)</span>
                </div>
              </div>

              <!-- 特性标签 -->
              <div class="flex flex-wrap gap-1.5 mb-3">
                ${service.features.slice(0, 3).map(f => `
                  <span class="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    ${f}
                  </span>
                `).join('')}
              </div>

              <!-- 简评 -->
              <p class="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                ${service.tagline}
              </p>

              <!-- 快捷规格 -->
              <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-5 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> 延迟 23~28ms</span>
                <span>•</span>
                <span>全节点 1倍率</span>
                <span>•</span>
                <span>流媒体/AI 解锁</span>
              </div>
            </div>

            <!-- 底部：优惠码、起售价与操作 -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <div class="flex items-center justify-between mb-3.5">
                <div>
                  <span class="text-xs text-slate-400">起步价</span>
                  <span class="text-lg font-bold text-slate-900 dark:text-slate-100 ml-1">${startPrice}</span>
                  <span class="text-xs text-slate-400">/月</span>
                </div>
                <button onclick="navigator.clipboard.writeText('${service.couponCode}'); alert('优惠码 ${service.couponCode} 已复制！');" class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors" title="点击复制优惠码">
                  🎁 ${service.couponCode}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <a href="tutorials.html" class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors">
                  查看测速
                </a>
                <a href="${service.url}" target="_blank" rel="noopener noreferrer" class="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white text-center shadow-xs transition-colors flex items-center justify-center gap-1">
                  <span>直达官网</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>

          </div>
        `;
      }).join('')}
    </div>

    <!-- ⚡ TOP 4 ~ TOP 15 现代数据对比表格 (Comparison Table) -->
    <div class="mb-4 flex items-center gap-3 pt-2">
      <h3 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 shrink-0 flex items-center gap-2">
        <span>⚡ 更多优质梯子与机场评测对比</span>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">TOP 4 ~ TOP 15</span>
      </h3>
      <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th class="py-3.5 px-4 w-16">排名</th>
              <th class="py-3.5 px-4">机场品牌与核心特点</th>
              <th class="py-3.5 px-4 hidden sm:table-cell">线路类型 / 标签</th>
              <th class="py-3.5 px-4">起步资费</th>
              <th class="py-3.5 px-4 hidden md:table-cell">专属优惠码</th>
              <th class="py-3.5 px-4 text-right">快捷通道</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            ${rest.map((service, idx) => {
              const startP = service.plans && service.plans[0] ? service.plans[0].price.split(' ')[0] : '¥15.00';
              return `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  <td class="py-3.5 px-4 font-bold">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                      #${idx + 4}
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${service.name}</span>
                      <span class="text-amber-500 font-semibold text-xs">★ ${service.rating}</span>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${service.tagline}</p>
                  </td>
                  <td class="py-3.5 px-4 hidden sm:table-cell">
                    <div class="flex flex-wrap gap-1">
                      ${service.features.slice(0, 2).map(f => `
                        <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">${f}</span>
                      `).join('')}
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      ${startP}
                      <span class="text-[10px] font-normal text-slate-400">/起</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 hidden md:table-cell">
                    <button onclick="navigator.clipboard.writeText('${service.couponCode}'); alert('优惠码 ${service.couponCode} 已复制！');" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors" title="点击复制优惠码">
                      <span>🎁 ${service.couponCode}</span>
                    </button>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <a href="${service.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs transition-colors shrink-0">
                      <span>直达官网</span>
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   1. Dynamic Airport Monitoring Status Pill (Tooltip & Click Binding)
   -------------------------------------------------------------------------- */
function initStatusPill() {
  const container = document.getElementById('status-pill-container');
  if (!container) return;

  const total = airportsData.length;
  const active = airportsData.filter(a => a.status === 'normal').length;
  const abnormal = total - active;
  const lastUpdated = '1小时前';

  const isAllNormal = abnormal === 0;

  const bgClass = isAllNormal
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40';

  const dotColorClass = isAllNormal ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500';

  const textContent = isAllNormal
    ? `15/15 机场正常 · ${lastUpdated}`
    : `${active}/${total} 正常 (${abnormal}家异常) · ${lastUpdated}`;

  container.className = `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-2xs transition-all cursor-pointer ${bgClass}`;
  container.title = `点击查看 ${total} 家收录机场的实时连通率与避坑跑路监控看板`;
  
  container.innerHTML = `
    <span class="w-2 h-2 mr-1.5 rounded-full ${dotColorClass}"></span>
    ${textContent}
  `;

  container.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'tutorials.html#warning';
  });
}

/* --------------------------------------------------------------------------
   2. Dark/Light Mode Switcher with localStorage & System Fallback
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const userSavedTheme = localStorage.getItem('techcompass_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (userSavedTheme === 'dark' || (!userSavedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('techcompass_theme', isDark ? 'dark' : 'light');
    });
  }
}

/* --------------------------------------------------------------------------
   3. Featured Tools Renderer (4-Col Card Layout with Tailwind CSS)
   -------------------------------------------------------------------------- */
function renderFeaturedTools() {
  const container = document.getElementById('tools-grid-container');
  if (!container) return;

  const filtered = featuredToolsData.filter(tool => {
    const matchOS = state.os === 'all' || tool.platformKeys.includes(state.os);
    const matchProtocol = state.protocol === 'all' || tool.protocolKeys.includes(state.protocol);
    const matchScene = state.scene === 'all' || tool.sceneKeys.includes(state.scene);
    return matchOS && matchProtocol && matchScene;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400">暂无匹配该条件过滤下的测评工具卡片</div>`;
    return;
  }

  container.innerHTML = filtered.map(tool => `
    <article class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col group">
      
      <!-- Card Header: Icon & Tag Badge -->
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl">
          ${tool.icon}
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full font-semibold border ${getBadgeClass(tool.badgeType)}">
          ${tool.badge}
        </span>
      </div>

      <!-- Title & Description (2 Line Limit) -->
      <div class="mb-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          ${tool.name}
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          ${tool.tagline}
        </p>
      </div>

      <!-- Platform Badges -->
      <div class="flex flex-wrap gap-1.5 mb-4">
        ${tool.platforms.map(p => `<span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">${p}</span>`).join('')}
      </div>

      <!-- Metrics Rating Bars -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-5 flex flex-col gap-2 border border-slate-100 dark:border-slate-800">
        ${tool.metrics.map(m => `
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400">${m.label}</span>
            <div class="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mx-2">
              <div class="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full" style="width: ${m.percentage}%"></div>
            </div>
            <span class="font-bold text-slate-900 dark:text-slate-100 w-6 text-right">${m.score}</span>
          </div>
        `).join('')}
      </div>

      <!-- Bottom Action Buttons -->
      <div class="mt-auto grid grid-cols-2 gap-2">
        <a href="${tool.detailUrl}" class="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white text-center shadow-2xs transition-colors flex items-center justify-center gap-1">
          📖 详细评测
        </a>
        <a href="${tool.directUrl || tool.downloadUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white text-center shadow-2xs transition-colors flex items-center justify-center gap-1">
          ⚡ 官方下载
        </a>
      </div>

    </article>
  `).join('');
}

/* --------------------------------------------------------------------------
   4. Latest Articles Renderer
   -------------------------------------------------------------------------- */
function renderArticles() {
  const container = document.getElementById('articles-grid-container');
  if (!container) return;

  const filtered = articlesData.filter(art => {
    const matchOS = state.os === 'all' || (art.platformKeys && art.platformKeys.includes(state.os));
    const matchProtocol = state.protocol === 'all' || (art.protocolKeys && art.protocolKeys.includes(state.protocol));
    const matchScene = state.scene === 'all' || art.categoryKey === state.scene;
    return matchOS && matchProtocol && matchScene;
  });

  const displayList = filtered.slice(0, 6);

  if (displayList.length === 0) {
    return;
  }

  container.innerHTML = displayList.map(art => `
    <article class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col group">
      <div class="h-44 bg-slate-100 dark:bg-slate-800/80 relative flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
        <span class="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold border ${getBadgeClass(art.badgeType)}">
          ${art.category}
        </span>
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
          ${art.iconSvg}
        </div>
      </div>

      <div class="p-5 flex flex-col flex-grow">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          <a href="${art.url}" ${art.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${art.title}</a>
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          ${art.excerpt}
        </p>

        <div class="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>${art.date}</span>
          <span>${art.readTime}</span>
        </div>
      </div>
    </article>
  `).join('');
}

/* --------------------------------------------------------------------------
   5. FAQ Accordion Component
   -------------------------------------------------------------------------- */
function renderFAQAccordion() {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  container.innerHTML = faqData.map((item, index) => `
    <div class="faq-item bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors ${item.expandedDefault ? 'active' : ''}">
      <button class="faq-trigger w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <span>${item.question}</span>
        <svg class="faq-icon w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 transform transition-transform ${item.expandedDefault ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-content transition-all duration-200 overflow-hidden text-xs text-slate-600 dark:text-slate-400 leading-relaxed px-5 ${item.expandedDefault ? 'py-4 border-t border-slate-100 dark:border-slate-800' : 'max-h-0 py-0'}">
        <p>${item.answer}</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const icon = item.querySelector('.faq-icon');
      const isOpen = item.classList.contains('active');

      container.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-content').classList.add('max-h-0', 'py-0');
        other.querySelector('.faq-content').classList.remove('py-4', 'border-t', 'border-slate-100', 'dark:border-slate-800');
        other.querySelector('.faq-icon').classList.remove('rotate-180');
      });

      if (!isOpen) {
        item.classList.add('active');
        content.classList.remove('max-h-0', 'py-0');
        content.classList.add('py-4', 'border-t', 'border-slate-100', 'dark:border-slate-800');
        icon.classList.add('rotate-180');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. Interactive Multi-Taxonomy Filter Engine
   -------------------------------------------------------------------------- */
function initFilterPills() {
  const pills = document.querySelectorAll('.filter-pill-btn');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.dataset.filterType;
      const val = pill.dataset.filterVal;

      if (!type || !val) return;

      state[type] = val;

      const parentGroup = pill.closest('#filter-group-' + type) || pill.parentElement;
      parentGroup.querySelectorAll('.filter-pill-btn').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'active');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });

      pill.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      pill.classList.add('bg-blue-600', 'text-white', 'active');

      renderFeaturedTools();
      renderArticles();
    });
  });

  const heroQuickBtns = document.querySelectorAll('[data-quick-filter]');
  heroQuickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const platVal = btn.dataset.quickFilter;
      state.os = platVal;

      const osPills = document.querySelectorAll('[data-filter-type="os"]');
      osPills.forEach(p => {
        if (p.dataset.filterVal === platVal) {
          p.click();
        }
      });

      document.getElementById('tools-grid-container')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* --------------------------------------------------------------------------
   7. Search Modal Logic
   -------------------------------------------------------------------------- */
function initSearchModal() {
  const triggerBtn = document.getElementById('search-trigger');
  const modal = document.getElementById('search-modal');
  const closeBtn = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('modal-search-input');
  const resultsContainer = document.getElementById('search-results-list');

  if (!modal || !searchInput || !resultsContainer) return;

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    searchInput.focus();
    renderSearchResults('');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    searchInput.value = '';
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.classList.contains('hidden') ? openModal() : closeModal();
    }
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value.trim()));

  function renderSearchResults(query) {
    const q = query.toLowerCase();
    const allItems = [
      ...topFeaturedServices.map(s => ({ title: s.name + ' - ' + s.tagline, cat: '梯子推荐', url: s.url })),
      ...featuredToolsData.map(t => ({ title: t.name + ' - ' + t.tagline, cat: '工具评测', url: t.detailUrl })),
      ...articlesData.map(a => ({ title: a.title, cat: a.category, url: a.url }))
    ];

    const filtered = allItems.filter(item => item.title.toLowerCase().includes(q));

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<div class="p-4 text-center text-slate-400">无匹配搜索结果</div>`;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <a href="${item.url}" ${item.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span class="font-medium text-slate-800 dark:text-slate-200">${item.title}</span>
        <span class="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500">${item.cat}</span>
      </a>
    `).join('');
  }
}

function getBadgeClass(type) {
  switch (type) {
    case 'indigo': return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';
    case 'emerald': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    case 'amber': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    case 'sky': return 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20';
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

function initTGJumper() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button, span, .tg-link');
    if (el) {
      const href = el.getAttribute('href') || '';
      const text = el.innerText || '';
      if (href.includes('t.me/huanqiuti8899') || text.includes('@huanqiuti8899') || text.includes('Telegram')) {
        if (!href || href === '#' || href === 'javascript:void(0)') {
          e.preventDefault();
          window.open('https://t.me/huanqiuti8899', '_blank', 'noopener,noreferrer');
        }
      }
    }
  });
}
