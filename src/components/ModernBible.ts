// ModernBible.ts
export class ModernBible {
    private container!: HTMLElement;
    private bible!: HTMLElement;
    private cover!: HTMLElement;
    private pages!: HTMLElement;
    private styleElement!: HTMLStyleElement;

    private isOpen = false;
    private animationId: number | null = null;
    private startTime = Date.now();
    private mouseEnterHandler!: () => void;
    private mouseLeaveHandler!: () => void;

    private floatHeight = 18;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;
        this.injectStyles();
        this.createBible();
        this.attachEvents();
        this.animate();
    }

    /* ---------------- STYLES ---------------- */
    private injectStyles(): void {
        this.styleElement = document.createElement('style');
        this.styleElement.textContent = `
        .modern-bible-container {
            perspective: 1400px;
            width: 300px;
            height: 400px;
            margin: auto;
        }

        .modern-bible {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transform: rotateY(-15deg);
            cursor: pointer;
        }

        /* COVER — NO TRANSITION */
        .bible-cover {
            position: absolute;
            inset: 0;
            background: linear-gradient(145deg,#050505,#111);
            border-radius: 14px 22px 22px 14px;
            border-right: 18px solid #000;
            transform-origin: left center;
            transform: translateZ(44px) rotateY(0deg);
            z-index: 5;
        }

        /* PAGES — TRANSPARENT */
        .bible-pages {
            position: absolute;
            inset: 3%;
            background: transparent; /* 🔥 removed white background */
            transform: translateZ(20px);
            border-radius: 10px 18px 18px 10px;
            z-index: 3;
            overflow: hidden;
        }

        .page-content {
            position: absolute;
            inset: 30px;
            font-family: Georgia, serif;
            color: #333;
            opacity: 1; /* 🔥 never hidden */
        }

        .page-content h2 {
            text-align: center;
            color: #8B4513;
            margin-bottom: 16px;
            border-bottom: 2px solid #D4A76A;
            padding-bottom: 6px;
        }

        .page-content p {
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 14px;
            text-align: justify;
        }

        .verse {
            font-style: italic;
            color: #5D4037;
            border-left: 3px solid #D4A76A;
            padding-left: 12px;
            margin: 12px 0;
        }

        .bible-side {
            position: absolute;
            width: 38px;
            height: 94%;
            right: -38px;
            top: 3%;
            background: linear-gradient(to right,#000,#222);
            transform-origin: left;
            transform: rotateY(90deg);
        }

        .bible-top {
            position: absolute;
            width: 100%;
            height: 38px;
            top: -38px;
            background: linear-gradient(to bottom,#000,#222);
            transform-origin: bottom;
            transform: rotateX(90deg);
        }

        .cross-container {
            width: 90px;
            height: 130px;
            margin: 60px auto 20px;
            position: relative;
        }

        .cross-vertical {
            position: absolute;
            width: 20px;
            height: 120px;
            background: gold;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 10px;
        }

        .cross-horizontal {
            position: absolute;
            width: 80px;
            height: 20px;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: gold;
            border-radius: 10px;
        }

        .bible-title {
            text-align: center;
            font-size: 2.4rem;
            color: gold;
            font-family: 'Times New Roman', serif;
            margin-top: 10px;
            text-shadow: 0 0 20px rgba(255,215,0,.7);
        }
        `;
        document.head.appendChild(this.styleElement);
    }

    /* ---------------- DOM ---------------- */
    private createBible(): void {
        this.container.className = 'modern-bible-container';

        this.bible = document.createElement('div');
        this.bible.className = 'modern-bible';

        this.cover = document.createElement('div');
        this.cover.className = 'bible-cover';

        const cross = document.createElement('div');
        cross.className = 'cross-container';
        cross.innerHTML = `
            <div class="cross-vertical"></div>
            <div class="cross-horizontal"></div>
        `;

        const title = document.createElement('div');
        title.className = 'bible-title';
        title.textContent = 'HOLY BIBLE';

        this.cover.append(cross, title);

        this.pages = document.createElement('div');
        this.pages.className = 'bible-pages';

        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        pageContent.innerHTML = `
            <h2>John 3:16</h2>

            <p>
                "For God so loved the world that he gave his one and only Son,
                that whoever believes in him shall not perish but have eternal life."
            </p>

            <div class="verse">
                "The Lord is my shepherd, I lack nothing."<br>
                <span style="font-size:0.9rem;color:#777;">- Psalm 23:1</span>
            </div>

            <p>
                Trust in the Lord with all your heart and lean not on your own
                understanding; in all your ways submit to him, and he will make
                your paths straight.
            </p>

            <div class="verse">
                "I can do all things through Christ who strengthens me."<br>
                <span style="font-size:0.9rem;color:#777;">- Philippians 4:13</span>
            </div>
        `;

        this.pages.appendChild(pageContent);

        this.bible.append(
            this.cover,
            this.pages,
            Object.assign(document.createElement('div'), { className: 'bible-side' }),
            Object.assign(document.createElement('div'), { className: 'bible-top' })
        );

        this.container.appendChild(this.bible);
    }

    /* ---------------- EVENTS ---------------- */
    private attachEvents(): void {
        this.mouseEnterHandler = () => this.open();
        this.mouseLeaveHandler = () => this.close();
        this.bible.addEventListener('mouseenter', this.mouseEnterHandler);
        this.bible.addEventListener('mouseleave', this.mouseLeaveHandler);
    }

    /* ---------------- FLOAT ---------------- */
    private animate(): void {
        const t = (Date.now() - this.startTime) / 1000;
        if (!this.isOpen) {
            this.bible.style.transform =
                `rotateY(-15deg) translateY(${Math.sin(t) * this.floatHeight}px)`;
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /* ---------------- BOOK ACTIONS ---------------- */
    private open(): void {
        this.isOpen = true;

        this.cover.animate(
            [
                { transform: 'translateZ(44px) rotateY(0deg)' },
                { transform: 'translateZ(44px) rotateY(-65deg)' }
            ],
            { duration: 600, easing: 'ease-out', fill: 'forwards' }
        );

        this.pages.style.transform = 'translateZ(20px) translateX(12px)';
    }

    private close(): void {
        this.isOpen = false;

        this.cover.animate(
            [
                { transform: 'translateZ(44px) rotateY(-65deg)' },
                { transform: 'translateZ(44px) rotateY(0deg)' }
            ],
            { duration: 600, easing: 'ease-in', fill: 'forwards' }
        );

        this.pages.style.transform = 'translateZ(20px)';
    }

    destroy(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.bible.removeEventListener('mouseenter', this.mouseEnterHandler);
        this.bible.removeEventListener('mouseleave', this.mouseLeaveHandler);
        if (this.container.contains(this.bible)) {
            this.container.removeChild(this.bible);
        }
        if (this.styleElement && document.head.contains(this.styleElement)) {
            document.head.removeChild(this.styleElement);
        }
    }
}
