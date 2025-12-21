// Nebula animation implementation
// Exposes: NebulaAnimation(canvas, text)
class NebulaStar {
    constructor(x, y, radius = 3, isLetter = false) {
        this.x = x;
        this.y = y;
        this.baseRadius = radius;
        this.isLetter = !!isLetter;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.0008 + Math.random() * 0.0012;
        this.orbit = Math.random() * 6;
        // letters should be a bit brighter by default
        this.opacity = this.isLetter ? (0.85 + Math.random() * 0.15) : (0.55 + Math.random() * 0.35);
    }

    draw(ctx, t) {
        const ox = Math.cos(this.angle + t * this.speed) * this.orbit;
        const oy = Math.sin(this.angle + t * this.speed) * this.orbit;
        const drawX = this.x + ox;
        const drawY = this.y + oy;
        const pulse = 1 + Math.sin(t * 0.002 + this.angle) * 0.15;
        const r = Math.max(1, this.baseRadius * pulse);

    // Soft glow (smaller for letter stars so letters remain legible)
    const glowMult = this.isLetter ? 3.2 : 6;
    const midStop = this.isLetter ? 0.28 : 0.4;
    const midOpacityFactor = this.isLetter ? 0.45 : 0.35;

    const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, r * glowMult);
    g.addColorStop(0, `rgba(255,255,255,${this.opacity})`);
    g.addColorStop(midStop, `rgba(169,85,247,${this.opacity * midOpacityFactor})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(drawX, drawY, r * glowMult, 0, Math.PI * 2);
    ctx.fill();

    // Core (letters get slightly brighter, smaller core to avoid bulge)
    ctx.beginPath();
    const coreRadius = this.isLetter ? Math.max(0.8, r * 0.9) : r;
    ctx.arc(drawX, drawY, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.isLetter ? `rgba(255,255,240,${Math.min(1, this.opacity + 0.15)})` : `rgba(255,255,255,${Math.min(1, this.opacity + 0.1)})`;
    ctx.fill();
    }
}

class NebulaAnimation {
    constructor(canvas, text = 'Safa') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.text = text;
        this.stars = [];
        this.centers = [];
        this.t0 = null;
        this.running = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // regenerate positions when resized
        this._generate();
    }

    _generate() {
        this.stars.length = 0;
        this.centers.length = 0;

        const ctx = this.ctx;
        const canvas = this.canvas;
        const fontSize = Math.max(72, Math.min(320, Math.floor(canvas.width / 6)));
        const letterSpacing = Math.floor(fontSize * 0.35);

        // Use a temporary canvas to render the text and sample pixels
        const text = this.text.toUpperCase();
        const temp = document.createElement('canvas');
        const tctx = temp.getContext('2d');

        // Make temp canvas large enough for high-res sampling
        tctx.font = `bold ${fontSize}px Arial Black`;
        const textWidth = Math.ceil(tctx.measureText(text).width);
        temp.width = textWidth + 40;
        temp.height = Math.ceil(fontSize * 1.2);

        // center and draw text in white on temp canvas
        tctx.clearRect(0, 0, temp.width, temp.height);
        tctx.fillStyle = 'white';
        tctx.font = `bold ${fontSize}px Arial Black`;
        tctx.textAlign = 'center';
        tctx.textBaseline = 'middle';
        tctx.fillText(text, temp.width / 2, temp.height / 2);

        // sampling parameters: higher value => more spacing between stars
        const sampleRate = Math.max(4, Math.floor(fontSize / 12));
        const alphaThreshold = 150;

        // Map temp canvas pixels to main canvas centered position
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const offsetX = centerX - temp.width / 2;
        const offsetY = centerY - temp.height / 2;

        const img = tctx.getImageData(0, 0, temp.width, temp.height).data;
        let placed = 0;
        const maxLetterStars = 1200; // safety cap

        for (let y = 0; y < temp.height; y += sampleRate) {
            for (let x = 0; x < temp.width; x += sampleRate) {
                const i = (y * temp.width + x) * 4;
                if (img[i + 3] > alphaThreshold) {
                    // map to main canvas
                    const px = offsetX + x + (Math.random() * sampleRate - sampleRate / 2);
                    const py = offsetY + y + (Math.random() * sampleRate - sampleRate / 2);
                    // small stars that outline the letter
                    this.stars.push(new NebulaStar(px, py, 1 + Math.random() * 1.6, true));
                    placed++;
                    if (placed > maxLetterStars) break;
                }
            }
            if (placed > maxLetterStars) break;
        }

        // Create nebula cloud centers per letter for background glow
        ctx.font = `bold ${fontSize}px Arial Black`;
        const perLetterWidth = textWidth / text.length;
        const startX = centerX - textWidth / 2 + perLetterWidth / 2;
        for (let i = 0; i < text.length; i++) {
            const lx = startX + i * (perLetterWidth + letterSpacing);
            const ly = centerY;
            this.centers.push({ x: lx, y: ly });
        }

        // Add some distant background stars for depth
        const bgCount = Math.floor((canvas.width * canvas.height) / 140000);
        for (let i = 0; i < bgCount; i++) {
            const bx = Math.random() * canvas.width;
            const by = Math.random() * canvas.height;
            this.stars.push(new NebulaStar(bx, by, 0.6 + Math.random() * 1.0));
        }
    }

    _drawNebula(t) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // soft clear with slight fade to preserve motion
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw colored nebulas around each center
        this.centers.forEach((c, i) => {
            const hue = 260 - i * 20;
            for (let layer = 0; layer < 3; layer++) {
                const radius = (120 + layer * 40) + Math.sin(t * 0.001 + i + layer) * 18;
                const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius);
                // make nebula clouds a bit subtler so letter stars stand out
                const alpha = 0.04 + layer * 0.015;
                grad.addColorStop(0, `hsla(${hue}, 80%, ${55 - layer * 6}%, ${alpha})`);
                grad.addColorStop(0.6, `hsla(${hue + 20}, 70%, ${45 - layer * 6}%, ${alpha * 0.6})`);
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        });

        // faint text outline behind stars to aid readability
        ctx.save();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.font = `bold ${Math.max(72, Math.min(220, Math.floor(canvas.width / 6)))}px Arial Black`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillText(this.text.toUpperCase(), centerX, centerY);
        ctx.restore();



        // draw stars (letter stars are smaller/brighter now)
        this.stars.forEach(s => s.draw(ctx, t));

        // optional soft vignette to emphasize center
        ctx.save();
        const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width / 4, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.2);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.t0 = null;
        this._generate();
        requestAnimationFrame(ts => this._frame(ts));
    }

    stop() {
        this.running = false;
    }

    _frame(ts) {
        if (!this.running) return;
        if (!this.t0) this.t0 = ts;
        const t = ts - this.t0;
        this._drawNebula(t);
        requestAnimationFrame(s => this._frame(s));
    }
}

// expose class name expected by index.html (NebulaAnimation)
window.NebulaAnimation = NebulaAnimation;
