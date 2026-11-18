/**
 * VELVE — Quiet Luxury & Seamless Fashion
 * Core Client-side Logic & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Data Store: Products & Cart (Connected to VelveStore)
  // -------------------------------------------------------------------------
  function getProductsList() {
    return (window.VelveStore && typeof window.VelveStore.getProducts === 'function')
      ? window.VelveStore.getProducts()
      : [];
  }

  // Initial Cart State (Persisted in localStorage to prevent data loss)
  let cart = [];
  try {
    const savedCart = localStorage.getItem('velve_cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) cart = parsed;
    }
  } catch (e) {
    cart = [];
  }

  function saveCartState() {
    try {
      localStorage.setItem('velve_cart', JSON.stringify(cart));
    } catch (e) {}
  }

  let FREE_SHIPPING_THRESHOLD = 180000; // $180.000 COP default

  // -------------------------------------------------------------------------
  // 2. DOM Elements
  // -------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartBadge = document.getElementById('cartBadge');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartShippingMsg = document.getElementById('cartShippingMsg');
  const shippingFillBar = document.getElementById('shippingFillBar');
  const cartCountHeader = document.getElementById('cartCountHeader');

  // Search Elements
  const searchBackdrop = document.getElementById('searchModalBackdrop');
  const openSearchBtn = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput = document.getElementById('searchInput');

  // Quick View Modal Elements
  const quickviewBackdrop = document.getElementById('quickviewBackdrop');
  const quickviewClose = document.getElementById('quickviewClose');
  const qvImage = document.getElementById('qvImage');
  const qvCategory = document.getElementById('qvCategory');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvDesc = document.getElementById('qvDesc');
  const qvComposition = document.getElementById('qvComposition');
  const qvAddBtn = document.getElementById('qvAddBtn');
  let currentQvProduct = null;
  let selectedQvSize = 'S';

  // Lookbook Elements
  const timeSlotButtons = document.querySelectorAll('.time-slot-btn');
  const lookbookSlides = document.querySelectorAll('.lookbook-slide');

  // Toast Notification
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Mobile Menu
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileMenuDrawer');
  const mobileClose = document.getElementById('mobileMenuClose');

  // -------------------------------------------------------------------------
  // 3. Currency Formatter (COP Style)
  // -------------------------------------------------------------------------
  function formatMoney(amount) {
    return '$' + amount.toLocaleString('es-CO');
  }

  // -------------------------------------------------------------------------
  // 4. Sticky Header with Scroll Detection
  // -------------------------------------------------------------------------
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 5. Toast Notification
  // -------------------------------------------------------------------------
  let toastTimeout;
  function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3800);
  }

  // -------------------------------------------------------------------------
  // 6. Cart Drawer Mechanics
  // -------------------------------------------------------------------------
  function openCart() {
    cartBackdrop.classList.add('open');
    cartDrawer.classList.add('open');
    document.body.classList.add('no-scroll');
    renderCart();
  }

  function closeCart() {
    cartBackdrop.classList.remove('open');
    cartDrawer.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  openCartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', (e) => {
    if (e.target === cartBackdrop) closeCart();
  });

  function renderCart() {
    // Total items count
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    cartBadge.textContent = totalItems;
    cartCountHeader.textContent = `(${totalItems})`;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <img src="assets/icons/logo-monogram.png?v=20261029_3" alt="" class="empty-sprout" style="object-fit: contain; width: 44px; height: 34px; margin: 0 auto;">
          <p style="font-family: var(--font-serif); font-size: 1.1rem;">Tu bolsa está vacía</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 240px;">Descubre nuestras piezas de transición y lleva el lujo silencioso a tu día.</p>
          <button class="btn btn-mocha" style="margin-top: 0.5rem;" onclick="document.getElementById('closeCartBtn').click(); window.location.hash='#coleccion';">
            Explorar Colección
          </button>
        </div>
      `;
      cartSubtotalEl.textContent = formatMoney(0);
      cartTotalEl.textContent = formatMoney(0);
      shippingFillBar.style.width = '0%';
      cartShippingMsg.innerHTML = `Agrega productos para calcular el envío express`;
      return;
    }

    // Render items
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-spec">Talla: ${item.size} &bull; Tono: ${item.color}</span>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
          <div class="qty-control">
            <button class="qty-btn btn-decrease" aria-label="Disminuir">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn btn-increase" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="item-remove-btn" aria-label="Eliminar prenda" title="Eliminar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    // Attach quantity & remove listeners
    cartItemsContainer.querySelectorAll('.cart-item').forEach(itemEl => {
      const id = itemEl.getAttribute('data-id');
      const size = itemEl.getAttribute('data-size');
      const color = itemEl.getAttribute('data-color');

      itemEl.querySelector('.btn-decrease').addEventListener('click', () => {
        updateItemQty(id, size, color, -1);
      });
      itemEl.querySelector('.btn-increase').addEventListener('click', () => {
        updateItemQty(id, size, color, 1);
      });
      itemEl.querySelector('.item-remove-btn').addEventListener('click', () => {
        removeFromCart(id, size, color);
      });
    });

    // Subtotal calculation
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    cartSubtotalEl.textContent = formatMoney(subtotal);
    cartTotalEl.textContent = formatMoney(subtotal);

    // Free shipping bar calculation
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingFillBar.style.width = '100%';
      shippingFillBar.style.backgroundColor = '#5B2C38';
      cartShippingMsg.innerHTML = `¡Felicidades! Disfrutas de <strong>Envío Express Gratuito</strong>`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      shippingFillBar.style.width = `${progressPercent}%`;
      shippingFillBar.style.backgroundColor = '#5B2C38';
      cartShippingMsg.innerHTML = `Te faltan <strong>${formatMoney(remaining)}</strong> para disfrutar de <strong>Envío Gratis</strong>`;
    }

    saveCartState();
  }

  function addToCart(product, size = 'S', color = null, customImage = null) {
    const defaultColor = (product.colors && product.colors[0]) ? product.colors[0].name : 'Natural';
    const itemColor = color || defaultColor;

    let itemImage = customImage;
    if (!itemImage && product.colors) {
      const match = product.colors.find(c => c.name.toLowerCase() === itemColor.toLowerCase());
      if (match && match.image) itemImage = match.image;
    }
    if (!itemImage) itemImage = product.imagePrimary;

    const existing = cart.find(i => i.id === product.id && i.size === size && i.color === itemColor);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        color: itemColor,
        size: size,
        price: product.price,
        qty: 1,
        image: itemImage
      });
    }

    renderCart();
    openCart();
    showToast(`"${product.name}" (${itemColor}) añadida a tu bolsa.`);
  }

  function updateItemQty(id, size, color, delta) {
    const item = cart.find(i => i.id === id && i.size === size && i.color === color);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => !(i.id === id && i.size === size && i.color === color));
      showToast('Prenda retirada de la bolsa.');
    }
    renderCart();
  }

  function removeFromCart(id, size, color) {
    cart = cart.filter(i => !(i.id === id && i.size === size && i.color === color));
    renderCart();
    showToast('Prenda retirada de la bolsa.');
  }

  // -------------------------------------------------------------------------
  // 7. Render Catalog Grid with Progressive Scroll & Sales Category
  // -------------------------------------------------------------------------
  const productsGrid = document.getElementById('productsGrid');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const catalogLiveSearch = document.getElementById('catalogLiveSearch');
  const catalogCountLabel = document.getElementById('catalogCountLabel');
  const catalogLoadMoreWrap = document.getElementById('catalogLoadMoreWrap');
  const btnLoadMoreProducts = document.getElementById('btnLoadMoreProducts');
  const catalogProgressFill = document.getElementById('catalogProgressFill');
  const catalogScrollSentinel = document.getElementById('catalogScrollSentinel');
  const catalogSectionTitle = document.getElementById('catalogSectionTitle');
  const catalogSectionEyebrow = document.getElementById('catalogSectionEyebrow');
  const catalogModeActiveTitle = document.getElementById('catalogModeActiveTitle');
  const btnExitCatalogMode = document.getElementById('btnExitCatalogMode');
  const btnToggleIsolatedCatalog = document.getElementById('btnToggleIsolatedCatalog');
  const brandHomeLogo = document.getElementById('brandHomeLogo');

  const BATCH_SIZE = 12;
  let currentCategory = 'all';
  let currentSearch = '';
  let currentFilteredProducts = [];
  let visibleProductCount = 0;

  function isSaleProduct(product) {
    if (!product) return false;
    const badgeStr = (product.badge || '').toLowerCase();
    const catStr = (product.category || '').toLowerCase();
    return Boolean(
      product.onSale === true ||
      badgeStr.includes('sale') ||
      badgeStr.includes('oferta') ||
      catStr.includes('sale') ||
      (product.oldPrice && Number(product.oldPrice) > Number(product.price))
    );
  }

  function buildProductCardHtml(product) {
    const saleFlag = isSaleProduct(product);
    const hasOldPrice = (saleFlag && product.oldPrice)
      ? `<span class="product-old-price">${formatMoney(product.oldPrice)}</span>`
      : '';
    const badgeClass = saleFlag ? 'badge-sale' : (product.badgeClass || 'badge-wine');
    const badgeText = saleFlag && (!product.badge || product.badge === 'Cero Costuras')
      ? 'Sale -20%'
      : product.badge;
    const badgeHtml = badgeText
      ? `<span class="product-badge ${badgeClass}">${badgeText}</span>`
      : '';

    const colors = product.colors || [];
    const firstColor = colors[0] || { name: 'Natural', image: product.imagePrimary };
    const displayColors = colors.slice(0, 7);
    const extraCount = colors.length - displayColors.length;
    const sizeInfo = (window.VelveStore && window.VelveStore.getProductSizesInfo)
      ? window.VelveStore.getProductSizesInfo(product)
      : { summaryText: 'Cero Costuras', defaultSize: 'Talla Única (S a L)' };

    const swatchesHtml = displayColors.map((c, idx) => `
      <span class="swatch-btn ${idx === 0 ? 'active' : ''}" 
            style="${c.style || ('background-color: ' + c.hex + ';')}" 
            title="${c.name}"
            data-color-name="${c.name}"
            data-color-img="${c.image || product.imagePrimary}"></span>
    `).join('') + (extraCount > 0 ? `<span class="swatch-more-tag" title="${colors.slice(7).map(c => c.name).join(', ')}">+${extraCount}</span>` : '');

    return `
      <article class="product-card" data-product-id="${product.id}" data-selected-color="${firstColor.name}" data-selected-image="${firstColor.image}">
        <div class="product-media-wrap">
          ${badgeHtml}
          <img class="product-img img-primary" src="${firstColor.image || product.imagePrimary}" alt="${product.name}" loading="lazy">
          <img class="product-img img-secondary" src="${product.imageSecondary || firstColor.image || product.imagePrimary}" alt="${product.name} estilo secundario" loading="lazy">
          
          <div class="product-hover-actions">
            <button class="quick-add-btn btn-quick-add" data-id="${product.id}">
              Añadir Rápido +
            </button>
            <button class="quick-add-btn btn-quick-view" data-id="${product.id}" style="background-color: rgba(255,255,255,0.92); font-size: 0.7rem;">
              Vista Rápida
            </button>
          </div>
        </div>

        <div class="product-meta">
          <div class="product-swatches-row">
            <div class="product-swatches">
              ${swatchesHtml}
            </div>
            <span class="product-color-indicator" title="${firstColor.name}">${firstColor.name}</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <span class="product-category-sub">${product.category} &bull; ${sizeInfo.summaryText}</span>
          <div class="product-price-row">
            <span class="product-price">${formatMoney(product.price)}</span>
            ${hasOldPrice}
          </div>
        </div>
      </article>
    `;
  }

  function updateProgressiveFooter() {
    if (!catalogLoadMoreWrap) return;
    const total = currentFilteredProducts.length;
    if (total === 0 || visibleProductCount >= total) {
      catalogLoadMoreWrap.style.display = 'none';
      return;
    }
    catalogLoadMoreWrap.style.display = 'flex';
    const pct = Math.min(100, Math.max(12, Math.round((visibleProductCount / total) * 100)));
    if (catalogProgressFill) {
      catalogProgressFill.style.width = `${pct}%`;
    }
  }

  function appendNextProductBatch() {
    if (!productsGrid) return;
    if (visibleProductCount >= currentFilteredProducts.length) {
      updateProgressiveFooter();
      return;
    }

    const nextSlice = currentFilteredProducts.slice(visibleProductCount, visibleProductCount + BATCH_SIZE);
    visibleProductCount += nextSlice.length;

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = nextSlice.map(buildProductCardHtml).join('');
    const newCards = Array.from(tempContainer.children);

    newCards.forEach(card => {
      productsGrid.appendChild(card);
      bindSingleProductCard(card);
    });

    updateProgressiveFooter();
  }

  function updateCatalogHeaderLabels() {
    const isSaleCat = currentCategory.toLowerCase() === 'sale' || currentCategory.toLowerCase() === 'sales';
    if (catalogSectionEyebrow) {
      catalogSectionEyebrow.textContent = isSaleCat ? 'Oportunidades & Descuentos' : 'Catálogo Oficial E-Commerce';
    }
    if (catalogSectionTitle) {
      if (isSaleCat) {
        catalogSectionTitle.textContent = 'Sales & Ofertas Especiales';
      } else if (currentCategory === 'all') {
        catalogSectionTitle.textContent = 'Catálogo & Colección';
      } else {
        catalogSectionTitle.textContent = currentCategory;
      }
    }
    if (catalogModeActiveTitle) {
      catalogModeActiveTitle.textContent = isSaleCat
        ? 'Vista Exclusiva: Sales -20%'
        : (currentCategory === 'all' ? 'Vista Exclusiva de Catálogo' : `Catálogo: ${currentCategory}`);
    }
    if (catalogCountLabel) {
      if (isSaleCat) {
        catalogCountLabel.textContent = 'Selección Sales con descuento';
      } else if (currentCategory === 'all') {
        catalogCountLabel.textContent = 'Todas las categorías';
      } else {
        catalogCountLabel.textContent = `Categoría: ${currentCategory}`;
      }
    }
  }

  function renderProducts(categoryFilter = null, searchQuery = null) {
    if (categoryFilter !== null) currentCategory = categoryFilter;
    if (searchQuery !== null) currentSearch = searchQuery.toLowerCase().trim();

    // Sync active state on filter tabs
    filterTabs.forEach(t => {
      const f = (t.getAttribute('data-filter') || '').toLowerCase();
      t.classList.toggle('active', f === currentCategory.toLowerCase());
    });

    // Sync active state on top nav links
    const navCatalogo = document.getElementById('navLinkCatalogo');
    const navSales = document.getElementById('navLinkSales');
    const isSaleCat = currentCategory.toLowerCase() === 'sale' || currentCategory.toLowerCase() === 'sales';
    if (navCatalogo && navSales) {
      if (isSaleCat) {
        navCatalogo.style.borderBottom = 'none';
        navSales.style.borderBottom = '2px solid #9B1C1C';
      } else {
        navCatalogo.style.borderBottom = '2px solid var(--accent-wine)';
        navSales.style.borderBottom = 'none';
      }
    }

    updateCatalogHeaderLabels();

    const productsList = getProductsList();

    currentFilteredProducts = productsList.filter(product => {
      // Category match
      let matchCat = true;
      if (currentCategory !== 'all') {
        const prodCat = (product.category || '').toLowerCase();
        const targetCat = currentCategory.toLowerCase();
        if (targetCat === 'sale' || targetCat === 'sales') {
          matchCat = isSaleProduct(product);
        } else if (targetCat === 'bodies' || targetCat === 'bodys') {
          matchCat = prodCat.includes('body') || prodCat.includes('bodies');
        } else {
          matchCat = prodCat.includes(targetCat);
        }
      }

      // Search match
      let matchSearch = true;
      if (currentSearch) {
        const titleMatch = product.name.toLowerCase().includes(currentSearch);
        const catMatch = (product.category || '').toLowerCase().includes(currentSearch);
        const colorMatch = (product.colors || []).some(c => c.name.toLowerCase().includes(currentSearch));
        matchSearch = titleMatch || catMatch || colorMatch;
      }

      return matchCat && matchSearch;
    });

    visibleProductCount = 0;

    if (currentFilteredProducts.length === 0) {
      if (productsList.length === 0) {
        productsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-subtle); border: 1px dashed var(--border-subtle);">
            <img src="assets/icons/logo-monogram.png?v=20261112_1" alt="" style="width: 38px; height: 36px; object-fit: contain; margin: 0 auto 0.85rem auto; opacity: 0.85;">
            <p style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--text-primary); margin-bottom: 0.45rem;">
              Nueva Colección en Curaduría
            </p>
            <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto; line-height: 1.6;">
              Nuestro atelier está actualizando las referencias de la temporada. Muy pronto estarán disponibles nuestras nuevas piezas sin costuras.
            </p>
          </div>
        `;
      } else {
        productsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-subtle); border: 1px dashed var(--border-subtle);">
            <p style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.5rem;">
              No se encontraron prendas para "${currentSearch || currentCategory}"
            </p>
            <p style="font-size: 0.85rem; max-width: 380px; margin: 0 auto 1.2rem auto;">
              Prueba buscando por otra tonalidad o selecciona otra categoría.
            </p>
            <button class="btn btn-mocha" style="font-size: 0.75rem;" onclick="resetCatalogFilters()">
              Ver todo el catálogo
            </button>
          </div>
        `;
      }
      updateProgressiveFooter();
      return;
    }

    productsGrid.innerHTML = '';
    appendNextProductBatch();
  }

  function bindSingleProductCard(card) {
    const primaryImg = card.querySelector('.img-primary');
    const secondaryImg = card.querySelector('.img-secondary');
    const colorIndicator = card.querySelector('.product-color-indicator');
    const swatches = card.querySelectorAll('.swatch-btn');

    function applyColor(swatch) {
      const colorName = swatch.getAttribute('data-color-name');
      const colorImg = swatch.getAttribute('data-color-img');
      if (!colorImg) return;

      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      if (colorIndicator) {
        colorIndicator.textContent = colorName;
        colorIndicator.title = colorName;
      }

      if (primaryImg && primaryImg.src !== colorImg) {
        primaryImg.classList.add('img-fade');
        primaryImg.src = colorImg;
        if (secondaryImg) secondaryImg.src = colorImg;
        setTimeout(() => {
          primaryImg.classList.remove('img-fade');
        }, 180);
      }

      card.dataset.selectedColor = colorName;
      card.dataset.selectedImage = colorImg;
    }

    swatches.forEach(swatch => {
      swatch.addEventListener('mouseenter', () => applyColor(swatch));
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        applyColor(swatch);
      });
    });

    function triggerCardQuickView() {
      const pId = card.getAttribute('data-product-id');
      const prod = getProductsList().find(p => p.id === pId);
      if (prod) {
        const selColor = card.dataset.selectedColor || null;
        const selImg = card.dataset.selectedImage || null;
        openQuickView(prod, selColor, selImg);
      }
    }

    const mediaWrap = card.querySelector('.product-media-wrap');
    if (mediaWrap) {
      mediaWrap.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        triggerCardQuickView();
      });
    }

    const titleEl = card.querySelector('.product-title');
    if (titleEl) {
      titleEl.addEventListener('click', () => {
        triggerCardQuickView();
      });
    }

    const quickAddBtn = card.querySelector('.btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = quickAddBtn.getAttribute('data-id');
        const prod = getProductsList().find(p => p.id === pId);
        if (prod) {
          const selColor = card.dataset.selectedColor || (prod.colors && prod.colors[0]?.name);
          const selImg = card.dataset.selectedImage || prod.imagePrimary;
          const sizeInfo = (window.VelveStore && window.VelveStore.getProductSizesInfo)
            ? window.VelveStore.getProductSizesInfo(prod)
            : { defaultSize: 'Talla Única (S a L)' };
          addToCart(prod, sizeInfo.defaultSize, selColor, selImg);
        }
      });
    }

    const quickViewBtn = card.querySelector('.btn-quick-view');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerCardQuickView();
      });
    }
  }

  // Load More Button & Progressive Scroll Observer
  if (btnLoadMoreProducts) {
    btnLoadMoreProducts.addEventListener('click', () => {
      appendNextProductBatch();
    });
  }

  if (catalogScrollSentinel && 'IntersectionObserver' in window) {
    const progressiveObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && visibleProductCount < currentFilteredProducts.length) {
          appendNextProductBatch();
        }
      });
    }, {
      root: null,
      rootMargin: '320px 0px',
      threshold: 0.01
    });
    progressiveObserver.observe(catalogScrollSentinel);
  }

  // Separated Catalog View Mode Controller
  function setCatalogIsolatedMode(enable, filterToApply = null) {
    if (enable) {
      document.body.classList.add('catalog-view-mode');
      if (btnToggleIsolatedCatalog) {
        btnToggleIsolatedCatalog.textContent = 'Ver Inicio Completo';
      }
      if (filterToApply !== null) {
        renderProducts(filterToApply, null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.body.classList.remove('catalog-view-mode');
      if (btnToggleIsolatedCatalog) {
        btnToggleIsolatedCatalog.textContent = 'Separar Vista Catálogo';
      }
    }
  }

  if (btnExitCatalogMode) {
    btnExitCatalogMode.addEventListener('click', () => {
      setCatalogIsolatedMode(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnToggleIsolatedCatalog) {
    btnToggleIsolatedCatalog.addEventListener('click', () => {
      const isIsolated = document.body.classList.contains('catalog-view-mode');
      setCatalogIsolatedMode(!isIsolated);
    });
  }

  if (brandHomeLogo) {
    brandHomeLogo.addEventListener('click', (e) => {
      if (document.body.classList.contains('catalog-view-mode')) {
        e.preventDefault();
        setCatalogIsolatedMode(false);
        renderProducts('all', '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Navigation Links for Separated Catalog / Sales vs Home Sections
  document.querySelectorAll('[data-nav-view]').forEach(navEl => {
    navEl.addEventListener('click', (e) => {
      const viewType = navEl.getAttribute('data-nav-view');
      const filterAttr = navEl.getAttribute('data-filter');
      if (viewType === 'catalog') {
        e.preventDefault();
        setCatalogIsolatedMode(true, filterAttr || 'all');
      } else if (viewType === 'home') {
        setCatalogIsolatedMode(false);
      }
    });
  });

  // Hero Secondary CTA ("Explorar Sales -20%") & Category Cards with [data-cat-filter]
  const heroCta2 = document.getElementById('heroCta2');
  if (heroCta2) {
    heroCta2.addEventListener('click', (e) => {
      const f = heroCta2.getAttribute('data-filter');
      if (f) {
        e.preventDefault();
        setCatalogIsolatedMode(true, f);
      }
    });
  }

  document.querySelectorAll('[data-cat-filter]').forEach(cardEl => {
    cardEl.addEventListener('click', (e) => {
      const catFilter = cardEl.getAttribute('data-cat-filter');
      if (catFilter) {
        e.preventDefault();
        renderProducts(catFilter, null);
        const colSec = document.getElementById('coleccion');
        if (colSec) colSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Filter Tabs Event
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.getAttribute('data-filter');
      renderProducts(cat, null);
    });
  });

  // Live Search Event
  if (catalogLiveSearch) {
    let searchDebounce;
    catalogLiveSearch.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        renderProducts(null, e.target.value);
      }, 150);
    });
  }

  window.resetCatalogFilters = function () {
    currentCategory = 'all';
    currentSearch = '';
    if (catalogLiveSearch) catalogLiveSearch.value = '';
    renderProducts('all', '');
  };

  // -------------------------------------------------------------------------
  // 8. Quick View Modal Mechanics with Dynamic Color Switch
  // -------------------------------------------------------------------------
  let selectedQvColor = null;
  let selectedQvImage = null;

  function openQuickView(product, initialColor = null, initialImage = null) {
    currentQvProduct = product;
    selectedQvSize = 'S';

    const colors = product.colors || [];
    const firstColor = colors[0] || { name: 'Natural', image: product.imagePrimary };

    selectedQvColor = initialColor || firstColor.name;
    selectedQvImage = initialImage || firstColor.image || product.imagePrimary;

    qvImage.src = selectedQvImage;
    qvCategory.textContent = product.category;
    qvTitle.textContent = product.name;
    qvPrice.textContent = formatMoney(product.price);
    qvDesc.textContent = product.description;
    qvComposition.textContent = product.composition;

    // Render swatches in modal
    const qvSwatchesContainer = document.getElementById('qvSwatches');
    const qvColorNameEl = document.getElementById('qvSelectedColorName');
    if (qvColorNameEl) qvColorNameEl.textContent = selectedQvColor;

    if (qvSwatchesContainer) {
      qvSwatchesContainer.innerHTML = colors.map(c => `
        <span class="swatch-btn ${c.name === selectedQvColor ? 'active' : ''}" 
              style="${c.style || ('background-color: ' + c.hex + ';')}; width: 22px; height: 22px;" 
              title="${c.name}"
              data-color-name="${c.name}"
              data-color-img="${c.image}"></span>
      `).join('');

      qvSwatchesContainer.querySelectorAll('.swatch-btn').forEach(swatch => {
        swatch.addEventListener('click', () => {
          qvSwatchesContainer.querySelectorAll('.swatch-btn').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');

          selectedQvColor = swatch.getAttribute('data-color-name');
          selectedQvImage = swatch.getAttribute('data-color-img');

          if (qvColorNameEl) qvColorNameEl.textContent = selectedQvColor;
          if (qvImage && selectedQvImage) {
            qvImage.style.opacity = '0.35';
            qvImage.src = selectedQvImage;
            setTimeout(() => { qvImage.style.opacity = '1'; }, 180);
          }
        });
      });
    }

    // Render dynamic size buttons according to product's configured sizing mode
    const qvSizeSection = document.getElementById('qvSizeSection');
    const qvSizeLabel = document.getElementById('qvSizeLabel');
    const qvSizeSelector = document.getElementById('qvSizeSelector');
    const qvSizeFitNote = document.getElementById('qvSizeFitNote');

    const sizeInfo = (window.VelveStore && window.VelveStore.getProductSizesInfo)
      ? window.VelveStore.getProductSizesInfo(product)
      : { mode: 'one_size', fullOneSizeLabel: 'Talla Única (S a L)', oneSizeRange: 'S a L', enabledSizes: ['Talla Única (S a L)'], defaultSize: 'Talla Única (S a L)' };

    selectedQvSize = sizeInfo.defaultSize;

    if (qvSizeSection && qvSizeSelector) {
      if (sizeInfo.mode === 'none') {
        qvSizeSection.style.display = 'none';
      } else if (sizeInfo.mode === 'one_size') {
        qvSizeSection.style.display = 'block';
        if (qvSizeLabel) qvSizeLabel.textContent = 'Talla de la Prenda:';
        qvSizeSelector.innerHTML = `
          <button type="button" class="size-pill active" data-size="${sizeInfo.fullOneSizeLabel}" style="width: auto; padding: 0 1.15rem; font-weight: 600;">
            ${sizeInfo.fullOneSizeLabel}
          </button>
        `;
        if (qvSizeFitNote) {
          if (sizeInfo.oneSizeRange) {
            qvSizeFitNote.style.display = 'block';
            qvSizeFitNote.innerHTML = `✦ Tejido circular de elongación inteligente pensado para adaptarse de la talla <strong>${sizeInfo.oneSizeRange}</strong>.`;
          } else {
            qvSizeFitNote.style.display = 'none';
          }
        }
      } else {
        // multi_size: render ONLY the sizes enabled by the admin for this announcement
        qvSizeSection.style.display = 'block';
        if (qvSizeLabel) qvSizeLabel.textContent = 'Seleccionar Talla Disponible:';
        if (qvSizeFitNote) qvSizeFitNote.style.display = 'none';

        qvSizeSelector.innerHTML = sizeInfo.enabledSizes.map((sz, idx) => `
          <button type="button" class="size-pill ${idx === 0 ? 'active' : ''}" data-size="${sz}" style="${sz.length > 3 ? 'width: auto; padding: 0 0.85rem;' : ''}">
            ${sz}
          </button>
        `).join('');

        qvSizeSelector.querySelectorAll('.size-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            qvSizeSelector.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedQvSize = pill.getAttribute('data-size');
          });
        });
      }
    }

    quickviewBackdrop.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeQuickView() {
    quickviewBackdrop.classList.remove('open');
    document.body.classList.remove('no-scroll');
    currentQvProduct = null;
  }

  quickviewClose.addEventListener('click', closeQuickView);
  quickviewBackdrop.addEventListener('click', (e) => {
    if (e.target === quickviewBackdrop) closeQuickView();
  });

  qvAddBtn.addEventListener('click', () => {
    if (currentQvProduct) {
      addToCart(currentQvProduct, selectedQvSize, selectedQvColor, selectedQvImage);
      closeQuickView();
    }
  });

  // -------------------------------------------------------------------------
  // 9. Interactive "24 Horas en Velve" Lookbook
  // -------------------------------------------------------------------------
  timeSlotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTime = btn.getAttribute('data-time');

      timeSlotButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      lookbookSlides.forEach(slide => {
        if (slide.getAttribute('data-time') === targetTime) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 10. Search Drawer Logic (Connected to Live Catalog Search)
  // -------------------------------------------------------------------------
  function openSearch() {
    searchBackdrop.classList.add('open');
    document.body.classList.add('no-scroll');
    setTimeout(() => searchInput.focus(), 200);
  }

  function closeSearch() {
    searchBackdrop.classList.remove('open');
    document.body.classList.remove('no-scroll');
    searchInput.value = '';
  }

  function executeTopSearch(term) {
    const cleanTerm = (term || '').trim();
    if (catalogLiveSearch) {
      catalogLiveSearch.value = cleanTerm;
    }
    renderProducts('all', cleanTerm);
    closeSearch();
    const colSec = document.getElementById('coleccion');
    if (colSec) {
      colSec.scrollIntoView({ behavior: 'smooth' });
    }
    if (cleanTerm) {
      showToast(`Mostrando resultados para "${cleanTerm}"`);
    }
  }

  openSearchBtn.addEventListener('click', openSearch);
  closeSearchBtn.addEventListener('click', closeSearch);
  searchBackdrop.addEventListener('click', (e) => {
    if (e.target === searchBackdrop) closeSearch();
  });

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeTopSearch(searchInput.value);
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  document.querySelectorAll('.search-tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const term = chip.textContent.trim();
      executeTopSearch(term);
    });
  });

  // -------------------------------------------------------------------------
  // 11. Mobile Navigation Drawer & Info Modals (Size Guide, Shipping, Care)
  // -------------------------------------------------------------------------
  const mobileBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileAdminAccessBtn = document.getElementById('mobileAdminAccessBtn');

  function openMobileMenu() {
    mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  mobileToggle.addEventListener('click', openMobileMenu);
  mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileMenu);
  }

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  if (mobileAdminAccessBtn) {
    mobileAdminAccessBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      openAdminModal();
    });
  }

  // Info Modal (Guía de Tallas, Envíos, Cuidado Textil, Sostenibilidad)
  const infoModalBackdrop = document.getElementById('infoModalBackdrop');
  const infoModalCloseBtn = document.getElementById('infoModalCloseBtn');
  const infoModalEyebrow = document.getElementById('infoModalEyebrow');
  const infoModalTitle = document.getElementById('infoModalTitle');
  const infoModalBody = document.getElementById('infoModalBody');
  const btnOpenSizeGuideFromQv = document.getElementById('btnOpenSizeGuideFromQv');

  const INFO_MODAL_CONTENT = {
    'size-guide': {
      eyebrow: 'Ingeniería Anatómica Velve',
      title: 'Guía de Tallas Inteligente',
      html: `
        <p style="margin-bottom: 1rem;">
          Nuestras prendas están confeccionadas en telares circulares con microfibra de poliamida y elastano de recuperación inteligente. Muchas de nuestras referencias son <strong>Talla Única (S a L)</strong> gracias a su elongación multidireccional sin costuras que se adapta suavemente al contorno sin oprimir.
        </p>
        <div style="background: var(--bg-secondary); padding: 0.9rem 1rem; border-radius: 4px; margin-bottom: 1.1rem; border-left: 3px solid var(--accent-wine);">
          <strong style="color: var(--text-primary); display: block; margin-bottom: 0.2rem;">✦ Equivalencia Talla Única (S a L)</strong>
          <span>Busto: 84 – 102 cm &bull; Cintura: 62 – 82 cm &bull; Cadera: 88 – 108 cm.</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left; margin-bottom: 1rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); color: var(--text-primary);">
              <th style="padding: 0.55rem 0.4rem;">Talla</th>
              <th style="padding: 0.55rem 0.4rem;">Busto (cm)</th>
              <th style="padding: 0.55rem 0.4rem;">Cintura (cm)</th>
              <th style="padding: 0.55rem 0.4rem;">Cadera (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.55rem 0.4rem; font-weight: 600;">XS</td>
              <td style="padding: 0.55rem 0.4rem;">78 – 83</td>
              <td style="padding: 0.55rem 0.4rem;">58 – 63</td>
              <td style="padding: 0.55rem 0.4rem;">84 – 89</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.55rem 0.4rem; font-weight: 600;">S</td>
              <td style="padding: 0.55rem 0.4rem;">84 – 89</td>
              <td style="padding: 0.55rem 0.4rem;">64 – 69</td>
              <td style="padding: 0.55rem 0.4rem;">90 – 95</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.55rem 0.4rem; font-weight: 600;">M</td>
              <td style="padding: 0.55rem 0.4rem;">90 – 95</td>
              <td style="padding: 0.55rem 0.4rem;">70 – 75</td>
              <td style="padding: 0.55rem 0.4rem;">96 – 101</td>
            </tr>
            <tr>
              <td style="padding: 0.55rem 0.4rem; font-weight: 600;">L</td>
              <td style="padding: 0.55rem 0.4rem;">96 – 103</td>
              <td style="padding: 0.55rem 0.4rem;">76 – 83</td>
              <td style="padding: 0.55rem 0.4rem;">102 – 109</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 0.78rem; color: var(--text-muted);">
          ¿Dudas con tu calce? Escríbenos por WhatsApp y nuestra asesora te guiará según la referencia elegida.
        </p>
      `
    },
    'shipping': {
      eyebrow: 'Despachos & Garantía Velve',
      title: 'Política de Envíos & Retornos',
      html: `
        <p style="margin-bottom: 0.85rem;">
          <strong>Envíos Nacionales en toda Colombia:</strong> Despachamos todos los pedidos en un plazo de 24 a 72 horas hábiles. Disfruta de <strong>Envío Express Gratuito</strong> en compras superiores al tope vigente en la barra superior.
        </p>
        <p style="margin-bottom: 0.85rem;">
          <strong>Modalidades de Pago:</strong> Coordinamos tu orden de forma directa y segura vía WhatsApp (Transferencia Bancolombia, Nequi, Daviplata o Pago Contra Entrega según cobertura).
        </p>
        <p>
          <strong>Cambios por Talla o Tono:</strong> Cuentas con 15 días calendario tras recibir tu pedido para solicitar cambio de talla o referencia, siempre que la prenda conserve sus etiquetas originales y no presente uso.
        </p>
      `
    },
    'care': {
      eyebrow: 'Longevidad Textil',
      title: 'Cuidado de Microfibras Segunda Piel',
      html: `
        <ul style="display: flex; flex-direction: column; gap: 0.65rem; padding-left: 1rem; list-style: disc;">
          <li>Lavar a mano o en ciclo delicado con agua fría (máx. 30 °C) en bolsa de lavado.</li>
          <li>No utilizar suavizantes ni blanqueadores (los suavizantes recubren las fibras de elastano y reducen su transpirabilidad).</li>
          <li>Secar a la sombra sobre superficie plana; no usar secadora ni planchar directamente.</li>
        </ul>
      `
    },
    'sustainability': {
      eyebrow: 'Filosofía Quiet Luxury',
      title: 'Sostenibilidad & Armario Cápsula',
      html: `
        <p style="margin-bottom: 0.85rem;">
          En VELVE creemos en comprar menos y elegir mejor. El tejido en telar circular sin costuras reduce hasta en un 35% el desperdicio de corte textil frente a la confección tradicional.
        </p>
        <p>
          Cada prenda está diseñada para acompañarte durante años del estudio de pilates a la oficina y a la noche sin perder su estructura ni su suavidad aterciopelada.
        </p>
      `
    }
  };

  function openInfoModal(topicKey) {
    if (topicKey === 'whatsapp-concierge') {
      const cfg = window.VelveStore ? window.VelveStore.getConfig() : {};
      const rawPhone = (cfg.ecommerce && cfg.ecommerce.whatsappPhone) ? cfg.ecommerce.whatsappPhone : '573129014455';
      const cleanPhone = rawPhone.replace(/\D/g, '') || '573129014455';
      const msg = encodeURIComponent('Hola VELVE, me gustaría recibir asesoría personalizada sobre sus prendas y tallas.');
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
      return;
    }
    const content = INFO_MODAL_CONTENT[topicKey];
    if (!content || !infoModalBackdrop) return;
    closeMobileMenu();
    if (infoModalEyebrow) infoModalEyebrow.textContent = content.eyebrow;
    if (infoModalTitle) infoModalTitle.textContent = content.title;
    if (infoModalBody) infoModalBody.innerHTML = content.html;
    infoModalBackdrop.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeInfoModal() {
    if (!infoModalBackdrop) return;
    infoModalBackdrop.classList.remove('open');
    if (!quickviewBackdrop.classList.contains('open')) {
      document.body.classList.remove('no-scroll');
    }
  }

  if (infoModalCloseBtn) {
    infoModalCloseBtn.addEventListener('click', closeInfoModal);
  }
  if (infoModalBackdrop) {
    infoModalBackdrop.addEventListener('click', (e) => {
      if (e.target === infoModalBackdrop) closeInfoModal();
    });
  }
  if (btnOpenSizeGuideFromQv) {
    btnOpenSizeGuideFromQv.addEventListener('click', (e) => {
      e.preventDefault();
      openInfoModal('size-guide');
    });
  }
  document.querySelectorAll('[data-info-modal]').forEach(el => {
    if (el.id === 'btnOpenSizeGuideFromQv') return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openInfoModal(el.getAttribute('data-info-modal'));
    });
  });

  // -------------------------------------------------------------------------
  // 12. Newsletter Submission Form
  // -------------------------------------------------------------------------
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      if (email && email.includes('@')) {
        showToast('¡Bienvenida al Universo Velve! Disfruta de 10% OFF con código: VELVE10');
        newsletterEmail.value = '';
      } else {
        showToast('Por favor introduce un correo electrónico válido.');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 12.1. Admin Security Access Modal (Silhouette Button Controller)
  // -------------------------------------------------------------------------
  const headerAdminAuthBtn = document.getElementById('headerAdminAuthBtn');
  const adminLoginModalBackdrop = document.getElementById('adminLoginModalBackdrop');
  const btnCloseAdminLoginModal = document.getElementById('btnCloseAdminLoginModal');
  const storeAdminLoginForm = document.getElementById('storeAdminLoginForm');
  const adminLoginUser = document.getElementById('adminLoginUser');
  const adminLoginPass = document.getElementById('adminLoginPass');
  const btnToggleAdminPass = document.getElementById('btnToggleAdminPass');
  const adminRememberMe = document.getElementById('adminRememberMe');
  const adminLoginError = document.getElementById('adminLoginError');

  function openAdminModal() {
    if (!adminLoginModalBackdrop) return;
    
    // If already authenticated, inform user and redirect directly to admin panel
    if (window.VelveStore && window.VelveStore.isAuthenticated()) {
      showToast('Sesión de Administrador activa. Entrando...');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 300);
      return;
    }

    if (adminLoginError) {
      adminLoginError.style.display = 'none';
      adminLoginError.textContent = '';
    }
    adminLoginModalBackdrop.removeAttribute('hidden');
    adminLoginModalBackdrop.classList.add('active');
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      if (adminLoginUser) adminLoginUser.focus();
    }, 150);
  }

  function closeAdminModal() {
    if (!adminLoginModalBackdrop) return;
    adminLoginModalBackdrop.classList.remove('active');
    adminLoginModalBackdrop.setAttribute('hidden', '');
    document.body.classList.remove('no-scroll');
    if (adminLoginError) {
      adminLoginError.style.display = 'none';
    }
  }

  if (headerAdminAuthBtn) {
    headerAdminAuthBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminModal();
    });
  }

  if (btnCloseAdminLoginModal) {
    btnCloseAdminLoginModal.addEventListener('click', (e) => {
      e.preventDefault();
      closeAdminModal();
    });
  }

  if (adminLoginModalBackdrop) {
    adminLoginModalBackdrop.addEventListener('click', (e) => {
      if (e.target === adminLoginModalBackdrop) {
        closeAdminModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminLoginModalBackdrop && !adminLoginModalBackdrop.hasAttribute('hidden')) {
      closeAdminModal();
    }
  });

  if (btnToggleAdminPass && adminLoginPass) {
    btnToggleAdminPass.addEventListener('click', (e) => {
      e.preventDefault();
      const currentType = adminLoginPass.getAttribute('type');
      adminLoginPass.setAttribute('type', currentType === 'password' ? 'text' : 'password');
    });
  }

  if (storeAdminLoginForm) {
    storeAdminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userInput = (adminLoginUser ? adminLoginUser.value : '').trim();
      const passInput = (adminLoginPass ? adminLoginPass.value : '').trim();
      const remember = adminRememberMe ? adminRememberMe.checked : true;

      if (!userInput || !passInput) {
        if (adminLoginError) {
          adminLoginError.textContent = 'Por favor ingresa usuario y contraseña.';
          adminLoginError.style.display = 'block';
        }
        return;
      }

      if (window.VelveStore) {
        const result = window.VelveStore.login(userInput, passInput, remember);
        if (result.success) {
          if (adminLoginError) adminLoginError.style.display = 'none';
          showToast('Credenciales correctas. Accediendo al Panel...');
          const submitBtn = document.getElementById('btnAdminSubmitLogin');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Acceso Concedido &check;</span>';
          }
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 450);
        } else {
          if (adminLoginError) {
            adminLoginError.textContent = result.message || 'Usuario o contraseña incorrectos.';
            adminLoginError.style.display = 'block';
          }
          if (adminLoginPass) {
            adminLoginPass.focus();
            adminLoginPass.select();
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 13. Dynamic CMS Hydration (Apply Store Config)
  // -------------------------------------------------------------------------
  function applyStoreConfig() {
    if (!window.VelveStore) return;
    const config = window.VelveStore.getConfig();

    // Announcement Bar
    const announcementBar = document.getElementById('announcementBar');
    const announcementText = document.getElementById('announcementText');
    const announcementSec = document.getElementById('announcementSec');
    if (announcementBar && config.announcement) {
      announcementBar.style.display = config.announcement.enabled !== false ? 'flex' : 'none';
      if (announcementText && config.announcement.text) announcementText.textContent = config.announcement.text;
      if (announcementSec && config.announcement.secondaryText) announcementSec.textContent = config.announcement.secondaryText;
    }

    // Hero Section
    if (config.hero) {
      const heroBgImage = document.getElementById('heroBgImage');
      const heroBadge = document.getElementById('heroBadge');
      const heroTitle = document.getElementById('heroTitle');
      const heroSubtitle = document.getElementById('heroSubtitle');
      const heroCta1 = document.getElementById('heroCta1');
      const heroCta2 = document.getElementById('heroCta2');

      if (heroBgImage && config.hero.image) heroBgImage.src = config.hero.image;
      if (heroBadge && config.hero.badge) {
        heroBadge.innerHTML = `
          <img src="assets/icons/logo-monogram-light.png?v=20261112_1" alt="" width="18" height="18" style="object-fit: contain;" aria-hidden="true">
          ${config.hero.badge}
        `;
      }
      if (heroTitle && config.hero.title) heroTitle.textContent = config.hero.title;
      if (heroSubtitle && config.hero.subtitle) heroSubtitle.textContent = config.hero.subtitle;
      if (heroCta1 && config.hero.ctaPrimaryText) heroCta1.textContent = config.hero.ctaPrimaryText;
      if (heroCta2 && config.hero.ctaSecondaryText) heroCta2.textContent = config.hero.ctaSecondaryText;
    }

    // Value Prop Section
    if (config.valueProp) {
      const valueTextureImg = document.getElementById('valueTextureImg');
      const valueTitle = document.getElementById('valueTitle');
      const valueLead = document.getElementById('valueLead');
      const pillar1Title = document.getElementById('pillar1Title');
      const pillar1Desc = document.getElementById('pillar1Desc');
      const pillar2Title = document.getElementById('pillar2Title');
      const pillar2Desc = document.getElementById('pillar2Desc');
      const pillar3Title = document.getElementById('pillar3Title');
      const pillar3Desc = document.getElementById('pillar3Desc');

      if (valueTextureImg && config.valueProp.image) valueTextureImg.src = config.valueProp.image;
      if (valueTitle && config.valueProp.title) valueTitle.innerHTML = config.valueProp.title.replace('\n', '<br>');
      if (valueLead && config.valueProp.leadText) valueLead.textContent = config.valueProp.leadText;
      if (pillar1Title && config.valueProp.feature1Title) pillar1Title.textContent = config.valueProp.feature1Title;
      if (pillar1Desc && config.valueProp.feature1Desc) pillar1Desc.textContent = config.valueProp.feature1Desc;
      if (pillar2Title && config.valueProp.feature2Title) pillar2Title.textContent = config.valueProp.feature2Title;
      if (pillar2Desc && config.valueProp.feature2Desc) pillar2Desc.textContent = config.valueProp.feature2Desc;
      if (pillar3Title && config.valueProp.feature3Title) pillar3Title.textContent = config.valueProp.feature3Title;
      if (pillar3Desc && config.valueProp.feature3Desc) pillar3Desc.textContent = config.valueProp.feature3Desc;
    }

    // Category Images
    if (config.categories) {
      const catCard1Img = document.getElementById('catCard1Img');
      const catCard2Img = document.getElementById('catCard2Img');
      const catCard3Img = document.getElementById('catCard3Img');
      const catCard4Img = document.getElementById('catCard4Img');

      if (catCard1Img && config.categories.card1Image) catCard1Img.src = config.categories.card1Image;
      if (catCard2Img && config.categories.card2Image) catCard2Img.src = config.categories.card2Image;
      if (catCard3Img && config.categories.card3Image) catCard3Img.src = config.categories.card3Image;
      if (catCard4Img && config.categories.card4Image) catCard4Img.src = config.categories.card4Image;
    }

    // Manifesto
    if (config.manifesto) {
      const manifestoQuoteText = document.getElementById('manifestoQuoteText');
      if (manifestoQuoteText && config.manifesto.quote) manifestoQuoteText.textContent = config.manifesto.quote;
    }

    // Ecommerce Settings
    if (config.ecommerce && config.ecommerce.freeShippingThreshold) {
      FREE_SHIPPING_THRESHOLD = config.ecommerce.freeShippingThreshold;
    }
  }

  // -------------------------------------------------------------------------
  // 14. E-Commerce WhatsApp Checkout Funnel Optimizer (1-Page Express Flow)
  // -------------------------------------------------------------------------
  const checkoutBtn = document.getElementById('checkoutBtn');
  const expressCheckoutBackdrop = document.getElementById('expressCheckoutBackdrop');
  const expressFormView = document.getElementById('expressFormView');
  const expressSuccessView = document.getElementById('expressSuccessView');
  const closeExpressCheckoutBtn = document.getElementById('closeExpressCheckoutBtn');
  const btnCloseSuccessModal = document.getElementById('btnCloseSuccessModal');
  const expressCheckoutForm = document.getElementById('expressCheckoutForm');
  const btnSubmitWhatsAppOrder = document.getElementById('btnSubmitWhatsAppOrder');

  const customerName = document.getElementById('customerName');
  const customerPhone = document.getElementById('customerPhone');
  const customerAddress = document.getElementById('customerAddress');
  const customerCity = document.getElementById('customerCity');
  const orderNotes = document.getElementById('orderNotes');

  const errName = document.getElementById('errName');
  const errPhone = document.getElementById('errPhone');
  const errAddress = document.getElementById('errAddress');
  const errCity = document.getElementById('errCity');

  const expressItemCount = document.getElementById('expressItemCount');
  const expressTotalAmount = document.getElementById('expressTotalAmount');
  const expressItemsMiniList = document.getElementById('expressItemsMiniList');

  const successOrderId = document.getElementById('successOrderId');
  const btnOpenWhatsAppDirect = document.getElementById('btnOpenWhatsAppDirect');

  // Load saved customer data to prevent redundant friction
  function loadSavedCustomerData() {
    try {
      const saved = localStorage.getItem('velve_customer_data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name && customerName) customerName.value = data.name;
        if (data.phone && customerPhone) customerPhone.value = data.phone;
        if (data.address && customerAddress) customerAddress.value = data.address;
        if (data.city && customerCity) customerCity.value = data.city;
        if (data.notes && orderNotes) orderNotes.value = data.notes;
      }
    } catch (e) {}
  }

  // Standardized WhatsApp Message Payload Generator
  function generateWhatsAppOrderLink({ phone, cartItems, customerData, orderId, total }) {
    // Clean phone format: Country code without '+' (default Colombia 573129014455)
    const cleanPhone = (phone || '573129014455').replace(/\D/g, '');

    const itemsList = cartItems
      .map(item => `▪️ ${item.qty || item.quantity || 1}x ${item.name} (${item.color || item.variant || 'Natural'}, Talla ${item.size || 'S'}) - $${((item.price * (item.qty || item.quantity || 1))).toLocaleString('es-CO')}`)
      .join('\n');

    const rawMessage = 
`👋 ¡Hola! Quiero confirmar mi pedido:

🧾 *ORDEN:* #${orderId}
---------------------------------
📦 *DETALLE DE PRODUCTOS:*
${itemsList}

💰 *TOTAL ESTIMADO:* $${Number(total).toLocaleString('es-CO')}
---------------------------------
📍 *DATOS DE ENTREGA:*
• *Nombre:* ${customerData.name}
• *Teléfono:* ${customerData.phone}
• *Dirección:* ${customerData.address}
• *Ciudad:* ${customerData.city}
• *Notas:* ${customerData.notes || 'Ninguna'}

Quedo atento(a) para coordinar el pago y envío.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;
  }

  function openExpressCheckout() {
    if (cart.length === 0) {
      showToast('Tu bolsa de compras está vacía.');
      return;
    }

    // Close slide-in cart drawer smoothly
    closeCart();

    // Calculate totals
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    if (expressItemCount) expressItemCount.textContent = totalItems;
    if (expressTotalAmount) expressTotalAmount.textContent = formatMoney(subtotal);

    // Render mini order summary
    if (expressItemsMiniList) {
      expressItemsMiniList.innerHTML = cart.map(item => `
        <div class="express-mini-item">
          <img src="${item.image}" alt="${item.name}" class="express-mini-thumb">
          <div class="express-mini-info">
            <div class="express-mini-name">${item.name}</div>
            <div class="express-mini-meta">Tono: <strong>${item.color}</strong> &bull; Talla: ${item.size} &bull; ${item.qty} ud(s)</div>
          </div>
          <div class="express-mini-price">${formatMoney(item.price * item.qty)}</div>
        </div>
      `).join('');
    }

    // Reset views
    if (expressFormView) expressFormView.style.display = 'block';
    if (expressSuccessView) expressSuccessView.style.display = 'none';
    clearFormErrors();

    // Pre-fill previously saved customer details
    loadSavedCustomerData();

    // Trigger Tracking event (InitiateCheckout)
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'InitiateCheckout',
        ecommerce: {
          currency: 'COP',
          value: subtotal,
          items: cart.map(i => ({
            item_id: i.id,
            item_name: i.name,
            item_variant: `${i.color} / ${i.size}`,
            price: i.price,
            quantity: i.qty
          }))
        }
      });
    }

    // Open modal
    if (expressCheckoutBackdrop) {
      expressCheckoutBackdrop.classList.add('open');
      document.body.classList.add('no-scroll');
    }
  }

  function closeExpressCheckout() {
    if (expressCheckoutBackdrop) {
      expressCheckoutBackdrop.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  }

  function clearFormErrors() {
    [customerName, customerPhone, customerAddress, customerCity].forEach(input => {
      if (input) input.classList.remove('error');
    });
    [errName, errPhone, errAddress, errCity].forEach(err => {
      if (err) err.classList.remove('show');
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openExpressCheckout);
  }

  if (closeExpressCheckoutBtn) {
    closeExpressCheckoutBtn.addEventListener('click', closeExpressCheckout);
  }

  if (btnCloseSuccessModal) {
    btnCloseSuccessModal.addEventListener('click', closeExpressCheckout);
  }

  if (expressCheckoutBackdrop) {
    expressCheckoutBackdrop.addEventListener('click', (e) => {
      if (e.target === expressCheckoutBackdrop) {
        closeExpressCheckout();
      }
    });
  }

  // Handle Express Checkout Form Submission
  if (expressCheckoutForm) {
    expressCheckoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        showToast('Tu bolsa está vacía.');
        closeExpressCheckout();
        return;
      }

      clearFormErrors();

      // Form validation
      const nameVal = customerName?.value.trim() || '';
      const phoneVal = customerPhone?.value.trim() || '';
      const addressVal = customerAddress?.value.trim() || '';
      const cityVal = customerCity?.value.trim() || '';
      const notesVal = orderNotes?.value.trim() || '';

      let hasError = false;

      if (!nameVal || nameVal.length < 2) {
        customerName?.classList.add('error');
        errName?.classList.add('show');
        hasError = true;
      }
      if (!phoneVal || phoneVal.replace(/\D/g, '').length < 7) {
        customerPhone?.classList.add('error');
        errPhone?.classList.add('show');
        hasError = true;
      }
      if (!addressVal || addressVal.length < 4) {
        customerAddress?.classList.add('error');
        errAddress?.classList.add('show');
        hasError = true;
      }
      if (!cityVal || cityVal.length < 2) {
        customerCity?.classList.add('error');
        errCity?.classList.add('show');
        hasError = true;
      }

      if (hasError) {
        const firstErrorInput = expressCheckoutForm.querySelector('.express-input.error');
        if (firstErrorInput) firstErrorInput.focus();
        return;
      }

      // 1. Persist customer data in localStorage for future frictionless orders
      const customerData = {
        name: nameVal,
        phone: phoneVal,
        address: addressVal,
        city: cityVal,
        notes: notesVal
      };

      try {
        localStorage.setItem('velve_customer_data', JSON.stringify(customerData));
      } catch (err) {}

      // 2. Generate unique order ID and total
      const orderId = 'VEL-2026-' + Math.floor(1000 + Math.random() * 9000);
      const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

      // 3. Register real order in VelveStore (updates Admin orders dashboard and decreases stock)
      const newOrder = window.VelveStore.createOrder({
        id: orderId,
        customer: {
          name: customerData.name,
          phone: customerData.phone,
          city: customerData.city,
          address: customerData.address,
          notes: customerData.notes
        },
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          size: i.size,
          color: i.color,
          price: i.price,
          qty: i.qty,
          image: i.image
        })),
        total: totalAmount,
        status: 'Pendiente WhatsApp',
        paymentMethod: 'Transferencia / Contra Entrega WhatsApp'
      });

      // 4. Analytics & Tracking events
      window.dispatchEvent(new CustomEvent('velve:checkout-whatsapp', {
        detail: {
          orderId: orderId,
          total: totalAmount,
          customer: customerData,
          items: [...cart]
        }
      }));

      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: 'GenerateLead',
          lead_type: 'WhatsApp_Express_Checkout',
          order_id: orderId,
          value: totalAmount
        });
      }

      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', { content_name: 'WhatsApp Order', value: totalAmount, currency: 'COP' });
      }

      // 5. Build WhatsApp URL
      const config = window.VelveStore.getConfig();
      const storePhone = config.ecommerce?.whatsappPhone || '+57 312 901 4455';
      const waUrl = generateWhatsAppOrderLink({
        phone: storePhone,
        cartItems: cart,
        customerData: customerData,
        orderId: orderId,
        total: totalAmount
      });

      // 6. Clear cart & update UI
      cart = [];
      saveCartState();
      renderCart();

      // 7. Transition to Success View inside Modal
      if (expressFormView) expressFormView.style.display = 'none';
      if (expressSuccessView) expressSuccessView.style.display = 'flex';
      if (successOrderId) successOrderId.textContent = '#' + orderId;
      if (btnOpenWhatsAppDirect) btnOpenWhatsAppDirect.href = waUrl;

      showToast(`¡Orden #${orderId} generada! Redirigiendo a WhatsApp...`);

      // 8. Open WhatsApp in new tab
      window.open(waUrl, '_blank');
    });
  }

  // Live event listeners from admin (same-window & cross-tab localStorage sync)
  window.addEventListener('velve:config-updated', () => {
    applyStoreConfig();
    renderCart();
  });
  window.addEventListener('velve:products-updated', () => {
    renderProducts();
  });
  window.addEventListener('velve:reset-defaults', () => {
    applyStoreConfig();
    renderProducts();
    renderCart();
  });
  window.addEventListener('velve:cloud-synced', () => {
    applyStoreConfig();
    renderProducts();
    renderCart();
  });
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === 'velve_store_config_v1') {
      applyStoreConfig();
      renderCart();
    } else if (e.key.startsWith('velve_store_products')) {
      renderProducts();
    }
  });

  // Initial render & hydration
  applyStoreConfig();
  renderProducts();
  renderCart();
});
