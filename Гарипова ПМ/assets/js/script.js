/**
 * ========================================
 * СКРИПТ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
 * ========================================
 */

/* Переменные для слайдера */
var mainSlideIndex = 0;
var slideInterval = null;
var sliderTotal = 0;

/**
 * ========================================
 * ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
 * ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    initSlider();
});

/**
 * ========================================
 * СЛАЙДЕР
 * ======================================== */
function initSlider() {
    var sliderTrack = document.getElementById('mainSlider');
    if (!sliderTrack) {
        return;
    }
    
    var container = sliderTrack.closest('.slider-container');
    if (!container) {
        return;
    }
    
    var images = sliderTrack.querySelectorAll('img');
    sliderTotal = images.length;
    
    if (sliderTotal === 0) {
        return;
    }
    
    var dotsContainer = document.getElementById('sliderDots');
    
    /* Создание точек */
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (var i = 0; i < sliderTotal; i++) {
            var dot = document.createElement('span');
            dot.className = 'dot';
            if (i === 0) {
                dot.classList.add('active');
            }
            dot.dataset.index = i;
            (function(index) {
                dot.addEventListener('click', function() {
                    goToSlide(index);
                });
            })(i);
            dotsContainer.appendChild(dot);
        }
    }
    
    /* Сохраняем ссылки */
    window.mainSlider = sliderTrack;
    window.mainDots = dotsContainer;
    window.mainSlideIndex = 0;
    
    /* Показываем первый слайд */
    goToSlide(0);
    
    /* Запуск автопереключения */
    startAutoSlide();
}

function goToSlide(index) {
    var track = window.mainSlider;
    var dots = window.mainDots;
    var total = sliderTotal;
    
    if (!track) {
        return;
    }
    
    if (index < 0) {
        index = total - 1;
    }
    if (index >= total) {
        index = 0;
    }
    
    window.mainSlideIndex = index;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    
    if (dots) {
        var dotElements = dots.querySelectorAll('.dot');
        for (var i = 0; i < dotElements.length; i++) {
            if (i === index) {
                dotElements[i].classList.add('active');
            } else {
                dotElements[i].classList.remove('active');
            }
        }
    }
}

function nextSlide() {
    var idx = (window.mainSlideIndex || 0) + 1;
    goToSlide(idx);
    resetAutoSlide();
}

function prevSlide() {
    var idx = (window.mainSlideIndex || 0) - 1;
    goToSlide(idx);
    resetAutoSlide();
}

function startAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    slideInterval = setInterval(function() {
        var idx = (window.mainSlideIndex || 0) + 1;
        goToSlide(idx);
    }, 3000);
}

function resetAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        startAutoSlide();
    }
}