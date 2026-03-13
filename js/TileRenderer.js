/**
 * TileRenderer - Generates polished tile textures with gradients, shadows, and highlights
 * Uses Canvas 2D API to create Phaser textures for each tile type/value
 */
class TileRenderer {
  constructor(scene) {
    this.scene = scene;
    this.generatedSize = 0;
  }

  /**
   * Generate all tile textures at the given size
   * Call this in GameScene.create() and on resize
   */
  generateTextures(tileSize) {
    if (this.generatedSize === tileSize) return;
    this.generatedSize = tileSize;

    // Normal tile values
    const values = [1, 2, 3, 6, 12, 24, 48, 96, 192, 384, 768, 1536, 3072];
    values.forEach(v => {
      this._generateNormalTile(v, tileSize);
    });

    // Special tiles
    this._generateSteelTile(tileSize);
    this._generateLeadTile(tileSize);
    this._generateGlassTile(tileSize, 2); // durability 2
    this._generateGlassTile(tileSize, 1); // durability 1 (cracked)
    this._generateWildcardTile(tileSize);
    this._generateAutoSwapperTile(tileSize);
    this._generateBombTile(tileSize);
  }

  /**
   * Get the texture key for a tile
   */
  getKey(value, tileType = 'normal', specialData = {}) {
    switch (tileType) {
      case 'steel': return 'tile_steel';
      case 'lead': return 'tile_lead';
      case 'glass': return specialData.durability === 1 ? 'tile_glass_1' : 'tile_glass_2';
      case 'wildcard': return 'tile_wildcard';
      case 'auto_swapper': return 'tile_auto_swapper';
      case 'bomb': return 'tile_bomb';
      default: return `tile_${value}`;
    }
  }

  // ---- Helper drawing functions ----

  _getCanvas(key, size) {
    // Remove old texture if it exists
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    const canvasTexture = this.scene.textures.createCanvas(key, size, size);
    const ctx = canvasTexture.getContext();
    return { canvasTexture, ctx };
  }

  _roundRectPath(ctx, x, y, w, h, r) {
    if (typeof r === 'number') r = { tl: r, tr: r, bl: r, br: r };
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
  }

  _roundRect(ctx, x, y, w, h, r, fill, stroke) {
    this._roundRectPath(ctx, x, y, w, h, r);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  _hexToRgb(hex) {
    if (typeof hex === 'number') {
      return {
        r: (hex >> 16) & 0xff,
        g: (hex >> 8) & 0xff,
        b: hex & 0xff
      };
    }
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  _colorToCSS(color) {
    if (typeof color === 'string') return color;
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    return `rgb(${r},${g},${b})`;
  }

  _darken(color, amt) {
    const c = this._hexToRgb(color);
    return `rgb(${Math.max(0,c.r-amt)},${Math.max(0,c.g-amt)},${Math.max(0,c.b-amt)})`;
  }

  _lighten(color, amt) {
    const c = this._hexToRgb(color);
    return `rgb(${Math.min(255,c.r+amt)},${Math.min(255,c.g+amt)},${Math.min(255,c.b+amt)})`;
  }

  // ---- Normal Tile ----
  _generateNormalTile(value, tileSize) {
    const key = `tile_${value}`;
    const pad = 8; // padding for shadow
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;
    const color = getTileColor(value);
    const colorCSS = this._colorToCSS(color);

    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = colorCSS;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Gradient overlay for depth
    const grad = ctx.createLinearGradient(cx - h, cy - h, cx - h, cy + h);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.03)');
    grad.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);

    // Inner highlight (top edge)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - h + r + 2, cy - h + 1.5);
    ctx.lineTo(cx + h - r - 2, cy - h + 1.5);
    ctx.stroke();

    // Bottom edge shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - h + r + 2, cy + h - 1);
    ctx.lineTo(cx + h - r - 2, cy + h - 1);
    ctx.stroke();

    // Border
    ctx.strokeStyle = this._darken(color, 30);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, false, true);
    ctx.globalAlpha = 1;

