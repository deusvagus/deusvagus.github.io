const AdPopupModule = {
    timerId: null,
    countdown: 5,

    init() {
        this.injectHTML();
        this.bindEvents();
    },

    injectHTML() {
        const adHTML = `
        <div class="ad-overlay" id="adOverlay">
            <div class="ad-container">
                <button class="ad-close-btn" id="adCloseBtn">&times;</button>
                <h2>新版網站已上線！</h2>
                <p>體驗更快的速度與更強大的功能，立即升級至 V2 版！</p>
                
                <a href="https://deusvagus.github.io/musicplayer/" class="popup-button" target="_blank" id="adGoToNewVersionBtn">立即前往</a>
                
                <div class="ad-countdown" id="adCountdown"></div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', adHTML);
    },

    bindEvents() {
        const closeBtn = document.getElementById('adCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.hide.bind(this));
        }

        const goToBtn = document.getElementById('adGoToNewVersionBtn');
        if (goToBtn) {
            // 點擊「立即前往」後也關閉廣告
            goToBtn.addEventListener('click', this.hide.bind(this));
        }
    },

    show() {
        const overlay = document.getElementById('adOverlay');
        const closeBtn = document.getElementById('adCloseBtn');
        const countdownEl = document.getElementById('adCountdown');

        if (!overlay || !closeBtn || !countdownEl) {
            console.error('Ad popup elements not found.');
            return;
        }

        overlay.style.display = 'flex';
        closeBtn.style.display = 'none'; // 隱藏關閉按鈕
        this.countdown = 5; // 重置倒數
        countdownEl.textContent = `您可以在 ${this.countdown} 秒後略過...`;

        // 清除上一個計時器
        if (this.timerId) {
            clearInterval(this.timerId);
        }

        // 開始新的計時器
        this.timerId = setInterval(() => {
            this.countdown--;
            if (this.countdown > 0) {
                countdownEl.textContent = `您可以在 ${this.countdown} 秒後略過...`;
            } else {
                // 倒數結束
                clearInterval(this.timerId);
                this.timerId = null;
                countdownEl.textContent = '您可以點擊 X 關閉此廣告。';
                closeBtn.style.display = 'block'; // 顯示關閉按鈕
            }
        }, 1000);
    },

    hide() {
        const overlay = document.getElementById('adOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // 如果計時器還在跑，提前關閉時也清除
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
};

// 確保在 DOM 載入後初始化廣告模組
document.addEventListener('DOMContentLoaded', () => AdPopupModule.init());