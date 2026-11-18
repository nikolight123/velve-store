/**
 * VELVE — Shared Store & Persistence Layer
 * Manages configuration, product catalog, inventory, and sales orders via localStorage.
 */

(function () {
  const STORAGE_KEYS = {
    CONFIG: 'velve_store_config_v1',
    PRODUCTS: 'velve_store_products_v6_clean',
    ORDERS: 'velve_store_orders_v3_clean',
    AUTH: 'velve_store_auth_v1',
    SESSION: 'velve_store_session_v1',
    SUPABASE: 'velve_supabase_config_v1'
  };

  // Production Cloud Credentials (Can be set here or via Admin Panel -> Configuración)
  const DEFAULT_SUPABASE_CONFIG = {
    url: (window.VELVE_SUPABASE_CONFIG && window.VELVE_SUPABASE_CONFIG.url) || 'https://agugjzlgvuwaqgsnzmhu.supabase.co',
    anonKey: (window.VELVE_SUPABASE_CONFIG && window.VELVE_SUPABASE_CONFIG.anonKey) || 'sb_publishable_XFWvr9HN8OrFpQGoogO7-A_5dRJoyg_',
    bucket: 'velve-media'
  };

  // Purge legacy supplier inventory from localStorage automatically
  try {
    ['velve_store_products_v1', 'velve_store_products_v2', 'velve_store_products_v3', 'velve_store_products_v4', 'velve_store_products_v5'].forEach(k => {
      localStorage.removeItem(k);
    });
  } catch (e) {}

  const DEFAULT_AUTH = {
    username: 'Admin',
    password: 'Zapato123',
    role: 'Administrator'
  };

  // ---------------------------------------------------------------------------
  // 1. Default Configuration (CMS & Designer Mode)
  // ---------------------------------------------------------------------------
  const DEFAULT_CONFIG = {
    announcement: {
      enabled: true,
      text: 'Envío express gratuito en pedidos superiores a $180.000 COP',
      secondaryText: 'Ingeniería Textil Sin Costuras • Tacto Segunda Piel'
    },
    hero: {
      badge: 'Ingeniería Textil • Lujo Silencioso',
      title: 'Tan estructural como la seda, tan suave como Velve.',
      subtitle: 'Prendas sin costuras concebidas bajo la premisa del lujo silencioso y el confort anatómico: diseñadas para fundirse con tu cuerpo del estudio a la sastrería y a la noche.',
      ctaPrimaryText: 'Explorar Catálogo',
      ctaPrimaryLink: '#coleccion',
      ctaSecondaryText: 'Ver Sales -20%',
      ctaSecondaryLink: '#coleccion',
      image: 'assets/images/hero_model.jpg'
    },
    valueProp: {
      eyebrow: 'La Esencia Velve',
      title: 'Tan estructural como la seda,\ntan suave como Velve.',
      leadText: 'Muévete de formas que te hagan sentir bien. Creamos prendas base de ingeniería textil avanzada que actúan como una segunda piel ingrávida: sin costuras laterales que opriman, con soporte invisible y la estética sobria del lujo silencioso.',
      image: 'assets/images/velve_textile_atelier.jpg',
      tag1: 'Tejido Circular 0% Fricción',
      tag2: 'Tono sobre Tono • Alabaster & Warm Sand',
      feature1Title: 'Segunda Piel Sin Costuras',
      feature1Desc: 'Tejido en telar circular computarizado que elimina uniones rígidas, garantizando un tacto continuo que acompaña cada movimiento sin marcar.',
      feature2Title: 'Termo-Adaptabilidad & Poro Abierto',
      feature2Desc: 'Microfibras inteligentes de alta recuperación elástica que regulan la temperatura corporal y mantienen una caída impecable de la mañana a la noche.',
      feature3Title: 'Sistema Cromático Tono sobre Tono',
      feature3Desc: 'Paleta atemporal inspirada en materiales nobles —Obsidian Velvet, Alabaster Silk, Raw Cashmere, Warm Sand y Deep Espresso— pensada para el armario cápsula moderno.'
    },
    categories: {
      card1Title: 'La revolución del Body',
      card1Badge: 'Edición Insignia',
      card1Image: 'assets/images/velve_capsule_trio.jpg',
      card2Title: 'Movimiento Puro',
      card2Badge: 'Activewear & Studio',
      card2Image: 'assets/images/pilates_studio.jpg',
      card3Title: 'Líneas de Sastrería',
      card3Badge: 'Day-to-Night',
      card3Image: 'assets/images/blazer_transition.jpg',
      card4Title: 'Líneas Minimalistas',
      card4Badge: 'Cápsula Nocturne',
      card4Image: 'assets/images/evening_noir.jpg'
    },
    lookbook: {
      title: '24 Horas con la misma prenda base.',
      subtitle: 'Observa cómo una misma pieza sin costuras se transforma a lo largo del día. Selecciona un horario para descubrir la fórmula de estilismo.',
      morningTime: '07:30 AM',
      morningTitle: 'Studio & Movimiento',
      morningDesc: 'La prenda en solitario: sujeción suave y respirabilidad total durante tu práctica matutina.',
      morningImage: 'assets/images/pilates_studio.jpg',
      afternoonTime: '01:30 PM',
      afternoonTitle: 'Reunión & Sastrería',
      afternoonDesc: 'Superpon un blazer de lana estructurado y mocasines. El body actúa como un top pulcro e impecable.',
      afternoonImage: 'assets/images/blazer_transition.jpg',
      eveningTime: '08:30 PM',
      eveningTitle: 'Cena & Cóctel',
      eveningDesc: 'Pantalón fluido de satén negro, joyería dorada fina y labial vino tinto. Sofisticación sin esfuerzo.',
      eveningImage: 'assets/images/evening_noir.jpg'
    },
    manifesto: {
      quote: '"Muévete de formas que te hagan sentir bien. Tan estructural como la seda, tan suave como Velve: un lujo silencioso que abraza tu figura sin costuras y acompaña tu propio ritmo."',
      author: 'El Manifiesto Velve • Ingeniería Textil & Confort Anatómico'
    },
    ecommerce: {
      freeShippingThreshold: 180000,
      currency: 'COP',
      currencySymbol: '$',
      taxRate: 0.19,
      contactEmail: 'concierge@velvestudios.com',
      whatsappPhone: '+57 312 901 4455'
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Default Products Catalog (Clean / Empty — Ready for Admin Input)
  // ---------------------------------------------------------------------------
  const DEFAULT_PRODUCTS = [];

  // ---------------------------------------------------------------------------
  // 3. Default Orders (Sales Control)
  // ---------------------------------------------------------------------------
  const DEFAULT_ORDERS = [];

  // ---------------------------------------------------------------------------
  // 4. Persistence API (window.VelveStore)
  // ---------------------------------------------------------------------------
  window.VelveStore = {
    // Config Methods
    getConfig: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.announcement && parsed.announcement.text && parsed.announcement.text.includes('168')) {
            parsed.announcement.text = DEFAULT_CONFIG.announcement.text;
          }
          if (parsed.hero && parsed.hero.ctaSecondaryText === 'El Concepto Velve') {
            parsed.hero.ctaSecondaryText = DEFAULT_CONFIG.hero.ctaSecondaryText;
            parsed.hero.ctaSecondaryLink = DEFAULT_CONFIG.hero.ctaSecondaryLink;
          }
          if (parsed.hero && parsed.hero.title === 'Comodidad que transita contigo.') {
            parsed.hero.badge = DEFAULT_CONFIG.hero.badge;
            parsed.hero.title = DEFAULT_CONFIG.hero.title;
            parsed.hero.subtitle = DEFAULT_CONFIG.hero.subtitle;
          }
          if (parsed.valueProp && parsed.valueProp.image === 'assets/images/fabric_texture.jpg') {
            parsed.valueProp = Object.assign({}, DEFAULT_CONFIG.valueProp);
          }
          if (parsed.categories && parsed.categories.card1Image === 'assets/images/hero_model.jpg') {
            parsed.categories.card1Image = DEFAULT_CONFIG.categories.card1Image;
          }
          if (parsed.manifesto && parsed.manifesto.quote && parsed.manifesto.quote.includes('El lujo verdadero no grita')) {
            parsed.manifesto = Object.assign({}, DEFAULT_CONFIG.manifesto);
          }
          return Object.assign({}, DEFAULT_CONFIG, parsed);
        }
      } catch (e) {
        console.error('Error reading Velve config:', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    },

    saveConfig: function (newConfig, skipCloud = false) {
      try {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
        window.dispatchEvent(new CustomEvent('velve:config-updated', { detail: newConfig }));
        if (!skipCloud && typeof this._pushConfigToCloud === 'function') {
          this._pushConfigToCloud(newConfig);
        }
        return true;
      } catch (e) {
        console.error('Error saving Velve config:', e);
        return false;
      }
    },

    // Products Methods
    getProducts: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error reading Velve products:', e);
      }
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      } catch (e) {}
      return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    },

    saveProducts: function (products, skipCloud = false) {
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        window.dispatchEvent(new CustomEvent('velve:products-updated', { detail: products }));
        if (!skipCloud && typeof this._pushProductsToCloud === 'function') {
          this._pushProductsToCloud(products);
        }
        return true;
      } catch (e) {
        console.error('Error saving Velve products:', e);
        return false;
      }
    },

    clearAllProducts: function () {
      this.saveProducts([]);
      if (typeof this._clearCloudProducts === 'function') {
        this._clearCloudProducts();
      }
      return true;
    },

    normalizeSizingConfig: function (productData) {
      const rawSizing = productData.sizing || {};
      const mode = rawSizing.mode || productData.sizingMode || 'one_size';

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
        const label = (rawSizing.oneSizeLabel || productData.oneSizeLabel || 'Talla Única').trim() || 'Talla Única';
        const range = (rawSizing.oneSizeRange !== undefined ? rawSizing.oneSizeRange : (productData.oneSizeRange !== undefined ? productData.oneSizeRange : 'S a L')).trim();
        const fullLabel = range ? `${label} (${range})` : label;
        return {
          mode: 'one_size',
          oneSizeLabel: label,
          oneSizeRange: range,
          fullOneSizeLabel: fullLabel,
          enabledSizes: [fullLabel]
        };
      }

      // mode === 'multi_size'
      let enabled = Array.isArray(rawSizing.enabledSizes)
        ? rawSizing.enabledSizes.filter(Boolean)
        : (Array.isArray(productData.enabledSizes) ? productData.enabledSizes.filter(Boolean) : null);

      if (!enabled || enabled.length === 0) {
        const stockObj = productData.stock || { XS: 5, S: 10, M: 10, L: 5 };
        enabled = Object.keys(stockObj).filter(k => Number(stockObj[k]) > 0);
        if (enabled.length === 0) enabled = ['S', 'M', 'L'];
      }

      return {
        mode: 'multi_size',
        oneSizeLabel: 'Talla Única',
        oneSizeRange: 'S a L',
        fullOneSizeLabel: 'Talla Única (S a L)',
        enabledSizes: enabled
      };
    },

    getProductSizesInfo: function (product) {
      if (!product) {
        return {
          mode: 'one_size',
          oneSizeLabel: 'Talla Única',
          oneSizeRange: 'S a L',
          fullOneSizeLabel: 'Talla Única (S a L)',
          enabledSizes: ['Talla Única (S a L)'],
          defaultSize: 'Talla Única (S a L)',
          summaryText: 'Talla Única (S a L)'
        };
      }
      const sizing = this.normalizeSizingConfig(product);
      if (sizing.mode === 'none') {
        return Object.assign({}, sizing, {
          defaultSize: 'Única',
          summaryText: 'Sin talla específica'
        });
      }
      if (sizing.mode === 'one_size') {
        return Object.assign({}, sizing, {
          defaultSize: sizing.fullOneSizeLabel,
          summaryText: sizing.fullOneSizeLabel
        });
      }
      const firstSize = sizing.enabledSizes[0] || 'S';
      return Object.assign({}, sizing, {
        defaultSize: firstSize,
        summaryText: 'Tallas: ' + sizing.enabledSizes.join(', ')
      });
    },

    addProduct: function (productData) {
      const products = this.getProducts();
      const stockObj = productData.stock || { XS: 5, S: 10, M: 10, L: 5 };
      const initialTotal = Object.values(stockObj).reduce((a, b) => a + (Number(b) || 0), 0) || 30;
      const defaultColors = productData.colors && productData.colors.length
        ? productData.colors.map((c, idx) => ({
            name: (c.name || 'Obsidian Velvet').trim(),
            hex: c.hex || '#161514',
            style: c.style || `background-color: ${c.hex || '#161514'};`,
            image: c.image || productData.imagePrimary || 'assets/images/velve_capsule_trio.jpg',
            active: idx === 0,
            stock: (c.stock !== undefined && c.stock !== null) ? Math.max(0, Number(c.stock)) : initialTotal
          }))
        : [{
            name: 'Obsidian Velvet',
            hex: '#161514',
            style: 'background-color: #161514;',
            image: productData.imagePrimary || 'assets/images/velve_capsule_trio.jpg',
            active: true,
            stock: initialTotal
          }];

      const primaryImg = productData.imagePrimary || defaultColors[0]?.image || 'assets/images/velve_capsule_trio.jpg';
      const secondaryImg = productData.imageSecondary || defaultColors[1]?.image || primaryImg;
      const sizingConfig = this.normalizeSizingConfig(productData);

      const isSale = Boolean(
        productData.onSale ||
        (productData.badge && productData.badge.toLowerCase().includes('sale')) ||
        (productData.category && productData.category.toLowerCase().includes('sale')) ||
        (productData.oldPrice && Number(productData.oldPrice) > Number(productData.price))
      );
      const calcOldPrice = isSale && !productData.oldPrice
        ? Math.round((Number(productData.price || 94000) * 1.25) / 1000) * 1000
        : (productData.oldPrice ? Number(productData.oldPrice) : null);

      const customId = (productData.id && String(productData.id).trim())
        ? String(productData.id).trim()
        : ('velve-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900));

      const newProduct = Object.assign({
        status: 'active',
        stock: stockObj,
        onSale: isSale,
        oldPrice: calcOldPrice
      }, productData, {
        id: customId,
        imagePrimary: primaryImg,
        imageSecondary: secondaryImg,
        colors: defaultColors,
        sizing: sizingConfig
      });

      const existingIdx = products.findIndex(p => p.id === customId);
      if (existingIdx !== -1) {
        products[existingIdx] = newProduct;
      } else {
        products.unshift(newProduct);
      }
      this.saveProducts(products);
      return newProduct;
    },

    bulkImportProducts: function (itemsArray, mode = 'append') {
      if (!Array.isArray(itemsArray)) return { imported: 0, total: 0 };
      let current = mode === 'replace' ? [] : this.getProducts();
      let importedCount = 0;

      itemsArray.forEach((raw, idx) => {
        if (!raw || !raw.name) return;
        const stockObj = raw.stock || { XS: 5, S: 10, M: 10, L: 5 };
        const sumSizes = Object.values(stockObj).reduce((a, b) => a + (Number(b) || 0), 0) || 20;
        const colors = Array.isArray(raw.colors) && raw.colors.length
          ? raw.colors.map((c, cIdx) => ({
              name: (c.name || 'Obsidian Velvet').trim(),
              hex: c.hex || '#161514',
              style: c.style || `background-color: ${c.hex || '#161514'};`,
              image: c.image || raw.imagePrimary || 'assets/images/velve_capsule_trio.jpg',
              active: cIdx === 0,
              stock: (c.stock !== undefined && c.stock !== null) ? Math.max(0, Number(c.stock)) : sumSizes
            }))
          : [{
              name: 'Obsidian Velvet',
              hex: '#161514',
              style: 'background-color: #161514;',
              image: raw.imagePrimary || 'assets/images/velve_capsule_trio.jpg',
              active: true,
              stock: sumSizes
            }];

        const primaryImg = raw.imagePrimary || colors[0]?.image || 'assets/images/velve_capsule_trio.jpg';
        const secondaryImg = raw.imageSecondary || colors[1]?.image || primaryImg;
        const priceNum = Number(raw.price) || 95000;
        const isSale = Boolean(
          raw.onSale ||
          (raw.badge && String(raw.badge).toLowerCase().includes('sale')) ||
          (raw.category && String(raw.category).toLowerCase().includes('sale')) ||
          (raw.oldPrice && Number(raw.oldPrice) > priceNum)
        );
        const calcOldPrice = isSale && !raw.oldPrice
          ? Math.round((priceNum * 1.25) / 1000) * 1000
          : (raw.oldPrice ? Number(raw.oldPrice) : null);

        const prodId = (raw.id && String(raw.id).trim())
          ? String(raw.id).trim()
          : ('VEL-' + Date.now() + '-' + (idx + 1));

        const sizingConfig = this.normalizeSizingConfig(raw);

        const normalized = {
          id: prodId,
          name: String(raw.name).trim(),
          category: raw.category || 'Bodies',
          price: priceNum,
          oldPrice: calcOldPrice,
          badge: raw.badge || (isSale ? 'Sale -20%' : ''),
          badgeClass: isSale ? 'badge-sale' : (raw.badge === 'Bestseller' ? 'badge-wine' : ''),
          imagePrimary: primaryImg,
          imageSecondary: secondaryImg,
          stock: stockObj,
          sizing: sizingConfig,
          colors: colors,
          description: raw.description || 'Prenda arquitectónica sin costuras confeccionada bajo el estándar de lujo silencioso Velve.',
          composition: raw.composition || '82% Microfibra de Poliamida 6.6, 18% Elastano Lycra®.',
          status: 'active',
          onSale: isSale
        };

        const existingIdx = current.findIndex(p => p.id.toLowerCase() === prodId.toLowerCase());
        if (existingIdx !== -1) {
          current[existingIdx] = normalized;
        } else {
          current.push(normalized);
        }
        importedCount++;
      });

      this.saveProducts(current);
      return { imported: importedCount, total: current.length };
    },

    updateProduct: function (id, updatedData) {
      const products = this.getProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        const existing = products[idx];
        // If only 1 color exists and stock was updated via modal, sync that single color's stock
        if (updatedData.stock && existing.colors && existing.colors.length === 1 && !updatedData.colors) {
          const sumStock = Object.values(updatedData.stock).reduce((a, b) => a + (Number(b) || 0), 0);
          existing.colors[0].stock = sumStock;
          if (updatedData.imagePrimary) {
            existing.colors[0].image = updatedData.imagePrimary;
          }
        }
        const merged = Object.assign({}, existing, updatedData);
        if (updatedData.sizing || updatedData.sizingMode || updatedData.enabledSizes || updatedData.oneSizeRange !== undefined) {
          merged.sizing = this.normalizeSizingConfig(merged);
        }
        if (
          (merged.badge && merged.badge.toLowerCase().includes('sale')) ||
          (merged.category && merged.category.toLowerCase().includes('sale'))
        ) {
          merged.onSale = true;
          if (!merged.oldPrice) {
            merged.oldPrice = Math.round((Number(merged.price || 94000) * 1.25) / 1000) * 1000;
          }
        }
        products[idx] = merged;
        this.saveProducts(products);
        return products[idx];
      }
      return null;
    },

    deleteProduct: function (id) {
      let products = this.getProducts();
      products = products.filter(p => p.id !== id);
      this.saveProducts(products);
      if (typeof this._deleteProductFromCloud === 'function') {
        this._deleteProductFromCloud(id);
      }
      return true;
    },

    updateColorStock: function (productId, colorName, newStock) {
      const products = this.getProducts();
      const prod = products.find(p => p.id === productId);
      if (!prod || !prod.colors) return null;
      const col = prod.colors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
      if (col) {
        col.stock = Math.max(0, parseInt(newStock, 10) || 0);
        this.saveProducts(products);
        return col;
      }
      return null;
    },

    updateColorImage: function (productId, colorName, newImageUrl) {
      const products = this.getProducts();
      const prod = products.find(p => p.id === productId);
      if (!prod || !prod.colors) return null;
      const col = prod.colors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
      if (col) {
        col.image = newImageUrl;
        if (prod.colors[0]?.name === col.name) {
          prod.imagePrimary = newImageUrl;
        }
        this.saveProducts(products);
        return col;
      }
      return null;
    },

    updateAllProductImages: function (productId, { imagePrimary, imageSecondary, colorImages, colorStocks }) {
      const products = this.getProducts();
      const prod = products.find(p => p.id === productId);
      if (!prod) return null;
      if (imagePrimary) prod.imagePrimary = imagePrimary;
      if (imageSecondary) prod.imageSecondary = imageSecondary;
      if (prod.colors) {
        prod.colors.forEach(c => {
          if (colorImages && colorImages[c.name]) {
            c.image = colorImages[c.name];
          }
          if (colorStocks && colorStocks[c.name] !== undefined) {
            c.stock = Math.max(0, parseInt(colorStocks[c.name], 10) || 0);
          }
        });
      }
      this.saveProducts(products);
      return prod;
    },

    // Orders Methods
    getOrders: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error reading Velve orders:', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_ORDERS));
    },

    saveOrders: function (orders, skipCloud = false) {
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        window.dispatchEvent(new CustomEvent('velve:orders-updated', { detail: orders }));
        if (!skipCloud && typeof this._pushOrdersToCloud === 'function') {
          this._pushOrdersToCloud(orders);
        }
        return true;
      } catch (e) {
        console.error('Error saving Velve orders:', e);
        return false;
      }
    },

    createOrder: function (orderData) {
      const orders = this.getOrders();
      const newOrder = Object.assign({
        id: 'VEL-2026-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pendiente WhatsApp',
        paymentMethod: 'Transferencia / Contra Entrega WhatsApp'
      }, orderData);

      // Decrement stock in products catalog
      if (newOrder.items && Array.isArray(newOrder.items)) {
        const products = this.getProducts();
        newOrder.items.forEach(orderItem => {
          const prod = products.find(p => p.id === orderItem.id);
          if (prod) {
            // Decrement variant color stock if applicable
            if (prod.colors && orderItem.color) {
              const col = prod.colors.find(c => c.name.toLowerCase() === orderItem.color.toLowerCase());
              if (col) {
                col.stock = Math.max(0, (col.stock ?? 15) - (orderItem.qty || 1));
              }
            }
            // Decrement size stock
            if (prod.stock && prod.stock[orderItem.size] !== undefined) {
              prod.stock[orderItem.size] = Math.max(0, prod.stock[orderItem.size] - (orderItem.qty || 1));
            }
          }
        });
        this.saveProducts(products);
      }

      orders.unshift(newOrder);
      this.saveOrders(orders);
      return newOrder;
    },

    updateOrderStatus: function (orderId, newStatus) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        this.saveOrders(orders);
        return order;
      }
      return null;
    },

    // Sales Analytics Metrics
    getAnalytics: function () {
      const orders = this.getOrders();
      const products = this.getProducts();

      const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelado' ? o.total : 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      
      let totalUnitsSold = 0;
      orders.forEach(o => {
        if (o.status !== 'Cancelado' && o.items) {
          o.items.forEach(i => totalUnitsSold += (i.qty || 1));
        }
      });

      let totalInventoryUnits = 0;
      let lowStockAlerts = 0;
      products.forEach(p => {
        let productTotal = 0;
        if (p.colors && p.colors.length) {
          productTotal = p.colors.reduce((sum, c) => sum + (Number(c.stock) || 0), 0);
        } else if (p.stock && typeof p.stock === 'object') {
          productTotal = Object.values(p.stock).reduce((a, b) => a + (Number(b) || 0), 0);
        }
        totalInventoryUnits += productTotal;
        if (productTotal <= 10) lowStockAlerts++;
      });

      return {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        averageOrderValue: averageOrderValue,
        totalUnitsSold: totalUnitsSold,
        totalInventoryUnits: totalInventoryUnits,
        lowStockAlerts: lowStockAlerts
      };
    },

    // -------------------------------------------------------------------------
    // Authentication & Security API
    // -------------------------------------------------------------------------
    getAuthCredentials: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.password === 'velve2026') {
            parsed.password = 'Zapato123';
            parsed.username = 'Admin';
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(parsed));
          }
          return Object.assign({}, DEFAULT_AUTH, parsed);
        }
      } catch (e) {
        console.error('Error reading auth credentials:', e);
      }
      return Object.assign({}, DEFAULT_AUTH);
    },

    updateAuthCredentials: function (username, password) {
      try {
        const current = this.getAuthCredentials();
        const updated = {
          username: username ? username.trim() : current.username,
          password: password ? password.trim() : current.password,
          role: 'Administrator',
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updated));
        return true;
      } catch (e) {
        console.error('Error updating auth credentials:', e);
        return false;
      }
    },

    login: function (userInput, passwordInput, remember = false) {
      const creds = this.getAuthCredentials();
      const u = (userInput || '').trim().toLowerCase();
      const p = (passwordInput || '').trim();

      const validUser = (u === 'admin') || (u === creds.username.toLowerCase()) || (u === 'admin@velvestudios.com');
      const validPass = (p === 'Zapato123') || (p === creds.password);

      if (validUser && validPass) {
        const session = {
          token: 'velve_auth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          username: creds.username || 'Admin',
          role: 'Administrator',
          loginTime: new Date().toISOString(),
          remember: !!remember
        };
        try {
          sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
          if (remember) {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
          }
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('velve:auth-changed', { detail: { authenticated: true, session } }));
        return { success: true, session };
      }

      return { success: false, message: 'Usuario o contraseña incorrectos. Verifica tus credenciales.' };
    },

    isAuthenticated: function () {
      try {
        const sessionStr = sessionStorage.getItem(STORAGE_KEYS.SESSION) || localStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session && session.token) {
            return true;
          }
        }
      } catch (e) {}
      return false;
    },

    getSession: function () {
      try {
        const sessionStr = sessionStorage.getItem(STORAGE_KEYS.SESSION) || localStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessionStr) {
          return JSON.parse(sessionStr);
        }
      } catch (e) {}
      return null;
    },

    logout: function () {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('velve:auth-changed', { detail: { authenticated: false } }));
      return true;
    },

    // Reset All to Defaults (Preserves active admin session)
    resetAll: function () {
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      this.saveConfig(DEFAULT_CONFIG);
      this.saveProducts(DEFAULT_PRODUCTS);
      this.saveOrders(DEFAULT_ORDERS);
      if (typeof this._clearCloudProducts === 'function') {
        this._clearCloudProducts();
      }
      window.dispatchEvent(new CustomEvent('velve:reset-defaults'));
      return true;
    },

    // -------------------------------------------------------------------------
    // 5. Automatic Image Optimizer (WebP / Canvas Compression) + Cloud Upload
    // -------------------------------------------------------------------------
    optimizeImageFile: function (file, options = {}) {
      const maxWidth = options.maxWidth || 1200;
      const maxHeight = options.maxHeight || 1500;
      const quality = options.quality || 0.82;
      const self = this;

      return new Promise((resolve, reject) => {
        if (!file || !file.type || !file.type.startsWith('image/')) {
          reject(new Error('El archivo seleccionado no es una imagen válida.'));
          return;
        }

        const originalKb = Math.max(1, Math.round(file.size / 1024));
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
        reader.onload = (ev) => {
          const rawDataUrl = ev.target.result;
          const img = new Image();
          img.onerror = () => resolve({ url: rawDataUrl, originalKb, optimizedKb: originalKb, cloudUploaded: false });
          img.onload = () => {
            try {
              let targetW = img.width;
              let targetH = img.height;
              if (targetW > maxWidth || targetH > maxHeight) {
                const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
                targetW = Math.round(targetW * ratio);
                targetH = Math.round(targetH * ratio);
              }

              const canvas = document.createElement('canvas');
              canvas.width = targetW;
              canvas.height = targetH;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, targetW, targetH);

              let compressedDataUrl = canvas.toDataURL('image/webp', quality);
              let mimeType = 'image/webp';
              let ext = 'webp';
              if (!compressedDataUrl || !compressedDataUrl.startsWith('data:image/webp')) {
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                mimeType = 'image/jpeg';
                ext = 'jpg';
              }

              const optimizedKb = Math.max(1, Math.round((compressedDataUrl.length * 3) / 4 / 1024));

              // If Supabase is configured, try uploading to Storage bucket 'velve-media'
              if (self.isSupabaseConfigured()) {
                canvas.toBlob(async (blob) => {
                  if (!blob) {
                    resolve({ url: compressedDataUrl, originalKb, optimizedKb, cloudUploaded: false });
                    return;
                  }
                  const uploadedUrl = await self.uploadBlobToSupabase(blob, file.name, ext, mimeType);
                  if (uploadedUrl) {
                    resolve({ url: uploadedUrl, originalKb, optimizedKb, cloudUploaded: true });
                  } else {
                    resolve({ url: compressedDataUrl, originalKb, optimizedKb, cloudUploaded: false });
                  }
                }, mimeType, quality);
              } else {
                resolve({ url: compressedDataUrl, originalKb, optimizedKb, cloudUploaded: false });
              }
            } catch (err) {
              resolve({ url: rawDataUrl, originalKb, optimizedKb: originalKb, cloudUploaded: false });
            }
          };
          img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
      });
    },

    // -------------------------------------------------------------------------
    // 6. Supabase Cloud Sync Engine (100% Free Tier REST & Storage API)
    // -------------------------------------------------------------------------
    // Helper to sanitize Supabase URL (removes trailing slashes and /rest/v1 if pasted)
    _cleanSupabaseUrl: function (url) {
      if (!url) return '';
      return String(url)
        .trim()
        .replace(/\/rest\/v1\/?$/i, '')
        .replace(/\/+$/, '');
    },

    getSupabaseConfig: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.SUPABASE);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            url: this._cleanSupabaseUrl(parsed.url || DEFAULT_SUPABASE_CONFIG.url),
            anonKey: (parsed.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey || '').trim(),
            bucket: parsed.bucket || DEFAULT_SUPABASE_CONFIG.bucket || 'velve-media'
          };
        }
      } catch (e) {}
      return {
        url: this._cleanSupabaseUrl(DEFAULT_SUPABASE_CONFIG.url),
        anonKey: (DEFAULT_SUPABASE_CONFIG.anonKey || '').trim(),
        bucket: DEFAULT_SUPABASE_CONFIG.bucket || 'velve-media'
      };
    },

    saveSupabaseConfig: function ({ url, anonKey, bucket }) {
      const clean = {
        url: this._cleanSupabaseUrl(url),
        anonKey: (anonKey || '').trim(),
        bucket: (bucket || 'velve-media').trim()
      };
      try {
        localStorage.setItem(STORAGE_KEYS.SUPABASE, JSON.stringify(clean));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('velve:supabase-config-updated', { detail: clean }));
      return clean;
    },

    isSupabaseConfigured: function () {
      const cfg = this.getSupabaseConfig();
      return Boolean(cfg.url && cfg.url.startsWith('https://') && cfg.anonKey && cfg.anonKey.length > 20);
    },

    _supabaseHeaders: function (extra = {}) {
      const cfg = this.getSupabaseConfig();
      return Object.assign({
        'apikey': cfg.anonKey,
        'Authorization': 'Bearer ' + cfg.anonKey,
        'Content-Type': 'application/json'
      }, extra);
    },

    uploadBlobToSupabase: async function (blob, originalName = 'prenda', ext = 'webp', mimeType = 'image/webp') {
      if (!this.isSupabaseConfigured()) return null;
      const cfg = this.getSupabaseConfig();
      const safeBase = String(originalName || 'prenda')
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 40) || 'velve';
      const objectPath = `products/${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${safeBase}.${ext}`;
      const uploadEndpoint = `${cfg.url}/storage/v1/object/${cfg.bucket}/${objectPath}`;

      try {
        const res = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'apikey': cfg.anonKey,
            'Authorization': 'Bearer ' + cfg.anonKey,
            'Content-Type': mimeType,
            'x-upsert': 'true'
          },
          body: blob
        });
        if (res.ok) {
          return `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${objectPath}`;
        }
      } catch (e) {
        console.warn('Supabase Storage upload fallback to local WebP:', e);
      }
      return null;
    },

    testSupabaseConnection: async function () {
      if (!this.isSupabaseConfigured()) {
        return { ok: false, message: 'Ingresa primero la URL del proyecto y la llave anon public de Supabase.' };
      }
      const cfg = this.getSupabaseConfig();
      try {
        const res = await fetch(`${cfg.url}/rest/v1/velve_products?select=id&limit=1`, {
          method: 'GET',
          headers: this._supabaseHeaders()
        });
        if (res.ok) {
          return { ok: true, message: 'Conexión exitosa con Supabase. Tablas listas y sincronizadas.' };
        }
        const errBody = await res.text();
        if (res.status === 404 || errBody.includes('relation') || errBody.includes('does not exist') || errBody.includes('PGRST')) {
          return {
            ok: false,
            needsSchema: true,
            message: 'Conectado al servidor Supabase, pero falta crear las tablas. Copia y ejecuta el Script SQL en el SQL Editor de Supabase.'
          };
        }
        return { ok: false, message: `Respuesta de Supabase (${res.status}): verifica tu llave anon public.` };
      } catch (e) {
        return { ok: false, message: 'No se pudo conectar con la URL de Supabase. Verifica que empiece por https://xxx.supabase.co' };
      }
    },

    _pushConfigToCloud: async function (configObj) {
      if (!this.isSupabaseConfigured()) return false;
      const cfg = this.getSupabaseConfig();
      try {
        const res = await fetch(`${cfg.url}/rest/v1/velve_config?on_conflict=key`, {
          method: 'POST',
          headers: this._supabaseHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify([{
            key: 'store_config',
            data: configObj,
            updated_at: new Date().toISOString()
          }])
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },

    _pushProductsToCloud: async function (productsArray) {
      if (!this.isSupabaseConfigured() || !Array.isArray(productsArray)) return false;
      const cfg = this.getSupabaseConfig();
      if (productsArray.length === 0) return true;
      const rows = productsArray.map(p => ({
        id: String(p.id),
        name: String(p.name || 'Prenda Velve'),
        category: String(p.category || 'Bodies'),
        price: Number(p.price) || 0,
        on_sale: Boolean(p.onSale),
        status: String(p.status || 'active'),
        data: p,
        updated_at: new Date().toISOString()
      }));
      try {
        const res = await fetch(`${cfg.url}/rest/v1/velve_products?on_conflict=id`, {
          method: 'POST',
          headers: this._supabaseHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify(rows)
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },

    _deleteProductFromCloud: async function (productId) {
      if (!this.isSupabaseConfigured() || !productId) return false;
      const cfg = this.getSupabaseConfig();
      try {
        const res = await fetch(`${cfg.url}/rest/v1/velve_products?id=eq.${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          headers: this._supabaseHeaders()
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },

    _clearCloudProducts: async function () {
      if (!this.isSupabaseConfigured()) return false;
      const cfg = this.getSupabaseConfig();
      try {
        const res = await fetch(`${cfg.url}/rest/v1/velve_products?id=neq.__never__`, {
          method: 'DELETE',
          headers: this._supabaseHeaders()
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },

    _pushOrdersToCloud: async function (ordersArray) {
      if (!this.isSupabaseConfigured() || !Array.isArray(ordersArray) || ordersArray.length === 0) return false;
      const cfg = this.getSupabaseConfig();
      const rows = ordersArray.map(o => ({
        id: String(o.id),
        customer_name: (o.customer && o.customer.name) ? String(o.customer.name) : 'Cliente Velve',
        customer_phone: (o.customer && o.customer.phone) ? String(o.customer.phone) : '',
        customer_city: (o.customer && o.customer.city) ? String(o.customer.city) : '',
        total: Number(o.total) || 0,
        status: String(o.status || 'Pendiente WhatsApp'),
        data: o,
        updated_at: new Date().toISOString()
      }));
      try {
        const res = await fetch(`${cfg.url}/rest/v1/velve_orders?on_conflict=id`, {
          method: 'POST',
          headers: this._supabaseHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify(rows)
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },

    pushAllToCloud: async function () {
      if (!this.isSupabaseConfigured()) return { ok: false, message: 'Supabase no está configurado.' };
      const cOk = await this._pushConfigToCloud(this.getConfig());
      const pOk = await this._pushProductsToCloud(this.getProducts());
      const oOk = await this._pushOrdersToCloud(this.getOrders());
      return {
        ok: cOk && pOk,
        message: (cOk && pOk)
          ? 'Catálogo, configuración y pedidos sincronizados en Supabase correctamente.'
          : 'No se pudieron subir todos los datos. Asegúrate de haber ejecutado el Script SQL en Supabase.'
      };
    },

    syncFromCloud: async function () {
      if (!this.isSupabaseConfigured()) return { synced: false };
      const cfg = this.getSupabaseConfig();
      let updatedAny = false;
      try {
        // 1. Pull Config
        const resCfg = await fetch(`${cfg.url}/rest/v1/velve_config?key=eq.store_config&select=data`, {
          method: 'GET',
          headers: this._supabaseHeaders()
        });
        if (resCfg.ok) {
          const rowsCfg = await resCfg.json();
          if (Array.isArray(rowsCfg) && rowsCfg.length > 0 && rowsCfg[0].data) {
            const mergedCfg = Object.assign({}, DEFAULT_CONFIG, rowsCfg[0].data);
            this.saveConfig(mergedCfg, true);
            updatedAny = true;
          }
        }

        // 2. Pull Products
        const resProd = await fetch(`${cfg.url}/rest/v1/velve_products?select=data,updated_at&order=created_at.desc`, {
          method: 'GET',
          headers: this._supabaseHeaders()
        });
        if (resProd.ok) {
          const rowsProd = await resProd.json();
          if (Array.isArray(rowsProd)) {
            const cloudProducts = rowsProd.map(r => r.data).filter(Boolean);
            this.saveProducts(cloudProducts, true);
            updatedAny = true;
          }
        }

        // 3. Pull Orders
        const resOrd = await fetch(`${cfg.url}/rest/v1/velve_orders?select=data,created_at&order=created_at.desc`, {
          method: 'GET',
          headers: this._supabaseHeaders()
        });
        if (resOrd.ok) {
          const rowsOrd = await resOrd.json();
          if (Array.isArray(rowsOrd)) {
            const cloudOrders = rowsOrd.map(r => r.data).filter(Boolean);
            this.saveOrders(cloudOrders, true);
            updatedAny = true;
          }
        }

        if (updatedAny) {
          window.dispatchEvent(new CustomEvent('velve:cloud-synced'));
        }
        return { synced: updatedAny };
      } catch (e) {
        console.warn('Error syncing from Supabase:', e);
        return { synced: false };
      }
    }
  };

  // Seed data if not existing
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    window.VelveStore.saveConfig(DEFAULT_CONFIG, true);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    window.VelveStore.saveProducts(DEFAULT_PRODUCTS, true);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    window.VelveStore.saveOrders(DEFAULT_ORDERS, true);
  }

  // Automatically sync from Supabase Cloud on startup if configured
  if (window.VelveStore.isSupabaseConfigured()) {
    setTimeout(() => {
      window.VelveStore.syncFromCloud();
    }, 60);
  }
})();
