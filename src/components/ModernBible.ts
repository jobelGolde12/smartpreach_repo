// ModernBible.ts
export class ModernBible {
    private container!: HTMLElement;
    private bible!: HTMLElement;
    private cover!: HTMLElement;
    private pages!: HTMLElement;
    private styleElement: HTMLStyleElement | null = null;
    private isOpen = false;
    private animationId: number | null = null;
    private isAnimating = true;
    private startTime = Date.now();
    
    // Animation parameters
    private floatSpeed = 0.003;
    private rotateSpeed = 0.0;
    private floatHeight = 40;
    private rotateRange = 0;
    
    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        
        this.initializeStyles();
        this.createBible();
        this.setupEventListeners();
        this.animate();
    }
    
    private initializeStyles(): void {
        this.styleElement = document.createElement('style');
        this.styleElement.textContent = `
            .modern-bible-container {
                perspective: 1500px;
                width: 380px;
                height: 520px;
                margin: 0 auto;
                position: relative;
                z-index: 998;
            }

            .modern-bible {
                width: 100%;
                height: 100%;
                position: relative;
                transform-style: preserve-3d;
                transform: rotateY(-15deg);
                transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                cursor: pointer;
            }

            .bible-cover {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(145deg, #050505, #111111, #050505);
                border-radius: 16px 28px 28px 16px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                border-right: 15px solid #000;
                transform-origin: left center;
                transform: translateZ(35px) rotateY(0deg);
                transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                overflow: hidden;
                z-index: 3;
            }

            .bible-cover::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background:
                    radial-gradient(circle at 30% 20%, rgba(255,215,0,0.05) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(255,165,0,0.03) 0%, transparent 50%);
                pointer-events: none;
            }

            .bible-cover::after {
                content: '';
                position: absolute;
                top: 10px;
                left: 10px;
                right: 25px;
                bottom: 10px;
                border: 2px solid rgba(255, 215, 0, 0.15);
                border-radius: 10px 22px 22px 10px;
                pointer-events: none;
            }

            .cross-container {
                width: 120px;
                height: 160px;
                position: relative;
                margin-top: 80px;
                margin-bottom: 50px;
            }

            .cross-vertical {
                position: absolute;
                width: 22px;
                height: 150px;
                background: linear-gradient(to bottom,
                    rgba(255, 223, 0, 0.95),
                    rgba(255, 195, 0, 0.95),
                    rgba(255, 223, 0, 0.95));
                left: 50%;
                transform: translateX(-50%);
                border-radius: 12px;
                top: 15px;
            }

            .cross-vertical::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to right,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent);
                border-radius: 12px;
            }

            .cross-horizontal {
                position: absolute;
                width: 90px;
                height: 22px;
                background: linear-gradient(to right,
                    rgba(255, 223, 0, 0.95),
                    rgba(255, 195, 0, 0.95),
                    rgba(255, 223, 0, 0.95));
                top: 65px;
                left: 50%;
                transform: translateX(-50%);
                border-radius: 12px;
            }

            .cross-horizontal::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to bottom,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent);
                border-radius: 12px;
            }

            .bible-title {
                font-size: 3.4rem;
                font-weight: 400;
                color: #FFD700;
                text-shadow:
                    0 0 25px rgba(255, 215, 0, 0.9),
                    0 0 50px rgba(255, 215, 0, 0.5);
                letter-spacing: 4px;
                font-family: 'Times New Roman', serif;
                position: relative;
                padding: 15px 30px;
                background: linear-gradient(to right,
                    transparent,
                    rgba(255, 215, 0, 0.08) 20%,
                    rgba(255, 215, 0, 0.15) 50%,
                    rgba(255, 215, 0, 0.08) 80%,
                    transparent);
                border-radius: 6px;
                margin-top: 10px;
            }

            .bible-pages {
                position: absolute;
                width: 95%;
                height: 96%;
                background: linear-gradient(90deg,
                    #f8f8f8 0%, #fefefe 5%, #f5f5f5 10%, #fefefe 15%,
                    #f8f8f8 20%, #fefefe 25%, #f5f5f5 30%, #fefefe 35%,
                    #f8f8f8 40%, #fefefe 45%, #f5f5f5 50%, #fefefe 55%,
                    #f8f8f8 60%, #fefefe 65%, #f5f5f5 70%, #fefefe 75%,
                    #f8f8f8 80%, #fefefe 85%, #f5f5f5 90%, #fefefe 95%,
                    #f8f8f8 100%);
                border-radius: 12px 22px 22px 12px;
                left: 0;
                transform: translateZ(12px);
                overflow: hidden;
                z-index: 2;
                transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .page-edge {
                position: absolute;
                width: 100%;
                height: 100%;
                background: repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 4px,
                    rgba(0, 0, 0, 0.07) 4px,
                    rgba(0, 0, 0, 0.07) 7px
                );
                border-radius: 12px 22px 22px 12px;
            }

            .page-content {
                position: absolute;
                top: 50px;
                left: 50px;
                right: 50px;
                bottom: 50px;
                font-family: 'Georgia', serif;
                color: #333;
                opacity: 0;
                transition: opacity 0.8s ease;
                pointer-events: none;
            }

            .page-content h2 {
                font-size: 1.8rem;
                color: #8B4513;
                margin-bottom: 25px;
                text-align: center;
                border-bottom: 2px solid #D4A76A;
                padding-bottom: 10px;
            }

            .page-content p {
                font-size: 1.1rem;
                line-height: 1.8;
                margin-bottom: 20px;
                text-align: justify;
            }

            .page-content .verse {
                font-style: italic;
                color: #5D4037;
                padding-left: 20px;
                border-left: 3px solid #D4A76A;
                margin: 15px 0;
            }

            .bible-side {
                position: absolute;
                width: 30px;
                height: 96%;
                background: linear-gradient(to right,
                    #000,
                    #1a1a1a,
                    #000);
                right: -30px;
                top: 2%;
                transform-origin: left;
                transform: rotateY(90deg);
                border-radius: 0 8px 8px 0;
                z-index: 1;
            }

            .bible-top {
                position: absolute;
                width: 100%;
                height: 30px;
                background: linear-gradient(to bottom,
                    #000,
                    #1a1a1a,
                    #000);
                top: -30px;
                transform-origin: bottom;
                transform: rotateX(90deg);
                border-radius: 16px 16px 0 0;
                z-index: 1;
            }

            .shine-effect {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 45%;
                background: linear-gradient(
                    to bottom,
                    rgba(255, 255, 255, 0.12) 0%,
                    rgba(255, 255, 255, 0.08) 25%,
                    rgba(255, 255, 255, 0.04) 50%,
                    transparent 100%
                );
                border-radius: 16px 28px 0 0;
                pointer-events: none;
                z-index: 2;
            }

            .corner-decoration {
                position: absolute;
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 215, 0, 0.25);
                border-radius: 10px;
                z-index: 3;
            }

            .corner-tl {
                top: 25px;
                left: 25px;
                border-right: none;
                border-bottom: none;
            }

            .corner-tr {
                top: 25px;
                right: 40px;
                border-left: none;
                border-bottom: none;
            }

            .corner-bl {
                bottom: 25px;
                left: 25px;
                border-right: none;
                border-top: none;
            }

            .corner-br {
                bottom: 25px;
                right: 40px;
                border-left: none;
                border-top: none;
            }

            .page-marker {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 100px;
                background: linear-gradient(to bottom, #D4A76A, #8B4513, #D4A76A);
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.5s ease;
            }



            @media (max-width: 768px) {
                .modern-bible-container {
                    width: 300px;
                    height: 420px;
                }

                .bible-title {
                    font-size: 2.5rem;
                }

                .cross-container {
                    margin-top: 50px;
                    width: 90px;
                    height: 130px;
                }

                .cross-vertical {
                    height: 120px;
                    width: 18px;
                }

                .cross-horizontal {
                    width: 70px;
                    height: 18px;
                    top: 55px;
                }

                .page-content {
                    top: 30px;
                    left: 30px;
                    right: 30px;
                    bottom: 30px;
                }

                .page-content h2 {
                    font-size: 1.4rem;
                }

                .page-content p {
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(this.styleElement);
    }
    
    private createBible(): void {
        this.container.className = 'modern-bible-container';
        
        this.bible = document.createElement('div');
        this.bible.className = 'modern-bible';
        
        // Create the cover
        this.cover = document.createElement('div');
        this.cover.className = 'bible-cover';
        
        // Create cross container
        const crossContainer = document.createElement('div');
        crossContainer.className = 'cross-container';
        
        const crossVertical = document.createElement('div');
        crossVertical.className = 'cross-vertical';
        
        const crossHorizontal = document.createElement('div');
        crossHorizontal.className = 'cross-horizontal';
        
        crossContainer.appendChild(crossVertical);
        crossContainer.appendChild(crossHorizontal);
        
        // Create title
        const title = document.createElement('div');
        title.className = 'bible-title';
        title.textContent = 'HOLY BIBLE';
        
        // Create shine effect
        const shine = document.createElement('div');
        shine.className = 'shine-effect';
        
        // Create corner decorations
        const cornerTL = document.createElement('div');
        cornerTL.className = 'corner-decoration corner-tl';
        
        const cornerTR = document.createElement('div');
        cornerTR.className = 'corner-decoration corner-tr';
        
        const cornerBL = document.createElement('div');
        cornerBL.className = 'corner-decoration corner-bl';
        
        const cornerBR = document.createElement('div');
        cornerBR.className = 'corner-decoration corner-br';
        
        // Assemble cover
        this.cover.appendChild(crossContainer);
        this.cover.appendChild(title);
        this.cover.appendChild(shine);
        this.cover.appendChild(cornerTL);
        this.cover.appendChild(cornerTR);
        this.cover.appendChild(cornerBL);
        this.cover.appendChild(cornerBR);
        
        // Create pages
        this.pages = document.createElement('div');
        this.pages.className = 'bible-pages';
        
        const pageEdge = document.createElement('div');
        pageEdge.className = 'page-edge';
        
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        pageContent.innerHTML = `
            <h2>John 3:16</h2>
            <p>"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."</p>
            
            <div class="verse">"The Lord is my shepherd, I lack nothing."<br><span style="font-size:0.9rem;color:#777;">- Psalm 23:1</span></div>
            
            <p>Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.</p>
            
            <div class="verse">"I can do all things through Christ who strengthens me."<br><span style="font-size:0.9rem;color:#777;">- Philippians 4:13</span></div>
        `;
        
        const pageMarker = document.createElement('div');
        pageMarker.className = 'page-marker';
        
        this.pages.appendChild(pageEdge);
        this.pages.appendChild(pageContent);
        this.pages.appendChild(pageMarker);
        
        // Create side
        const side = document.createElement('div');
        side.className = 'bible-side';
        
        // Create top
        const top = document.createElement('div');
        top.className = 'bible-top';
        
        // Assemble the bible
        this.bible.appendChild(this.cover);
        this.bible.appendChild(this.pages);
        this.bible.appendChild(side);
        this.bible.appendChild(top);
        
        this.container.appendChild(this.bible);
    }
    
    private setupEventListeners(): void {
        this.bible.addEventListener('mouseenter', () => {
            if (!this.isOpen) {
                this.isOpen = true;
                this.cover.style.transform = 'translateZ(35px) rotateY(-60deg)';
                this.pages.style.transform = 'translateZ(12px) translateX(10px)';
                const pageContent = this.pages.querySelector('.page-content') as HTMLElement;
                if (pageContent) pageContent.style.opacity = '1';
                const pageMarker = this.pages.querySelector('.page-marker') as HTMLElement;
                if (pageMarker) pageMarker.style.opacity = '0.8';
            }
        });

        this.bible.addEventListener('mouseleave', () => {
            if (this.isOpen) {
                this.isOpen = false;
                this.cover.style.transform = 'translateZ(35px) rotateY(0deg)';
                this.pages.style.transform = 'translateZ(12px)';
                const pageContent = this.pages.querySelector('.page-content') as HTMLElement;
                if (pageContent) pageContent.style.opacity = '0';
                const pageMarker = this.pages.querySelector('.page-marker') as HTMLElement;
                if (pageMarker) pageMarker.style.opacity = '0';
            }
        });

        // Touch support for mobile
        this.bible.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.cover.style.transform = 'translateZ(35px) rotateY(-60deg)';
                this.pages.style.transform = 'translateZ(12px) translateX(10px)';
                const pageContent = this.pages.querySelector('.page-content') as HTMLElement;
                if (pageContent) pageContent.style.opacity = '1';
                const pageMarker = this.pages.querySelector('.page-marker') as HTMLElement;
                if (pageMarker) pageMarker.style.opacity = '0.8';
            } else {
                this.cover.style.transform = 'translateZ(35px) rotateY(0deg)';
                this.pages.style.transform = 'translateZ(12px)';
                const pageContent = this.pages.querySelector('.page-content') as HTMLElement;
                if (pageContent) pageContent.style.opacity = '0';
                const pageMarker = this.pages.querySelector('.page-marker') as HTMLElement;
                if (pageMarker) pageMarker.style.opacity = '0';
            }
        });
    }
    
    private animate(): void {
        if (!this.isAnimating) return;
        
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000;
        
        // Calculate floating animation
        const floatOffset = Math.sin(elapsedTime * this.floatSpeed * Math.PI) * this.floatHeight;
        
        // Calculate rotation animation
        const rotateAngle = Math.sin(elapsedTime * this.rotateSpeed * Math.PI) * this.rotateRange;
        
        // Apply transformations only if bible is not open
        if (!this.isOpen) {
            this.bible.style.transform = `rotateY(${rotateAngle - 15}deg) translateY(${floatOffset}px)`;
        }
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    public start(): void {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.startTime = Date.now() - (this.startTime ? Date.now() - this.startTime : 0);
            this.animate();
        }
    }
    
    public stop(): void {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    public openBook(): void {
        this.isOpen = true;
        this.cover.style.transform = 'translateZ(35px) rotateY(-60deg)';
        this.pages.style.transform = 'translateZ(12px) translateX(10px)';
        const pageContent = this.pages.querySelector('.page-content') as HTMLElement;
        if (pageContent) pageContent.style.opacity = '1';
        const pageMarker = this.pages.querySelector('.page-marker') as HTMLElement;
        if (pageMarker) pageMarker.style.opacity = '0.8';
    }
    
    public closeBook(): void {
        this.isOpen = false;
        this.cover.style.transform = 'translateZ(35px) rotateY(0deg)';
        this.pages.style.transform = 'translateZ(12px)';
        const pageContent = this.pages.querySelector('.page-content') as HTMLElement;
        if (pageContent) pageContent.style.opacity = '0';
        const pageMarker = this.pages.querySelector('.page-marker') as HTMLElement;
        if (pageMarker) pageMarker.style.opacity = '0';
    }
    
    public setFloatSpeed(speed: number): void {
        this.floatSpeed = speed * 0.001;
    }
    
    public setRotateSpeed(speed: number): void {
        this.rotateSpeed = speed * 0.001;
    }
    
    public setFloatHeight(height: number): void {
        this.floatHeight = height;
    }
    
    public setRotateRange(range: number): void {
        this.rotateRange = range;
    }
    
    public destroy(): void {
        this.stop();
        if (this.container && this.bible) {
            this.container.innerHTML = '';
        }
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
    }
}