/**
 * VELVE — Official Catalog Seed & Brand Presets
 * El inventario del proveedor anterior ha sido eliminado por completo (0 referencias iniciales).
 * El administrador puede ingresar sus publicaciones paso a paso (foto por foto con variaciones)
 * o mediante carga masiva CSV / Excel / JSON desde el Panel de Administración.
 */

window.VELVE_CATALOG_DATA = [];

/**
 * Paleta oficial de tonos VELVE (Quiet Luxury Tone-on-Tone) + Tonos Complementarios
 * Disponible en el Estudio de Publicación Ágil del Administrador.
 */
window.VELVE_OFFICIAL_TONES = [
  { name: 'Obsidian Velvet (Negro)', hex: '#161514', style: 'background-color: #161514;' },
  { name: 'Alabaster Silk (Marfil)', hex: '#FAF8F5', style: 'background-color: #FAF8F5;' },
  { name: 'Raw Cashmere (Greige)', hex: '#D8D0C5', style: 'background-color: #D8D0C5;' },
  { name: 'Warm Sand (Nude II)', hex: '#B69B84', style: 'background-color: #B69B84;' },
  { name: 'Deep Espresso (Café)', hex: '#4A3B32', style: 'background-color: #4A3B32;' },
  { name: 'Vino Tinto Nocturne', hex: '#5B2C38', style: 'background-color: #5B2C38;' },
  { name: 'Oliva Studio', hex: '#4A5546', style: 'background-color: #4A5546;' },
  { name: 'Azul Medianoche', hex: '#1E293B', style: 'background-color: #1E293B;' },
  { name: 'Terracota Suave', hex: '#9A5B4A', style: 'background-color: #9A5B4A;' },
  { name: 'Gris Bruma', hex: '#9CA3AF', style: 'background-color: #9CA3AF;' }
];

/**
 * Plantilla de ejemplo para Carga Masiva (CSV / JSON)
 * Muestra cómo configurar tanto prendas de Talla Única Parametrizable (ej. S a L)
 * como prendas con tallas específicas seleccionables, agrupando variaciones por SKU.
 */
window.VELVE_BULK_TEMPLATE_SAMPLE = [
  {
    sku: 'VEL-BODY-001',
    nombre: 'Body Sculpt Cuello Square Seamless',
    categoria: 'Bodies',
    precio: 145000,
    precio_anterior: 180000,
    badge: 'Bestseller',
    modo_talla: 'unica',
    talla_unica_rango: 'S a L',
    tallas_habilitadas: 'Talla Única (S a L)',
    color_nombre: 'Obsidian Velvet',
    color_hex: '#161514',
    stock_color: 20,
    foto_color: 'assets/images/velve_capsule_trio.jpg',
    foto_hover: 'assets/images/velve_textile_atelier.jpg',
    stock_xs: 0,
    stock_s: 0,
    stock_m: 0,
    stock_l: 0,
    descripcion: 'Body arquitectónico sin costuras de tacto segunda piel. Tejido de alta elongación pensado para adaptarse de la talla S a la L.',
    composicion: '82% Microfibra de Poliamida 6.6, 18% Elastano Lycra® de recuperación inteligente.'
  },
  {
    sku: 'VEL-BODY-001',
    nombre: 'Body Sculpt Cuello Square Seamless',
    categoria: 'Bodies',
    precio: 145000,
    precio_anterior: 180000,
    badge: 'Bestseller',
    modo_talla: 'unica',
    talla_unica_rango: 'S a L',
    tallas_habilitadas: 'Talla Única (S a L)',
    color_nombre: 'Warm Sand',
    color_hex: '#B69B84',
    stock_color: 15,
    foto_color: 'assets/images/hero_model.jpg',
    foto_hover: 'assets/images/velve_textile_atelier.jpg',
    stock_xs: 0,
    stock_s: 0,
    stock_m: 0,
    stock_l: 0,
    descripcion: 'Body arquitectónico sin costuras de tacto segunda piel. Tejido de alta elongación pensado para adaptarse de la talla S a la L.',
    composicion: '82% Microfibra de Poliamida 6.6, 18% Elastano Lycra® de recuperación inteligente.'
  },
  {
    sku: 'VEL-ENTERIZO-002',
    nombre: 'Enterizo Studio Segunda Piel',
    categoria: 'Enterizos Largos',
    precio: 189000,
    precio_anterior: 235000,
    badge: 'Sale -20%',
    modo_talla: 'multiple',
    talla_unica_rango: '',
    tallas_habilitadas: 'S,M,L',
    color_nombre: 'Deep Espresso',
    color_hex: '#4A3B32',
    stock_color: 18,
    foto_color: 'assets/images/blazer_transition.jpg',
    foto_hover: 'assets/images/evening_noir.jpg',
    stock_xs: 0,
    stock_s: 6,
    stock_m: 7,
    stock_l: 5,
    descripcion: 'Enterizo de línea continua con elongación en 4 direcciones y soporte invisible.',
    composicion: '80% Poliamida Microfibra Mate, 20% Elastano.'
  }
];
