class Teleprompter {
    constructor() {
        console.log('开始初始化提词器...');
        
        this.isScrolling = false;
        this.isPaused = false;
        this.scrollInterval = null;
        this.currentPosition = 0;
        this.formattedText = [];
        this.currentLine = 0;
        this.totalLines = 0;
        this.lineHeights = []; // 存储每行高度
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.initializeTextPosition();
        
        console.log('提词器初始化完成');
    }
    
    initializeElements() {
        console.log('正在初始化元素...');
        
        // 文本输入
        this.textInput = document.getElementById('textInput');
        this.formatTextBtn = document.getElementById('formatText');
        
        // 滚动控制
        this.scrollSpeed = document.getElementById('scrollSpeed');
        this.speedValue = document.getElementById('speedValue');
        this.startScrollBtn = document.getElementById('startScroll');
        this.pauseScrollBtn = document.getElementById('pauseScroll');
        this.resetScrollBtn = document.getElementById('resetScroll');
        
        // 显示设置
        this.fontSize = document.getElementById('fontSize');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.lineHeight = document.getElementById('lineHeight');
        this.lineHeightValue = document.getElementById('lineHeightValue');
        this.textColor = document.getElementById('textColor');
        this.bgColor = document.getElementById('bgColor');
        this.mirrorText = document.getElementById('mirrorText');
        
        // 高级功能
        this.advancedToggle = document.getElementById('advancedToggle');
        this.advancedContent = document.getElementById('advancedContent');
        this.maxWordsPerParagraph = document.getElementById('maxWordsPerParagraph');
        this.maxWordsValue = document.getElementById('maxWordsValue');
        this.forceParagraphBreak = document.getElementById('forceParagraphBreak');
        this.formatTextBtn = document.getElementById('formatTextBtn');
        this.undoFormatBtn = document.getElementById('undoFormatBtn');
        this.mainFormatBtn = document.getElementById('formatText'); // 主显示按钮
        
        // 显示区域
        this.textDisplay = document.getElementById('textDisplay');
        this.teleprompterContent = document.getElementById('teleprompterContent');
        this.readingGuide = document.getElementById('readingGuide');
        
        // 控制面板
        this.controlPanel = document.getElementById('controlPanel');
        this.togglePanelBtn = document.getElementById('togglePanel');
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreen');
        this.showPanelBtn = document.getElementById('showPanelBtn');
        
        // 进度显示
        this.progressFill = document.getElementById('progressFill');
        this.currentLineSpan = document.getElementById('currentLine');
        this.totalLinesSpan = document.getElementById('totalLines');
        this.jumpToLineInput = document.getElementById('jumpToLine');
        this.jumpButton = document.getElementById('jumpButton');
        
        // 容器
        this.container = document.querySelector('.container');
        this.teleprompterContainer = document.getElementById('teleprompterContainer');
        
        console.log('元素初始化完成');
    }
    
    bindEvents() {
        // 文本格式化
        this.formatTextBtn.addEventListener('click', () => this.smartFormatText()); // 高级功能中的格式化按钮
        this.undoFormatBtn.addEventListener('click', () => this.undoFormat());
        this.mainFormatBtn.addEventListener('click', () => this.formatText()); // 主显示按钮（简单显示）
        
        // 滚动控制
        this.scrollSpeed.addEventListener('input', () => {
            this.speedValue.textContent = parseFloat(this.scrollSpeed.value).toFixed(1);
            this.saveSettings();
        });
        
        this.startScrollBtn.addEventListener('click', () => this.startScrolling());
        this.pauseScrollBtn.addEventListener('click', () => this.pauseScrolling());
        this.resetScrollBtn.addEventListener('click', () => this.resetScrolling());
        
        // 显示设置
        this.fontSize.addEventListener('input', () => this.updateFontSize());
        this.lineHeight.addEventListener('input', () => this.updateLineHeight());
        this.textColor.addEventListener('input', () => this.updateTextColor());
        this.bgColor.addEventListener('input', () => this.updateBgColor());
        this.mirrorText.addEventListener('change', () => this.updateMirrorText());
        
        // 高级功能
        this.advancedToggle.addEventListener('click', () => this.toggleAdvancedMenu());
        this.maxWordsPerParagraph.addEventListener('input', () => this.updateMaxWordsPerParagraph());
        this.forceParagraphBreak.addEventListener('change', () => this.updateForceParagraphBreak());
        
        // 全屏和面板控制
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.togglePanelBtn.addEventListener('click', () => this.togglePanel());
        this.showPanelBtn.addEventListener('click', () => this.togglePanel());
        
        // 快速定位
        this.jumpButton.addEventListener('click', () => this.jumpToLine());
        this.jumpToLineInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.jumpToLine();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
        
        // 全屏状态变化
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    }
    
