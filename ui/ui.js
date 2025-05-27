// ui.js - Управление интерфейсом, кнопками и переходами

// Элементы интерфейса
const elements = {
    // Экраны
    startScreen: document.getElementById('start-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    exitDialog: document.getElementById('exit-dialog'),
    
    // Контейнеры
    textContainer: document.getElementById('text-container'),
    textContent: document.getElementById('text-content'),
    backgroundImage: document.getElementById('background-image'),
    
    // Кнопки навигации
    startBtn: document.getElementById('start-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    
    // Кнопки управления
    playPauseBtn: document.getElementById('play-pause-btn'),
    playPauseIcon: document.getElementById('play-pause-icon'),
    settingsBtn: document.getElementById('settings-btn'),
    //autoscrollBtn: document.getElementById('autoscroll-btn'),
    exitBtn: document.getElementById('exit-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    confirmExitBtn: document.getElementById('confirm-exit-btn'),
    cancelExitBtn: document.getElementById('cancel-exit-btn'),

    switchMusic: document.getElementById('switch-music'),
    
    // Настройки
    speedSlider: document.getElementById('speed-slider'),
    speedValue: document.getElementById('speed-value'),
    fontFamily: document.getElementById('font-family'),
    fontSizeSlider: document.getElementById('font-size-slider'),
    fontSizeValue: document.getElementById('font-size-value'),
    fontColor: document.getElementById('font-color'),
    restartBtn: document.getElementById('restart-btn'),
    gotoLine: document.getElementById('goto-line'),
    gotoBtn: document.getElementById('goto-btn'),
    developerMode: document.getElementById('developer-mode'),

    novelTitle: document.getElementById('novel-title'),
    imageBubble: document.getElementById('image-bubble'),
    opacityBubbleSlider: document.getElementById('opacityBubble-slider'),
    opacityBubbleValue: document.getElementById('opacityBubble-value'),

    
    // Аудио
    backgroundMusic: document.getElementById('background-music'),
    soundEffect: document.getElementById('sound-effect')
};

// Состояние интерфейса
const uiState = {
    isPlaying: false,
    isAutoscrollEnabled: true,
    isDeveloperMode: false
};

// Настройки по умолчанию
const defaultOptions = {
    speed: 1000,
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontColor: '#000000',
    isDeveloperMode: false,
    opacityImageBabble: 100,
    isMusicOn: true
};

// Название и обложка
function setTitleStory(){
  document.title = titleStory;
  if (showTitle)  elements.novelTitle.textContent = titleStory; // Добавляем название
}



// Текущие настройки
let options = { ...defaultOptions };

// Инициализация интерфейса
function initUI() {
    // Загрузка настроек из localStorage
    loadOptions();
    
    // Создание элемента для отображения информации разработчика
    createDeveloperInfo();
    
    // Применение настроек
    applyOptions();

    // Название и обложка
    setTitleStory()
    
    // Обработчики событий для кнопок
    setupEventListeners();
}

// Загрузка настроек из localStorage
function loadOptions() {
    const savedOptions = localStorage.getItem('options');
    if (savedOptions) {
        try {
            options = { ...defaultOptions, ...JSON.parse(savedOptions) };
        } catch (e) {
            console.error('Ошибка при загрузке настроек:', e);
            options = { ...defaultOptions };
        }
    }
    
    // Загружаем сохраненное состояние новеллы
    const savedState = localStorage.getItem('novelState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            novelState.currentFrame = state.currentFrame || 0;
            novelState.currentImage = state.currentImage;
            novelState.currentMusic = state.currentMusic;
        } catch (e) {
            console.error('Ошибка при загрузке состояния новеллы:', e);
        }
    }
}

// Сохранение настроек в localStorage
function saveOptions() {
    // Сохраняем основные настройки
    localStorage.setItem('options', JSON.stringify(options));
    
    // Сохраняем текущее состояние новеллы
    const currentState = {
        currentFrame: novelState.currentFrame,
        currentImage: novelState.currentImage,
        currentMusic: novelState.currentMusic
    };
    localStorage.setItem('novelState', JSON.stringify(currentState));
}

// Применение настроек к интерфейсу
function applyOptions() {
    // Применение скорости
    elements.speedSlider.value = options.speed;
    elements.speedValue.textContent = options.speed;

    // Применение прозрачности подложки для текста
    elements.opacityBubbleSlider.value = options.opacityImageBabble;
    elements.opacityBubbleValue.textContent = options.opacityImageBabble;
    elements.imageBubble.style.opacity = options.opacityImageBabble/100;
    
    // Применение шрифта
    elements.fontFamily.value = options.fontFamily;
    elements.textContent.style.fontFamily = options.fontFamily;
    
    // Применение размера шрифта
    elements.fontSizeSlider.value = options.fontSize;
    elements.fontSizeValue.textContent = options.fontSize;
    elements.textContent.style.fontSize = `${options.fontSize}px`;
    
    // Применение цвета шрифта
    elements.fontColor.value = options.fontColor;
    elements.textContent.style.color = options.fontColor;
    
    // Включение/отклчение музыки
    elements.switchMusic.checked = options.isMusicOn;

    // Применение режима разработчика
    elements.developerMode.checked = options.isDeveloperMode;
    uiState.isDeveloperMode = options.isDeveloperMode;
    toggleDeveloperInfo();
}

function loadMusic(){
            const backgroundMusic = document.getElementById('background-music');
            backgroundMusic.src = `audio/${novelState.currentMusic}.mp3`;
            backgroundMusic.load();
            backgroundMusic.play().catch(e => console.error('Ошибка воспроизведения музыки:', e));
            
}

// включение / выключение музыки
function toggleMusic() {
    options.isMusicOn = !options.isMusicOn;
    elements.switchMusic.checked = options.isMusicOn;
    if (options.isMusicOn){
       loadMusic() 
    }else{
        pause();
    }
        
    saveOptions();  
}


// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка старта
    elements.startBtn.addEventListener('click', startNovel);
    
    // Кнопки навигации
    elements.prevBtn.addEventListener('click', () => novelController.prevFrame());
    elements.nextBtn.addEventListener('click', () => novelController.nextFrame());
    
    // Кнопки управления
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    elements.settingsBtn.addEventListener('click', showSettings);
    //elements.autoscrollBtn.addEventListener('click', toggleAutoscroll);
    elements.exitBtn.addEventListener('click', showExitDialog);
    
    // Кнопки настроек
    elements.closeSettingsBtn.addEventListener('click', hideSettings);
    elements.speedSlider.addEventListener('input', updateSpeed);
    elements.opacityBubbleSlider.addEventListener('input', updateOpacityBubble);
    elements.fontFamily.addEventListener('change', updateFontFamily);
    elements.fontSizeSlider.addEventListener('input', updateFontSize);
    elements.fontColor.addEventListener('input', updateFontColor);
    elements.restartBtn.addEventListener('click', restartNovel);
    elements.gotoBtn.addEventListener('click', gotoLine);
    elements.developerMode.addEventListener('change', toggleDeveloperMode);
    
    // включение / отклчение музыки
    elements.switchMusic.addEventListener('change', toggleMusic);

    // Кнопки диалога выхода
    elements.confirmExitBtn.addEventListener('click', exitNovel);
    elements.cancelExitBtn.addEventListener('click', hideExitDialog);
    
    // Клавиатурная навигация
    document.addEventListener('keydown', handleKeyDown);
    
    // Свайпы для мобильных устройств
    setupTouchEvents();
}

// Начало новеллы
function startNovel() {
    elements.startScreen.style.display = 'none';
    novelController.start();
}

// Перезапуск новеллы
function restartNovel() {
    hideSettings();
    novelController.restart();
}

// Переход к определенной строке
function gotoLine() {
    const lineNumber = parseInt(elements.gotoLine.value);
    if (!isNaN(lineNumber) && lineNumber >= 0 && lineNumber < story.length) {
        hideSettings();
        novelController.gotoFrame(lineNumber);
    } else {
        alert(`Пожалуйста, введите номер строки от 0 до ${story.length - 1}`);
    }
}

// Переключение воспроизведения/паузы
function togglePlayPause() {
    if (uiState.isPlaying) {
        novelController.pause();
        elements.playPauseIcon.src = 'ui/play.png';
        elements.playPauseBtn.classList.remove('active-btn');
    } else {
        novelController.play();
        elements.playPauseIcon.src = 'ui/pause.png';
        elements.playPauseBtn.classList.add('active-btn');
    }
    uiState.isPlaying = !uiState.isPlaying;
}

// Переключение автопрокрутки
function toggleAutoscroll() {
    uiState.isAutoscrollEnabled = !uiState.isAutoscrollEnabled;
    // if (uiState.isAutoscrollEnabled) {
    //     elements.autoscrollBtn.classList.add('active-btn');
    // } else {
    //     elements.autoscrollBtn.classList.remove('active-btn');
    // }
    novelController.setAutoscroll(uiState.isAutoscrollEnabled);
}

// Показать настройки
function showSettings() {
    elements.settingsScreen.style.display = 'flex';
    if (uiState.isPlaying) {
        togglePlayPause(); // Ставим на паузу при открытии настроек
    }
}

// Скрыть настройки
function hideSettings() {
    elements.settingsScreen.style.display = 'none';
}

// Показать диалог выхода
function showExitDialog() {
    elements.exitDialog.style.display = 'flex';
    if (uiState.isPlaying) {
        togglePlayPause(); // Ставим на паузу при открытии диалога
    }
}

// Скрыть диалог выхода
function hideExitDialog() {
    elements.exitDialog.style.display = 'none';
}

// Выход из новеллы
function exitNovel() {
    localStorage.setItem('LastFrame', novelController.getCurrentFrame());
    window.location.reload();
}

// Обновление скорости
function updateSpeed() {
    const speed = parseInt(elements.speedSlider.value);
    elements.speedValue.textContent = speed;
    options.speed = speed;
    saveOptions();
}

// обновлние прозрачности подложки для текста
function updateOpacityBubble(){
   const opacity = parseInt(elements.opacityBubbleSlider.value);
   elements.opacityBubbleValue.textContent = opacity;
   options.opacityImageBabble = opacity;
   elements.imageBubble.style.opacity = opacity/100;
   saveOptions();
}


// Обновление шрифта
function updateFontFamily() {
    const fontFamily = elements.fontFamily.value;
    elements.textContent.style.fontFamily = fontFamily;
    options.fontFamily = fontFamily;
    saveOptions();
}

// Обновление размера шрифта
function updateFontSize() {
    const fontSize = parseInt(elements.fontSizeSlider.value);
    elements.fontSizeValue.textContent = fontSize;
    elements.textContent.style.fontSize = `${fontSize}px`;
    options.fontSize = fontSize;
    saveOptions();
}

// Обновление цвета шрифта
function updateFontColor() {
    const fontColor = elements.fontColor.value;
    elements.textContent.style.color = fontColor;
    options.fontColor = fontColor;
    saveOptions();
}

// Переключение режима разработчика
function toggleDeveloperMode() {
    uiState.isDeveloperMode = elements.developerMode.checked;
    options.isDeveloperMode = uiState.isDeveloperMode;
    saveOptions();
    toggleDeveloperInfo();
}

// Создание элемента для отображения информации разработчика
function createDeveloperInfo() {
    const devInfo = document.createElement('div');
    devInfo.id = 'developer-info';
    devInfo.className = 'developer-info';
    document.getElementById('novel-container').appendChild(devInfo);
}

// Переключение отображения информации разработчика
function toggleDeveloperInfo() {
    const devInfo = document.getElementById('developer-info');
    if (uiState.isDeveloperMode) {
        devInfo.style.display = 'block';
    } else {
        devInfo.style.display = 'none';
    }
}

// Обновление информации разработчика
function updateDeveloperInfo(frameData) {
    if (!uiState.isDeveloperMode) return;
    
    const devInfo = document.getElementById('developer-info');
    let infoText = `Кадр: ${frameData.index} / ${story.length - 1}<br>`;
    infoText += `Время: ${frameData.duration} сек<br>`;
    
    if (frameData.image) {
        infoText += `Изображение: ${frameData.image}<br>`;
    }
    
    if (frameData.music) {
        infoText += `Музыка: ${frameData.music}<br>`;
    }
    
    if (frameData.sound) {
        infoText += `Звук: ${frameData.sound}<br>`;
    }
    
    devInfo.innerHTML = infoText;
}

// Обработка нажатий клавиш
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            novelController.prevFrame();
            break;
        case 'ArrowRight':
            novelController.nextFrame();
            break;
        case ' ':
            togglePlayPause();
            break;
        case 'Escape':
            if (elements.settingsScreen.style.display === 'flex') {
                hideSettings();
            } else if (elements.exitDialog.style.display === 'flex') {
                hideExitDialog();
            } else {
                showExitDialog();
            }
            break;
    }
}

// Настройка обработчиков свайпов для мобильных устройств
function setupTouchEvents() {
    let startX, startY;
    const container = document.getElementById('novel-container');
    
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Если горизонтальный свайп больше вертикального и больше минимального порога
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Свайп влево
                novelController.nextFrame();
            } else {
                // Свайп вправо
                novelController.prevFrame();
            }
        }
        
        startX = null;
        startY = null;
    }, false);
}

// Экспорт функций для использования в main.js
window.uiController = {
    initUI,
    togglePlayPause,
    updateDeveloperInfo
};