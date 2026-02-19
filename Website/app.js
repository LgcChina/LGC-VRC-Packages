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

const setTheme = () => {
  const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.DarkMode);
  } else {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.LightMode);
  }
}

// ========== 新增：通用工具函数（容错+复用） ==========
/**
 * 安全获取 DOM 元素（避免 null 报错）
 * @param {string} id 元素ID
 * @returns {HTMLElement|null}
 */
const getElementByIdSafe = (id) => {
  const el = document.getElementById(id);
  if (!el) console.warn(`[VCC UI] 未找到DOM元素：${id}`);
  return el;
};

// ========== 关键修改1：确保DOM完全加载后执行逻辑 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 初始化主题
  setTheme();

  // 监听主题切换
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setTheme();
  });

  // ========== 原有DOM元素获取替换为安全获取 ==========
  const packageGrid = getElementByIdSafe('packageGrid');
  const searchInput = getElementByIdSafe('searchInput');
  const urlBarHelpButton = getElementByIdSafe('urlBarHelp');
  const addListingToVccHelp = getElementByIdSafe('addListingToVccHelp');
  const addListingToVccHelpClose = getElementByIdSafe('addListingToVccHelpClose');
  const vccListingInfoUrlFieldCopy = getElementByIdSafe('vccListingInfoUrlFieldCopy');
  const vccAddRepoButton = getElementByIdSafe('vccAddRepoButton');
  const vccUrlFieldCopy = getElementByIdSafe('vccUrlFieldCopy');
  const rowMoreMenu = getElementByIdSafe('rowMoreMenu');
  const packageInfoModal = getElementByIdSafe('packageInfoModal');
  const packageInfoModalClose = getElementByIdSafe('packageInfoModalClose');
  const packageInfoName = getElementByIdSafe('packageInfoName');
  const packageInfoId = getElementByIdSafe('packageInfoId');
  const packageInfoVersion = getElementByIdSafe('packageInfoVersion');
  const packageInfoDescription = getElementByIdSafe('packageInfoDescription');
  const packageInfoAuthor = getElementByIdSafe('packageInfoAuthor');
  const packageInfoDependencies = getElementByIdSafe('packageInfoDependencies');
  const packageInfoKeywords = getElementByIdSafe('packageInfoKeywords');
  const packageInfoLicense = getElementByIdSafe('packageInfoLicense');
  const packageInfoVccUrlFieldCopy = getElementByIdSafe('packageInfoVccUrlFieldCopy');
  const packageInfoListingHelp = getElementByIdSafe('packageInfoListingHelp');

  // ========== 原有搜索逻辑（保留） ==========
  if (searchInput && packageGrid) {
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
  }

  // ========== 关键修改2：修复urlBarHelp按钮点击逻辑（增强稳定性） ==========
  if (urlBarHelpButton && addListingToVccHelp) {
    // 移除原有事件绑定（避免重复），重新绑定
    urlBarHelpButton.removeEventListener('click', () => {});
    urlBarHelpButton.addEventListener('click', (e) => {
      // 阻止事件冒泡，避免被其他逻辑拦截
      e.stopPropagation();
      console.log('[VCC UI] 点击了urlBarHelp按钮，尝试打开弹窗');
      // 强制设置hidden为false（覆盖可能的样式/属性异常）
      addListingToVccHelp.hidden = false;
      // 强制显示弹窗（兼容Fluent UI组件）
      addListingToVccHelp.style.display = 'block';
      // 聚焦弹窗，确保可见
      addListingToVccHelp.focus();
    });
  }

  // ========== 弹窗核心逻辑（增强版） ==========
  if (addListingToVccHelpClose && addListingToVccHelp) {
    // 关闭弹窗（按钮）
    addListingToVccHelpClose.addEventListener('click', (e) => {
      e.stopPropagation();
      addListingToVccHelp.hidden = true;
      addListingToVccHelp.style.display = 'none';
    });
  }

  if (packageInfoListingHelp && addListingToVccHelp) {
    // 触发弹窗（包详情页帮助按钮）
    packageInfoListingHelp.addEventListener('click', (e) => {
      e.stopPropagation();
      addListingToVccHelp.hidden = false;
      addListingToVccHelp.style.display = 'block';
    });
  }

  // 新增：点击遮罩层关闭弹窗（Fluent Dialog 适配）
  if (addListingToVccHelp) {
    addListingToVccHelp.addEventListener('click', (e) => {
      const dialogContent = addListingToVccHelp.shadowRoot?.querySelector('.control');
      // 点击的是遮罩层（非内容区）才关闭
      if (dialogContent && !dialogContent.contains(e.target)) {
        addListingToVccHelp.hidden = true;
        addListingToVccHelp.style.display = 'none';
      }
    });

    // 新增：ESC键关闭弹窗
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !addListingToVccHelp.hidden) {
        addListingToVccHelp.hidden = true;
        addListingToVccHelp.style.display = 'none';
      }
    });

    // 新增：弹窗显示时禁止页面滚动
    const originalBodyStyle = document.body.style.overflow;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'hidden') {
          document.body.style.overflow = addListingToVccHelp.hidden 
            ? originalBodyStyle 
            : 'hidden';
        }
      });
    });
    observer.observe(addListingToVccHelp, { attributes: true, attributeFilter: ['hidden'] });
  }

  // ========== 原有复制逻辑（保留+容错） ==========
  if (vccListingInfoUrlFieldCopy) {
    vccListingInfoUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = getElementByIdSafe('vccListingInfoUrlField');
      if (!vccUrlField) return;
      
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value).catch(err => {
        console.error('[VCC UI] 复制失败：', err);
        alert('复制失败，请手动复制！');
      });
      
      vccListingInfoUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        vccListingInfoUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }

  // ========== 原有添加仓库逻辑（保留+容错） ==========
  if (vccAddRepoButton) {
    vccAddRepoButton.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  }

  // ========== 原有VCC URL复制逻辑（保留+容错） ==========
  if (vccUrlFieldCopy) {
    vccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = getElementByIdSafe('vccUrlField');
      if (!vccUrlField) return;
      
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value).catch(err => {
        console.error('[VCC UI] 复制失败：', err);
        alert('复制失败，请手动复制！');
      });
      
      vccUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        vccUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }

  // ========== 原有行菜单逻辑（保留+容错） ==========
  const hideRowMoreMenu = e => {
    if (!rowMoreMenu) return;
    if (rowMoreMenu.contains(e.target)) return;
    document.removeEventListener('click', hideRowMoreMenu);
    rowMoreMenu.hidden = true;
  };

  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  rowMenuButtons.forEach(button => {
    button.addEventListener('click', e => {
      if (!rowMoreMenu || !rowMoreMenu.hidden) return;
      
      rowMoreMenu.style.top = `${e.clientY + e.target.clientHeight}px`;
      rowMoreMenu.style.left = `${e.clientX - 120}px`;
      rowMoreMenu.hidden = false;

      const downloadLink = rowMoreMenu.querySelector('#rowMoreMenuDownload');
      if (downloadLink) {
        const downloadListener = () => {
          window.open(e?.target?.dataset?.packageUrl, '_blank');
        };
        downloadLink.addEventListener('change', () => {
          downloadListener();
          downloadLink.removeEventListener('change', downloadListener);
        });
      }

      setTimeout(() => {
        document.addEventListener('click', hideRowMoreMenu);
      }, 1);
    });
  });

  // ========== 原有包详情弹窗逻辑（保留+容错） ==========
  if (packageInfoModalClose && packageInfoModal) {
    packageInfoModalClose.addEventListener('click', () => {
      packageInfoModal.hidden = true;
    });
  }

  // Fluent dialog 样式适配（保留+容错）
  if (packageInfoModal) {
    const modalControl = packageInfoModal.shadowRoot?.querySelector('.control');
    if (modalControl) {
      modalControl.style.maxHeight = "90%";
      modalControl.style.transition = 'height 0.2s ease-in-out';
      modalControl.style.overflowY = 'hidden';
    }
  }

  // 行添加到VCC按钮逻辑（保留+容错）
  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  });

  // 行包详情按钮逻辑（保留+容错）
  const rowPackageInfoButton = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButton.forEach((button) => {
    button.addEventListener('click', e => {
      const packageId = e.target.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];
      
      if (!packageInfo) {
        console.error(`[VCC UI] 未找到包 ${packageId}，可用包：`, PACKAGES);
        return;
      }

      // 填充包信息（容错：避免空值导致UI异常）
      if (packageInfoName) packageInfoName.textContent = packageInfo.displayName || packageInfo.name;
      if (packageInfoId) packageInfoId.textContent = packageId || '未知ID';
      if (packageInfoVersion) packageInfoVersion.textContent = `v${packageInfo.version || '未知版本'}`;
      if (packageInfoDescription) packageInfoDescription.textContent = packageInfo.description || '无描述';
      
      if (packageInfoAuthor) {
        packageInfoAuthor.textContent = packageInfo.author?.name || '未知作者';
        packageInfoAuthor.href = packageInfo.author?.url || '#';
      }

      // 关键词渲染（容错）
      if (packageInfoKeywords) {
        const keywordsParent = packageInfoKeywords.parentElement;
        if ((packageInfo.keywords?.length ?? 0) === 0) {
          keywordsParent?.classList.add('hidden');
        } else {
          keywordsParent?.classList.remove('hidden');
          packageInfoKeywords.innerHTML = null;
          packageInfo.keywords.forEach(keyword => {
            const keywordDiv = document.createElement('div');
            keywordDiv.classList.add('me-2', 'mb-2', 'badge');
            keywordDiv.textContent = keyword;
            packageInfoKeywords.appendChild(keywordDiv);
          });
        }
      }

      // 许可证渲染（容错）
      if (packageInfoLicense) {
        const licenseParent = packageInfoLicense.parentElement;
        const hasLicense = packageInfo.license?.length || packageInfo.licensesUrl?.length;
        if (!hasLicense) {
          licenseParent?.classList.add('hidden');
        } else {
          licenseParent?.classList.remove('hidden');
          packageInfoLicense.textContent = packageInfo.license ?? '查看许可证';
          packageInfoLicense.href = packageInfo.licensesUrl ?? '#';
        }
      }

      // 依赖渲染（容错）
      if (packageInfoDependencies) {
        packageInfoDependencies.innerHTML = null;
        const dependencies = packageInfo.dependencies || {};
        Object.entries(dependencies).forEach(([name, version]) => {
          const depRow = document.createElement('li');
          depRow.classList.add('mb-2');
          depRow.textContent = `${name} @ v${version || '未知版本'}`;
          packageInfoDependencies.appendChild(depRow);
        });
      }

      // 显示弹窗并适配高度
      if (packageInfoModal) {
        packageInfoModal.hidden = false;
        setTimeout(() => {
          const modalControl = packageInfoModal.shadowRoot?.querySelector('.control');
          const colElement = packageInfoModal.querySelector('.col');
          if (modalControl && colElement) {
            const height = colElement.clientHeight;
            modalControl.style.setProperty('--dialog-height', `${height + 14}px`);
          }
        }, 1);
      }
    });
  });

  // ========== 原有包详情复制逻辑（保留+容错） ==========
  if (packageInfoVccUrlFieldCopy) {
    packageInfoVccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = getElementByIdSafe('packageInfoVccUrlField');
      if (!vccUrlField) return;
      
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value).catch(err => {
        console.error('[VCC UI] 复制失败：', err);
        alert('复制失败，请手动复制！');
      });
      
      packageInfoVccUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        packageInfoVccUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }
});
