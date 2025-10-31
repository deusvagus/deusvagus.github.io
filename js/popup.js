document.addEventListener('DOMContentLoaded', () => {

    // --- 【修改】HTML 結構：加入 3 個假的按鈕 ---
    const popupHTML = `
        <div class="popup-overlay" id="popupOverlay">
            <div class="popup-container" id="popupContainer">
                
                <button class="popup-close-btn" id="closeBtn1">&times;</button>
                <button class="popup-close-btn" id="closeBtn2">&times;</button>
                <button class="popup-close-btn" id="closeBtn3">&times;</button>
                <button class="popup-close-btn" id="closeBtn4">&times;</button>

                <h2>新版已經上線了不要再用舊版了</h2>
                <p>新版網站有更完善的搜尋功能，還整合了音樂播放器，不去的話就吃我彈窗！！！</p>
                <a href="https://deusvagus.github.io/musicplayer/" class="popup-button" id="goToNewVersionBtn">立即前往</a>
            </div>
        </div>
    `;
    // --- 【HTML 修改完畢】 ---

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // --- 獲取元素 ---
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('popupContainer');
    const goToNewVersionBtn = document.getElementById('goToNewVersionBtn');
    
    // 【新增】獲取所有 4 個關閉按鈕
    const closeButtons = [
        document.getElementById('closeBtn1'),
        document.getElementById('closeBtn2'),
        document.getElementById('closeBtn3'),
        document.getElementById('closeBtn4')
    ];
    // 【新增】4 個角落的 CSS class
    const cornerClasses = ['top-right', 'top-left', 'bottom-left', 'bottom-right'];

    // --- 狀態變數 ---
    let closeClickCount = 0;
    let realButtonIndex = 0; // 追蹤哪個按鈕是「真的」
    let isClosingLegally = false; // 防破解的「合法關閉」旗標

    // --- 核心功能函數 ---
    const showPopup = () => {
        popupOverlay.style.display = 'flex';
        scatterButtons(); // 顯示時就隨機分配
    };

    const hidePopup = () => {
        isClosingLegally = true; // 標記為合法關閉
        popupOverlay.style.display = 'none';
        
        // 【新增】停止監視器
        styleObserver.disconnect();
        bodyObserver.disconnect();
    };

    const redirectToNewVersion = () => {
        window.open('https://deusvagus.github.io/musicplayer/', '_blank');
        hidePopup();
    };

    // 【新增】觸發按鈕動畫（成功或失敗）
    function triggerButtonEffect(className) {
        // 確保不同時觸發
        goToNewVersionBtn.classList.remove('bouncing', 'shaking');
        // 強制重繪 (reflow) 以便動畫可以重新觸發
        void goToNewVersionBtn.offsetWidth; 
        
        goToNewVersionBtn.classList.add(className);
        goToNewVersionBtn.addEventListener('animationend', () => {
            goToNewVersionBtn.classList.remove(className);
        }, { once: true });
    }

    // 【新增】隨機分配按鈕位置和「真假」
    function scatterButtons() {
        // 1. 隨機決定哪個索引是「真的」
        realButtonIndex = Math.floor(Math.random() * 4);
        
        // 2. 隨機打亂位置
        const shuffledClasses = [...cornerClasses].sort(() => Math.random() - 0.5);

        // 3. 應用位置
        closeButtons.forEach((btn, index) => {
            // 先移除舊的位置
            btn.classList.remove(...cornerClasses);
            // 添加新的隨機位置
            btn.classList.add(shuffledClasses[index]);
        });
    }

    // 【新增】處理關閉按鈕的點擊
    function onCloseButtonClick(event, clickedIndex) {
        event.stopPropagation(); // 阻止冒泡到容器

        if (clickedIndex === realButtonIndex) {
            // --- 點對了 ---
            closeClickCount++;
            triggerButtonEffect('bouncing'); // 彈一下

            if (closeClickCount >= 4) {
                hidePopup(); // 點滿 4 次，關閉
            } else {
                scatterButtons(); // 沒點滿，重洗
            }
        } else {
            // --- 點错了 ---
            closeClickCount = 0; // 計數器歸零
            triggerButtonEffect('shaking'); // 搖頭嘲諷
            scatterButtons(); // 重洗
        }
    }

    // --- 【防破解】Mutation Observers ---
    
    // 旗標必須先宣告
    let styleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // 如果有人用 F12 或腳本把它 display: none ...
                if (popupOverlay.style.display === 'none' && !isClosingLegally) {
                    popupOverlay.style.display = 'flex'; // ...立刻改回來！
                    triggerButtonEffect('shaking'); // 順便嘲諷一下
                }
            }
        });
    });

    let bodyObserver = new MutationObserver((mutations) => {
        let overlayRemoved = false;
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach(node => {
                    if (node.id === 'popupOverlay') overlayRemoved = true;
                });
            }
        }
        
        // 如果有人用 F12 或腳本把整個節點刪了...
        if (overlayRemoved && !isClosingLegally) {
            document.body.insertAdjacentElement('beforeend', popupOverlay); // ...立刻加回去！
            triggerButtonEffect('shaking'); // 再次嘲諷
        }
    });

    // --- 綁定事件 ---

    // 幫 4 個按鈕綁定各自的點擊事件
    closeButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => onCloseButtonClick(e, index));
    });

    // 點擊容器主體 = 前往新版
    popupContainer.addEventListener('click', redirectToNewVersion);

    // --- 啟動 ---
    setTimeout(showPopup, 500);
    
    // 啟動監視器
    styleObserver.observe(popupOverlay, { attributes: true });
    bodyObserver.observe(document.body, { childList: true });
});