    canvasTexture.refresh();
  }

  // ---- Steel Tile ----
  _generateSteelTile(tileSize) {
    const key = 'tile_steel';
    const pad = 8;
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    const grad = ctx.createLinearGradient(cx - h, cy - h, cx - h, cy + h);
    grad.addColorStop(0, '#b0bec5');
    grad.addColorStop(0.3, '#8899a6');
    grad.addColorStop(0.7, '#6d7a85');
    grad.addColorStop(1, '#546570');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Crosshatch
    ctx.save();
    ctx.beginPath();
    this._roundRectPath(ctx, cx - h, cy - h, s, s, r);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = -s; i < s * 2; i += 8) {
      ctx.beginPath();
      ctx.moveTo(cx - h + i, cy - h);
      ctx.lineTo(cx - h + i - s, cy + h);
      ctx.stroke();
    }
    ctx.restore();

    // Top highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - h + r + 2, cy - h + 1.5);
    ctx.lineTo(cx + h - r - 2, cy - h + 1.5);
    ctx.stroke();

    canvasTexture.refresh();
  }

  // ---- Lead Tile ----
  _generateLeadTile(tileSize) {
    const key = 'tile_lead';
    const pad = 8;
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    const grad = ctx.createRadialGradient(cx - 8, cy - 8, 5, cx, cy, h * 1.2);
    grad.addColorStop(0, '#5a5a5a');
    grad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Inner glow
    const glow = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, h);
    glow.addColorStop(0, 'rgba(255,255,255,0.12)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);

    canvasTexture.refresh();
  }

  // ---- Glass Tile ----
  _generateGlassTile(tileSize, durability) {
    const key = `tile_glass_${durability}`;
    const pad = 8;
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    ctx.shadowColor = 'rgba(100,180,220,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    const grad = ctx.createLinearGradient(cx - h, cy - h, cx + h, cy + h);
    grad.addColorStop(0, '#d4eaf5');
    grad.addColorStop(0.5, '#b8d4e8');
    grad.addColorStop(1, '#9cc0da');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Shine streak
    ctx.save();
    ctx.beginPath();
    this._roundRectPath(ctx, cx - h, cy - h, s, s, r);
    ctx.clip();
    const shine = ctx.createLinearGradient(cx - h - 10, cy - h, cx + h - 10, cy + h);
    shine.addColorStop(0, 'rgba(255,255,255,0)');
    shine.addColorStop(0.35, 'rgba(255,255,255,0)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    shine.addColorStop(0.65, 'rgba(255,255,255,0)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(cx - h, cy - h, s, s);

    // Crack lines for durability 1
    if (durability === 1) {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 15);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + 10, cy - 5);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 5, cy + 12);
      ctx.moveTo(cx - 8, cy + 10);
      ctx.lineTo(cx, cy);
      ctx.stroke();
    }
    ctx.restore();

    // Border
    ctx.strokeStyle = 'rgba(100,180,220,0.5)';
    ctx.lineWidth = 1.5;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, false, true);

    canvasTexture.refresh();
  }

  // ---- Wildcard Tile ----
  _generateWildcardTile(tileSize) {
    const key = 'tile_wildcard';
    const pad = 8;
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    ctx.shadowColor = 'rgba(200,140,240,0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    const grad = ctx.createLinearGradient(cx - h, cy - h, cx + h, cy + h);
    grad.addColorStop(0, '#e8bcf8');
    grad.addColorStop(0.5, '#dba4eb');
    grad.addColorStop(1, '#c88de0');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Sparkles
    ctx.save();
    ctx.beginPath();
    this._roundRectPath(ctx, cx - h, cy - h, s, s, r);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    [[cx-12,cy-14,2.5],[cx+15,cy-8,2],[cx-8,cy+12,1.5],[cx+10,cy+15,2],[cx+5,cy-5,1.5]].forEach(([sx,sy,sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Star text
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(tileSize * 0.43)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2605', cx, cy + 2);
    ctx.shadowColor = 'transparent';

    canvasTexture.refresh();
  }

  // ---- Auto-Swapper Tile ----
  _generateAutoSwapperTile(tileSize) {
    const key = 'tile_auto_swapper';
    const pad = 8;
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    ctx.shadowColor = 'rgba(140,100,180,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    const grad = ctx.createLinearGradient(cx - h, cy - h, cx + h, cy + h);
    grad.addColorStop(0, '#bfa0d8');
    grad.addColorStop(0.5, '#a78dc2');
    grad.addColorStop(1, '#9078aa');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Top highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - h + r + 2, cy - h + 1.5);
    ctx.lineTo(cx + h - r - 2, cy - h + 1.5);
    ctx.stroke();

    // Swap arrows (positioned in top portion so number can sit below)
    const arrowY = cy - h * 0.35;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 7, arrowY, 7, Math.PI * 0.3, Math.PI * 1.2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 7, arrowY, 7, Math.PI * 1.3, Math.PI * 2.2, false);
    ctx.stroke();

    // Arrowheads
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(cx - 11, arrowY - 5);
    ctx.lineTo(cx - 7, arrowY - 9);
    ctx.lineTo(cx - 5, arrowY - 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 11, arrowY + 5);
    ctx.lineTo(cx + 7, arrowY + 9);
    ctx.lineTo(cx + 5, arrowY + 3);
    ctx.fill();

    canvasTexture.refresh();
  }

  // ---- Bomb Tile ----
  _generateBombTile(tileSize) {
    const key = 'tile_bomb';
    const pad = 8;
    const totalSize = tileSize + pad * 2;
    const { canvasTexture, ctx } = this._getCanvas(key, totalSize);

    const s = tileSize - 4;
    const h = s / 2;
    const r = 10;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    ctx.shadowColor = 'rgba(200,60,60,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    const grad = ctx.createRadialGradient(cx - 5, cy - 5, 5, cx, cy, h * 1.2);
    grad.addColorStop(0, '#f08080');
    grad.addColorStop(1, '#c04040');
    ctx.fillStyle = grad;
    this._roundRect(ctx, cx - h, cy - h, s, s, r, true, false);
    ctx.shadowColor = 'transparent';

    // Fuse
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - h + 8);
    ctx.quadraticCurveTo(cx + 12, cy - h - 2, cx + 16, cy - h + 4);
    ctx.stroke();

    // Spark glow
    const sparkGrad = ctx.createRadialGradient(cx + 16, cy - h + 3, 0, cx + 16, cy - h + 3, 6);
    sparkGrad.addColorStop(0, 'rgba(255,255,0,0.9)');
    sparkGrad.addColorStop(0.5, 'rgba(255,140,0,0.6)');
    sparkGrad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = sparkGrad;
    ctx.beginPath();
    ctx.arc(cx + 16, cy - h + 3, 6, 0, Math.PI * 2);
    ctx.fill();

    canvasTexture.refresh();
  }
}

// Global instance - initialized per scene
let tileRenderer = null;