    initializeTextPosition() {
        // 确保文本显示区域有正确的初始位置
        setTimeout(() => {
            if (this.formattedText.length === 0) {
                // 如果没有格式化文本，显示默认提示并定位到中间位置
                const containerHeight = this.teleprompterContent.clientHeight;
                const lineHeight = this.getCurrentLineHeight();
                const startPosition = (containerHeight / 2) - lineHeight;
                this.textDisplay.style.transform = `translateY(${startPosition}px)`;
            }
        }, 100);
    }
    
    // 显示文本功能（简单显示，不格式化）
    formatText() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('请先输入文本内容！');
            return;
        }
        
        console.log('开始显示文本，输入长度：', text.length);
        
        // 简单按换行符分段，不进行智能格式化
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
        console.log('简单分段结果：', lines);
        
        this.formattedText = lines;
        this.totalLines = lines.length;
        this.currentLine = 0;
        this.currentPosition = 0;
        this.lineHeights = []; // 重置行高数组
        
        // 更新跳转输入框的最大值
        this.jumpToLineInput.max = this.totalLines;
        this.jumpToLineInput.value = 1;
        
        // 显示文本
        this.displayFormattedText();
        this.updateProgress();
        
        // 保存到本地存储
        localStorage.setItem('teleprompterText', text);
        
        alert('文本显示完成！共' + lines.length + '行');
    }
    
    // 智能格式化功能
    smartFormatText() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('请先输入文本内容！');
            return;
        }
        
        console.log('开始智能格式化文本，输入长度：', text.length);
        
        // 进行智能格式化
        const sentences = this.splitByPunctuation(text);
        console.log('智能格式化结果：', sentences);
        
        this.formattedText = sentences;
        this.totalLines = sentences.length;
        this.currentLine = 0;
        this.currentPosition = 0;
        this.lineHeights = []; // 重置行高数组
        
        // 更新跳转输入框的最大值
        this.jumpToLineInput.max = this.totalLines;
        this.jumpToLineInput.value = 1;
        
        // 显示格式化后的文本
        this.displayFormattedText();
        this.updateProgress();
        
        // 保存到本地存储
        localStorage.setItem('teleprompterText', text);
        
        alert('智能格式化完成！共' + sentences.length + '行');
    }
    
    // 撤销格式化功能
    undoFormat() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('请先输入文本内容！');
            return;
        }
        
        console.log('开始撤销格式化，恢复原始段落');
        
        // 简单按换行符分段，恢复原始段落结构
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
        console.log('撤销格式化结果：', lines);
        
        this.formattedText = lines;
        this.totalLines = lines.length;
        this.currentLine = 0;
        this.currentPosition = 0;
        this.lineHeights = []; // 重置行高数组
        
        // 更新跳转输入框的最大值
        this.jumpToLineInput.max = this.totalLines;
        this.jumpToLineInput.value = 1;
        
        // 显示格式化后的文本
        this.displayFormattedText();
        this.updateProgress();
        
        // 保存到本地存储
        localStorage.setItem('teleprompterText', text);
        
        alert('格式化已撤销！共' + lines.length + '行');
    }
    
    splitByPunctuation(text) {
        // 获取最大段落字数设置
        const maxWords = parseInt(this.maxWordsPerParagraph.value) || 50;
        const forceBreak = this.forceParagraphBreak.checked;
        
        // 定义中文和英文的标点符号
        const punctuation = /[。！？；：.!?;:\n]/;
        const sentences = [];
        let current = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            current += char;
            
            // 如果遇到标点符号，或者文本长度超过限制
            if (punctuation.test(char) || current.length > maxWords) {
                // 查找下一个非空白字符
                let j = i + 1;
                while (j < text.length && /\s/.test(text[j])) {
                    j++;
                }
                
                // 如果当前句子长度合理，或者已经累积了较多字符
                if (current.trim().length > 10 || sentences.length === 0) {
                    sentences.push(current.trim());
                    current = '';
                    i = j - 1; // 跳过空白字符
                }
            }
        }
        
        // 处理剩余的文本
        if (current.trim()) {
            // 如果剩余文本较长且启用了强制分段，进一步分割
            if (forceBreak && current.length > maxWords * 1.5) {
                const remainingSentences = this.forceSplitLongText(current, maxWords);
                sentences.push(...remainingSentences);
            } else {
                sentences.push(current.trim());
            }
        }
        
        return sentences;
    }
    
    forceSplitLongText(text, maxWords) {
        const sentences = [];
        let current = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            current += char;
            
            // 强制在最大字数处分割，优先在标点符号处
            if (current.length >= maxWords) {
                // 向前查找最近的标点符号
                let breakPoint = current.length;
                for (let j = current.length - 1; j >= Math.max(0, current.length - 20); j--) {
                    if (/[，。！？；：,\.!?;:]/.test(current[j])) {
                        breakPoint = j + 1;
                        break;
                    }
                }
                
                const segment = current.substring(0, breakPoint).trim();
                if (segment.length > 10) {
                    sentences.push(segment);
                }
                
                current = current.substring(breakPoint);
            }
        }
        
        if (current.trim()) {
            sentences.push(current.trim());
        }
        
        return sentences;
    }
    
    displayFormattedText() {
        let html = '';
        this.lineHeights = []; // 重置行高数组
        
        this.formattedText.forEach((sentence, index) => {
            html += `<p data-line="${index}">${sentence}</p>`;
        });
        
        if (html === '') {
            html = '<p>请输入您的提词内容，然后点击"格式化文本"按钮开始使用...</p>';
        }
        
        this.textDisplay.innerHTML = html;
        this.totalLinesSpan.textContent = this.totalLines;
        
        // 应用当前的行间距设置
        const currentLineHeight = this.lineHeight.value;
        const paragraphs = this.textDisplay.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.lineHeight = currentLineHeight;
        });
        
        // 计算每行的高度并存储
        paragraphs.forEach((p, index) => {
            const height = p.offsetHeight + parseFloat(getComputedStyle(p).marginBottom);
            this.lineHeights[index] = height;
        });
        
        // 计算初始位置，将第一行文本对齐到中间位置
        const containerHeight = this.teleprompterContent.clientHeight;
        const firstLineHeight = this.lineHeights[0] || this.getCurrentLineHeight();
        const totalContentHeight = this.lineHeights.reduce((sum, height) => sum + height, 0);
        
        // 如果内容高度小于容器高度，将第一行放在中间位置
        // 如果内容高度大于容器高度，确保第一行不会被遮挡
        let startPosition = (containerHeight / 2) - firstLineHeight;
        
        // 确保起始位置不会导致文本显示在容器底部之外
        if (startPosition < 0) {
            startPosition = Math.min(50, containerHeight / 4); // 给一个合理的顶部边距
        }
        
        // 重置滚动位置
        this.currentPosition = 0;
        const isMirror = this.mirrorText.checked;
        const mirrorScale = isMirror ? ' scaleX(-1)' : ' scaleX(1)';
        this.textDisplay.style.transform = `translateY(${startPosition}px)${mirrorScale}`;
    }
    
    // 滚动功能
    startScrolling() {
        if (this.formattedText.length === 0) {
            alert('请先格式化文本！');
            return;
        }
        
        if (this.isPaused) {
            this.resumeScrolling();
            return;
        }
        
        this.isScrolling = true;
        this.isPaused = false;
        this.startScrollBtn.textContent = '滚动中...';
        this.startScrollBtn.disabled = true;
        this.readingGuide.classList.add('visible');
        
        const speed = parseFloat(this.scrollSpeed.value);
        const interval = Math.max(20, 210 - speed); // 扩大速度转换范围，最低20ms，最高190ms
        
        this.scrollInterval = setInterval(() => {
            this.scrollStep();
        }, interval);
    }
    
    scrollStep() {
        if (this.formattedText.length === 0) {
            this.stopScrolling();
            alert('请先格式化文本！');
            return;
        }
        
        const lineHeight = this.getCurrentLineHeight();
        this.currentPosition += 1;
        
        // 更新当前行
        let accumulatedHeight = 0;
        let newLine = 0;
        for (let i = 0; i < this.lineHeights.length; i++) {
            accumulatedHeight += this.lineHeights[i];
            if (accumulatedHeight > this.currentPosition) {
                newLine = i;
                break;
            }
            newLine = i;
        }
        
        if (newLine !== this.currentLine && newLine < this.totalLines) {
            this.currentLine = newLine;
            this.updateProgress();
        }
        
        // 应用滚动
        const isMirror = this.mirrorText.checked;
        const mirrorScale = isMirror ? ' scaleX(-1)' : ' scaleX(1)';
        this.textDisplay.style.transform = `translateY(-${this.currentPosition}px)${mirrorScale}`;
        
        // 检查是否滚动到底部
        const containerHeight = this.teleprompterContent.clientHeight;
        const contentHeight = this.textDisplay.scrollHeight;
        
        if (this.currentPosition + containerHeight >= contentHeight) {
            this.stopScrolling();
            alert('已滚动到文本末尾！');
        }
    }
    
    pauseScrolling() {
        if (this.isScrolling && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.scrollInterval);
            this.pauseScrollBtn.textContent = '继续';
            this.startScrollBtn.textContent = '继续';
            this.startScrollBtn.disabled = false;
        }
    }
    
    resumeScrolling() {
        if (this.isPaused) {
            this.isPaused = false;
            this.startScrolling();
            this.pauseScrollBtn.textContent = '暂停';
        }
    }
    
    resetScrolling() {
        this.stopScrolling();
        this.currentPosition = 0;
        this.currentLine = 0;
        
        // 重置到初始中间位置
        const containerHeight = this.teleprompterContent.clientHeight;
        const firstLineHeight = this.lineHeights[0] || this.getCurrentLineHeight();
        let startPosition = (containerHeight / 2) - firstLineHeight;
        
        // 确保起始位置不会导致文本显示在容器底部之外
        if (startPosition < 0) {
            startPosition = Math.min(50, containerHeight / 4); // 给一个合理的顶部边距
        }
        
        const isMirror = this.mirrorText.checked;
        const mirrorScale = isMirror ? ' scaleX(-1)' : ' scaleX(1)';
        this.textDisplay.style.transform = `translateY(${startPosition}px)${mirrorScale}`;
        
        this.updateProgress();
        this.readingGuide.classList.remove('visible');
    }
    
    stopScrolling() {
        this.isScrolling = false;
        this.isPaused = false;
        clearInterval(this.scrollInterval);
        this.startScrollBtn.textContent = '开始';
        this.startScrollBtn.disabled = false;
        this.pauseScrollBtn.textContent = '暂停';
    }
    
    // 显示设置
    updateFontSize() {
        const size = this.fontSize.value;
        this.fontSizeValue.textContent = size + 'px';
        this.textDisplay.style.fontSize = size + 'px';
        
        // 重新计算行高
        if (this.formattedText.length > 0) {
            setTimeout(() => this.displayFormattedText(), 50);
        }
        this.saveSettings();
    }
    
    updateLineHeight() {
        const height = this.lineHeight.value;
        this.lineHeightValue.textContent = height;
        
        // 应用到所有段落，让每一行都有这个行间距
        const paragraphs = this.textDisplay.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.lineHeight = height;
        });
        
        // 重新计算行高
        if (this.formattedText.length > 0) {
            setTimeout(() => this.displayFormattedText(), 50);
        }
        this.saveSettings();
    }
    
    updateTextColor() {
        const color = this.textColor.value;
        this.textDisplay.style.color = color;
        this.saveSettings();
    }
    
    updateBgColor() {
        const color = this.bgColor.value;
        this.teleprompterContainer.style.backgroundColor = color;
        this.saveSettings();
    }
    
    updateMirrorText() {
        const text = this.textInput.value.trim();
        if (text === '') {
            this.textDisplay.innerHTML = '';
            this.formattedText = [];
            return;
        }
        
        // 简单按换行符分段，保持原始段落结构
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
        this.formattedText = lines;
        this.totalLines = lines.length;
        const formattedText = lines.map(line => `<p>${line}</p>`).join('');
        
        this.textDisplay.innerHTML = formattedText;
        
        // 应用当前设置
        this.updateFontSize();
        this.updateLineHeight();
        this.updateTextColor();
        this.updateBgColor();
        
        // 更新镜像状态
        const isMirror = this.mirrorText.checked;
        if (isMirror) {
            this.textDisplay.style.transform = `translateY(-${this.currentPosition}px) scaleX(-1)`;
        } else {
            this.textDisplay.style.transform = `translateY(-${this.currentPosition}px) scaleX(1)`;
        }
        
        this.saveSettings();
    }
    
    // 高级功能
    toggleAdvancedMenu() {
        const isVisible = this.advancedContent.style.display === 'block';
        this.advancedContent.style.display = isVisible ? 'none' : 'block';
        this.advancedToggle.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    }
    
    updateMaxWordsPerParagraph() {
        const value = this.maxWordsPerParagraph.value;
        this.maxWordsValue.textContent = value;
        this.saveSettings();
    }
    
    updateForceParagraphBreak() {
        this.saveSettings();
    }
    
    
    
    // 全屏功能
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().then(() => {
                this.container.classList.add('fullscreen');
                this.toggleFullscreenBtn.textContent = '退出全屏';
            }).catch(err => {
                alert(`无法进入全屏模式: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                this.container.classList.remove('fullscreen');
                this.toggleFullscreenBtn.textContent = '全屏显示';
            });
        }
    }
    
    togglePanel() {
        this.controlPanel.classList.toggle('hidden');
        const isHidden = this.controlPanel.classList.contains('hidden');
        this.togglePanelBtn.textContent = isHidden ? '显示控制面板' : '隐藏控制面板';
        this.showPanelBtn.style.display = isHidden ? 'block' : 'none';
        
        // 同时切换容器的panel-hidden类，用于扩展文本显示区域
        this.container.classList.toggle('panel-hidden', isHidden);
        
        // 切换body的背景样式，隐藏蓝色渐变背景
        document.body.classList.toggle('panel-hidden-bg', isHidden);
    }
    
    // 键盘快捷键
    handleKeyboard(e) {
        if (e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (this.isScrolling && !this.isPaused) {
                    this.pauseScrolling();
                } else {
                    this.startScrolling();
                }
                break;
            case 'r':
            case 'R':
                this.resetScrolling();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    this.toggleFullscreen();
                }
                break;
        }
    }
    
    // 快速定位功能
    jumpToLine() {
        if (!this.formattedText || this.formattedText.length === 0) {
            alert('请先格式化文本');
            return;
        }
        
        const targetLine = parseInt(this.jumpToLineInput.value);
        if (isNaN(targetLine) || targetLine < 1 || targetLine > this.formattedText.length) {
            alert(`请输入有效的行号 (1-${this.formattedText.length})`);
            return;
        }
        
        this.stopScrolling();
        this.currentLine = targetLine - 1; // 转换为0基索引
        this.currentPosition = this.calculatePositionForLine(this.currentLine);
        const isMirror = this.mirrorText.checked;
        const mirrorScale = isMirror ? ' scaleX(-1)' : ' scaleX(1)';
        this.textDisplay.style.transform = `translateY(-${this.currentPosition}px)${mirrorScale}`;
        this.updateProgress();
    }

    calculatePositionForLine(lineIndex) {
        let position = 0;
        for (let i = 0; i < lineIndex && i < this.lineHeights.length; i++) {
            position += this.lineHeights[i] || this.getCurrentLineHeight();
        }
        return position;
    }

    // 进度更新
    updateProgress() {
        const progress = this.totalLines > 0 ? (this.currentLine / this.totalLines) * 100 : 0;
        this.progressFill.style.width = progress + '%';
        this.currentLineSpan.textContent = this.currentLine + 1;
    }
    
    // 工具方法
    getCurrentLineHeight() {
        const firstParagraph = this.textDisplay.querySelector('p');
        if (firstParagraph) {
            return firstParagraph.offsetHeight + 
                   parseFloat(getComputedStyle(firstParagraph).marginBottom);
        }
        return 50; // 默认值
    }
    
    handleResize() {
        // 重新计算行高和位置
        if (this.formattedText.length > 0) {
            this.displayFormattedText();
        } else {
            // 如果没有格式化文本，重新初始化位置
            this.initializeTextPosition();
        }
    }
    
    handleFullscreenChange() {
        if (!document.fullscreenElement) {
            this.container.classList.remove('fullscreen');
            this.toggleFullscreenBtn.textContent = '全屏显示';
        }
    }
    
    // 设置保存和加载
    saveSettings() {
        const settings = {
            scrollSpeed: this.scrollSpeed.value,
            fontSize: this.fontSize.value,
            lineHeight: this.lineHeight.value,
            textColor: this.textColor.value,
            bgColor: this.bgColor.value,
            mirrorText: this.mirrorText.checked,
            maxWordsPerParagraph: this.maxWordsPerParagraph.value,
            forceParagraphBreak: this.forceParagraphBreak.checked
        };
        localStorage.setItem('teleprompterSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        // 加载设置
        const settings = localStorage.getItem('teleprompterSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.scrollSpeed.value = parsed.scrollSpeed || 50;
            this.fontSize.value = parsed.fontSize || 32;
            this.lineHeight.value = parsed.lineHeight || 1.8;
            this.textColor.value = parsed.textColor || '#ffffff';
            this.bgColor.value = parsed.bgColor || '#000000';
            this.mirrorText.checked = parsed.mirrorText || false;
            this.maxWordsPerParagraph.value = parsed.maxWordsPerParagraph || 50;
            this.forceParagraphBreak.checked = parsed.forceParagraphBreak !== undefined ? parsed.forceParagraphBreak : true;
            
            // 应用设置
            this.speedValue.textContent = parseFloat(this.scrollSpeed.value).toFixed(1);
            this.updateFontSize();
            this.updateLineHeight();
            this.updateTextColor();
            this.updateBgColor();
            this.updateMirrorText();
            this.updateMaxWordsPerParagraph();
            this.updateForceParagraphBreak();
        }
        
        // 加载文本
        const savedText = localStorage.getItem('teleprompterText');
        if (savedText) {
            this.textInput.value = savedText;
            setTimeout(() => this.formatText(), 100);
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new Teleprompter();
});

// 添加一些提示信息
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('提词器应用已加载完成！');
        console.log('快捷键说明：');
        console.log('- 空格键：开始/暂停滚动');
        console.log('- R键：重置滚动');
        console.log('- F键：切换全屏');
        console.log('- ESC键：退出全屏');
    }, 1000);
});