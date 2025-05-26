// main.js - Основной функционал визуальной новеллы

// Состояние новеллы
const novelState = {
    currentFrame: 0,
    isPlaying: false,
    isAutoscrollEnabled: true,
    timer: null,
    currentMusic: null,
    currentImage: null
};

// Инициализация новеллы
function initNovel() {
    // Инициализация интерфейса и загрузка настроек
    window.uiController.initUI();
    
    // Загружаем сохраненное состояние новеллы
    const savedState = localStorage.getItem('novelState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            novelState.currentFrame = state.currentFrame || 0;
            novelState.currentImage = state.currentImage;
            novelState.currentMusic = state.currentMusic;
            
            // Отображаем текущий кадр, это также применит фон и музыку
            displayFrame();
        } catch (e) {
            console.error('Ошибка при загрузке состояния новеллы:', e);
            // В случае ошибки начинаем с начала
            novelState.currentFrame = 0;
            displayFrame();
        }
    } else {
        // Если нет сохраненного состояния, начинаем с начала
        novelState.currentFrame = 0;
        displayFrame();
    }
}

// Парсинг строки контента
function parseFrame(frameText, index) {
    const result = {
        index: index,
        text: frameText,
        duration: 3, // Значение по умолчанию
        image: null,
        music: null,
        sound: null
    };
    
    // Извлечение длительности [X]
    const durationMatch = frameText.match(/\[(\d+)\]/);
    if (durationMatch) {
        result.duration = parseInt(durationMatch[1]);
        result.text = result.text.replace(durationMatch[0], '');
    }
    
    // Извлечение изображения @XXX
    const imageMatch = frameText.match(/@(\w+)/);
    if (imageMatch) {
        result.image = imageMatch[1];
        result.text = result.text.replace(imageMatch[0], '');
    }
    
    // Извлечение фоновой музыки $XX
    const musicMatch = frameText.match(/\$(\w+)/);
    if (musicMatch) {
        result.music = musicMatch[1];
        result.text = result.text.replace(musicMatch[0], '');
    }
    
    // Извлечение звукового эффекта %XX
    const soundMatch = frameText.match(/%(\w+)/);
    if (soundMatch) {
        result.sound = soundMatch[1];
        result.text = result.text.replace(soundMatch[0], '');
    }
    
    return result;
}

