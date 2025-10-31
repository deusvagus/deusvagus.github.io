document.addEventListener('DOMContentLoaded', () => {
    const popupHTML = `
        <div class="popup-overlay" id="popupOverlay">
            <div class="popup-container" id="popupContainer">
                <button class="popup-close-btn" id="closePopupBtn">&times;</button>
                <h2>新版已經上線了不要再用舊版了</h2>
                <p>新版網站有更完善的搜尋功能，還整合了音樂播放器，不去的話就吃我彈窗！！！</p>
                <a href="https://deusvagus.github.io/musicplayer/" class="popup-button" id="goToNewVersionBtn">立即前往</a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('popupContainer');
    const closePopupBtn = document.getElementById('closePopupBtn');
    // 【新增】獲取前往新版按鈕
    const goToNewVersionBtn = document.getElementById('goToNewVersionBtn');

    const showPopup = () => {
        popupOverlay.style.display = 'flex';
    };

    const hidePopup = () => {
        popupOverlay.style.display = 'none';
    };

    const redirectToNewVersion = () => {
        window.open('https://deusvagus.github.io/musicplayer/', '_blank');
        hidePopup();
    };

    // --- 【以下為主要修改區域】 ---

    let closeClickCount = 0; // 1. 建立點擊計數器
    
    // 2. 定義四個角落的位置
    const cornerPositions = [
        { top: '8px', right: '8px', bottom: 'auto', left: 'auto' }, // Top-Right
        { top: '8px', left: '8px', bottom: 'auto', right: 'auto' }, // Top-Left
        { bottom: '8px', left: '8px', top: 'auto', right: 'auto' }, // Bottom-Left
        { bottom: '8px', right: '8px', top: 'auto', left: 'auto' }  // Bottom-Right
    ];

    // 3. 修改關閉按鈕的點擊事件
    closePopupBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // 防止事件冒泡到父容器
        
        closeClickCount++; // 每次點擊都+1

        // 5. 觸發「立即前往」按鈕的彈跳特效
        goToNewVersionBtn.classList.add('bouncing');
        // 監聽動畫結束事件，結束後移除 class，以便下次點擊
        goToNewVersionBtn.addEventListener('animationend', () => {
            goToNewVersionBtn.classList.remove('bouncing');
        }, { once: true }); // { once: true } 讓監聽器只執行一次

        // 4. 檢查點擊次數
        if (closeClickCount >= 4) {
            // 點滿 4 次，關閉彈窗
            hidePopup();
        } else {
            // 還沒點滿 4 次，移動按鈕到隨機新位置
            const nextPosition = cornerPositions[Math.floor(Math.random() * cornerPositions.length)];
            
            // 重置所有位置屬性
            closePopupBtn.style.top = 'auto';
            closePopupBtn.style.right = 'auto';
            closePopupBtn.style.bottom = 'auto';
            closePopupBtn.style.left = 'auto';

            // 應用新的位置
            Object.assign(closePopupBtn.style, nextPosition);
        }
    });
    
    // --- 【以上為主要修改區域】 ---

    // 保持容器點擊跳轉的功能
    popupContainer.addEventListener('click', redirectToNewVersion);

    setTimeout(showPopup, 500);
});