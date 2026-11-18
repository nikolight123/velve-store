/**
 * VELVE — Admin Suite & Designer Mode Controller
 * Powers the Visual CMS, Inventory Manager, and Sales Analytics Dashboard.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.VelveStore) {
    console.error('VelveStore not loaded.');
    return;
  }

  // -------------------------------------------------------------------------
  // 0. Security Gate & Authentication Check
  // -------------------------------------------------------------------------
  const adminGateOverlay = document.getElementById('adminGateOverlay');
  const adminGateForm = document.getElementById('adminGateForm');
  const adminGateError = document.getElementById('adminGateError');
  const gateUser = document.getElementById('gateUser');
  const gatePass = document.getElementById('gatePass');
  const btnToggleGatePass = document.getElementById('btnToggleGatePass');
  const gateRememberMe = document.getElementById('gateRememberMe');
  const btnAdminSidebarLogout = document.getElementById('btnAdminSidebarLogout');
  const btnAdminTopbarLogout = document.getElementById('btnAdminTopbarLogout');

  function checkAdminAuth() {
    if (window.VelveStore && window.VelveStore.isAuthenticated()) {
      if (adminGateOverlay) {
        adminGateOverlay.classList.add('unlocked');
        adminGateOverlay.style.display = 'none';
      }
    } else {
      if (adminGateOverlay) {
        adminGateOverlay.classList.remove('unlocked');
        adminGateOverlay.style.display = 'flex';
        if (gateUser) setTimeout(() => gateUser.focus(), 150);
      }
    }
  }

  // Initial gate check
  checkAdminAuth();

  if (btnToggleGatePass && gatePass) {
    btnToggleGatePass.addEventListener('click', (e) => {
      e.preventDefault();
      const current = gatePass.getAttribute('type');
      gatePass.setAttribute('type', current === 'password' ? 'text' : 'password');
    });
  }

  if (adminGateForm) {
    adminGateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = (gateUser ? gateUser.value : '').trim();
      const p = (gatePass ? gatePass.value : '').trim();
      const remember = gateRememberMe ? gateRememberMe.checked : true;

      if (!u || !p) {
        if (adminGateError) {
          adminGateError.textContent = 'Por favor ingresa tu usuario y contraseña.';
          adminGateError.style.display = 'block';
        }
        return;
      }

      const res = window.VelveStore.login(u, p, remember);
      if (res.success) {
        if (adminGateError) adminGateError.style.display = 'none';
        if (adminGateOverlay) {
          adminGateOverlay.classList.add('unlocked');
          adminGateOverlay.style.display = 'none';
        }
        showToast('Acceso autorizado. ¡Bienvenido, Administrador!');
      } else {
        if (adminGateError) {
          adminGateError.textContent = res.message || 'Usuario o contraseña incorrectos.';
          adminGateError.style.display = 'block';
        }
        if (gatePass) {
          gatePass.focus();
          gatePass.select();
        }
      }
    });
  }

  function handleLogout(e) {
    if (e) e.preventDefault();
    if (confirm('¿Deseas cerrar la sesión de administración?')) {
      if (window.VelveStore) {
        window.VelveStore.logout();
      }
      showToast('Sesión finalizada.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 350);
    }
  }

  if (btnAdminSidebarLogout) {
    btnAdminSidebarLogout.addEventListener('click', handleLogout);
  }
  if (btnAdminTopbarLogout) {
    btnAdminTopbarLogout.addEventListener('click', handleLogout);
  }

  // -------------------------------------------------------------------------
  // 1. DOM Elements & Tab Switching
  // -------------------------------------------------------------------------
  const sidebarButtons = document.querySelectorAll('.sidebar-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const topbarTitle = document.getElementById('topbarCurrentSection');
  const adminToast = document.getElementById('adminToast');
  const adminToastMsg = document.getElementById('adminToastMsg');

  function showToast(msg) {
    if (!adminToast || !adminToastMsg) return;
    adminToastMsg.textContent = msg;
    adminToast.classList.add('show');
    setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3200);
  }

  function formatMoney(amount) {
    return '$' + Number(amount || 0).toLocaleString('es-CO');
  }

  function activateTab(targetTabId) {
    const btn = Array.from(sidebarButtons).find(b => b.getAttribute('data-tab') === targetTabId);
    const targetPane = document.getElementById(targetTabId);
    if (!btn || !targetPane) return;

    sidebarButtons.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    targetPane.classList.add('active');

    const spanText = btn.querySelector('span')?.textContent || 'Panel';
    if (topbarTitle) topbarTitle.textContent = spanText;

    if (targetTabId === 'tab-designer' || targetTabId === 'tab-settings') loadDesignerForm();
    if (targetTabId === 'tab-catalog') renderCatalogTable();
    if (targetTabId === 'tab-sales') renderSalesDashboard();
  }

  // Tab switching
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      activateTab(targetTabId);
      if (history.replaceState) {
        history.replaceState(null, null, '#' + targetTabId);
      }
    });
  });

  // Check URL hash on load or hashchange
  function checkHashTab() {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (hash && ['tab-designer', 'tab-catalog', 'tab-sales', 'tab-settings'].includes(hash)) {
      activateTab(hash);
    }
  }
  window.addEventListener('hashchange', checkHashTab);

  // -------------------------------------------------------------------------
  // 2. MÓDULO 1: MODO DISEÑADOR (Visual CMS) & AJUSTES (TAB 4)
  // -------------------------------------------------------------------------
  // Config inputs
  const cfgAnnouncementEnabled = document.getElementById('cfgAnnouncementEnabled');
  const cfgAnnouncementText = document.getElementById('cfgAnnouncementText');
  const cfgAnnouncementSec = document.getElementById('cfgAnnouncementSec');

  const cfgHeroImage = document.getElementById('cfgHeroImage');
  const previewHeroImg = document.getElementById('previewHeroImg');
  const cfgHeroBadge = document.getElementById('cfgHeroBadge');
  const cfgHeroTitle = document.getElementById('cfgHeroTitle');
  const cfgHeroSubtitle = document.getElementById('cfgHeroSubtitle');
  const cfgHeroCta1 = document.getElementById('cfgHeroCta1');
  const cfgHeroCta2 = document.getElementById('cfgHeroCta2');

  const cfgValueImage = document.getElementById('cfgValueImage');
  const previewValueImg = document.getElementById('previewValueImg');
  const cfgValueTitle = document.getElementById('cfgValueTitle');
  const cfgValueLead = document.getElementById('cfgValueLead');
  const cfgPillar1Title = document.getElementById('cfgPillar1Title');
  const cfgPillar1Desc = document.getElementById('cfgPillar1Desc');
  const cfgPillar2Title = document.getElementById('cfgPillar2Title');
  const cfgPillar2Desc = document.getElementById('cfgPillar2Desc');
  const cfgPillar3Title = document.getElementById('cfgPillar3Title');
  const cfgPillar3Desc = document.getElementById('cfgPillar3Desc');

  const cfgCat1Image = document.getElementById('cfgCat1Image');
  const cfgCat2Image = document.getElementById('cfgCat2Image');
  const cfgCat3Image = document.getElementById('cfgCat3Image');
  const cfgCat4Image = document.getElementById('cfgCat4Image');

  const cfgManifestoQuote = document.getElementById('cfgManifestoQuote');

  // E-commerce & Settings inputs (Tab 1 & Tab 4)
  const cfgFreeShipping = document.getElementById('cfgFreeShipping');
  const cfgContactEmail = document.getElementById('cfgContactEmail');
  const cfgWhatsappPhone = document.getElementById('cfgWhatsappPhone');

  const cfgSettingsFreeShipping = document.getElementById('cfgSettingsFreeShipping');
  const cfgSettingsContactEmail = document.getElementById('cfgSettingsContactEmail');
  const cfgSettingsWhatsappPhone = document.getElementById('cfgSettingsWhatsappPhone');
  const cfgCurrency = document.getElementById('cfgCurrency');

  const cfgAdminUsername = document.getElementById('cfgAdminUsername');
  const cfgAdminNewPassword = document.getElementById('cfgAdminNewPassword');
  const btnSaveAuthCreds = document.getElementById('btnSaveAuthCreds');

  // Keep paired inputs synchronized between Tab 1 and Tab 4
  function syncInputPair(inputA, inputB) {
    if (!inputA || !inputB) return;
    inputA.addEventListener('input', () => { inputB.value = inputA.value; });
    inputB.addEventListener('input', () => { inputA.value = inputB.value; });
  }
  syncInputPair(cfgFreeShipping, cfgSettingsFreeShipping);
  syncInputPair(cfgContactEmail, cfgSettingsContactEmail);
  syncInputPair(cfgWhatsappPhone, cfgSettingsWhatsappPhone);

  // Simulator elements
  const simAnnouncement = document.getElementById('simAnnouncement');
  const simHeroImg = document.getElementById('simHeroImg');
  const simHeroBadge = document.getElementById('simHeroBadge');
  const simHeroTitle = document.getElementById('simHeroTitle');
  const simHeroSub = document.getElementById('simHeroSub');
  const simHeroCta = document.getElementById('simHeroCta');
  const simValueTitle = document.getElementById('simValueTitle');
  const simValueLead = document.getElementById('simValueLead');
  const simQuote = document.getElementById('simQuote');

  function loadDesignerForm() {
    const config = window.VelveStore.getConfig();

    // Announcement
    if (cfgAnnouncementEnabled) cfgAnnouncementEnabled.checked = config.announcement?.enabled !== false;
    if (cfgAnnouncementText) cfgAnnouncementText.value = config.announcement?.text || '';
    if (cfgAnnouncementSec) cfgAnnouncementSec.value = config.announcement?.secondaryText || '';

    // Hero
    if (cfgHeroImage) cfgHeroImage.value = config.hero?.image || 'assets/images/hero_model.jpg';
    if (previewHeroImg && cfgHeroImage) previewHeroImg.src = cfgHeroImage.value;
    if (cfgHeroBadge) cfgHeroBadge.value = config.hero?.badge || '';
    if (cfgHeroTitle) cfgHeroTitle.value = config.hero?.title || '';
    if (cfgHeroSubtitle) cfgHeroSubtitle.value = config.hero?.subtitle || '';
    if (cfgHeroCta1) cfgHeroCta1.value = config.hero?.ctaPrimaryText || 'Descubre la Colección';
    if (cfgHeroCta2) cfgHeroCta2.value = config.hero?.ctaSecondaryText || 'El Concepto Velve';

    // Value Prop
    if (cfgValueImage) cfgValueImage.value = config.valueProp?.image || 'assets/images/fabric_texture.jpg';
    if (previewValueImg && cfgValueImage) previewValueImg.src = cfgValueImage.value;
    if (cfgValueTitle) cfgValueTitle.value = config.valueProp?.title || '';
    if (cfgValueLead) cfgValueLead.value = config.valueProp?.leadText || '';
    if (cfgPillar1Title) cfgPillar1Title.value = config.valueProp?.feature1Title || '';
    if (cfgPillar1Desc) cfgPillar1Desc.value = config.valueProp?.feature1Desc || '';
    if (cfgPillar2Title) cfgPillar2Title.value = config.valueProp?.feature2Title || '';
    if (cfgPillar2Desc) cfgPillar2Desc.value = config.valueProp?.feature2Desc || '';
    if (cfgPillar3Title) cfgPillar3Title.value = config.valueProp?.feature3Title || '';
    if (cfgPillar3Desc) cfgPillar3Desc.value = config.valueProp?.feature3Desc || '';

    // Categories
    if (cfgCat1Image) cfgCat1Image.value = config.categories?.card1Image || 'assets/images/hero_model.jpg';
    if (cfgCat2Image) cfgCat2Image.value = config.categories?.card2Image || 'assets/images/pilates_studio.jpg';
    if (cfgCat3Image) cfgCat3Image.value = config.categories?.card3Image || 'assets/images/blazer_transition.jpg';
    if (cfgCat4Image) cfgCat4Image.value = config.categories?.card4Image || 'assets/images/evening_noir.jpg';

    // Manifesto
    if (cfgManifestoQuote) cfgManifestoQuote.value = config.manifesto?.quote || '';

    // Settings (Both Tab 1 and Tab 4)
    const freeShipVal = config.ecommerce?.freeShippingThreshold || 180000;
    const emailVal = config.ecommerce?.contactEmail || 'concierge@velvestudios.com';
    const waPhoneVal = config.ecommerce?.whatsappPhone || '+57 312 901 4455';

    if (cfgFreeShipping) cfgFreeShipping.value = freeShipVal;
    if (cfgSettingsFreeShipping) cfgSettingsFreeShipping.value = freeShipVal;

    if (cfgContactEmail) cfgContactEmail.value = emailVal;
    if (cfgSettingsContactEmail) cfgSettingsContactEmail.value = emailVal;

    if (cfgWhatsappPhone) cfgWhatsappPhone.value = waPhoneVal;
    if (cfgSettingsWhatsappPhone) cfgSettingsWhatsappPhone.value = waPhoneVal;

    if (cfgCurrency) cfgCurrency.value = config.ecommerce?.currency || 'COP';

    // Auth credentials
    if (cfgAdminUsername && window.VelveStore.getAuthCredentials) {
      const creds = window.VelveStore.getAuthCredentials();
      cfgAdminUsername.value = creds.username || 'Admin';
    }

    updateSimulator();
  }

  function updateSimulator() {
    if (simAnnouncement && cfgAnnouncementEnabled && cfgAnnouncementText) {
      simAnnouncement.style.display = cfgAnnouncementEnabled.checked ? 'block' : 'none';
      simAnnouncement.textContent = cfgAnnouncementText.value;
    }
    if (simHeroImg && cfgHeroImage) simHeroImg.src = cfgHeroImage.value;
    if (previewHeroImg && cfgHeroImage) previewHeroImg.src = cfgHeroImage.value;
    if (simHeroBadge && cfgHeroBadge) simHeroBadge.textContent = cfgHeroBadge.value;
    if (simHeroTitle && cfgHeroTitle) simHeroTitle.textContent = cfgHeroTitle.value;
    if (simHeroSub && cfgHeroSubtitle) simHeroSub.textContent = cfgHeroSubtitle.value;
    if (simHeroCta && cfgHeroCta1) simHeroCta.textContent = cfgHeroCta1.value;

    if (previewValueImg && cfgValueImage) previewValueImg.src = cfgValueImage.value;
    if (simValueTitle && cfgValueTitle) simValueTitle.textContent = cfgValueTitle.value.replace('\n', ' ');
    if (simValueLead && cfgValueLead) simValueLead.textContent = cfgValueLead.value;
    if (simQuote && cfgManifestoQuote) simQuote.textContent = cfgManifestoQuote.value;
  }

  // Bind live updates
  const liveInputs = [
    cfgAnnouncementEnabled, cfgAnnouncementText, cfgAnnouncementSec,
    cfgHeroImage, cfgHeroBadge, cfgHeroTitle, cfgHeroSubtitle, cfgHeroCta1,
    cfgValueImage, cfgValueTitle, cfgValueLead, cfgManifestoQuote
  ];
  liveInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateSimulator);
      input.addEventListener('change', updateSimulator);
    }
  });

  // Quick gallery chip buttons
  document.querySelectorAll('.chip-img-select').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const targetInputId = chip.getAttribute('data-target');
      const imagePath = chip.getAttribute('data-path');
      const targetInput = document.getElementById(targetInputId);
      if (targetInput) {
        targetInput.value = imagePath;
        updateSimulator();
        showToast('Imagen aplicada a la configuración.');
      }
    });
  });

  // Save all config action
  function saveCurrentConfig() {
    const config = window.VelveStore.getConfig();

    config.announcement = {
      enabled: cfgAnnouncementEnabled ? cfgAnnouncementEnabled.checked : true,
      text: cfgAnnouncementText ? cfgAnnouncementText.value.trim() : '',
      secondaryText: cfgAnnouncementSec ? cfgAnnouncementSec.value.trim() : ''
    };

    config.hero = Object.assign({}, config.hero, {
      image: cfgHeroImage ? cfgHeroImage.value.trim() : '',
      badge: cfgHeroBadge ? cfgHeroBadge.value.trim() : '',
      title: cfgHeroTitle ? cfgHeroTitle.value.trim() : '',
      subtitle: cfgHeroSubtitle ? cfgHeroSubtitle.value.trim() : '',
      ctaPrimaryText: cfgHeroCta1 ? cfgHeroCta1.value.trim() : '',
      ctaSecondaryText: cfgHeroCta2 ? cfgHeroCta2.value.trim() : ''
    });

    config.valueProp = Object.assign({}, config.valueProp, {
      image: cfgValueImage ? cfgValueImage.value.trim() : '',
      title: cfgValueTitle ? cfgValueTitle.value.trim() : '',
      leadText: cfgValueLead ? cfgValueLead.value.trim() : '',
      feature1Title: cfgPillar1Title ? cfgPillar1Title.value.trim() : '',
      feature1Desc: cfgPillar1Desc ? cfgPillar1Desc.value.trim() : '',
      feature2Title: cfgPillar2Title ? cfgPillar2Title.value.trim() : '',
      feature2Desc: cfgPillar2Desc ? cfgPillar2Desc.value.trim() : '',
      feature3Title: cfgPillar3Title ? cfgPillar3Title.value.trim() : '',
      feature3Desc: cfgPillar3Desc ? cfgPillar3Desc.value.trim() : ''
    });

    config.categories = Object.assign({}, config.categories, {
      card1Image: cfgCat1Image ? cfgCat1Image.value.trim() : '',
      card2Image: cfgCat2Image ? cfgCat2Image.value.trim() : '',
      card3Image: cfgCat3Image ? cfgCat3Image.value.trim() : '',
      card4Image: cfgCat4Image ? cfgCat4Image.value.trim() : ''
    });

    config.manifesto = {
      quote: cfgManifestoQuote ? cfgManifestoQuote.value.trim() : '',
      author: 'El Manifiesto Velve • Creado para la libertad femenina'
    };

    const freeShipValue = Number(cfgSettingsFreeShipping?.value || cfgFreeShipping?.value) || 180000;
    const emailValue = (cfgSettingsContactEmail?.value || cfgContactEmail?.value || 'concierge@velvestudios.com').trim();
    const waPhoneValue = (cfgSettingsWhatsappPhone?.value || cfgWhatsappPhone?.value || '+57 312 901 4455').trim();

    config.ecommerce = Object.assign({}, config.ecommerce, {
      freeShippingThreshold: freeShipValue,
      currency: cfgCurrency?.value || 'COP',
      contactEmail: emailValue,
      whatsappPhone: waPhoneValue
    });

    window.VelveStore.saveConfig(config);
    showToast('¡Configuración guardada! Se actualizará la tienda de inmediato.');
  }

  const btnSaveAllConfig = document.getElementById('btnSaveAllConfig');
  if (btnSaveAllConfig) btnSaveAllConfig.addEventListener('click', saveCurrentConfig);

  const btnSaveSettings = document.getElementById('btnSaveSettings');
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveCurrentConfig);

  if (btnSaveAuthCreds) {
    btnSaveAuthCreds.addEventListener('click', () => {
      const newU = cfgAdminUsername ? cfgAdminUsername.value.trim() : '';
      const newP = cfgAdminNewPassword ? cfgAdminNewPassword.value.trim() : '';
      if (!newU) {
        showToast('El nombre de usuario no puede estar vacío.');
        return;
      }
      window.VelveStore.updateAuthCredentials(newU, newP || undefined);
      if (cfgAdminNewPassword) cfgAdminNewPassword.value = '';
      showToast('Credenciales de acceso actualizadas correctamente.');
    });
  }

  // -------------------------------------------------------------------------
  // 3. MÓDULO 2: CATÁLOGO & INVENTARIOS
  // -------------------------------------------------------------------------
  const catalogTableBody = document.getElementById('catalogTableBody');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const catalogCategoryFilter = document.getElementById('catalogCategoryFilter');
  const catalogCountDisplay = document.getElementById('catalogCountDisplay');

  // KPI elements
  const kpiTotalRefs = document.getElementById('kpiTotalRefs');
  const kpiTotalInventory = document.getElementById('kpiTotalInventory');
  const kpiInventoryVal = document.getElementById('kpiInventoryVal');
  const kpiLowStockAlerts = document.getElementById('kpiLowStockAlerts');

  // Set of open product accordions to preserve toggle state across edits
  const openColorAccordions = new Set();

  // Canvas WebP image compression + automatic Supabase Storage upload
  async function processImageFile(file, maxWidth = 1200, quality = 0.82) {
    if (window.VelveStore && typeof window.VelveStore.optimizeImageFile === 'function') {
      const result = await window.VelveStore.optimizeImageFile(file, { maxWidth, quality });
      return result.url;
    }
    throw new Error('Motor de optimización no disponible.');
  }

  function getProductTotalStock(p) {
    if (p.colors && p.colors.length) {
      return p.colors.reduce((sum, c) => sum + (Number(c.stock) || 0), 0);
    }
    if (p.stock && typeof p.stock === 'object') {
      return Object.values(p.stock).reduce((a, b) => a + (Number(b) || 0), 0);
    }
    return 0;
  }

  function updateKpis() {
    const products = window.VelveStore.getProducts();
    let totalUnits = 0;
    let totalValue = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      const pStock = getProductTotalStock(p);
      totalUnits += pStock;
      totalValue += (pStock * p.price);
      if (pStock <= 10) lowStockCount++;
    });

    if (kpiTotalRefs) kpiTotalRefs.textContent = products.length;
    if (kpiTotalInventory) kpiTotalInventory.textContent = totalUnits.toLocaleString('es-CO');
    if (kpiInventoryVal) kpiInventoryVal.textContent = formatMoney(totalValue);
    if (kpiLowStockAlerts) kpiLowStockAlerts.textContent = lowStockCount;
  }

  function renderCatalogTable() {
    const products = window.VelveStore.getProducts();
    const searchTerm = (catalogSearchInput?.value || '').toLowerCase().trim();
    const categoryFilter = catalogCategoryFilter?.value || 'all';

    updateKpis();

    // Filter
    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm) || 
                          p.category.toLowerCase().includes(searchTerm) ||
                          p.id.toLowerCase().includes(searchTerm) ||
                          (p.badge && p.badge.toLowerCase().includes(searchTerm)) ||
                          (p.colors && p.colors.some(c => c.name.toLowerCase().includes(searchTerm)));
      const matchCategory = (categoryFilter === 'all') || (p.category === categoryFilter);
      return matchSearch && matchCategory;
    });

    if (catalogCountDisplay) {
      catalogCountDisplay.textContent = `Mostrando ${filtered.length} de ${products.length} prendas`;
    }

    if (filtered.length === 0) {
      if (products.length === 0) {
        catalogTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 3.5rem 1.75rem; background: #FAF8F5;">
              <img src="assets/icons/logo-monogram.png?v=20261112_1" alt="" style="width: 38px; height: 36px; object-fit: contain; margin: 0 auto 0.75rem auto;">
              <h4 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--admin-text-primary); margin-bottom: 0.4rem;">
                Tu inventario está en cero — Listo para tu nueva colección VELVE
              </h4>
              <p style="font-size: 0.82rem; color: var(--admin-text-secondary); max-width: 560px; margin: 0 auto 1.35rem auto; line-height: 1.55;">
                El inventario del proveedor anterior ha sido eliminado. Elige cómo deseas ingresar tus nuevas publicaciones con sus variaciones de color, tallas y fotografías:
              </p>
              <div style="display: inline-flex; flex-wrap: wrap; gap: 0.65rem; justify-content: center;">
                <button type="button" class="admin-btn admin-btn-primary btn-empty-start-wizard">
                  + Crear Primera Prenda (Paso a Paso con Variaciones)
                </button>
                <button type="button" class="admin-btn admin-btn-secondary btn-empty-start-photobatch" style="border-color: var(--accent-wine); color: var(--accent-wine); background: #FFFFFF;">
                  📸 Subir Lote de Fotos (Foto por Foto desde PC)
                </button>
                <button type="button" class="admin-btn admin-btn-secondary btn-empty-start-bulk" style="background: #FFFFFF;">
                  📥 Carga Masiva (Plantilla CSV / Excel / JSON)
                </button>
              </div>
            </td>
          </tr>
        `;
        const b1 = catalogTableBody.querySelector('.btn-empty-start-wizard');
        const b2 = catalogTableBody.querySelector('.btn-empty-start-photobatch');
        const b3 = catalogTableBody.querySelector('.btn-empty-start-bulk');
        if (b1) b1.addEventListener('click', openNewProductModal);
        if (b2) b2.addEventListener('click', () => openBulkUploadModal('photos'));
        if (b3) b3.addEventListener('click', () => openBulkUploadModal('file'));
      } else {
        catalogTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 3rem 1.5rem; color: var(--admin-text-muted);">
              <p style="font-size: 1rem; margin-bottom: 0.5rem;">No se encontraron prendas con los filtros actuales.</p>
              <span style="font-size: 0.8rem;">Prueba buscando otra palabra clave o selecciona "Todas las categorías".</span>
            </td>
          </tr>
        `;
      }
      return;
    }

    let rowsHtml = '';

    filtered.forEach(p => {
      const colors = p.colors || [];
      const totalStock = getProductTotalStock(p);
      const isExpanded = openColorAccordions.has(p.id);

      let statusBadge = '<span class="status-badge in-stock">En Stock</span>';
      if (totalStock === 0) {
        statusBadge = '<span class="status-badge out-stock">Agotado</span>';
      } else if (totalStock <= 10) {
        statusBadge = '<span class="status-badge low-stock">Bajo Stock</span>';
      }

      const badgeTag = p.badge ? `<span style="font-size: 0.65rem; background: #EAE5DE; padding: 0.15rem 0.4rem; border-radius: 3px; margin-left: 0.4rem;">${p.badge}</span>` : '';
      const sizeInfo = (window.VelveStore && window.VelveStore.getProductSizesInfo)
        ? window.VelveStore.getProductSizesInfo(p)
        : { summaryText: 'Talla Única (S a L)' };

      // Inline color preview swatches (first 4)
      const previewPills = colors.slice(0, 4).map(c => `
        <span title="${c.name}: ${c.stock ?? 15} uds" style="display: inline-flex; align-items: center; gap: 0.3rem; background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 0.18rem 0.45rem; border-radius: 12px; font-size: 0.7rem;">
          <span style="width: 9px; height: 9px; border-radius: 50%; ${c.style ? `background: ${c.style}` : `background-color: ${c.hex || '#ddd'}`}; border: 1px solid rgba(0,0,0,0.18); display: inline-block;"></span>
          <span style="color: var(--admin-text-secondary); max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.name}:</span>
          <strong data-pill-stock="${p.id}-${c.name}" style="color: var(--admin-text-primary); font-size: 0.72rem;">${c.stock ?? 15}</strong>
        </span>
      `).join('');
      const moreColorsTag = colors.length > 4 ? `<span style="font-size: 0.68rem; color: var(--admin-text-muted); font-weight: 600;">+${colors.length - 4} más</span>` : '';

      // Main product row
      rowsHtml += `
        <tr data-product-id="${p.id}" class="product-main-row">
          <td>
            <div class="product-row-meta">
              <div style="position: relative;">
                <img src="${p.imagePrimary}" alt="${p.name}" class="product-table-thumb" id="thumb-main-${p.id}" style="cursor: pointer;" title="Haz clic para cambiar fotos y logo">
              </div>
              <div>
                <strong style="color: var(--admin-text-primary); font-size: 0.9rem;">${p.name}</strong>
                ${badgeTag}
                <div style="font-size: 0.72rem; color: var(--admin-text-muted); margin-top: 2px;">
                  Ref: <span style="font-family: monospace;">${p.id}</span> &bull; 
                  <span style="color: var(--accent-wine); font-weight: 600;">${colors.length} colores</span> &bull;
                  <span style="color: var(--accent-espresso); font-weight: 600;">📏 ${sizeInfo.summaryText}</span>
                </div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 500;">${p.category}</span>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--accent-wine);">${formatMoney(p.price)}</div>
            ${p.oldPrice ? `<span style="font-size: 0.72rem; text-decoration: line-through; color: var(--admin-text-muted);">${formatMoney(p.oldPrice)}</span>` : ''}
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center;">
                ${previewPills}
                ${moreColorsTag}
              </div>
              <div>
                <button type="button" class="btn-toggle-colors ${isExpanded ? 'active' : ''}" data-id="${p.id}" id="toggle-btn-${p.id}" aria-expanded="${isExpanded}">
                  <span>🎨 Control por Colores (${colors.length})</span>
                  <span class="arrow-indicator">${isExpanded ? '▴' : '▾'}</span>
                </button>
              </div>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <div id="status-badge-${p.id}">${statusBadge}</div>
              <div style="font-size: 0.75rem; color: var(--admin-text-secondary);">
                Total: <strong id="total-badge-${p.id}">${totalStock}</strong> uds
              </div>
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.4rem; align-items: center;">
              <button class="admin-btn admin-btn-secondary btn-open-photo-mgr" data-id="${p.id}" style="padding: 0.4rem 0.7rem; font-size: 0.72rem; background: #F8F5F2; border-color: rgba(91, 44, 56, 0.25); color: var(--accent-wine); font-weight: 600;" title="Reemplazar imágenes con tus fotos oficiales y logo">
                📷 Fotos & Logo
              </button>
              <button class="admin-btn admin-btn-secondary btn-edit-product" data-id="${p.id}" style="padding: 0.4rem 0.65rem; font-size: 0.72rem;" title="Editar información general">
                Editar
              </button>
              <button class="admin-btn admin-btn-danger btn-delete-product" data-id="${p.id}" style="padding: 0.4rem 0.55rem; font-size: 0.72rem;" title="Eliminar referencia">
                &times;
              </button>
            </div>
          </td>
        </tr>

        <!-- Color Breakdown Accordion Sub-row -->
        <tr class="color-breakdown-row ${isExpanded ? 'open' : ''}" id="breakdown-${p.id}">
          <td colspan="6" style="padding: 0;">
            <div class="color-breakdown-panel">
              <div class="color-panel-header">
                <div class="color-panel-title">
                  <span>🎨 Desglose de Inventario y Fotos por Color — <strong>${p.name}</strong></span>
                  <span style="font-size: 0.75rem; color: var(--admin-text-secondary); font-weight: normal; margin-left: 0.5rem;">
                    (Inventario total: <strong id="subtotal-${p.id}">${totalStock}</strong> unidades distribuidas en ${colors.length} tonalidades)
                  </span>
                </div>
                <button class="admin-btn admin-btn-secondary btn-open-photo-mgr" data-id="${p.id}" style="font-size: 0.72rem; padding: 0.35rem 0.75rem; background: #FFFFFF;">
                  📷 Modificar Fotos & Logo (Colección)
                </button>
              </div>

              <div class="color-cards-grid">
                ${colors.map(c => `
                  <div class="color-inventory-card" data-prod-id="${p.id}" data-color="${c.name}">
                    <div class="color-card-header">
                      <span class="color-swatch-dot" style="${c.style ? `background: ${c.style}` : `background-color: ${c.hex || '#ddd'}`};"></span>
                      <span class="color-card-title" title="${c.name}">${c.name}</span>
                    </div>

                    <div class="color-card-photo-box btn-card-change-photo" data-id="${p.id}" data-color="${c.name}" title="Clic para cambiar la foto de este color con tu logo">
                      <img src="${c.image || p.imagePrimary}" alt="${c.name}" class="color-card-img" id="card-img-${p.id}-${c.name.replace(/[^a-zA-Z0-9]/g, '_')}">
                      <div class="color-card-photo-overlay">
                        <span class="btn-overlay-action">📷 Cambiar Foto</span>
                        <span style="font-size: 0.65rem; color: #FFFFFF; margin-top: 2px;">Subir con tu logo</span>
                      </div>
                    </div>

                    <div class="color-card-stock-row">
                      <span style="font-size: 0.72rem; color: var(--admin-text-secondary); font-weight: 600;">Stock:</span>
                      <div style="display: flex; align-items: center; gap: 3px;">
                        <button type="button" class="color-stock-stepper-btn btn-cstock-dec" data-id="${p.id}" data-color="${c.name}">−</button>
                        <input type="number" min="0" class="color-stock-input input-cstock" data-id="${p.id}" data-color="${c.name}" value="${c.stock ?? 15}">
                        <button type="button" class="color-stock-stepper-btn btn-cstock-inc" data-id="${p.id}" data-color="${c.name}">+</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    catalogTableBody.innerHTML = rowsHtml;

    // Attach listeners for accordion toggles
    catalogTableBody.querySelectorAll('.btn-toggle-colors').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pId = btn.getAttribute('data-id');
        const targetRow = document.getElementById(`breakdown-${pId}`);
        if (!targetRow) return;

        const isCurrentlyOpen = targetRow.classList.contains('open');
        const arrow = btn.querySelector('.arrow-indicator');

        if (isCurrentlyOpen) {
          targetRow.classList.remove('open');
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          if (arrow) arrow.textContent = '▾';
          openColorAccordions.delete(pId);
        } else {
          targetRow.classList.add('open');
          btn.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          if (arrow) arrow.textContent = '▴';
          openColorAccordions.add(pId);
        }
      });
    });

    // Attach Color Stock Steppers
    catalogTableBody.querySelectorAll('.btn-cstock-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const colorName = btn.getAttribute('data-color');
        adjustColorStock(pId, colorName, 1);
      });
    });

    catalogTableBody.querySelectorAll('.btn-cstock-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const colorName = btn.getAttribute('data-color');
        adjustColorStock(pId, colorName, -1);
      });
    });

    // Direct input change on color stock
    catalogTableBody.querySelectorAll('.input-cstock').forEach(input => {
      input.addEventListener('change', () => {
        const pId = input.getAttribute('data-id');
        const colorName = input.getAttribute('data-color');
        const newVal = Math.max(0, parseInt(input.value, 10) || 0);
        input.value = newVal;
        window.VelveStore.updateColorStock(pId, colorName, newVal);
        updateRowStockTotals(pId);
        showToast(`Stock de "${colorName}" actualizado a ${newVal} uds.`);
      });
    });

    // Attach "Fotos & Logo" buttons (opens photo manager modal)
    catalogTableBody.querySelectorAll('.btn-open-photo-mgr').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        openPhotoManagerModal(pId);
      });
    });

    // Main thumbnail click also opens photo manager
    catalogTableBody.querySelectorAll('.product-table-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const row = thumb.closest('tr');
        const pId = row?.getAttribute('data-product-id');
        if (pId) openPhotoManagerModal(pId);
      });
    });

    // Color card photo click opens photo manager focused on that color
    catalogTableBody.querySelectorAll('.btn-card-change-photo').forEach(box => {
      box.addEventListener('click', () => {
        const pId = box.getAttribute('data-id');
        const colorName = box.getAttribute('data-color');
        openPhotoManagerModal(pId, colorName);
      });
    });

    // Attach edit product general info
    catalogTableBody.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        openEditProductModal(pId);
      });
    });

    // Attach delete button
    catalogTableBody.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        if (confirm('¿Deseas eliminar esta referencia del catálogo Velve?')) {
          window.VelveStore.deleteProduct(pId);
          renderCatalogTable();
          showToast('Prenda eliminada del catálogo.');
        }
      });
    });
  }

  function adjustColorStock(productId, colorName, delta) {
    const input = catalogTableBody.querySelector(`.input-cstock[data-id="${productId}"][data-color="${colorName}"]`);
    if (!input) return;

    const currentVal = parseInt(input.value, 10) || 0;
    const newVal = Math.max(0, currentVal + delta);
    input.value = newVal;

    window.VelveStore.updateColorStock(productId, colorName, newVal);
    updateRowStockTotals(productId);
    showToast(`Stock de "${colorName}": ${newVal} uds`);
  }

  function updateRowStockTotals(productId) {
    const products = window.VelveStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newTotal = getProductTotalStock(prod);

    // Update inline color preview pills in main row
    if (prod.colors && catalogTableBody) {
      prod.colors.forEach(c => {
        const pillEl = catalogTableBody.querySelector(`strong[data-pill-stock="${productId}-${c.name}"]`);
        if (pillEl) pillEl.textContent = c.stock ?? 15;
      });
    }

    // Update total badge in main row
    const totalBadge = document.getElementById(`total-badge-${productId}`);
    if (totalBadge) totalBadge.textContent = newTotal;

    // Update subtotal in breakdown panel header
    const subtotalEl = document.getElementById(`subtotal-${productId}`);
    if (subtotalEl) subtotalEl.textContent = newTotal;

    // Update status badge
    const statusBadgeEl = document.getElementById(`status-badge-${productId}`);
    if (statusBadgeEl) {
      if (newTotal === 0) {
        statusBadgeEl.innerHTML = '<span class="status-badge out-stock">Agotado</span>';
      } else if (newTotal <= 10) {
        statusBadgeEl.innerHTML = '<span class="status-badge low-stock">Bajo Stock</span>';
      } else {
        statusBadgeEl.innerHTML = '<span class="status-badge in-stock">En Stock</span>';
      }
    }

    updateKpis();
  }

  if (catalogSearchInput) catalogSearchInput.addEventListener('input', renderCatalogTable);
  if (catalogCategoryFilter) catalogCategoryFilter.addEventListener('change', renderCatalogTable);

  // -------------------------------------------------------------------------
  // 4. Estudio de Publicación Ágil (Paso a Paso con Variaciones, Tooltips y Vista Previa)
  // -------------------------------------------------------------------------
  const productModalBackdrop = document.getElementById('productModalBackdrop');
  const closeProductModal = document.getElementById('closeProductModal');
  const btnCancelProductModal = document.getElementById('btnCancelProductModal');
  const btnOpenNewProductModal = document.getElementById('btnOpenNewProductModal');
  const productForm = document.getElementById('productForm');
  const modalProductTitle = document.getElementById('modalProductTitle');

  const prodEditId = document.getElementById('prodEditId');
  const prodCustomSku = document.getElementById('prodCustomSku');
  const prodName = document.getElementById('prodName');
  const prodCategory = document.getElementById('prodCategory');
  const prodPrice = document.getElementById('prodPrice');
  const prodOldPrice = document.getElementById('prodOldPrice');
  const prodBadge = document.getElementById('prodBadge');
  const prodImgPrimary = document.getElementById('prodImgPrimary');
  const prodImgSecondary = document.getElementById('prodImgSecondary');
  const prodPrimaryPreview = document.getElementById('prodPrimaryPreview');
  const prodSecondaryPreview = document.getElementById('prodSecondaryPreview');
  const prodPrimaryFile = document.getElementById('prodPrimaryFile');
  const prodSecondaryFile = document.getElementById('prodSecondaryFile');
  const btnCopyPrimaryToSecondary = document.getElementById('btnCopyPrimaryToSecondary');

  const prodStockXS = document.getElementById('prodStockXS');
  const prodStockS = document.getElementById('prodStockS');
  const prodStockM = document.getElementById('prodStockM');
  const prodStockL = document.getElementById('prodStockL');
  const prodSizeMode = document.getElementById('prodSizeMode');
  const paneOneSizeConfig = document.getElementById('paneOneSizeConfig');
  const paneMultiSizeConfig = document.getElementById('paneMultiSizeConfig');
  const prodOneSizeLabel = document.getElementById('prodOneSizeLabel');
  const prodOneSizeRange = document.getElementById('prodOneSizeRange');
  const oneSizeBadgePreview = document.getElementById('oneSizeBadgePreview');
  const chkSizeXS = document.getElementById('chkSizeXS');
  const chkSizeS = document.getElementById('chkSizeS');
  const chkSizeM = document.getElementById('chkSizeM');
  const chkSizeL = document.getElementById('chkSizeL');
  const prodCustomExtraSizes = document.getElementById('prodCustomExtraSizes');
  const prodDesc = document.getElementById('prodDesc');
  const prodComp = document.getElementById('prodComp');
  const btnFillEditorialDesc = document.getElementById('btnFillEditorialDesc');
  const btnDistributeStockSizes = document.getElementById('btnDistributeStockSizes');

  // Wizard stepper & variations elements
  const wizTab1 = document.getElementById('wizTab1');
  const wizTab2 = document.getElementById('wizTab2');
  const wizTab3 = document.getElementById('wizTab3');
  const wizardStepPane1 = document.getElementById('wizardStepPane1');
  const wizardStepPane2 = document.getElementById('wizardStepPane2');
  const wizardStepPane3 = document.getElementById('wizardStepPane3');
  const chkShowAllWizardSteps = document.getElementById('chkShowAllWizardSteps');
  const btnWizardPrev = document.getElementById('btnWizardPrev');
  const btnWizardNext = document.getElementById('btnWizardNext');
  const btnSaveAndCreateAnother = document.getElementById('btnSaveAndCreateAnother');

  const velveOfficialTonePresets = document.getElementById('velveOfficialTonePresets');
  const prodVariantsList = document.getElementById('prodVariantsList');
  const btnAddVariantRow = document.getElementById('btnAddVariantRow');
  const prodMultiVariantFiles = document.getElementById('prodMultiVariantFiles');

  // Live preview elements inside wizard
  const wizPreviewStockTag = document.getElementById('wizPreviewStockTag');
  const wizPreviewBadge = document.getElementById('wizPreviewBadge');
  const wizPreviewImg = document.getElementById('wizPreviewImg');
  const wizPreviewSwatches = document.getElementById('wizPreviewSwatches');
  const wizPreviewTitle = document.getElementById('wizPreviewTitle');
  const wizPreviewCat = document.getElementById('wizPreviewCat');
  const wizPreviewPrice = document.getElementById('wizPreviewPrice');
  const wizPreviewOldPrice = document.getElementById('wizPreviewOldPrice');

  // Onboarding guide controls
  const catalogOnboardingGuide = document.getElementById('catalogOnboardingGuide');
  const btnToggleOnboardingGuide = document.getElementById('btnToggleOnboardingGuide');
  const btnHideOnboardingGuide = document.getElementById('btnHideOnboardingGuide');
  const btnClearAllInventory = document.getElementById('btnClearAllInventory');
  const btnGuideStartWizard = document.getElementById('btnGuideStartWizard');
  const btnGuideStartPhotoBatch = document.getElementById('btnGuideStartPhotoBatch');
  const btnGuideStartBulk = document.getElementById('btnGuideStartBulk');
  const btnOpenPhotoBatchModal = document.getElementById('btnOpenPhotoBatchModal');
  const btnOpenBulkUploadModal = document.getElementById('btnOpenBulkUploadModal');

  let currentWizardStep = 1;
  let draftVariants = [];

  if (btnToggleOnboardingGuide && catalogOnboardingGuide) {
    btnToggleOnboardingGuide.addEventListener('click', () => {
      const isHidden = catalogOnboardingGuide.style.display === 'none';
      catalogOnboardingGuide.style.display = isHidden ? 'block' : 'none';
    });
  }
  if (btnHideOnboardingGuide && catalogOnboardingGuide) {
    btnHideOnboardingGuide.addEventListener('click', () => {
      catalogOnboardingGuide.style.display = 'none';
    });
  }
  if (btnClearAllInventory) {
    btnClearAllInventory.addEventListener('click', () => {
      if (confirm('¿Confirmas que deseas vaciar todo el inventario actual y dejar el catálogo en 0 prendas?')) {
        window.VelveStore.clearAllProducts();
        renderCatalogTable();
        showToast('Inventario vaciado por completo (0 referencias).');
      }
    });
  }

  function setWizardStep(stepNum) {
    currentWizardStep = Math.max(1, Math.min(3, Number(stepNum) || 1));
    [wizTab1, wizTab2, wizTab3].forEach((tab, idx) => {
      if (tab) tab.classList.toggle('active', idx + 1 === currentWizardStep);
    });
    [wizardStepPane1, wizardStepPane2, wizardStepPane3].forEach((pane, idx) => {
      if (pane) pane.classList.toggle('active', idx + 1 === currentWizardStep);
    });

    const showAll = chkShowAllWizardSteps && chkShowAllWizardSteps.checked;
    if (productForm) {
      productForm.classList.toggle('product-form-all-steps', Boolean(showAll));
    }
    if (btnWizardPrev) {
      btnWizardPrev.style.display = (!showAll && currentWizardStep > 1) ? 'inline-flex' : 'none';
    }
    if (btnWizardNext) {
      btnWizardNext.style.display = (!showAll && currentWizardStep < 3) ? 'inline-flex' : 'none';
    }
  }

  [wizTab1, wizTab2, wizTab3].forEach((tab, idx) => {
    if (tab) {
      tab.addEventListener('click', () => setWizardStep(idx + 1));
    }
  });
  if (btnWizardPrev) {
    btnWizardPrev.addEventListener('click', () => setWizardStep(currentWizardStep - 1));
  }
  if (btnWizardNext) {
    btnWizardNext.addEventListener('click', () => {
      if (currentWizardStep === 1 && prodName && !prodName.value.trim()) {
        prodName.focus();
        showToast('Ingresa primero el nombre de la prenda en el Paso 1.');
        return;
      }
      setWizardStep(currentWizardStep + 1);
    });
  }
  if (chkShowAllWizardSteps) {
    chkShowAllWizardSteps.addEventListener('change', () => setWizardStep(currentWizardStep));
  }

  // Render Official Velve Tone Presets
  function initOfficialTonePresets() {
    if (!velveOfficialTonePresets) return;
    const tones = window.VELVE_OFFICIAL_TONES || [
      { name: 'Obsidian Velvet', hex: '#161514' },
      { name: 'Alabaster Silk', hex: '#FAF8F5' },
      { name: 'Raw Cashmere', hex: '#D8D0C5' },
      { name: 'Warm Sand', hex: '#B69B84' },
      { name: 'Deep Espresso', hex: '#4A3B32' }
    ];
    velveOfficialTonePresets.innerHTML = tones.map(t => `
      <button type="button" class="tone-preset-chip" data-tone-name="${t.name}" data-tone-hex="${t.hex}">
        <span style="width: 11px; height: 11px; border-radius: 50%; background: ${t.hex}; border: 1px solid rgba(0,0,0,0.25); display: inline-block;"></span>
        <span>+ ${t.name}</span>
      </button>
    `).join('');

    velveOfficialTonePresets.querySelectorAll('.tone-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-tone-name');
        const hex = chip.getAttribute('data-tone-hex');
        addDraftVariant({
          name: name,
          hex: hex,
          image: prodImgPrimary?.value || 'assets/images/velve_capsule_trio.jpg',
          stock: 15
        });
        showToast(`Variación "${name}" añadida.`);
      });
    });
  }
  initOfficialTonePresets();

  function renderDraftVariants() {
    if (!prodVariantsList) return;
    if (draftVariants.length === 0) {
      draftVariants = [{
        name: 'Obsidian Velvet',
        hex: '#161514',
        image: prodImgPrimary?.value || 'assets/images/velve_capsule_trio.jpg',
        stock: 15
      }];
    }

    prodVariantsList.innerHTML = draftVariants.map((v, idx) => `
      <div class="variant-builder-card" data-var-idx="${idx}">
        <div class="variant-thumb-box">
          <img src="${v.image || prodImgPrimary?.value || 'assets/images/velve_capsule_trio.jpg'}" alt="${v.name}">
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.45rem;">
          <div style="display: grid; grid-template-columns: 36px 1.2fr 95px; gap: 0.5rem; align-items: center;">
            <input type="color" class="var-hex-input" data-idx="${idx}" value="${v.hex || '#161514'}" title="Elegir tono en el selector de color" style="width: 34px; height: 30px; padding: 0; border: 1px solid var(--border-light); border-radius: 4px; cursor: pointer; background: none;">
            <input type="text" class="form-input var-name-input" data-idx="${idx}" value="${v.name}" placeholder="Nombre del color (ej. Warm Sand)" style="padding: 0.38rem 0.6rem; font-size: 0.78rem;">
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <input type="number" class="form-input var-stock-input" data-idx="${idx}" value="${v.stock ?? 15}" min="0" title="Unidades en stock de este color" style="padding: 0.38rem 0.45rem; font-size: 0.78rem; text-align: center;">
              <span style="font-size: 0.68rem; color: var(--admin-text-muted);">uds</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
            <label class="file-upload-btn" style="padding: 0.28rem 0.6rem; font-size: 0.7rem;">
              <span>📁 Subir Foto Color (PC)</span>
              <input type="file" accept="image/*" class="var-file-input" data-idx="${idx}" style="display: none;">
            </label>
            <input type="text" class="form-input var-img-input" data-idx="${idx}" value="${v.image || ''}" placeholder="Ruta o URL de la foto de este color" style="flex: 1; min-width: 140px; padding: 0.32rem 0.55rem; font-size: 0.72rem;">
            <button type="button" class="tone-preset-chip btn-var-make-cover" data-idx="${idx}" style="font-size: 0.66rem; padding: 0.2rem 0.5rem;" title="Usar la foto de este color como portada principal">
              ⭐ Portada
            </button>
          </div>
        </div>

        <div>
          <button type="button" class="admin-btn admin-btn-danger btn-remove-var" data-idx="${idx}" style="padding: 0.35rem 0.55rem; font-size: 0.72rem;" title="Eliminar esta variación de color">
            &times;
          </button>
        </div>
      </div>
    `).join('');

    // Bind events on variant rows
    prodVariantsList.querySelectorAll('.var-hex-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (draftVariants[i]) {
          draftVariants[i].hex = inp.value;
          updateWizardLivePreview();
        }
      });
    });

    prodVariantsList.querySelectorAll('.var-name-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (draftVariants[i]) {
          draftVariants[i].name = inp.value;
          updateWizardLivePreview();
        }
      });
    });

    prodVariantsList.querySelectorAll('.var-stock-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (draftVariants[i]) {
          draftVariants[i].stock = Math.max(0, parseInt(inp.value, 10) || 0);
          updateWizardLivePreview();
        }
      });
    });

    prodVariantsList.querySelectorAll('.var-img-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (draftVariants[i]) {
          draftVariants[i].image = inp.value.trim();
          const card = inp.closest('.variant-builder-card');
          const img = card?.querySelector('.variant-thumb-box img');
          if (img && draftVariants[i].image) img.src = draftVariants[i].image;
          if (i === 0 && prodImgPrimary && draftVariants[0].image) {
            prodImgPrimary.value = draftVariants[0].image;
            if (prodPrimaryPreview) prodPrimaryPreview.src = draftVariants[0].image;
          }
          updateWizardLivePreview();
        }
      });
    });

    prodVariantsList.querySelectorAll('.var-file-input').forEach(fileInp => {
      fileInp.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const i = Number(fileInp.getAttribute('data-idx'));
        try {
          const dataUrl = await processImageFile(file);
          if (draftVariants[i]) {
            draftVariants[i].image = dataUrl;
            if (i === 0 && prodImgPrimary) {
              prodImgPrimary.value = dataUrl;
              if (prodPrimaryPreview) prodPrimaryPreview.src = dataUrl;
            }
            renderDraftVariants();
            updateWizardLivePreview();
            showToast(`Foto cargada para "${draftVariants[i].name}".`);
          }
        } catch (err) {
          alert(err.message);
        }
      });
    });

    prodVariantsList.querySelectorAll('.btn-var-make-cover').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-idx'));
        if (draftVariants[i] && draftVariants[i].image) {
          if (prodImgPrimary) prodImgPrimary.value = draftVariants[i].image;
          if (prodPrimaryPreview) prodPrimaryPreview.src = draftVariants[i].image;
          updateWizardLivePreview();
          showToast(`Foto de "${draftVariants[i].name}" asignada como portada.`);
        }
      });
    });

    prodVariantsList.querySelectorAll('.btn-remove-var').forEach(btn => {
      btn.addEventListener('click', () => {
        if (draftVariants.length <= 1) {
          showToast('La prenda debe tener al menos 1 variación de color.');
          return;
        }
        const i = Number(btn.getAttribute('data-idx'));
        draftVariants.splice(i, 1);
        renderDraftVariants();
        updateWizardLivePreview();
      });
    });

    updateWizardLivePreview();
  }

  function addDraftVariant(variantObj) {
    draftVariants.push({
      name: variantObj?.name || `Color ${draftVariants.length + 1}`,
      hex: variantObj?.hex || '#B69B84',
      image: variantObj?.image || prodImgPrimary?.value || 'assets/images/velve_capsule_trio.jpg',
      stock: variantObj?.stock ?? 12
    });
    renderDraftVariants();
  }

  if (btnAddVariantRow) {
    btnAddVariantRow.addEventListener('click', () => {
      addDraftVariant({
        name: `Tono ${draftVariants.length + 1}`,
        hex: '#B69B84',
        image: prodImgPrimary?.value || 'assets/images/velve_capsule_trio.jpg',
        stock: 12
      });
    });
  }

  if (prodMultiVariantFiles) {
    prodMultiVariantFiles.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const tones = window.VELVE_OFFICIAL_TONES || [];
      for (let i = 0; i < files.length; i++) {
        try {
          const compressed = await processImageFile(files[i]);
          const cleanFileName = files[i].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const fallbackTone = tones[i % (tones.length || 1)] || { name: cleanFileName, hex: '#161514' };
          if (i === 0 && draftVariants.length === 1 && draftVariants[0].image === 'assets/images/velve_capsule_trio.jpg') {
            draftVariants[0].image = compressed;
            draftVariants[0].name = cleanFileName || fallbackTone.name;
            if (prodImgPrimary) prodImgPrimary.value = compressed;
            if (prodPrimaryPreview) prodPrimaryPreview.src = compressed;
          } else {
            draftVariants.push({
              name: cleanFileName || fallbackTone.name,
              hex: fallbackTone.hex || '#161514',
              image: compressed,
              stock: 12
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
      prodMultiVariantFiles.value = '';
      renderDraftVariants();
      showToast(`Se cargaron ${files.length} fotos como variaciones de color.`);
    });
  }

  function distributeColorStockToSizes() {
    const totalColorStock = draftVariants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    if (totalColorStock <= 0) return;
    const xs = Math.max(1, Math.round(totalColorStock * 0.15));
    const s = Math.max(1, Math.round(totalColorStock * 0.35));
    const m = Math.max(1, Math.round(totalColorStock * 0.35));
    const l = Math.max(0, totalColorStock - (xs + s + m));
    if (prodStockXS) prodStockXS.value = xs;
    if (prodStockS) prodStockS.value = s;
    if (prodStockM) prodStockM.value = m;
    if (prodStockL) prodStockL.value = l;
  }

  if (btnDistributeStockSizes) {
    btnDistributeStockSizes.addEventListener('click', () => {
      distributeColorStockToSizes();
      showToast('Inventario por tallas sincronizado con el total de colores.');
    });
  }

  // Step 1 Quick Helpers (Discounts, Editorial Description & Composition)
  document.querySelectorAll('.btn-quick-discount').forEach(btn => {
    btn.addEventListener('click', () => {
      const disc = parseFloat(btn.getAttribute('data-disc')) || 0;
      const currentPrice = Number(prodPrice?.value) || 145000;
      if (prodPrice && !prodPrice.value) prodPrice.value = currentPrice;
      if (disc <= 0) {
        if (prodOldPrice) prodOldPrice.value = '';
        if (prodBadge && prodBadge.value === 'Sale -20%') prodBadge.value = '';
      } else {
        const computedOld = Math.round((currentPrice / (1 - disc)) / 1000) * 1000;
        if (prodOldPrice) prodOldPrice.value = computedOld;
        if (prodBadge) prodBadge.value = 'Sale -20%';
      }
      updateWizardLivePreview();
    });
  });

  if (btnFillEditorialDesc) {
    btnFillEditorialDesc.addEventListener('click', () => {
      const nameStr = (prodName?.value || 'Esta pieza Velve').trim();
      if (prodDesc) {
        prodDesc.value = `${nameStr} ha sido confeccionada en tejido circular sin costuras de tacto segunda piel. Tan estructural como la seda, tan suave como Velve: ofrece soporte anatómico invisible, elongación en 4 direcciones y una caída impecable que transita del estudio a la noche.`;
      }
      if (prodComp && !prodComp.value.trim()) {
        prodComp.value = '82% Microfibra de Poliamida 6.6, 18% Elastano Lycra® • Tejido Circular Seamless.';
      }
      showToast('Descripción editorial autocompletada.');
    });
  }

  document.querySelectorAll('.btn-quick-comp').forEach(btn => {
    btn.addEventListener('click', () => {
      if (prodComp) prodComp.value = btn.getAttribute('data-comp') || '';
    });
  });

  // Step 2 Direct File Uploaders
  if (prodPrimaryFile) {
    prodPrimaryFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressed = await processImageFile(file);
        if (prodImgPrimary) prodImgPrimary.value = compressed;
        if (prodPrimaryPreview) prodPrimaryPreview.src = compressed;
        if (draftVariants[0]) {
          draftVariants[0].image = compressed;
          renderDraftVariants();
        }
        updateWizardLivePreview();
        showToast('Foto principal cargada.');
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (prodSecondaryFile) {
    prodSecondaryFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressed = await processImageFile(file);
        if (prodImgSecondary) prodImgSecondary.value = compressed;
        if (prodSecondaryPreview) prodSecondaryPreview.src = compressed;
        showToast('Foto secundaria (Hover) cargada.');
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (btnCopyPrimaryToSecondary) {
    btnCopyPrimaryToSecondary.addEventListener('click', () => {
      if (prodImgPrimary && prodImgSecondary) {
        prodImgSecondary.value = prodImgPrimary.value;
        if (prodSecondaryPreview) prodSecondaryPreview.src = prodImgPrimary.value;
        showToast('Foto principal copiada al efecto Hover.');
      }
    });
  }

  if (prodImgPrimary) {
    prodImgPrimary.addEventListener('input', () => {
      if (prodPrimaryPreview && prodImgPrimary.value.trim()) {
        prodPrimaryPreview.src = prodImgPrimary.value.trim();
      }
      updateWizardLivePreview();
    });
  }
  if (prodImgSecondary) {
    prodImgSecondary.addEventListener('input', () => {
      if (prodSecondaryPreview && prodImgSecondary.value.trim()) {
        prodSecondaryPreview.src = prodImgSecondary.value.trim();
      }
    });
  }

  function getWizardSizingConfig() {
    const mode = prodSizeMode?.value || 'one_size';
    if (mode === 'none') {
      return {
        mode: 'none',
        oneSizeLabel: 'Única',
        oneSizeRange: '',
        fullOneSizeLabel: 'Única',
        enabledSizes: []
      };
    }
    if (mode === 'one_size') {
      const lbl = (prodOneSizeLabel?.value || 'Talla Única').trim() || 'Talla Única';
      const rng = (prodOneSizeRange ? prodOneSizeRange.value : 'S a L').trim();
      const full = rng ? `${lbl} (${rng})` : lbl;
      return {
        mode: 'one_size',
        oneSizeLabel: lbl,
        oneSizeRange: rng,
        fullOneSizeLabel: full,
        enabledSizes: [full]
      };
    }
    // multi_size
    const enabled = [];
    if (chkSizeXS && chkSizeXS.checked) enabled.push('XS');
    if (chkSizeS && chkSizeS.checked) enabled.push('S');
    if (chkSizeM && chkSizeM.checked) enabled.push('M');
    if (chkSizeL && chkSizeL.checked) enabled.push('L');
    if (prodCustomExtraSizes && prodCustomExtraSizes.value.trim()) {
      prodCustomExtraSizes.value.split(',').forEach(s => {
        const clean = s.trim();
        if (clean && !enabled.includes(clean)) enabled.push(clean);
      });
    }
    if (enabled.length === 0) enabled.push('S', 'M', 'L');
    return {
      mode: 'multi_size',
      oneSizeLabel: 'Talla Única',
      oneSizeRange: 'S a L',
      fullOneSizeLabel: 'Talla Única (S a L)',
      enabledSizes: enabled
    };
  }

  function updateSizingModePanels() {
    const mode = prodSizeMode?.value || 'one_size';
    if (paneOneSizeConfig) paneOneSizeConfig.style.display = mode === 'one_size' ? 'block' : 'none';
    if (paneMultiSizeConfig) paneMultiSizeConfig.style.display = mode === 'multi_size' ? 'block' : 'none';

    const cfg = getWizardSizingConfig();
    if (oneSizeBadgePreview && mode === 'one_size') {
      oneSizeBadgePreview.textContent = `Vista en anuncio: ${cfg.fullOneSizeLabel}`;
    }
    updateWizardLivePreview();
  }

  if (prodSizeMode) {
    prodSizeMode.addEventListener('change', updateSizingModePanels);
  }
  [prodOneSizeLabel, prodOneSizeRange, chkSizeXS, chkSizeS, chkSizeM, chkSizeL, prodCustomExtraSizes].forEach(el => {
    if (el) {
      el.addEventListener('input', updateSizingModePanels);
      el.addEventListener('change', updateSizingModePanels);
    }
  });
  document.querySelectorAll('.btn-onesize-range-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      if (prodOneSizeRange) {
        prodOneSizeRange.value = btn.getAttribute('data-range') || '';
        updateSizingModePanels();
      }
    });
  });

  // Live Preview Updater inside Wizard
  function updateWizardLivePreview() {
    const titleVal = (prodName?.value || '').trim() || 'Nueva Prenda Velve';
    const catVal = prodCategory?.value || 'Bodies';
    const priceVal = Number(prodPrice?.value) || 145000;
    const oldPriceVal = Number(prodOldPrice?.value) || 0;
    const badgeVal = prodBadge?.value || (oldPriceVal > priceVal ? 'Sale -20%' : '');
    const mainImgVal = (prodImgPrimary?.value || '').trim() || draftVariants[0]?.image || 'assets/images/velve_capsule_trio.jpg';
    const totalStock = draftVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const szCfg = getWizardSizingConfig();
    const szSummary = szCfg.mode === 'none'
      ? 'Cero Costuras'
      : (szCfg.mode === 'one_size' ? szCfg.fullOneSizeLabel : ('Tallas: ' + szCfg.enabledSizes.join(', ')));

    if (wizPreviewTitle) wizPreviewTitle.textContent = titleVal;
    if (wizPreviewCat) wizPreviewCat.textContent = `${catVal} • ${szSummary}`;
    if (wizPreviewPrice) wizPreviewPrice.textContent = formatMoney(priceVal);
    if (wizPreviewOldPrice) {
      if (oldPriceVal > priceVal) {
        wizPreviewOldPrice.style.display = 'inline';
        wizPreviewOldPrice.textContent = formatMoney(oldPriceVal);
      } else {
        wizPreviewOldPrice.style.display = 'none';
      }
    }
    if (wizPreviewBadge) {
      if (badgeVal) {
        wizPreviewBadge.style.display = 'inline-block';
        wizPreviewBadge.textContent = badgeVal;
        wizPreviewBadge.style.background = badgeVal.toLowerCase().includes('sale') ? '#9B1C1C' : '#161514';
      } else {
        wizPreviewBadge.style.display = 'none';
      }
    }
    if (wizPreviewImg && mainImgVal) {
      wizPreviewImg.src = mainImgVal;
    }
    if (wizPreviewStockTag) {
      wizPreviewStockTag.textContent = `${totalStock} uds (${draftVariants.length} col.)`;
    }
    if (wizPreviewSwatches) {
      wizPreviewSwatches.innerHTML = draftVariants.map(v => `
        <span title="${v.name} (${v.stock} uds)" style="width: 14px; height: 14px; border-radius: 50%; background: ${v.hex || '#161514'}; border: 1px solid rgba(0,0,0,0.25); display: inline-block; cursor: pointer;" data-prev-img="${v.image || mainImgVal}"></span>
      `).join('');
      wizPreviewSwatches.querySelectorAll('span[data-prev-img]').forEach(dot => {
        dot.addEventListener('click', () => {
          const targetImg = dot.getAttribute('data-prev-img');
          if (wizPreviewImg && targetImg) wizPreviewImg.src = targetImg;
        });
      });
    }
  }

  [prodName, prodCategory, prodPrice, prodOldPrice, prodBadge].forEach(el => {
    if (el) {
      el.addEventListener('input', updateWizardLivePreview);
      el.addEventListener('change', updateWizardLivePreview);
    }
  });

  function resetWizardForNewProduct() {
    modalProductTitle.textContent = 'Nueva Publicación de Prenda';
    prodEditId.value = '';
    if (prodCustomSku) prodCustomSku.value = '';
    productForm.reset();
    prodImgPrimary.value = 'assets/images/velve_capsule_trio.jpg';
    prodImgSecondary.value = 'assets/images/velve_textile_atelier.jpg';
    if (prodPrimaryPreview) prodPrimaryPreview.src = prodImgPrimary.value;
    if (prodSecondaryPreview) prodSecondaryPreview.src = prodImgSecondary.value;
    prodStockXS.value = '5';
    prodStockS.value = '10';
    prodStockM.value = '10';
    prodStockL.value = '5';
    if (prodSizeMode) prodSizeMode.value = 'one_size';
    if (prodOneSizeLabel) prodOneSizeLabel.value = 'Talla Única';
    if (prodOneSizeRange) prodOneSizeRange.value = 'S a L';
    if (chkSizeXS) chkSizeXS.checked = false;
    if (chkSizeS) chkSizeS.checked = true;
    if (chkSizeM) chkSizeM.checked = true;
    if (chkSizeL) chkSizeL.checked = true;
    if (prodCustomExtraSizes) prodCustomExtraSizes.value = '';
    draftVariants = [
      {
        name: 'Obsidian Velvet (Negro)',
        hex: '#161514',
        image: 'assets/images/velve_capsule_trio.jpg',
        stock: 15
      }
    ];
    setWizardStep(1);
    updateSizingModePanels();
    renderDraftVariants();
    updateWizardLivePreview();
  }

  function openNewProductModal() {
    resetWizardForNewProduct();
    productModalBackdrop.classList.add('open');
  }

  function openEditProductModal(productId) {
    const products = window.VelveStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    modalProductTitle.textContent = 'Editar Publicación: ' + prod.name;
    prodEditId.value = prod.id;
    if (prodCustomSku) prodCustomSku.value = prod.id;
    prodName.value = prod.name;
    prodCategory.value = prod.category;
    prodPrice.value = prod.price;
    prodOldPrice.value = prod.oldPrice || '';
    prodBadge.value = prod.badge || '';
    prodImgPrimary.value = prod.imagePrimary || 'assets/images/velve_capsule_trio.jpg';
    prodImgSecondary.value = prod.imageSecondary || prod.imagePrimary || 'assets/images/velve_textile_atelier.jpg';
    if (prodPrimaryPreview) prodPrimaryPreview.src = prodImgPrimary.value;
    if (prodSecondaryPreview) prodSecondaryPreview.src = prodImgSecondary.value;
    prodStockXS.value = prod.stock?.XS ?? 5;
    prodStockS.value = prod.stock?.S ?? 10;
    prodStockM.value = prod.stock?.M ?? 10;
    prodStockL.value = prod.stock?.L ?? 5;
    prodDesc.value = prod.description || '';
    prodComp.value = prod.composition || '';

    const sizeInfo = window.VelveStore.getProductSizesInfo
      ? window.VelveStore.getProductSizesInfo(prod)
      : { mode: 'one_size', oneSizeLabel: 'Talla Única', oneSizeRange: 'S a L', enabledSizes: ['S', 'M', 'L'] };

    if (prodSizeMode) prodSizeMode.value = sizeInfo.mode || 'one_size';
    if (prodOneSizeLabel) prodOneSizeLabel.value = sizeInfo.oneSizeLabel || 'Talla Única';
    if (prodOneSizeRange) prodOneSizeRange.value = sizeInfo.oneSizeRange !== undefined ? sizeInfo.oneSizeRange : 'S a L';

    const stdSizes = ['XS', 'S', 'M', 'L'];
    const enSizes = Array.isArray(sizeInfo.enabledSizes) ? sizeInfo.enabledSizes : ['S', 'M', 'L'];
    if (chkSizeXS) chkSizeXS.checked = enSizes.includes('XS');
    if (chkSizeS) chkSizeS.checked = enSizes.includes('S');
    if (chkSizeM) chkSizeM.checked = enSizes.includes('M');
    if (chkSizeL) chkSizeL.checked = enSizes.includes('L');
    if (prodCustomExtraSizes) {
      const extras = sizeInfo.mode === 'multi_size' ? enSizes.filter(s => !stdSizes.includes(s)) : [];
      prodCustomExtraSizes.value = extras.join(', ');
    }

    draftVariants = (prod.colors && prod.colors.length)
      ? prod.colors.map(c => ({
          name: c.name || 'Obsidian Velvet',
          hex: c.hex || '#161514',
          image: c.image || prod.imagePrimary,
          stock: c.stock ?? 15
        }))
      : [{
          name: 'Obsidian Velvet',
          hex: '#161514',
          image: prod.imagePrimary,
          stock: 15
        }];

    setWizardStep(1);
    updateSizingModePanels();
    renderDraftVariants();
    updateWizardLivePreview();
    productModalBackdrop.classList.add('open');
  }

  function closeProductModalWindow() {
    productModalBackdrop.classList.remove('open');
  }

  if (btnOpenNewProductModal) btnOpenNewProductModal.addEventListener('click', openNewProductModal);
  if (btnGuideStartWizard) btnGuideStartWizard.addEventListener('click', openNewProductModal);
  if (closeProductModal) closeProductModal.addEventListener('click', closeProductModalWindow);
  if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeProductModalWindow);

  function saveProductFromWizard(keepOpenForNext = false) {
    if (!prodName.value.trim()) {
      setWizardStep(1);
      prodName.focus();
      showToast('Por favor escribe el nombre de la prenda.');
      return;
    }
    if (!prodPrice.value || Number(prodPrice.value) <= 0) {
      setWizardStep(1);
      prodPrice.focus();
      showToast('Por favor ingresa un precio de venta válido.');
      return;
    }

    const cleanedColors = draftVariants.map((v, idx) => ({
      name: (v.name || `Tono ${idx + 1}`).trim(),
      hex: v.hex || '#161514',
      style: `background-color: ${v.hex || '#161514'};`,
      image: (v.image || prodImgPrimary.value || 'assets/images/velve_capsule_trio.jpg').trim(),
      active: idx === 0,
      stock: Math.max(0, Number(v.stock) || 0)
    }));

    const primaryImgUrl = (prodImgPrimary.value || cleanedColors[0]?.image || 'assets/images/velve_capsule_trio.jpg').trim();
    const secondaryImgUrl = (prodImgSecondary.value || cleanedColors[1]?.image || primaryImgUrl).trim();
    const customSkuVal = (prodCustomSku?.value || '').trim();
    const sizingConfig = getWizardSizingConfig();

    const productData = {
      id: prodEditId.value || customSkuVal || undefined,
      name: prodName.value.trim(),
      category: prodCategory.value,
      price: Number(prodPrice.value) || 0,
      oldPrice: prodOldPrice.value ? Number(prodOldPrice.value) : null,
      badge: prodBadge.value,
      badgeClass: prodBadge.value.toLowerCase().includes('sale') ? 'badge-sale' : (prodBadge.value === 'Bestseller' ? 'badge-wine' : ''),
      imagePrimary: primaryImgUrl,
      imageSecondary: secondaryImgUrl,
      sizing: sizingConfig,
      stock: {
        XS: Number(prodStockXS.value) || 0,
        S: Number(prodStockS.value) || 0,
        M: Number(prodStockM.value) || 0,
        L: Number(prodStockL.value) || 0
      },
      colors: cleanedColors,
      description: prodDesc.value.trim() || 'Prenda arquitectónica sin costuras confeccionada bajo el estándar de lujo silencioso Velve.',
      composition: prodComp.value.trim() || '82% Microfibra de Poliamida 6.6, 18% Elastano Lycra®.',
      status: 'active'
    };

    if (prodEditId.value) {
      window.VelveStore.updateProduct(prodEditId.value, productData);
      showToast(`Publicación "${productData.name}" actualizada (${cleanedColors.length} colores).`);
    } else {
      window.VelveStore.addProduct(productData);
      showToast(`¡Publicación "${productData.name}" creada con ${cleanedColors.length} variación(es)!`);
    }

    renderCatalogTable();

    if (keepOpenForNext) {
      resetWizardForNewProduct();
      setTimeout(() => prodName?.focus(), 100);
    } else {
      closeProductModalWindow();
    }
  }

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProductFromWizard(false);
    });
  }

  if (btnSaveAndCreateAnother) {
    btnSaveAndCreateAnother.addEventListener('click', (e) => {
      e.preventDefault();
      saveProductFromWizard(true);
    });
  }

  // -------------------------------------------------------------------------
  // 4.05. MÓDULO DE CARGA MASIVA (CSV / EXCEL / JSON) & CREADOR FOTO POR FOTO
  // -------------------------------------------------------------------------
  const bulkUploadModalBackdrop = document.getElementById('bulkUploadModalBackdrop');
  const closeBulkUploadModal = document.getElementById('closeBulkUploadModal');
  const btnCancelBulkModal = document.getElementById('btnCancelBulkModal');
  const tabBtnBulkFile = document.getElementById('tabBtnBulkFile');
  const tabBtnBulkPhotos = document.getElementById('tabBtnBulkPhotos');
  const bulkPaneFileMode = document.getElementById('bulkPaneFileMode');
  const bulkPanePhotosMode = document.getElementById('bulkPanePhotosMode');

  const btnDownloadCsvTemplate = document.getElementById('btnDownloadCsvTemplate');
  const btnDownloadJsonTemplate = document.getElementById('btnDownloadJsonTemplate');
  const btnLoadSampleBulkData = document.getElementById('btnLoadSampleBulkData');
  const bulkFileDropzone = document.getElementById('bulkFileDropzone');
  const bulkFileInput = document.getElementById('bulkFileInput');
  const bulkPasteTextarea = document.getElementById('bulkPasteTextarea');
  const btnParsePastedBulk = document.getElementById('btnParsePastedBulk');
  const bulkPreviewSection = document.getElementById('bulkPreviewSection');
  const bulkPreviewSummaryTitle = document.getElementById('bulkPreviewSummaryTitle');
  const bulkPreviewContainer = document.getElementById('bulkPreviewContainer');
  const chkBulkReplaceExisting = document.getElementById('chkBulkReplaceExisting');
  const btnConfirmBulkImport = document.getElementById('btnConfirmBulkImport');

  const batchPhotosInput = document.getElementById('batchPhotosInput');
  const radioBatchSingleProd = document.getElementById('radioBatchSingleProd');
  const radioBatchMultiProd = document.getElementById('radioBatchMultiProd');
  const batchSharedProductHeader = document.getElementById('batchSharedProductHeader');
  const batchSharedName = document.getElementById('batchSharedName');
  const batchSharedCategory = document.getElementById('batchSharedCategory');
  const batchSharedPrice = document.getElementById('batchSharedPrice');
  const batchSharedSizePreset = document.getElementById('batchSharedSizePreset');
  const batchSharedSku = document.getElementById('batchSharedSku');
  const batchPhotosContainer = document.getElementById('batchPhotosContainer');
  const btnSavePhotoBatch = document.getElementById('btnSavePhotoBatch');

  let stagedBulkProducts = [];
  let stagedBatchPhotos = [];

  function switchBulkModalTab(mode = 'file') {
    const isFile = mode === 'file';
    if (tabBtnBulkFile) tabBtnBulkFile.classList.toggle('active', isFile);
    if (tabBtnBulkPhotos) tabBtnBulkPhotos.classList.toggle('active', !isFile);
    if (bulkPaneFileMode) bulkPaneFileMode.style.display = isFile ? 'block' : 'none';
    if (bulkPanePhotosMode) bulkPanePhotosMode.style.display = !isFile ? 'block' : 'none';
    if (btnSavePhotoBatch) {
      btnSavePhotoBatch.style.display = (!isFile && stagedBatchPhotos.length > 0) ? 'inline-flex' : 'none';
    }
  }

  function openBulkUploadModal(defaultTab = 'file') {
    if (!bulkUploadModalBackdrop) return;
    switchBulkModalTab(defaultTab);
    bulkUploadModalBackdrop.classList.add('open');
  }

  function closeBulkUploadModalWindow() {
    if (bulkUploadModalBackdrop) bulkUploadModalBackdrop.classList.remove('open');
  }

  if (btnOpenBulkUploadModal) btnOpenBulkUploadModal.addEventListener('click', () => openBulkUploadModal('file'));
  if (btnOpenPhotoBatchModal) btnOpenPhotoBatchModal.addEventListener('click', () => openBulkUploadModal('photos'));
  if (btnGuideStartBulk) btnGuideStartBulk.addEventListener('click', () => openBulkUploadModal('file'));
  if (btnGuideStartPhotoBatch) btnGuideStartPhotoBatch.addEventListener('click', () => openBulkUploadModal('photos'));
  if (closeBulkUploadModal) closeBulkUploadModal.addEventListener('click', closeBulkUploadModalWindow);
  if (btnCancelBulkModal) btnCancelBulkModal.addEventListener('click', closeBulkUploadModalWindow);
  if (tabBtnBulkFile) tabBtnBulkFile.addEventListener('click', () => switchBulkModalTab('file'));
  if (tabBtnBulkPhotos) tabBtnBulkPhotos.addEventListener('click', () => switchBulkModalTab('photos'));

  // Download CSV Template
  if (btnDownloadCsvTemplate) {
    btnDownloadCsvTemplate.addEventListener('click', () => {
      const sampleRows = window.VELVE_BULK_TEMPLATE_SAMPLE || [];
      const headers = [
        'sku', 'nombre', 'categoria', 'precio', 'precio_anterior', 'badge',
        'modo_talla', 'talla_unica_rango', 'tallas_habilitadas',
        'color_nombre', 'color_hex', 'stock_color', 'foto_color', 'foto_hover',
        'stock_xs', 'stock_s', 'stock_m', 'stock_l', 'descripcion', 'composicion'
      ];
      let csvContent = '\uFEFF' + headers.join(',') + '\n';
      sampleRows.forEach(r => {
        const line = headers.map(h => {
          const val = r[h] !== undefined && r[h] !== null ? String(r[h]).replace(/"/g, '""') : '';
          return `"${val}"`;
        }).join(',');
        csvContent += line + '\n';
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Carga_Masiva_VELVE.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Plantilla CSV (compatible con Excel) descargada.');
    });
  }

  // Download JSON Template
  if (btnDownloadJsonTemplate) {
    btnDownloadJsonTemplate.addEventListener('click', () => {
      const sampleRows = window.VELVE_BULK_TEMPLATE_SAMPLE || [];
      const blob = new Blob([JSON.stringify(sampleRows, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Carga_Masiva_VELVE.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Plantilla JSON descargada.');
    });
  }

  // Parse CSV text into array of objects
  function parseCsvToObjects(text) {
    const cleanText = text.replace(/^\uFEFF/, '').trim();
    if (!cleanText) return [];
    const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Detect delimiter (comma, semicolon, or tab)
    const headerLine = lines[0];
    let delimiter = ',';
    if (headerLine.split('\t').length > headerLine.split(',').length) delimiter = '\t';
    else if (headerLine.split(';').length > headerLine.split(',').length) delimiter = ';';

    function splitCsvRow(rowStr) {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < rowStr.length; i++) {
        const ch = rowStr[i];
        if (ch === '"') {
          if (inQuotes && rowStr[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      result.push(cur.trim());
      return result;
    }

    const headers = splitCsvRow(lines[0]).map(h => h.toLowerCase().trim());
    const rows = [];
    for (let r = 1; r < lines.length; r++) {
      const cols = splitCsvRow(lines[r]);
      if (cols.every(c => !c)) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] !== undefined ? cols[idx] : '';
      });
      rows.push(obj);
    }
    return rows;
  }

  // Group flat rows (CSV or JSON) into structured Velve products with variations
  function groupRowsIntoProducts(rawItems) {
    const groupedMap = new Map();

    rawItems.forEach((item, idx) => {
      // If already in Velve product format with colors array
      if (item.name && Array.isArray(item.colors)) {
        const key = (item.id || item.name).toLowerCase();
        groupedMap.set(key, JSON.parse(JSON.stringify(item)));
        return;
      }

      const nombre = (item.nombre || item.name || item.titulo || '').trim();
      if (!nombre) return;
      const sku = (item.sku || item.id || item.referencia || ('VEL-' + (idx + 1))).trim();
      const groupKey = (sku || nombre).toLowerCase();

      const colorName = (item.color_nombre || item.color || 'Obsidian Velvet').trim();
      const colorHex = (item.color_hex || item.hex || '#161514').trim();
      const stockColor = Number(item.stock_color ?? item.stock ?? 15);
      const fotoColor = (item.foto_color || item.foto_principal || item.imagePrimary || item.imagen || 'assets/images/velve_capsule_trio.jpg').trim();
      const fotoHover = (item.foto_hover || item.imageSecondary || fotoColor).trim();

      if (!groupedMap.has(groupKey)) {
        const rawMode = String(item.modo_talla || item.sizingMode || 'unica').toLowerCase().trim();
        let sizingObj;
        if (rawMode.includes('ningun') || rawMode === 'none') {
          sizingObj = { mode: 'none', oneSizeLabel: 'Única', oneSizeRange: '', fullOneSizeLabel: 'Única', enabledSizes: [] };
        } else if (rawMode.includes('mult')) {
          const rawSizes = String(item.tallas_habilitadas || 'S,M,L').split(',').map(s => s.trim()).filter(Boolean);
          sizingObj = {
            mode: 'multi_size',
            oneSizeLabel: 'Talla Única',
            oneSizeRange: 'S a L',
            fullOneSizeLabel: 'Talla Única (S a L)',
            enabledSizes: rawSizes.length ? rawSizes : ['S', 'M', 'L']
          };
        } else {
          const rng = (item.talla_unica_rango !== undefined ? String(item.talla_unica_rango) : 'S a L').trim();
          const fullLbl = rng ? `Talla Única (${rng})` : 'Talla Única';
          sizingObj = {
            mode: 'one_size',
            oneSizeLabel: 'Talla Única',
            oneSizeRange: rng,
            fullOneSizeLabel: fullLbl,
            enabledSizes: [fullLbl]
          };
        }

        groupedMap.set(groupKey, {
          id: sku,
          name: nombre,
          category: (item.categoria || item.category || 'Bodies').trim(),
          price: Number(String(item.precio || item.price || 145000).replace(/[^\d]/g, '')) || 145000,
          oldPrice: item.precio_anterior || item.oldPrice ? Number(String(item.precio_anterior || item.oldPrice).replace(/[^\d]/g, '')) : null,
          badge: (item.badge || item.distintivo || '').trim(),
          imagePrimary: fotoColor,
          imageSecondary: fotoHover,
          sizing: sizingObj,
          stock: {
            XS: Number(item.stock_xs ?? 5),
            S: Number(item.stock_s ?? 10),
            M: Number(item.stock_m ?? 10),
            L: Number(item.stock_l ?? 5)
          },
          colors: [],
          description: (item.descripcion || item.description || 'Prenda arquitectónica sin costuras confeccionada bajo el estándar de lujo silencioso Velve.').trim(),
          composition: (item.composicion || item.composition || '82% Microfibra de Poliamida 6.6, 18% Elastano Lycra®.').trim()
        });
      }

      const prodEntry = groupedMap.get(groupKey);
      prodEntry.colors.push({
        name: colorName,
        hex: colorHex,
        style: `background-color: ${colorHex};`,
        image: fotoColor,
        active: prodEntry.colors.length === 0,
        stock: isNaN(stockColor) ? 15 : stockColor
      });
    });

    return Array.from(groupedMap.values());
  }

  function renderBulkPreviewTable() {
    if (!bulkPreviewSection || !bulkPreviewContainer) return;
    if (stagedBulkProducts.length === 0) {
      bulkPreviewSection.style.display = 'none';
      return;
    }

    const totalColors = stagedBulkProducts.reduce((acc, p) => acc + (p.colors?.length || 0), 0);
    bulkPreviewSection.style.display = 'block';
    if (bulkPreviewSummaryTitle) {
      bulkPreviewSummaryTitle.textContent = `✓ ${stagedBulkProducts.length} publicaciones listas (${totalColors} variaciones de color en total)`;
    }

    bulkPreviewContainer.innerHTML = stagedBulkProducts.map((p, pIdx) => `
      <div style="border: 1px solid var(--border-subtle); border-radius: 4px; padding: 0.85rem; margin-bottom: 0.65rem; background: #FAF8F5;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.55rem;">
          <div>
            <strong style="font-size: 0.88rem; color: var(--admin-text-primary);">${p.name}</strong>
            <span style="font-size: 0.72rem; color: var(--admin-text-muted); margin-left: 0.4rem;">SKU: ${p.id} &bull; ${p.category} &bull; ${formatMoney(p.price)}</span>
          </div>
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--accent-wine);">${p.colors.length} variación(es) de color</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.55rem;">
          ${p.colors.map((c, cIdx) => `
            <div style="display: flex; align-items: center; gap: 0.55rem; background: #FFFFFF; padding: 0.45rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <img src="${c.image}" alt="${c.name}" style="width: 38px; height: 48px; object-fit: cover; border-radius: 3px; border: 1px solid var(--border-light);">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 600;">
                  <span style="width: 9px; height: 9px; border-radius: 50%; background: ${c.hex}; display: inline-block; border: 1px solid rgba(0,0,0,0.2);"></span>
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.name}</span>
                </div>
                <span style="font-size: 0.68rem; color: var(--admin-text-muted); display: block;">Stock: ${c.stock} uds</span>
                <label style="font-size: 0.66rem; color: var(--accent-wine); font-weight: 700; cursor: pointer; text-decoration: underline;">
                  📁 Subir foto PC
                  <input type="file" accept="image/*" class="bulk-prev-file-input" data-pidx="${pIdx}" data-cidx="${cIdx}" style="display: none;">
                </label>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    bulkPreviewContainer.querySelectorAll('.bulk-prev-file-input').forEach(inp => {
      inp.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const pIdx = Number(inp.getAttribute('data-pidx'));
        const cIdx = Number(inp.getAttribute('data-cidx'));
        try {
          const dataUrl = await processImageFile(file);
          if (stagedBulkProducts[pIdx] && stagedBulkProducts[pIdx].colors[cIdx]) {
            stagedBulkProducts[pIdx].colors[cIdx].image = dataUrl;
            if (cIdx === 0) stagedBulkProducts[pIdx].imagePrimary = dataUrl;
            renderBulkPreviewTable();
            showToast('Foto asignada a la variación en vista previa.');
          }
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  function processBulkRawText(rawText) {
    const trimmed = (rawText || '').trim();
    if (!trimmed) {
      showToast('No se encontraron datos para procesar.');
      return;
    }
    try {
      let parsedRows = [];
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const jsonObj = JSON.parse(trimmed);
        parsedRows = Array.isArray(jsonObj) ? jsonObj : [jsonObj];
      } else {
        parsedRows = parseCsvToObjects(trimmed);
      }
      stagedBulkProducts = groupRowsIntoProducts(parsedRows);
      if (stagedBulkProducts.length === 0) {
        showToast('No se detectaron filas válidas. Revisa que exista la columna "nombre".');
        return;
      }
      renderBulkPreviewTable();
      showToast(`Se procesaron ${stagedBulkProducts.length} publicaciones listas para importar.`);
    } catch (err) {
      console.error(err);
      alert('Error al leer el formato. Asegúrate de usar un archivo CSV o JSON válido.');
    }
  }

  if (btnLoadSampleBulkData) {
    btnLoadSampleBulkData.addEventListener('click', () => {
      const sample = window.VELVE_BULK_TEMPLATE_SAMPLE || [];
      if (bulkPasteTextarea) bulkPasteTextarea.value = JSON.stringify(sample, null, 2);
      stagedBulkProducts = groupRowsIntoProducts(sample);
      renderBulkPreviewTable();
      showToast('Ejemplo cargado en la vista previa. ¡Revisa cómo agrupa las variaciones!');
    });
  }

  if (btnParsePastedBulk && bulkPasteTextarea) {
    btnParsePastedBulk.addEventListener('click', () => {
      processBulkRawText(bulkPasteTextarea.value);
    });
  }

  if (bulkFileInput) {
    bulkFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (bulkPasteTextarea) bulkPasteTextarea.value = ev.target.result;
        processBulkRawText(ev.target.result);
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (bulkFileDropzone) {
    bulkFileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      bulkFileDropzone.classList.add('dragover');
    });
    bulkFileDropzone.addEventListener('dragleave', () => {
      bulkFileDropzone.classList.remove('dragover');
    });
    bulkFileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      bulkFileDropzone.classList.remove('dragover');
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (bulkPasteTextarea) bulkPasteTextarea.value = ev.target.result;
        processBulkRawText(ev.target.result);
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (btnConfirmBulkImport) {
    btnConfirmBulkImport.addEventListener('click', () => {
      if (!stagedBulkProducts.length) return;
      const mode = (chkBulkReplaceExisting && chkBulkReplaceExisting.checked) ? 'replace' : 'append';
      const res = window.VelveStore.bulkImportProducts(stagedBulkProducts, mode);
      stagedBulkProducts = [];
      renderBulkPreviewTable();
      closeBulkUploadModalWindow();
      renderCatalogTable();
      showToast(`¡Importación exitosa! ${res.imported} publicaciones añadidas al catálogo.`);
    });
  }

  // Sub-tab B: Photo-by-Photo Batch Creator
  function updateBatchModeUI() {
    const isSingle = radioBatchSingleProd && radioBatchSingleProd.checked;
    if (batchSharedProductHeader) {
      batchSharedProductHeader.style.display = isSingle ? 'grid' : 'none';
    }
    renderBatchPhotosGrid();
  }
  if (radioBatchSingleProd) radioBatchSingleProd.addEventListener('change', updateBatchModeUI);
  if (radioBatchMultiProd) radioBatchMultiProd.addEventListener('change', updateBatchModeUI);

  function renderBatchPhotosGrid() {
    if (!batchPhotosContainer) return;
    const isSingle = radioBatchSingleProd && radioBatchSingleProd.checked;
    if (btnSavePhotoBatch) {
      btnSavePhotoBatch.style.display = stagedBatchPhotos.length > 0 ? 'inline-flex' : 'none';
    }

    if (stagedBatchPhotos.length === 0) {
      batchPhotosContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--admin-text-muted); border: 1px dashed var(--border-light); border-radius: var(--radius-subtle); background: #FFFFFF;">
          Haz clic en <strong>«📁 Seleccionar Fotos desde mi PC»</strong> para cargar tus imágenes foto por foto y asignarles color, nombre y existencias.
        </div>
      `;
      return;
    }

    batchPhotosContainer.innerHTML = stagedBatchPhotos.map((item, idx) => `
      <div class="batch-photo-item" data-bidx="${idx}">
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <img src="${item.image}" alt="Foto ${idx + 1}" style="width: 64px; height: 84px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-light);">
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.68rem; font-weight: 700; color: var(--accent-wine); text-transform: uppercase;">
                Foto #${idx + 1} ${isSingle && idx === 0 ? '(Portada)' : ''}
              </span>
              <button type="button" class="btn-remove-batch-photo" data-idx="${idx}" style="background: none; border: none; color: #9B1C1C; cursor: pointer; font-size: 0.85rem;">&times;</button>
            </div>
            ${!isSingle ? `
              <input type="text" class="form-input batch-item-prodname" data-idx="${idx}" value="${item.productName}" placeholder="Nombre de la prenda *" style="padding: 0.35rem 0.5rem; font-size: 0.76rem; margin-top: 0.25rem;">
            ` : ''}
            <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.35rem;">
              <input type="color" class="batch-item-hex" data-idx="${idx}" value="${item.colorHex}" style="width: 28px; height: 26px; padding: 0; border: 1px solid var(--border-light); border-radius: 3px; cursor: pointer;">
              <input type="text" class="form-input batch-item-colorname" data-idx="${idx}" value="${item.colorName}" placeholder="Nombre del color" style="padding: 0.32rem 0.5rem; font-size: 0.74rem; flex: 1;">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: ${isSingle ? '1fr' : '1fr 1fr 80px'}; gap: 0.45rem; padding-top: 0.4rem; border-top: 1px solid var(--border-subtle);">
          ${!isSingle ? `
            <select class="form-select batch-item-cat" data-idx="${idx}" style="padding: 0.32rem 0.45rem; font-size: 0.73rem;">
              <option value="Bodies" ${item.category === 'Bodies' ? 'selected' : ''}>Bodies</option>
              <option value="Leggings" ${item.category === 'Leggings' ? 'selected' : ''}>Leggings</option>
              <option value="Tops" ${item.category === 'Tops' ? 'selected' : ''}>Tops</option>
              <option value="Shorts" ${item.category === 'Shorts' ? 'selected' : ''}>Shorts</option>
              <option value="Enterizos Largos" ${item.category === 'Enterizos Largos' ? 'selected' : ''}>Enterizos Largos</option>
              <option value="Enterizos Cortos" ${item.category === 'Enterizos Cortos' ? 'selected' : ''}>Enterizos Cortos</option>
              <option value="Buzos" ${item.category === 'Buzos' ? 'selected' : ''}>Buzos</option>
              <option value="Camisetas" ${item.category === 'Camisetas' ? 'selected' : ''}>Camisetas</option>
              <option value="Sales" ${item.category === 'Sales' ? 'selected' : ''}>Sales</option>
            </select>
            <input type="number" class="form-input batch-item-price" data-idx="${idx}" value="${item.price}" placeholder="Precio COP" style="padding: 0.32rem 0.45rem; font-size: 0.73rem;">
          ` : ''}
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="font-size: 0.7rem; color: var(--admin-text-secondary); font-weight: 600;">Stock:</span>
            <input type="number" class="form-input batch-item-stock" data-idx="${idx}" value="${item.stock}" min="0" style="padding: 0.32rem 0.45rem; font-size: 0.74rem; text-align: center;">
            <span style="font-size: 0.68rem; color: var(--admin-text-muted);">uds</span>
          </div>
        </div>
      </div>
    `).join('');

    batchPhotosContainer.querySelectorAll('.btn-remove-batch-photo').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-idx'));
        stagedBatchPhotos.splice(i, 1);
        renderBatchPhotosGrid();
      });
    });

    batchPhotosContainer.querySelectorAll('.batch-item-prodname').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (stagedBatchPhotos[i]) stagedBatchPhotos[i].productName = inp.value;
      });
    });
    batchPhotosContainer.querySelectorAll('.batch-item-colorname').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (stagedBatchPhotos[i]) stagedBatchPhotos[i].colorName = inp.value;
      });
    });
    batchPhotosContainer.querySelectorAll('.batch-item-hex').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (stagedBatchPhotos[i]) stagedBatchPhotos[i].colorHex = inp.value;
      });
    });
    batchPhotosContainer.querySelectorAll('.batch-item-cat').forEach(inp => {
      inp.addEventListener('change', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (stagedBatchPhotos[i]) stagedBatchPhotos[i].category = inp.value;
      });
    });
    batchPhotosContainer.querySelectorAll('.batch-item-price').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (stagedBatchPhotos[i]) stagedBatchPhotos[i].price = Number(inp.value) || 145000;
      });
    });
    batchPhotosContainer.querySelectorAll('.batch-item-stock').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.getAttribute('data-idx'));
        if (stagedBatchPhotos[i]) stagedBatchPhotos[i].stock = Math.max(0, Number(inp.value) || 0);
      });
    });
  }

  if (batchPhotosInput) {
    batchPhotosInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const tones = window.VELVE_OFFICIAL_TONES || [];
      for (let i = 0; i < files.length; i++) {
        try {
          const compressed = await processImageFile(files[i]);
          const baseName = files[i].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const tonePreset = tones[(stagedBatchPhotos.length + i) % (tones.length || 1)] || { name: 'Obsidian Velvet', hex: '#161514' };
          stagedBatchPhotos.push({
            image: compressed,
            productName: baseName || `Prenda Velve ${stagedBatchPhotos.length + 1}`,
            colorName: baseName || tonePreset.name,
            colorHex: tonePreset.hex || '#161514',
            category: 'Bodies',
            price: 145000,
            stock: 15
          });
        } catch (err) {
          console.error(err);
        }
      }
      batchPhotosInput.value = '';
      renderBatchPhotosGrid();
      showToast(`${files.length} foto(s) cargadas en el creador por lote.`);
    });
  }

  function parseBatchSizePreset(presetStr) {
    const val = presetStr || 'one_size:S a L';
    const [modePart, detailPart] = val.split(':');
    if (modePart === 'none') {
      return { mode: 'none', oneSizeLabel: 'Única', oneSizeRange: '', fullOneSizeLabel: 'Única', enabledSizes: [] };
    }
    if (modePart === 'multi') {
      const sizes = (detailPart || 'S,M,L').split(',').map(s => s.trim()).filter(Boolean);
      return { mode: 'multi_size', oneSizeLabel: 'Talla Única', oneSizeRange: 'S a L', fullOneSizeLabel: 'Talla Única (S a L)', enabledSizes: sizes };
    }
    const rng = (detailPart !== undefined ? detailPart : 'S a L').trim();
    const full = rng ? `Talla Única (${rng})` : 'Talla Única';
    return { mode: 'one_size', oneSizeLabel: 'Talla Única', oneSizeRange: rng, fullOneSizeLabel: full, enabledSizes: [full] };
  }

  if (btnSavePhotoBatch) {
    btnSavePhotoBatch.addEventListener('click', () => {
      if (!stagedBatchPhotos.length) return;
      const isSingle = radioBatchSingleProd && radioBatchSingleProd.checked;
      const sharedSizing = parseBatchSizePreset(batchSharedSizePreset?.value);

      if (isSingle) {
        const sharedTitle = (batchSharedName?.value || '').trim() || 'Body Sculpt Velve';
        const sharedCat = batchSharedCategory?.value || 'Bodies';
        const sharedPriceVal = Number(batchSharedPrice?.value) || 145000;
        const sharedSkuVal = (batchSharedSku?.value || '').trim() || undefined;
        const totalUnits = stagedBatchPhotos.reduce((s, item) => s + (Number(item.stock) || 0), 0);

        window.VelveStore.addProduct({
          id: sharedSkuVal,
          name: sharedTitle,
          category: sharedCat,
          price: sharedPriceVal,
          imagePrimary: stagedBatchPhotos[0].image,
          imageSecondary: stagedBatchPhotos[1]?.image || stagedBatchPhotos[0].image,
          sizing: sharedSizing,
          stock: {
            XS: Math.max(1, Math.round(totalUnits * 0.15)),
            S: Math.max(1, Math.round(totalUnits * 0.35)),
            M: Math.max(1, Math.round(totalUnits * 0.35)),
            L: Math.max(1, Math.round(totalUnits * 0.15))
          },
          colors: stagedBatchPhotos.map((item, idx) => ({
            name: item.colorName || `Color ${idx + 1}`,
            hex: item.colorHex || '#161514',
            style: `background-color: ${item.colorHex || '#161514'};`,
            image: item.image,
            active: idx === 0,
            stock: item.stock ?? 15
          }))
        });
        showToast(`¡Prenda "${sharedTitle}" creada con ${stagedBatchPhotos.length} variaciones de color!`);
      } else {
        const itemsToImport = stagedBatchPhotos.map((item, idx) => ({
          name: item.productName || `Prenda Velve ${idx + 1}`,
          category: item.category || 'Bodies',
          price: item.price || 145000,
          imagePrimary: item.image,
          imageSecondary: item.image,
          sizing: sharedSizing,
          colors: [{
            name: item.colorName || 'Obsidian Velvet',
            hex: item.colorHex || '#161514',
            style: `background-color: ${item.colorHex || '#161514'};`,
            image: item.image,
            active: true,
            stock: item.stock ?? 15
          }]
        }));
        window.VelveStore.bulkImportProducts(itemsToImport, 'append');
        showToast(`¡Se publicaron ${itemsToImport.length} prendas independientes en el catálogo!`);
      }

      stagedBatchPhotos = [];
      renderBatchPhotosGrid();
      closeBulkUploadModalWindow();
      renderCatalogTable();
    });
  }

  // -------------------------------------------------------------------------
  // 4.1. MÓDULO 2.1: GESTOR DE FOTOS & LOGO (Principal y Variaciones de Color)
  // -------------------------------------------------------------------------
  const photoModalBackdrop = document.getElementById('photoModalBackdrop');
  const photoModalTitle = document.getElementById('photoModalTitle');
  const photoModalSubtitle = document.getElementById('photoModalSubtitle');
  const closePhotoModal = document.getElementById('closePhotoModal');
  const btnCancelPhotoModal = document.getElementById('btnCancelPhotoModal');
  const btnSavePhotoModal = document.getElementById('btnSavePhotoModal');
  const pmProductId = document.getElementById('pmProductId');
  const pmMainPreview = document.getElementById('pmMainPreview');
  const pmMainUrl = document.getElementById('pmMainUrl');
  const pmSecPreview = document.getElementById('pmSecPreview');
  const pmSecUrl = document.getElementById('pmSecUrl');
  const pmColorsContainer = document.getElementById('pmColorsContainer');
  const pmColorsCountTag = document.getElementById('pmColorsCountTag');

  function openPhotoManagerModal(productId, focusColorName = null) {
    const products = window.VelveStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    pmProductId.value = prod.id;
    if (photoModalTitle) photoModalTitle.textContent = `Modificar Fotos y Logo: ${prod.name}`;
    if (photoModalSubtitle) {
      photoModalSubtitle.textContent = `Ref: ${prod.id} • ${prod.category}. Sube tus fotos editadas con tu logo para reemplazar las del proveedor.`;
    }

    if (pmMainPreview) pmMainPreview.src = prod.imagePrimary;
    if (pmMainUrl) pmMainUrl.value = prod.imagePrimary;
    if (pmSecPreview) pmSecPreview.src = prod.imageSecondary || prod.imagePrimary;
    if (pmSecUrl) pmSecUrl.value = prod.imageSecondary || prod.imagePrimary;

    const colors = prod.colors || [];
    if (pmColorsCountTag) pmColorsCountTag.textContent = `${colors.length} tonalidades configuradas`;

    if (pmColorsContainer) {
      pmColorsContainer.innerHTML = colors.map((c, idx) => {
        const isFocused = focusColorName && c.name.toLowerCase() === focusColorName.toLowerCase();
        const safeColorId = 'col_' + idx;
        const colorImg = c.image || prod.imagePrimary;

        return `
          <div class="photo-upload-slot ${isFocused ? 'focused-slot' : ''}" data-color="${c.name}" id="pm-slot-${safeColorId}" style="${isFocused ? 'border: 2px solid var(--accent-wine); background: #FFF9F7;' : ''}">
            <img src="${colorImg}" alt="${c.name}" class="photo-preview-thumb" id="preview-col-${safeColorId}">
            <div class="photo-slot-info">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="color-swatch-dot" style="${c.style ? `background: ${c.style}` : `background-color: ${c.hex || '#ddd'}`};"></span>
                  <strong style="font-size: 0.85rem; color: var(--admin-text-primary);">${c.name}</strong>
                  ${isFocused ? '<span style="font-size: 0.65rem; background: var(--accent-wine); color: #fff; padding: 0.15rem 0.4rem; border-radius: 3px;">Seleccionado para editar</span>' : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="font-size: 0.75rem; color: var(--admin-text-secondary); font-weight: 600;">Inventario Color:</span>
                  <input type="number" min="0" class="color-stock-input pm-color-stock" data-color="${c.name}" value="${c.stock ?? 15}" style="width: 58px; padding: 0.25rem;">
                  <span style="font-size: 0.72rem; color: var(--admin-text-muted);">uds</span>
                </div>
              </div>

              <div>
                <label style="font-size: 0.7rem; color: var(--admin-text-muted); display: block; margin-bottom: 2px;">
                  URL o ruta de la foto con tu logo para este color:
                </label>
                <input type="text" class="form-input pm-color-url" data-color="${c.name}" data-preview-id="preview-col-${safeColorId}" value="${c.image || ''}" placeholder="URL o ruta de imagen (ej. assets/images/... o Base64)" style="font-size: 0.75rem; padding: 0.4rem;">
              </div>

              <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
                <label class="file-upload-btn">
                  <span>📁 Subir Foto con Logo (desde tu PC)</span>
                  <input type="file" accept="image/*" class="pm-color-file-input" data-color="${c.name}" data-preview-id="preview-col-${safeColorId}" data-status-id="status-${safeColorId}" style="display: none;">
                </label>
                <span id="status-${safeColorId}" style="font-size: 0.72rem; color: #15803d; font-weight: 600; display: none;">
                  ✓ Foto con logo cargada
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Attach file input change for color variants
      pmColorsContainer.querySelectorAll('.pm-color-file-input').forEach(fileInput => {
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const colorName = fileInput.getAttribute('data-color');
          const previewId = fileInput.getAttribute('data-preview-id');
          const statusId = fileInput.getAttribute('data-status-id');
          const previewImg = document.getElementById(previewId);
          const statusEl = document.getElementById(statusId);
          const urlInput = pmColorsContainer.querySelector(`.pm-color-url[data-color="${colorName}"]`);

          if (statusEl) {
            statusEl.style.display = 'inline';
            statusEl.textContent = '⏳ Comprimiendo y cargando...';
            statusEl.style.color = 'var(--admin-text-secondary)';
          }

          try {
            const compressed = await processImageFile(file);
            if (previewImg) previewImg.src = compressed;
            if (urlInput) urlInput.value = compressed;
            if (statusEl) {
              statusEl.textContent = '✓ Foto con logo lista para guardar';
              statusEl.style.color = '#15803d';
            }
            showToast(`Foto de "${colorName}" cargada correctamente.`);
          } catch (err) {
            console.error('Error al subir imagen:', err);
            alert('Error al procesar la foto: ' + err.message);
            if (statusEl) statusEl.style.display = 'none';
          }
        });
      });

      // Attach live preview for URL input
      pmColorsContainer.querySelectorAll('.pm-color-url').forEach(urlInput => {
        urlInput.addEventListener('input', () => {
          const previewId = urlInput.getAttribute('data-preview-id');
          const previewImg = document.getElementById(previewId);
          if (previewImg && urlInput.value.trim()) {
            previewImg.src = urlInput.value.trim();
          }
        });
      });
    }

    if (photoModalBackdrop) {
      photoModalBackdrop.classList.add('open');
    }

    // Scroll to focused color if requested
    if (focusColorName && pmColorsContainer) {
      setTimeout(() => {
        const focusedSlot = pmColorsContainer.querySelector('.focused-slot');
        if (focusedSlot) {
          focusedSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }

  function closePhotoModalWindow() {
    if (photoModalBackdrop) {
      photoModalBackdrop.classList.remove('open');
    }
  }

  if (closePhotoModal) closePhotoModal.addEventListener('click', closePhotoModalWindow);
  if (btnCancelPhotoModal) btnCancelPhotoModal.addEventListener('click', closePhotoModalWindow);

  // Main & Secondary photo file uploaders (also used in Designer Mode)
  document.querySelectorAll('.pm-file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const targetUrlId = input.getAttribute('data-target-url');
      const targetImgId = input.getAttribute('data-target-img');
      const urlInput = document.getElementById(targetUrlId);
      const imgEl = document.getElementById(targetImgId);

      try {
        const compressed = await processImageFile(file);
        if (imgEl) imgEl.src = compressed;
        if (urlInput) urlInput.value = compressed;
        updateSimulator();
        showToast('Foto cargada. Recuerda guardar los cambios.');
      } catch (err) {
        console.error('Error procesando imagen:', err);
        alert('Error al procesar la imagen: ' + err.message);
      }
    });
  });

  if (pmMainUrl && pmMainPreview) {
    pmMainUrl.addEventListener('input', () => {
      if (pmMainUrl.value.trim()) pmMainPreview.src = pmMainUrl.value.trim();
    });
  }

  if (pmSecUrl && pmSecPreview) {
    pmSecUrl.addEventListener('input', () => {
      if (pmSecUrl.value.trim()) pmSecPreview.src = pmSecUrl.value.trim();
    });
  }

  // Save all photo manager changes
  if (btnSavePhotoModal) {
    btnSavePhotoModal.addEventListener('click', () => {
      const pId = pmProductId.value;
      if (!pId) return;

      const mainUrl = pmMainUrl ? pmMainUrl.value.trim() : '';
      const secUrl = pmSecUrl ? pmSecUrl.value.trim() : '';

      const colorImages = {};
      const colorStocks = {};

      if (pmColorsContainer) {
        pmColorsContainer.querySelectorAll('.pm-color-url').forEach(input => {
          const colorName = input.getAttribute('data-color');
          if (colorName && input.value.trim()) {
            colorImages[colorName] = input.value.trim();
          }
        });

        pmColorsContainer.querySelectorAll('.pm-color-stock').forEach(input => {
          const colorName = input.getAttribute('data-color');
          if (colorName) {
            colorStocks[colorName] = Math.max(0, parseInt(input.value, 10) || 0);
          }
        });
      }

      const updated = window.VelveStore.updateAllProductImages(pId, {
        imagePrimary: mainUrl,
        imageSecondary: secUrl,
        colorImages: colorImages,
        colorStocks: colorStocks
      });

      if (updated) {
        showToast(`¡Fotos e inventario de "${updated.name}" guardados exitosamente!`);
        closePhotoModalWindow();
        renderCatalogTable();
      } else {
        alert('Hubo un inconveniente al actualizar las fotos.');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. MÓDULO 3: CONTROL DE VENTAS & PEDIDOS
  // -------------------------------------------------------------------------
  const ordersTableBody = document.getElementById('ordersTableBody');
  const kpiTotalRevenue = document.getElementById('kpiTotalRevenue');
  const kpiTotalOrders = document.getElementById('kpiTotalOrders');
  const kpiAOV = document.getElementById('kpiAOV');
  const kpiUnitsSold = document.getElementById('kpiUnitsSold');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnSalesSimulate = document.getElementById('btnSalesSimulate');
  const btnSimulateSale = document.getElementById('btnSimulateSale');

  function renderSalesDashboard() {
    const orders = window.VelveStore.getOrders();
    const analytics = window.VelveStore.getAnalytics();

    if (kpiTotalRevenue) kpiTotalRevenue.textContent = formatMoney(analytics.totalRevenue);
    if (kpiTotalOrders) kpiTotalOrders.textContent = analytics.totalOrders;
    if (kpiAOV) kpiAOV.textContent = formatMoney(analytics.averageOrderValue);
    if (kpiUnitsSold) kpiUnitsSold.textContent = analytics.totalUnitsSold;

    if (!ordersTableBody) return;

    if (orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--admin-text-muted);">
            No hay órdenes registradas. Haz clic en "+ Simular Venta" para generar un pedido de prueba.
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = orders.map(order => {
      const itemsList = order.items?.map(i => `
        <span style="display: block; font-size: 0.78rem;">
          &bull; ${i.name} (Talla: <strong>${i.size || 'S'}</strong>${i.color ? ', Color: ' + i.color : ''}, ${i.qty || 1} ud)
        </span>
      `).join('') || '1 Prenda Velve';

      return `
        <tr data-order-id="${order.id}">
          <td>
            <strong style="color: var(--accent-wine); font-family: monospace;">${order.id}</strong>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: var(--admin-text-secondary);">${order.date}</span>
          </td>
          <td>
            <div>
              <strong style="color: var(--admin-text-primary);">${order.customer?.name || 'Clienta Velve'}</strong>
              <div style="font-size: 0.72rem; color: var(--admin-text-muted); margin-top: 2px;">
                ${order.customer?.city || 'Colombia'}${order.customer?.address ? ' &bull; ' + order.customer.address : ''}
              </div>
              ${order.customer?.phone ? `
                <div style="font-size: 0.72rem; margin-top: 2px;">
                  <a href="https://wa.me/${order.customer.phone.replace(/\D/g, '')}" target="_blank" style="color: #15803d; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
                    <span>💬 ${order.customer.phone}</span>
                  </a>
                </div>
              ` : ''}
              ${order.customer?.notes ? `<div style="font-size: 0.7rem; color: var(--accent-wine); font-style: italic; margin-top: 2px;">Nota: "${order.customer.notes}"</div>` : ''}
            </div>
          </td>
          <td>
            ${itemsList}
          </td>
          <td>
            <strong style="font-weight: 600; color: var(--admin-text-primary);">${formatMoney(order.total)}</strong>
          </td>
          <td>
            <span style="font-size: 0.75rem; color: var(--admin-text-secondary);">${order.paymentMethod || 'Transferencia / WhatsApp'}</span>
          </td>
          <td>
            <select class="order-status-select" data-id="${order.id}" data-status="${order.status}">
              <option value="Pendiente WhatsApp" ${order.status === 'Pendiente WhatsApp' ? 'selected' : ''}>Pendiente WhatsApp</option>
              <option value="Pagado" ${order.status === 'Pagado' ? 'selected' : ''}>Pagado</option>
              <option value="En preparación" ${order.status === 'En preparación' ? 'selected' : ''}>En preparación</option>
              <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
              <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
              <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    // Attach status update event
    ordersTableBody.querySelectorAll('.order-status-select').forEach(select => {
      select.addEventListener('change', () => {
        const orderId = select.getAttribute('data-id');
        const newStatus = select.value;
        select.setAttribute('data-status', newStatus);
        window.VelveStore.updateOrderStatus(orderId, newStatus);
        renderSalesDashboard();
        showToast(`Orden ${orderId} actualizada a: ${newStatus}`);
      });
    });
  }

  // Simulate Sale Function (createOrder automatically decrements inventory)
  function simulateSale() {
    const products = window.VelveStore.getProducts();
    if (products.length === 0) {
      showToast('No hay productos disponibles para vender.');
      return;
    }

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const sizes = ['XS', 'S', 'M', 'L'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    
    const colors = randomProduct.colors || [];
    const chosenColor = colors.length ? colors[Math.floor(Math.random() * colors.length)] : null;
    const chosenColorName = chosenColor ? chosenColor.name : 'Natural';
    const chosenColorImg = chosenColor?.image || randomProduct.imagePrimary;

    const clientPool = [
      { name: 'Carolina Herrera V.', email: 'carolina.h@lux.co', phone: '+57 312 901 4455', city: 'Medellín, Llanogrande' },
      { name: 'Sofía Santodomingo', email: 'sofia.sd@estudio.co', phone: '+57 310 882 1920', city: 'Bogotá, Chicó Reservado' },
      { name: 'Adriana Arboleda', email: 'adriana@moda.co', phone: '+57 318 221 0099', city: 'Cali, Santa Teresita' },
      { name: 'Gabriela Tafur', email: 'gabriela.tafur@law.co', phone: '+57 320 771 5566', city: 'Barranquilla, Prado Alto' }
    ];
    const randomClient = clientPool[Math.floor(Math.random() * clientPool.length)];

    const newOrder = window.VelveStore.createOrder({
      customer: randomClient,
      items: [
        {
          id: randomProduct.id,
          name: randomProduct.name,
          size: randomSize,
          color: chosenColorName,
          image: chosenColorImg,
          price: randomProduct.price,
          qty: 1
        }
      ],
      total: randomProduct.price,
      status: 'Pagado',
      paymentMethod: 'Tarjeta de Crédito Wompi'
    });

    renderSalesDashboard();
    renderCatalogTable();
    showToast(`¡Nueva venta generada! Orden ${newOrder.id}: ${randomProduct.name} (${chosenColorName}, Talla ${randomSize})`);
  }

  if (btnSimulateSale) btnSimulateSale.addEventListener('click', simulateSale);
  if (btnSalesSimulate) btnSalesSimulate.addEventListener('click', simulateSale);

  // Export CSV
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      const orders = window.VelveStore.getOrders();
      if (orders.length === 0) {
        showToast('No hay órdenes para exportar.');
        return;
      }

      let csv = 'ID Pedido,Fecha,Clienta,Email,Ciudad,Prendas,Total (COP),Estado,Metodo Pago\n';
      orders.forEach(o => {
        const prendasText = o.items?.map(i => `${i.name} (${i.size})`).join(' | ') || '';
        csv += `"${o.id}","${o.date}","${o.customer?.name || ''}","${o.customer?.email || ''}","${o.customer?.city || ''}","${prendasText}","${o.total}","${o.status}","${o.paymentMethod}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Velve_Ventas_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Archivo CSV exportado exitosamente.');
    });
  }

  // -------------------------------------------------------------------------
  // 6. Reset Defaults, Supabase Cloud Config & Cross-tab Sync
  // -------------------------------------------------------------------------
  const supabaseUrlInput = document.getElementById('supabaseUrlInput');
  const supabaseAnonKeyInput = document.getElementById('supabaseAnonKeyInput');
  const supabaseStatusBadge = document.getElementById('supabaseStatusBadge');
  const supabaseConnectionFeedback = document.getElementById('supabaseConnectionFeedback');
  const btnTestSaveSupabase = document.getElementById('btnTestSaveSupabase');
  const btnPushAllSupabase = document.getElementById('btnPushAllSupabase');
  const btnCopySupabaseSql = document.getElementById('btnCopySupabaseSql');

  function loadSupabaseSettingsUI() {
    if (!window.VelveStore || !window.VelveStore.getSupabaseConfig) return;
    const sbCfg = window.VelveStore.getSupabaseConfig();
    if (supabaseUrlInput) supabaseUrlInput.value = sbCfg.url || '';
    if (supabaseAnonKeyInput) supabaseAnonKeyInput.value = sbCfg.anonKey || '';
    if (supabaseStatusBadge) {
      if (window.VelveStore.isSupabaseConfigured()) {
        supabaseStatusBadge.className = 'status-badge in-stock';
        supabaseStatusBadge.textContent = '☁️ Conectado a Supabase';
      } else {
        supabaseStatusBadge.className = 'status-badge low-stock';
        supabaseStatusBadge.textContent = 'Modo Local (Sin conectar)';
      }
    }
  }

  function showSupabaseFeedback(msg, isOk = true) {
    if (!supabaseConnectionFeedback) return;
    supabaseConnectionFeedback.style.display = 'block';
    supabaseConnectionFeedback.style.background = isOk ? '#E8F5E9' : '#FFF3E0';
    supabaseConnectionFeedback.style.color = isOk ? '#1B5E20' : '#E65100';
    supabaseConnectionFeedback.style.border = isOk ? '1px solid #A5D6A7' : '1px solid #FFCC80';
    supabaseConnectionFeedback.textContent = msg;
  }

  if (btnTestSaveSupabase) {
    btnTestSaveSupabase.addEventListener('click', async () => {
      const urlVal = (supabaseUrlInput?.value || '').trim();
      const keyVal = (supabaseAnonKeyInput?.value || '').trim();
      window.VelveStore.saveSupabaseConfig({ url: urlVal, anonKey: keyVal });
      loadSupabaseSettingsUI();

      if (!urlVal || !keyVal) {
        showSupabaseFeedback('Se desactivó la conexión en la nube. Operando en modo local.', false);
        return;
      }

      btnTestSaveSupabase.disabled = true;
      btnTestSaveSupabase.textContent = 'Probando conexión...';
      const testRes = await window.VelveStore.testSupabaseConnection();
      btnTestSaveSupabase.disabled = false;
      btnTestSaveSupabase.textContent = 'Guardar y Probar Conexión Supabase';

      showSupabaseFeedback(testRes.message, testRes.ok);
      if (testRes.ok) {
        await window.VelveStore.syncFromCloud();
        loadDesignerForm();
        renderCatalogTable();
        renderSalesDashboard();
        showToast('¡Conectado y sincronizado con Supabase exitosamente!');
      }
    });
  }

  if (btnPushAllSupabase) {
    btnPushAllSupabase.addEventListener('click', async () => {
      if (!window.VelveStore.isSupabaseConfigured()) {
        showSupabaseFeedback('Primero ingresa tu URL y API Key de Supabase y haz clic en Guardar.', false);
        return;
      }
      btnPushAllSupabase.disabled = true;
      const res = await window.VelveStore.pushAllToCloud();
      btnPushAllSupabase.disabled = false;
      showSupabaseFeedback(res.message, res.ok);
      showToast(res.message);
    });
  }

  if (btnCopySupabaseSql) {
    btnCopySupabaseSql.addEventListener('click', async () => {
      try {
        const res = await fetch('supabase_schema.sql');
        const sqlText = await res.text();
        await navigator.clipboard.writeText(sqlText);
        showSupabaseFeedback('✓ Script SQL copiado al portapapeles. Pégalo en Supabase -> SQL Editor -> Run.', true);
        showToast('Script SQL copiado al portapapeles.');
      } catch (e) {
        showToast('El archivo supabase_schema.sql está listo en la carpeta raíz del proyecto.');
      }
    });
  }

  // Mobile / Touch support for interactive Tooltips (?)
  document.addEventListener('click', (e) => {
    const tip = e.target.closest('.velve-tooltip');
    document.querySelectorAll('.velve-tooltip.tooltip-open').forEach(openEl => {
      if (openEl !== tip) openEl.classList.remove('tooltip-open');
    });
    if (tip) {
      e.preventDefault();
      e.stopPropagation();
      tip.classList.toggle('tooltip-open');
    }
  });

  const btnResetDefaults = document.getElementById('btnResetDefaults');
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm('¿Restablecer todos los datos a la configuración inicial de fábrica? Se reiniciarán textos, imágenes, productos y pedidos.')) {
        window.VelveStore.resetAll();
        loadDesignerForm();
        renderCatalogTable();
        renderSalesDashboard();
        showToast('Datos de fábrica restaurados.');
      }
    });
  }

  window.addEventListener('velve:cloud-synced', () => {
    loadDesignerForm();
    renderCatalogTable();
    renderSalesDashboard();
    loadSupabaseSettingsUI();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'velve_store_config_v1') loadDesignerForm();
    if (e.key && e.key.startsWith('velve_store_products')) renderCatalogTable();
    if (e.key && e.key.startsWith('velve_store_orders')) renderSalesDashboard();
    if (e.key === 'velve_store_session_v1') checkAdminAuth();
  });

  // Initial Boot
  loadDesignerForm();
  loadSupabaseSettingsUI();
  renderCatalogTable();
  renderSalesDashboard();
  checkHashTab();
});
