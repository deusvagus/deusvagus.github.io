document.addEventListener('DOMContentLoaded', () => {

    // --- HTML 結構 (不變) ---
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

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // --- 獲取元素 (不變) ---
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('popupContainer');
    const goToNewVersionBtn = document.getElementById('goToNewVersionBtn');
    
    const closeButtons = [
        document.getElementById('closeBtn1'),
        document.getElementById('closeBtn2'),
        document.getElementById('closeBtn3'),
        document.getElementById('closeBtn4')
    ];
    const cornerClasses = ['top-right', 'top-left', 'bottom-left', 'bottom-right'];

    // --- 狀態變數 (不變) ---
    let closeClickCount = 0;
    let realButtonIndex = 0; 
    let isClosingLegally = false; 

    // --- 核心功能函數 ---
    const showPopup = () => {
        popupOverlay.style.display = 'flex';
        scatterButtons(); 
    };

    const hidePopup = () => {
        isClosingLegally = true; 
        popupOverlay.style.display = 'none';
        
        styleObserver.disconnect();
        bodyObserver.disconnect();
    };

    // --- 【重大修改】 ---
    // 改為在當前頁面跳轉
    const redirectToNewVersion = () => {
        window.location.href = 'https://deusvagus.github.io/musicplayer/'; 
    };
    // --- 【修改完畢】 ---


    function triggerButtonEffect(className) {
        goToNewVersionBtn.classList.remove('bouncing', 'shaking');
        void goToNewVersionBtn.offsetWidth; 
        
        goToNewVersionBtn.classList.add(className);
        goToNewVersionBtn.addEventListener('animationend', () => {
            goToNewVersionBtn.classList.remove(className);
        }, { once: true });
    }

    function scatterButtons() {
        realButtonIndex = Math.floor(Math.random() * 4);
        const shuffledClasses = [...cornerClasses].sort(() => Math.random() - 0.5);

        closeButtons.forEach((btn, index) => {
            btn.classList.remove(...cornerClasses);
            btn.classList.add(shuffledClasses[index]);
        });
    }

    function onCloseButtonClick(event, clickedIndex) {
        event.stopPropagation(); 

        if (clickedIndex === realButtonIndex) {
            closeClickCount++;
            triggerButtonEffect('bouncing'); 

            if (closeClickCount >= 4) {
                hidePopup(); 
            } else {
                scatterButtons(); 
            }
        } else {
            closeClickCount = 0; 
            triggerButtonEffect('shaking'); 
            scatterButtons(); 
        }
    }

    // --- 防破解 (不變) ---
    let styleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (popupOverlay.style.display === 'none' && !isClosingLegally) {
                    popupOverlay.style.display = 'flex'; 
                    triggerButtonEffect('shaking'); 
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
        
        if (overlayRemoved && !isClosingLegally) {
            document.body.insertAdjacentElement('beforeend', popupOverlay); 
            triggerButtonEffect('shaking'); 
        }
    });

    // --- 綁定事件 (不變) ---

    closeButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => onCloseButtonClick(e, index));
    });

    goToNewVersionBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        redirectToNewVersion();
    });

    popupContainer.addEventListener('click', redirectToNewVersion);

    // --- 啟動 (不變) ---
    setTimeout(showPopup, 500);
    
    styleObserver.observe(popupOverlay, { attributes: true });
    bodyObserver.observe(document.body, { childList: true });
});