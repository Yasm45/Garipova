/**
 * ========================================
 * ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
 * ========================================
 */

/* Хранилище данных в localStorage */
const DB = {
    getUsers() {
        try {
            var data = localStorage.getItem('passazhiry_users');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    setUsers(users) {
        localStorage.setItem('passazhiry_users', JSON.stringify(users));
    },
    getApplications() {
        try {
            var data = localStorage.getItem('passazhiry_applications');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    setApplications(apps) {
        localStorage.setItem('passazhiry_applications', JSON.stringify(apps));
    },
    getReviews() {
        try {
            var data = localStorage.getItem('passazhiry_reviews');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    setReviews(reviews) {
        localStorage.setItem('passazhiry_reviews', JSON.stringify(reviews));
    },
    getCurrentUser() {
        try {
            var data = sessionStorage.getItem('passazhiry_current_user');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },
    setCurrentUser(user) {
        sessionStorage.setItem('passazhiry_current_user', JSON.stringify(user));
    },
    clearCurrentUser() {
        sessionStorage.removeItem('passazhiry_current_user');
    }
};

/* Текущий пользователь */
var currentUser = DB.getCurrentUser();

/* Индексы слайдов (для главной) */
var mainSlideIndex = 0;
var slideInterval = null;
var sliderTotal = 0;

/* Администратор */
var ADMIN_CREDENTIALS = {
    username: 'Admin26',
    password: 'Demo20'
};

/* Переменные для админ панели */
var adminCurrentPage = 1;
var adminItemsPerPage = 5;
var adminFilteredData = [];
var adminSortColumn = -1;
var adminSortAsc = true;

/* Переменные для звездного рейтинга */
var selectedRating = 0;

/**
 * ========================================
 * ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
 * ========================================
 */

document.addEventListener('DOMContentLoaded', function() {
    /* Проверка авторизации */
    checkAuth();
    
    /* Отображение имени пользователя */
    updateUserDisplay();
    
    /* Инициализация слайдера на главной странице */
    initSlider();
    
    /* Инициализация форм */
    initForms();
    
    /* Инициализация звездного рейтинга */
    initStarRating();
    
    /* Загрузка данных в личный кабинет */
    if (document.getElementById('applicationsList')) {
        loadProfileData();
    }
    
    /* Загрузка данных в админ панель */
    if (document.getElementById('adminTableBody')) {
        loadAdminData();
        updateAdminStats();
    }
});

/**
 * ========================================
 * СЛАЙДЕР (ДЛЯ ГЛАВНОЙ СТРАНИЦЫ)
 * ========================================
 */

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

/**
 * ========================================
 * ВАЛИДАЦИЯ ФОРМ
 * ========================================
 */

function initForms() {
    /* Форма регистрации */
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        var loginInput = document.getElementById('regLogin');
        var passInput = document.getElementById('regPassword');
        var emailInput = document.getElementById('regEmail');
        var fullnameInput = document.getElementById('regFullname');
        var birthdateInput = document.getElementById('regBirthdate');
        var phoneInput = document.getElementById('regPhone');
        
        if (loginInput) {
            loginInput.addEventListener('input', function() {
                validateLogin(this);
            });
        }
        if (passInput) {
            passInput.addEventListener('input', function() {
                validatePassword(this);
            });
        }
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                validateEmail(this);
            });
        }
        if (fullnameInput) {
            fullnameInput.addEventListener('input', function() {
                validateFullname(this);
            });
        }
        if (birthdateInput) {
            birthdateInput.addEventListener('change', function() {
                validateBirthdate(this);
            });
        }
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                validatePhone(this);
            });
        }
    }
    
    /* Форма входа */
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    /* Форма заявки */
    var appForm = document.getElementById('applicationForm');
    if (appForm) {
        appForm.addEventListener('submit', handleApplication);
        
        var dateInput = document.getElementById('startDate');
        if (dateInput) {
            dateInput.addEventListener('input', function() {
                validateDateInput(this);
            });
        }
    }
}

/* Валидация логина */
function validateLogin(input) {
    var value = input.value.trim();
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    var regex = /^[a-zA-Z0-9]{6,}$/;
    
    if (!value) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Логин обязателен для заполнения';
        return false;
    }
    
    if (!regex.test(value)) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Логин должен содержать латинские буквы и цифры, минимум 6 символов';
        return false;
    }
    
    var users = DB.getUsers();
    var currentLogin = value;
    for (var i = 0; i < users.length; i++) {
        if (users[i].login === currentLogin) {
            if (group) group.classList.add('error');
            if (group) group.classList.remove('success');
            if (errorMsg) errorMsg.textContent = 'Такой логин уже существует';
            return false;
        }
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

/* Валидация пароля */
function validatePassword(input) {
    var value = input.value;
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    if (!value) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Пароль обязателен для заполнения';
        return false;
    }
    
    if (value.length < 8) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Пароль должен содержать минимум 8 символов';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

/* Валидация email */
function validateEmail(input) {
    var value = input.value.trim();
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Email обязателен для заполнения';
        return false;
    }
    
    if (!regex.test(value)) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Введите корректный email';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

/* Валидация ФИО */
function validateFullname(input) {
    var value = input.value.trim();
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    if (!value || value.split(' ').length < 2) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Введите полное ФИО (минимум 2 слова)';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

/* Валидация даты рождения */
function validateBirthdate(input) {
    var value = input.value;
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    if (!value) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Выберите дату рождения';
        return false;
    }
    
    var birthDate = new Date(value);
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Вам должно быть не менее 18 лет';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

/* Валидация телефона */
function validatePhone(input) {
    var value = input.value.trim();
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    if (!value) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Номер телефона обязателен';
        return false;
    }
    
    var digits = value.replace(/\D/g, '');
    if (digits.length < 10) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Введите корректный номер телефона (минимум 10 цифр)';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

/* Валидация даты (ДД.ММ.ГГГГ) */
function validateDateInput(input) {
    var value = input.value.trim();
    var group = input.closest('.form-group');
    var errorMsg = group ? group.querySelector('.error-message') : null;
    
    if (!value) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Дата обязательна для заполнения';
        return false;
    }
    
    var regex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
    
    if (!regex.test(value)) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Формат: ДД.ММ.ГГГГ (например: 15.08.2026)';
        return false;
    }
    
    var parts = value.split('.');
    var date = new Date(parts[2], parts[1] - 1, parts[0]);
    if (isNaN(date.getTime())) {
        if (group) group.classList.add('error');
        if (group) group.classList.remove('success');
        if (errorMsg) errorMsg.textContent = 'Введите корректную дату';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

