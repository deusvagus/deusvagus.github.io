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

    closePopupBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // 防止事件冒泡到父容器
        hidePopup();
    });
    popupContainer.addEventListener('click', redirectToNewVersion);

    setTimeout(showPopup, 500);
});