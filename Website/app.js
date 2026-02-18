import { baseLayerLuminance, StandardLuminance } from 'https://unpkg.com/@fluentui/web-components';

const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

// ---------- i18n 配置 ----------
const i18n = {
  zh: {
    publishedBy: '发布者',
    copy: '复制',
    addToVcc: '添加到 VCC',
    gridHeaderName: '名称',
    gridHeaderType: '类型',
    searchPlaceholder: '搜索包...',
    howToAddListing: '如何将此列表添加到 VCC',
    urlBarHelpTooltip: '如何将列表添加到 VCC',
    step1: '打开 VCC 并转到设置',
    step2: '点击“包”选项卡',
    step3: '点击“添加仓库”',
    step4: '在出现的字段中 - 粘贴下面显示的网址',
    step5: '点击“添加”',
    step6: '检查仓库信息并点击“我了解”',
    step7: '转到您的任何项目，查看新添加列表中的包。',
    listingUrl: '列表网址',
    packageInfo: '包信息',
    author: '作者',
    dependencies: '依赖项',
    keywords: '关键词',
    license: '许可证',
    downloadZip: '下载 .ZIP',
    learnMore: '了解更多',
    docsLinkText: '您可以在 VCC 文档 上阅读更多关于包列表的信息',
    howToAddDesc: '要将此列表添加到您的 VCC（VRChat Creator Companion），请执行以下操作：'
  },
  en: {
    publishedBy: 'Published by',
    copy: 'Copy',
    addToVcc: 'Add to VCC',
    gridHeaderName: 'Name',
    gridHeaderType: 'Type',
    searchPlaceholder: 'Search packages...',
    howToAddListing: 'How to add this listing to your VCC',
    urlBarHelpTooltip: 'How to add a listing to your VCC',
    step1: 'Open your VCC and go to Settings',
    step2: 'Click the "Packages" tab',
    step3: 'Click "Add Repository"',
    step4: 'In the field that appears - paste the url displayed below',
    step5: 'Click "Add"',
    step6: 'Check the repository info and click "I Understand"',
    step7: 'Go to any of your projects to see the packages from the newly added listing.',
    listingUrl: 'Listing URL',
    packageInfo: 'Package Info',
    author: 'Author',
    dependencies: 'Dependencies',
    keywords: 'Keywords',
    license: 'License',
    downloadZip: 'Download .ZIP',
    learnMore: 'Learn More',
    docsLinkText: 'You can read more about Package Listings on the VCC docs',
    howToAddDesc: 'To add this listing to your VCC (VRChat Creator Companion), do the following:'
  }
};

let currentLang = localStorage.getItem('vcc-lang') || 'zh';

function updateLanguage(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      // 对于普通元素替换 textContent（保留子元素？这里假定元素主要包含文本或简单包裹）
      // 如果元素内有其他标签（如链接），直接替换 textContent 会破坏子元素，所以只替换文本节点
      // 简便处理：大部分带 data-i18n 的元素只包含纯文本，或内部无其他需要保留的元素。
      // 对于复杂的（如 docsLinkText 内有 <a>），我们使用 innerHTML 保留链接，但注意 XSS 风险（这里无用户输入）
      if (key === 'docsLinkText') {
        // 特殊处理：保留链接结构，只翻译周围文本
        // 这里简单用 innerHTML 替换，但链接 href 不变
        const link = el.querySelector('a');
        if (link) {
          const linkText = link.textContent;
          link.textContent = i18n[lang][key].includes(linkText) ? linkText : i18n[lang][key]; // 简化，实际可以更精细
          // 替换外层文本
          el.innerHTML = i18n[lang][key].replace(linkText, `<a href="${link.href}" target="_blank">${linkText}</a>`);
        } else {
          el.textContent = i18n[lang][key];
        }
      } else {
        el.textContent = i18n[lang][key];
      }
    }
  });

  // 处理 placeholder
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.setAttribute('placeholder', i18n[lang].searchPlaceholder);
  }

  // 处理工具提示（直接设置文本内容）
  const tooltips = document.querySelectorAll('fluent-tooltip[data-i18n]');
  tooltips.forEach(tooltip => {
    const key = tooltip.getAttribute('data-i18n');
    if (i18n[lang][key]) tooltip.textContent = i18n[lang][key];
  });

  // 保存当前语言
  localStorage.setItem('vcc-lang', lang);
  currentLang = lang;
}

