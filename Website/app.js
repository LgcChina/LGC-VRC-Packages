import { baseLayerLuminance, StandardLuminance } from 'https://unpkg.com/@fluentui/web-components';

// 列表URL（模板变量，由后端渲染）
const LISTING_URL = "{{ listingInfo.Url }}";

// 包信息数据（模板变量，由后端渲染）
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

/**
 * 设置Fluent UI主题（适配系统深色/浅色模式）
 */
const setTheme = () => {
  const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.DarkMode);
  } else {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.LightMode);
  }
};

/**
 * 安全获取DOM元素（避免null报错）
 * @param {string} id 元素ID
 * @returns {HTMLElement|null}
 */
const getElementByIdSafe = (id) => {
  const el = document.getElementById(id);
  if (!el) console.warn(`[VCC UI] 未找到DOM元素：${id}`);
  return el;
};

/**
 * 清理重复的弹窗元素（解决DOM重复渲染问题）
 * @returns {HTMLElement|null} 唯一的弹窗元素
 */
const cleanDuplicateDialog = () => {
  const allDialogs = document.querySelectorAll('fluent-dialog[id="addListingToVccHelp"]');
  if (allDialogs.length > 1) {
    console.warn('[VCC UI] 发现重复的addListingToVccHelp弹窗，清理多余元素');
    // 保留第一个，删除其余重复元素
    Array.from(allDialogs).slice(1).forEach(el => el.remove());
  }
  return document.querySelector('fluent-dialog[id="addListingToVccHelp"]');
};

/**
 * 等待Fluent UI组件定义完成（关键：避免组件未初始化就调用API）
 * @param {string} tagName 组件标签名（小写）
 * @returns {Promise<CustomElementConstructor>}
 */
const waitForComponentDefined = (tagName) => {
  return new Promise((resolve) => {
    if (customElements.get(tagName)) {
      resolve(customElements.get(tagName));
    } else {
      customElements.whenDefined(tagName).then(resolve);
    }
  });
};

