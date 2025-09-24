class PDFTeleprompter {
    constructor() {
        this.pdfDoc = null;
        this.pages = [];
        this.isPlaying = false;
        this.animationId = null;
        this.scrollPosition = 0;
        this.scrollSpeed = 2;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.controls = document.getElementById('controls');
        this.displayArea = document.getElementById('displayArea');
        this.teleprompterContent = document.getElementById('teleprompterContent');
        this.loading = document.getElementById('loading');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // 悬浮控制面板元素
        this.floatingControls = document.getElementById('floatingControls');
        this.floatPlayBtn = document.getElementById('floatPlayBtn');
        this.floatResetBtn = document.getElementById('floatResetBtn');
        this.floatExitBtn = document.getElementById('floatExitBtn');
        this.floatSpeedSlider = document.getElementById('floatSpeedSlider');
        this.floatSpeedValue = document.getElementById('floatSpeedValue');
        
        // 滚动容器
        this.teleprompterContainer = document.querySelector('.teleprompter-container');
    }
    
    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        this.speedSlider.addEventListener('input', (e) => {
            this.scrollSpeed = parseFloat(e.target.value);
            this.speedValue.textContent = this.scrollSpeed;
            if (this.floatSpeedSlider) {
                this.floatSpeedSlider.value = this.scrollSpeed;
                this.floatSpeedValue.textContent = this.scrollSpeed;
            }
        });
        
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // 悬浮控制面板事件
        if (this.floatPlayBtn) {
            this.floatPlayBtn.addEventListener('click', () => this.togglePlayPause());
            this.floatResetBtn.addEventListener('click', () => this.reset());
            this.floatExitBtn.addEventListener('click', () => this.exitFullscreen());
            
            this.floatSpeedSlider.addEventListener('input', (e) => {
                this.scrollSpeed = parseFloat(e.target.value);
                this.floatSpeedValue.textContent = this.scrollSpeed;
                this.speedSlider.value = this.scrollSpeed;
                this.speedValue.textContent = this.scrollSpeed;
            });
        }
        
        // 全屏状态变化监听
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(event => {
            document.addEventListener(event, () => this.handleFullscreenChange());
        });
        
        // 手动滚动监听
        this.teleprompterContainer.addEventListener('scroll', () => {
            if (!this.isPlaying) {
                this.scrollPosition = this.teleprompterContainer.scrollTop;
            }
        });
        
        // 防止滚动时自动播放
        this.teleprompterContainer.addEventListener('mousedown', () => {
            if (this.isPlaying) {
                this.pause();
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.togglePlayPause();
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                this.toggleFullscreen();
            } else if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    this.exitFullscreen();
                }
            }
        });
        
        // 触摸手势支持
        let touchStartY = 0;
        this.teleprompterContainer.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            if (this.isPlaying) {
                this.pause();
            }
        });
        
        this.teleprompterContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            this.teleprompterContainer.scrollTop += deltaY;
            touchStartY = touchY;
            this.scrollPosition = this.teleprompterContainer.scrollTop;
        });
    }
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            await this.processPDF(file);
        }
    }
    
    async processPDF(file) {
        this.showLoading(true);
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            await this.renderAllPages();
            this.showControls();
            
        } catch (error) {
            console.error('Error processing PDF:', error);
            alert('处理PDF文件时出错，请重试');
        } finally {
            this.showLoading(false);
        }
    }
    
    async renderAllPages() {
        this.pages = [];
        this.teleprompterContent.innerHTML = '';
        
        const totalPages = this.pdfDoc.numPages;
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await this.pdfDoc.getPage(pageNum);
            const canvas = await this.renderPageToCanvas(page);
            
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.marginBottom = '20px';
            
            this.teleprompterContent.appendChild(img);
            this.pages.push(img);
        }
    }
    
    async renderPageToCanvas(page) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        return canvas;
    }
    
    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
    }
    
    showControls() {
        this.uploadArea.parentElement.style.display = 'none';
        this.controls.style.display = 'flex';
        this.displayArea.style.display = 'block';
    }
    
    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.playBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.animateScroll();
        }
    }
    
    pause() {
        this.isPlaying = false;
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.scrollPosition = 0;
        this.teleprompterContainer.scrollTop = 0;
    }
    
    animateScroll() {
        if (!this.isPlaying) return;
        
        const contentHeight = this.teleprompterContent.scrollHeight;
        const containerHeight = this.teleprompterContainer.offsetHeight;
        
        this.scrollPosition += this.scrollSpeed;
        
        if (this.scrollPosition > contentHeight) {
            this.scrollPosition = 0;
        }
        
        this.teleprompterContainer.scrollTop = this.scrollPosition;
        
        this.animationId = requestAnimationFrame(() => this.animateScroll());
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        const element = this.displayArea;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        if (isFullscreen) {
            this.displayArea.classList.add('fullscreen');
            document.body.classList.add('fullscreen');
            this.floatingControls.style.display = 'flex';
            this.fullscreenBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
                退出全屏
            `;
        } else {
            this.displayArea.classList.remove('fullscreen');
            document.body.classList.remove('fullscreen');
            this.floatingControls.style.display = 'none';
            this.fullscreenBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                全屏
            `;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
            this.updatePlayButtons(false);
        } else {
            this.play();
            this.updatePlayButtons(true);
        }
    }
    
    updatePlayButtons(isPlaying) {
        const playIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="5,3 19,12 5,21"/>
            </svg>
        `;
        const pauseIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
        `;
        
        if (isPlaying) {
            this.floatPlayBtn.innerHTML = pauseIcon;
        } else {
            this.floatPlayBtn.innerHTML = playIcon;
        }
    }
    
    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.playBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.updatePlayButtons(true);
            this.animateScroll();
        }
    }
    
    pause() {
        this.isPlaying = false;
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.updatePlayButtons(false);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    // 键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.isPlaying) {
                        this.pause();
                    } else {
                        this.play();
                    }
                    break;
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.reset();
                    }
                    break;
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const teleprompter = new PDFTeleprompter();
    teleprompter.setupKeyboardShortcuts();
});

// 添加触摸手势支持
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
        // 滑动控制滚动速度
        const speedSlider = document.getElementById('speedSlider');
        const currentSpeed = parseInt(speedSlider.value);
        
        if (diff > 0 && currentSpeed < 10) {
            speedSlider.value = currentSpeed + 1;
        } else if (diff < 0 && currentSpeed > 1) {
            speedSlider.value = currentSpeed - 1;
        }
        
        speedSlider.dispatchEvent(new Event('input'));
    }
});