// ---------- 原有代码 ----------
const setTheme = () => {
  const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.DarkMode);
  } else {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.LightMode);
  }
}

(() => {
  setTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);

  // 语言切换事件
  document.getElementById('langZh').addEventListener('click', () => updateLanguage('zh'));
  document.getElementById('langEn').addEventListener('click', () => updateLanguage('en'));
  // 初始化语言
  updateLanguage(currentLang);

  const packageGrid = document.getElementById('packageGrid');
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', ({ target: { value = '' }}) => {
    const items = packageGrid.querySelectorAll('fluent-data-grid-row[row-type="default"]');
    items.forEach(item => {
      if (value === '') {
        item.style.display = 'grid';
        return;
      }
      if (
        item.dataset?.packageName?.toLowerCase()?.includes(value.toLowerCase()) ||
        item.dataset?.packageId?.toLowerCase()?.includes(value.toLowerCase())
      ) {
        item.style.display = 'grid';
      } else {
        item.style.display = 'none';
      }
    });
  });

  const urlBarHelpButton = document.getElementById('urlBarHelp');
  const addListingToVccHelp = document.getElementById('addListingToVccHelp');
  urlBarHelpButton.addEventListener('click', () => {
    addListingToVccHelp.hidden = false;
  });
  const addListingToVccHelpClose = document.getElementById('addListingToVccHelpClose');
  addListingToVccHelpClose.addEventListener('click', () => {
    addListingToVccHelp.hidden = true;
  });

  const vccListingInfoUrlFieldCopy = document.getElementById('vccListingInfoUrlFieldCopy');
  vccListingInfoUrlFieldCopy.addEventListener('click', () => {
    const vccUrlField = document.getElementById('vccListingInfoUrlField');
    vccUrlField.select();
    navigator.clipboard.writeText(vccUrlField.value);
    vccListingInfoUrlFieldCopy.appearance = 'accent';
    setTimeout(() => {
      vccListingInfoUrlFieldCopy.appearance = 'neutral';
    }, 1000);
  });

  const vccAddRepoButton = document.getElementById('vccAddRepoButton');
  vccAddRepoButton.addEventListener('click', () => window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`));

  const vccUrlFieldCopy = document.getElementById('vccUrlFieldCopy');
  vccUrlFieldCopy.addEventListener('click', () => {
    const vccUrlField = document.getElementById('vccUrlField');
    vccUrlField.select();
    navigator.clipboard.writeText(vccUrlField.value);
    vccUrlFieldCopy.appearance = 'accent';
    setTimeout(() => {
      vccUrlFieldCopy.appearance = 'neutral';
    }, 1000);
  });

  const rowMoreMenu = document.getElementById('rowMoreMenu');
  const hideRowMoreMenu = e => {
    if (rowMoreMenu.contains(e.target)) return;
    document.removeEventListener('click', hideRowMoreMenu);
    rowMoreMenu.hidden = true;
  }

  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  rowMenuButtons.forEach(button => {
    button.addEventListener('click', e => {
      if (rowMoreMenu?.hidden) {
        rowMoreMenu.style.top = `${e.clientY + e.target.clientHeight}px`;
        rowMoreMenu.style.left = `${e.clientX - 120}px`;
        rowMoreMenu.hidden = false;

        const downloadLink = rowMoreMenu.querySelector('#rowMoreMenuDownload');
        const downloadListener = () => {
          window.open(e?.target?.dataset?.packageUrl, '_blank');
        }
        downloadLink.addEventListener('change', () => {
          downloadListener();
          downloadLink.removeEventListener('change', downloadListener);
        });

        setTimeout(() => {
          document.addEventListener('click', hideRowMoreMenu);
        }, 1);
      }
    });
  });

  const packageInfoModal = document.getElementById('packageInfoModal');
  const packageInfoModalClose = document.getElementById('packageInfoModalClose');
  packageInfoModalClose.addEventListener('click', () => {
    packageInfoModal.hidden = true;
  });

  const modalControl = packageInfoModal.shadowRoot.querySelector('.control');
  modalControl.style.maxHeight = "90%";
  modalControl.style.transition = 'height 0.2s ease-in-out';
  modalControl.style.overflowY = 'hidden';

  const packageInfoName = document.getElementById('packageInfoName');
  const packageInfoId = document.getElementById('packageInfoId');
  const packageInfoVersion = document.getElementById('packageInfoVersion');
  const packageInfoDescription = document.getElementById('packageInfoDescription');
  const packageInfoAuthor = document.getElementById('packageInfoAuthor');
  const packageInfoDependencies = document.getElementById('packageInfoDependencies');
  const packageInfoKeywords = document.getElementById('packageInfoKeywords');
  const packageInfoLicense = document.getElementById('packageInfoLicense');

  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach((button) => {
    button.addEventListener('click', () => window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`));
  });

  const rowPackageInfoButton = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButton.forEach((button) => {
    button.addEventListener('click', e => {
      const packageId = e.target.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];
      if (!packageInfo) {
        console.error(`Did not find package ${packageId}. Packages available:`, PACKAGES);
        return;
      }

      packageInfoName.textContent = packageInfo.displayName;
      packageInfoId.textContent = packageId;
      packageInfoVersion.textContent = `v${packageInfo.version}`;
      packageInfoDescription.textContent = packageInfo.description;
      packageInfoAuthor.textContent = packageInfo.author.name;
      packageInfoAuthor.href = packageInfo.author.url;

      if ((packageInfo.keywords?.length ?? 0) === 0) {
        packageInfoKeywords.parentElement.classList.add('hidden');
      } else {
        packageInfoKeywords.parentElement.classList.remove('hidden');
        packageInfoKeywords.innerHTML = null;
        packageInfo.keywords.forEach(keyword => {
          const keywordDiv = document.createElement('div');
          keywordDiv.classList.add('me-2', 'mb-2', 'badge');
          keywordDiv.textContent = keyword;
          packageInfoKeywords.appendChild(keywordDiv);
        });
      }

      if (!packageInfo.license?.length && !packageInfo.licensesUrl?.length) {
        packageInfoLicense.parentElement.classList.add('hidden');
      } else {
        packageInfoLicense.parentElement.classList.remove('hidden');
        packageInfoLicense.textContent = packageInfo.license ?? 'See License';
        packageInfoLicense.href = packageInfo.licensesUrl ?? '#';
      }

      packageInfoDependencies.innerHTML = null;
      Object.entries(packageInfo.dependencies).forEach(([name, version]) => {
        const depRow = document.createElement('li');
        depRow.classList.add('mb-2');
        depRow.textContent = `${name} @ v${version}`;
        packageInfoDependencies.appendChild(depRow);
      });

      packageInfoModal.hidden = false;

      setTimeout(() => {
        const height = packageInfoModal.querySelector('.col').clientHeight;
        modalControl.style.setProperty('--dialog-height', `${height + 14}px`);
      }, 1);
    });
  });

  const packageInfoVccUrlFieldCopy = document.getElementById('packageInfoVccUrlFieldCopy');
  packageInfoVccUrlFieldCopy.addEventListener('click', () => {
    const vccUrlField = document.getElementById('packageInfoVccUrlField');
    vccUrlField.select();
    navigator.clipboard.writeText(vccUrlField.value);
    packageInfoVccUrlFieldCopy.appearance = 'accent';
    setTimeout(() => {
      packageInfoVccUrlFieldCopy.appearance = 'neutral';
    }, 1000);
  });

  const packageInfoListingHelp = document.getElementById('packageInfoListingHelp');
  packageInfoListingHelp.addEventListener('click', () => {
    addListingToVccHelp.hidden = false;
  });
})();