// ========== 主逻辑：DOM+组件都加载完成后执行 ==========
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 等待Fluent UI的dialog组件定义完成
  await waitForComponentDefined('fluent-dialog');
  // 2. 初始化主题
  setTheme();

  // 监听系统主题切换
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setTheme();
  });

  // 3. 获取DOM元素（先清理重复弹窗）
  const packageGrid = getElementByIdSafe('packageGrid');
  const searchInput = getElementByIdSafe('searchInput');
  const urlBarHelpButton = getElementByIdSafe('urlBarHelp');
  const addListingToVccHelp = cleanDuplicateDialog(); // 关键：清理重复弹窗
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

  // 4. 弹窗显示/隐藏通用方法（终极修复：调用组件原生API）
  /**
   * 显示添加仓库帮助弹窗（使用Fluent UI组件原生show()方法）
   */
  const showAddListingHelpDialog = () => {
    if (!addListingToVccHelp) {
      console.error('[VCC UI] 未找到addListingToVccHelp弹窗元素');
      return;
    }
    // 关键：调用Fluent UI dialog的原生show()方法
    addListingToVccHelp.show();
    // 移除所有手动设置的style，还原到原版状态
    addListingToVccHelp.removeAttribute('style');
    // 移除hidden属性（兜底）
    addListingToVccHelp.removeAttribute('hidden');
    console.log('[VCC UI] 调用组件show()方法，弹窗已激活');
  };

  /**
   * 隐藏添加仓库帮助弹窗（使用Fluent UI组件原生hide()方法）
   */
  const hideAddListingHelpDialog = () => {
    if (!addListingToVccHelp) return;
    // 关键：调用Fluent UI dialog的原生hide()方法
    addListingToVccHelp.hide();
    // 添加hidden属性（兜底）
    addListingToVccHelp.setAttribute('hidden', '');
  };

  // 5. 包搜索功能
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

  // 6. 帮助弹窗控制（终极修复：调用组件API）
  // 点击urlBarHelp按钮打开弹窗
  if (urlBarHelpButton && addListingToVccHelp) {
    urlBarHelpButton.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      e.preventDefault(); // 阻止默认行为
      showAddListingHelpDialog();
    });
  }

  // 点击关闭按钮隐藏弹窗
  if (addListingToVccHelpClose && addListingToVccHelp) {
    addListingToVccHelpClose.addEventListener('click', (e) => {
      e.stopPropagation();
      hideAddListingHelpDialog();
    });
  }

  // 包详情页帮助按钮打开弹窗
  if (packageInfoListingHelp && addListingToVccHelp) {
    packageInfoListingHelp.addEventListener('click', (e) => {
      e.stopPropagation();
      showAddListingHelpDialog();
    });
  }

  // 点击遮罩层关闭弹窗（适配组件API）
  if (addListingToVccHelp) {
    addListingToVccHelp.addEventListener('click', (e) => {
      const dialogContent = addListingToVccHelp.shadowRoot?.querySelector('.control');
      // 点击遮罩层（非内容区）才关闭
      if (dialogContent && !dialogContent.contains(e.target)) {
        hideAddListingHelpDialog();
      }
    });

    // ESC键关闭弹窗（适配组件API）
    window.addEventListener('keydown', (e) => {
      // 组件的open属性为true表示弹窗显示
      if (e.key === 'Escape' && addListingToVccHelp.open) {
        hideAddListingHelpDialog();
      }
    });

    // 弹窗显示时禁止页面滚动（基于组件open属性）
    const originalBodyStyle = document.body.style.overflow;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'open') {
          document.body.style.overflow = addListingToVccHelp.open 
            ? 'hidden' 
            : originalBodyStyle;
        }
      });
    });
    // 监听组件的open属性（Fluent UI dialog的核心状态属性）
    observer.observe(addListingToVccHelp, { attributes: true, attributeFilter: ['open'] });
  }

  // 7. URL复制功能（vccListingInfoUrlFieldCopy）
  if (vccListingInfoUrlFieldCopy) {
    vccListingInfoUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = getElementByIdSafe('vccListingInfoUrlField');
      if (!vccUrlField) return;
      
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value).catch(err => {
        console.error('[VCC UI] 复制失败：', err);
        alert('复制失败，请手动复制！');
      });
      
      // 复制反馈
      vccListingInfoUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        vccListingInfoUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }

  // 8. 添加到VCC按钮功能
  if (vccAddRepoButton) {
    vccAddRepoButton.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  }

  // 9. VCC URL复制功能（vccUrlFieldCopy）
  if (vccUrlFieldCopy) {
    vccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = getElementByIdSafe('vccUrlField');
      if (!vccUrlField) return;
      
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value).catch(err => {
        console.error('[VCC UI] 复制失败：', err);
        alert('复制失败，请手动复制！');
      });
      
      // 复制反馈
      vccUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        vccUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }

  // 10. 行菜单功能（下载ZIP）
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

  // 11. 包详情弹窗关闭功能（适配组件API）
  if (packageInfoModalClose && packageInfoModal) {
    packageInfoModalClose.addEventListener('click', () => {
      if (packageInfoModal.hide) {
        packageInfoModal.hide(); // 调用组件hide方法
      } else {
        packageInfoModal.hidden = true; // 兜底
      }
    });
  }

  // Fluent dialog 样式适配
  if (packageInfoModal) {
    const modalControl = packageInfoModal.shadowRoot?.querySelector('.control');
    if (modalControl) {
      modalControl.style.maxHeight = "90%";
      modalControl.style.transition = 'height 0.2s ease-in-out';
      modalControl.style.overflowY = 'hidden';
    }
  }

  // 12. 行添加到VCC按钮功能
  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  });

  // 13. 行包详情按钮功能
  const rowPackageInfoButton = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButton.forEach((button) => {
    button.addEventListener('click', e => {
      const packageId = e.target.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];
      
      if (!packageInfo) {
        console.error(`[VCC UI] 未找到包 ${packageId}，可用包：`, PACKAGES);
        return;
      }

      // 填充包信息（容错处理）
      if (packageInfoName) packageInfoName.textContent = packageInfo.displayName || packageInfo.name;
      if (packageInfoId) packageInfoId.textContent = packageId || '未知ID';
      if (packageInfoVersion) packageInfoVersion.textContent = `v${packageInfo.version || '未知版本'}`;
      if (packageInfoDescription) packageInfoDescription.textContent = packageInfo.description || '无描述';
      
      if (packageInfoAuthor) {
        packageInfoAuthor.textContent = packageInfo.author?.name || '未知作者';
        packageInfoAuthor.href = packageInfo.author?.url || '#';
      }

      // 渲染关键词
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

      // 渲染许可证
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

      // 渲染依赖项
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

      // 显示包详情弹窗（调用组件API）
      if (packageInfoModal) {
        if (packageInfoModal.show) {
          packageInfoModal.show(); // 调用组件show方法
        } else {
          packageInfoModal.hidden = false; // 兜底
        }
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

  // 14. 包详情URL复制功能
  if (packageInfoVccUrlFieldCopy) {
    packageInfoVccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = getElementByIdSafe('packageInfoVccUrlField');
      if (!vccUrlField) return;
      
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value).catch(err => {
        console.error('[VCC UI] 复制失败：', err);
        alert('复制失败，请手动复制！');
      });
      
      // 复制反馈
      packageInfoVccUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        packageInfoVccUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }
});