// Отображение текущего кадра
function displayFrame(reloaded=false) {
    if (novelState.currentFrame < 0 || novelState.currentFrame >= story.length) {
        console.error('Некорректный номер кадра:', novelState.currentFrame);
        return;
    }
    
    const frameText = story[novelState.currentFrame];
    const frameData = parseFrame(frameText, novelState.currentFrame);
    
    // если была перегружена страница то параметры для novelState взять с загруженных
    // они там уже есть надо не стироать их

     if (reloaded){
        if (novelState.currentImage) frameData.image=novelState.currentImage
        if (novelState.currentMusic) frameData.music=novelState.currentMusic
    }

    // Отображение текста
    const textContent = document.getElementById('text-content');
    textContent.textContent = frameData.text;
    textContent.classList.remove('fade-in');
    void textContent.offsetWidth; // Сброс анимации
    textContent.classList.add('fade-in');
    
    // Обновление изображения, если указано
    if (frameData.image) {
        const backgroundImage = document.getElementById('background-image');
        backgroundImage.style.opacity = 0;
        
        setTimeout(() => {
            // Проверяем формат изображения (png или jpg) без вывода ошибок в консоль
            const checkImageFormat = () => {
                // Функция для проверки существования файла
                const fileExists = (url) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                        img.src = url;
                    });
                };
                
                // Асинхронная функция для проверки форматов
                const tryFormats = async () => {
                    // Сначала проверяем PNG
                    if (await fileExists(`images/${frameData.image}.png`)) {
                        backgroundImage.src = `images/${frameData.image}.png`;
                    } 
                    // Затем проверяем JPG
                    else if (await fileExists(`images/${frameData.image}.jpg`)) {
                        backgroundImage.src = `images/${frameData.image}.jpg`;
                    }
                    
                    // Показываем изображение после установки правильного src
                    setTimeout(() => {
                        backgroundImage.style.opacity = 1;
                    }, 100);
                    
                    // Сохраняем текущее изображение
                    novelState.currentImage = frameData.image;
                };
                
                tryFormats();
            };
            
            checkImageFormat();
        }, 500); // Задержка для эффекта fade
    }
    
    // Воспроизведение фоновой музыки, если указана
    if (frameData.music) {
        const backgroundMusic = document.getElementById('background-music');
        
        // Если музыка отличается от текущей, меняем
        if ((frameData.music !== novelState.currentMusic && !reloaded) || (frameData.music == novelState.currentMusic && reloaded) ) {
            backgroundMusic.src = `audio/${frameData.music}.mp3`;
            backgroundMusic.load();
            backgroundMusic.play().catch(e => console.error('Ошибка воспроизведения музыки:', e));
            novelState.currentMusic = frameData.music;
        }

            

    }
    
    // Воспроизведение звукового эффекта, если указан
    if (frameData.sound) {
        const soundEffect = document.getElementById('sound-effect');
        soundEffect.src = `audio/_${frameData.sound}.mp3`;
        soundEffect.load();
        soundEffect.play().catch(e => console.error('Ошибка воспроизведения звука:', e));
    }
    
    // Сохранение текущего кадра и состояния новеллы
    //localStorage.setItem('LastFrame', novelState.currentFrame);
    //localStorage.setItem('LastImage', novelState.currentImage);
    //localStorage.setItem('LastMusic', novelState.currentMusic);

    localStorage.setItem('novelState', JSON.stringify(novelState));

    if (window.uiController && typeof window.uiController.saveOptions === 'function') {
        window.uiController.saveOptions();
    }
    
    // Обновление информации для режима разработчика
    window.uiController.updateDeveloperInfo(frameData);
    
    // Если включен автоскролл, запускаем таймер для следующего кадра
    if (novelState.isPlaying && novelState.isAutoscrollEnabled) {
        // Очищаем предыдущий таймер, если он был
        if (novelState.timer) {
            clearTimeout(novelState.timer);
        }
        
        // Устанавливаем новый таймер
        const options = JSON.parse(localStorage.getItem('options')) || { speed: 1000 };
        const duration = frameData.duration * options.speed;
        
        novelState.timer = setTimeout(() => {
            nextFrame();
        }, duration);
    }
}

// Переход к следующему кадру
function nextFrame() {
    if (novelState.currentFrame < story.length - 1) {
        novelState.currentFrame++;
        displayFrame();
    } else {
        // Достигнут конец истории
        pause();
    }
}

// Переход к предыдущему кадру
function prevFrame() {
    if (novelState.currentFrame > 0) {
        novelState.currentFrame--;
        displayFrame();
    }
}

// Переход к конкретному кадру
function gotoFrame(frameIndex) {
    if (frameIndex >= 0 && frameIndex < story.length) {
        novelState.currentFrame = frameIndex;
        displayFrame();
    }
}

// Запуск воспроизведения
function play() {
    novelState.isPlaying = true;
    
    // Возобновляем воспроизведение музыки, если она была остановлена
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic && novelState.currentMusic) {
        backgroundMusic.play().catch(e => console.error('Ошибка воспроизведения музыки:', e));
    }
    
    displayFrame(); // Обновляем текущий кадр, чтобы запустить таймер
}

// Пауза воспроизведения
function pause() {
    novelState.isPlaying = false;
    
    // Очищаем таймер, если он был
    if (novelState.timer) {
        clearTimeout(novelState.timer);
        novelState.timer = null;
    }
    
    // Останавливаем музыку
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

// Запуск новеллы
function start() {
    displayFrame(true);
}

// Перезапуск новеллы
function restart() {
    novelState.currentFrame = 0;
    displayFrame();
    
    if (novelState.isPlaying) {
        pause();
        window.uiController.togglePlayPause(); // Обновляем состояние кнопки
    }
}

// Установка режима автоскролла
function setAutoscroll(enabled) {
    novelState.isAutoscrollEnabled = enabled;
    
    if (enabled && novelState.isPlaying) {
        displayFrame(); // Перезапускаем таймер
    }
}

// Получение текущего номера кадра
function getCurrentFrame() {
    return novelState.currentFrame;
}

// Экспорт контроллера новеллы
window.novelController = {
    start,
    nextFrame,
    prevFrame,
    gotoFrame,
    play,
    pause,
    restart,
    setAutoscroll,
    getCurrentFrame
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initNovel);