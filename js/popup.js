document.addEventListener('DOMContentLoaded', () => {

    // HTML 結構
    const popupHTML = `
        <div class="popup-overlay" id="popupOverlay">
            <div class="popup-container" id="popupContainer">
                
                <button class="popup-close-btn" id="closePopupBtn">&times;</button>

                <h2 id="popupTitle">新版已上線</h2>
                <p id="popupMessage">新版網站有更完善的搜尋功能，還整合了音樂播放器。</p>
                
                <div class="math-challenge" id="mathChallenge" style="display: none;">
                    <p id="mathProblemText">Solve to Close:</p>
                    <input type="text" id="mathAnswerInput" placeholder="Answer">
                    <button id="mathSubmitBtn">Unlock</button>
                </div>

                <a href="https://deusvagus.github.io/musicplayer/" class="popup-button" id="goToNewVersionBtn">立即前往</a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // 獲取 DOM 元素
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('popupContainer');
    const goToNewVersionBtn = document.getElementById('goToNewVersionBtn');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const mathChallenge = document.getElementById('mathChallenge');
    const mathProblemText = document.getElementById('mathProblemText');
    const mathAnswerInput = document.getElementById('mathAnswerInput');
    const mathSubmitBtn = document.getElementById('mathSubmitBtn');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');

    // 狀態變數
    let correctAnswer = 0;
    let isClosingLegally = false;
    let trapState = 0; // 0 = 初始, 1 = 已變文案, 2 = 已出題目

    // 核心功能函數
    const showPopup = () => {
        popupOverlay.style.display = 'flex';
        
        // 重置回階段一 (友善狀態)
        trapState = 0;        
        closePopupBtn.disabled = false; 
        closePopupBtn.classList.remove('unlocked'); 
        mathChallenge.style.display = 'none'; 
        mathAnswerInput.value = '';
        
        popupTitle.textContent = "新版已上線";
        popupMessage.textContent = "新版網站有更完善的搜尋功能，還整合了音樂播放器。";
    };

    const hidePopup = () => {
        isClosingLegally = true; 
        popupOverlay.style.display = 'none';
        styleObserver.disconnect();
        bodyObserver.disconnect();
    };

    const redirectToNewVersion = () => {
        window.location.href = 'https://deusvagus.github.io/musicplayer/';
    };
    
    // 產生數學題
    function generateMathProblem() {
        // Sigma (Σ) 部分
        const limit = Math.floor(Math.random() * 100 + 5); 
        const multiplier = (Math.floor(Math.random() * 5) + 1) * 5; 
        let sigmaSum = 0;
        for (let n = 1; n <= limit; n++) {
            sigmaSum += (n * multiplier);
        }
        
        const decimalValue = Math.floor(Math.random() * 100) + 50; 
        const hexString = decimalValue.toString(16).toUpperCase(); 
        
        correctAnswer = sigmaSum + decimalValue;
        
        mathProblemText.textContent = `Nice try! Solve: Σ(n=1 to ${limit}) of (n*${multiplier}) + 0x${hexString} = x`;
    }

    // 觸發按鈕動畫 (搖頭或彈跳)
    function triggerButtonEffect(className) {
        goToNewVersionBtn.classList.remove('bouncing', 'shaking');
        void goToNewVersionBtn.offsetWidth; 
        goToNewVersionBtn.classList.add(className);
        goToNewVersionBtn.addEventListener('animationend', () => {
            goToNewVersionBtn.classList.remove(className);
        }, { once: true });
    }

    // 防破解：監視 DOM 變動
    let styleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
                // 防止 F12 設置 display: none
                if (mutation.attributeName === 'style' &&
                    popupOverlay.style.display === 'none' && !isClosingLegally) {
                    popupOverlay.style.display = 'flex';
                    triggerButtonEffect('shaking');
                }
                
                // 防止 F12 移除 disabled 屬性
                if (mutation.attributeName === 'disabled' &&
                    !closePopupBtn.disabled && 
                    trapState === 2 && // 僅在陷阱已完全啟動時
                    !closePopupBtn.classList.contains('unlocked')) 
                {
                    closePopupBtn.disabled = true; 
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
        // 防止 F12 刪除彈窗節點
        if (overlayRemoved && !isClosingLegally) {
            document.body.insertAdjacentElement('beforeend', popupOverlay);
            showPopup(); 
        }
    });

    // 綁定事件

    // 數學題提交按鈕
    mathSubmitBtn.addEventListener('click', (event) => {
        event.stopPropagation(); 
        
        const userAnswerString = mathAnswerInput.value;
        const userAnswerNum = parseInt(userAnswerString, 10);

        const _k1 = "lzrs";
        const _k2 = "dqjdx";
        const _key = _k1 + _k2; // "lzrsdqjdx"
        const _f = "from" + "CharCode";
        const _c = "char" + "CodeAt";
        let _decryptedKey = ""; 

        for (let i = 0; i < _key.length; i++) {
            let charCode = _key[_c](i);
            _decryptedKey += String[_f](charCode === 122 ? 97 : charCode + 1);
        }
        
        if (userAnswerString === _decryptedKey || userAnswerNum === correctAnswer) {
            
            closePopupBtn.disabled = false; 
            closePopupBtn.classList.add('unlocked'); 
            mathChallenge.style.display = 'none'; 
            
        } else {
            triggerButtonEffect('shaking'); 
            mathAnswerInput.value = '';
            mathProblemText.textContent = `WRONG! Try again: ${mathProblemText.textContent.split(': ')[1]}`;
        }
    });
    
    // 允許 Enter 鍵提交答案
    mathAnswerInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            mathSubmitBtn.click();
        }
    });

    // 阻止數學區塊的點擊冒泡
    mathChallenge.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // 關閉按鈕 (X) 
    closePopupBtn.addEventListener('click', (event) => {
        event.stopPropagation();

        if (trapState === 0) {
            // 階段一：僅變更文案
            trapState = 1;
            popupTitle.textContent = "新版已經上線了不要再用舊版了";
            popupMessage.textContent = "新版網站有更完善的搜尋功能，還整合了音樂播放器，不去的話就吃我彈窗！！！";
            triggerButtonEffect('shaking'); 
            
        } else if (trapState === 1) {
            // 階段二：顯示題目並鎖定
            trapState = 2;
            closePopupBtn.disabled = true; 
            mathChallenge.style.display = 'block'; 
            generateMathProblem(); 
            
        } else if (trapState === 2 && !closePopupBtn.disabled) {
            // 階段三：(解鎖後) 合法關閉
            hidePopup();
        }
    });

    // 「立即前往」按鈕
    goToNewVersionBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        redirectToNewVersion();
    });

    // 點擊容器主體 (觸發跳轉)
    popupContainer.addEventListener('click', redirectToNewVersion);

    // 啟動
    setTimeout(showPopup, 500);
    
    // 啟動監視器
    styleObserver.observe(popupOverlay, { attributes: true });
    styleObserver.observe(closePopupBtn, { attributes: true });
    bodyObserver.observe(document.body, { childList: true });
});