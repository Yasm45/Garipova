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

/**
 * ========================================
 * ОБРАБОТЧИК ФОРМЫ РЕГИСТРАЦИИ
 * ========================================
 */

function handleRegister(e) {
    e.preventDefault();
    
    var login = document.getElementById('regLogin');
    var password = document.getElementById('regPassword');
    var fullname = document.getElementById('regFullname');
    var birthdate = document.getElementById('regBirthdate');
    var phone = document.getElementById('regPhone');
    var email = document.getElementById('regEmail');
    
    var isValidLogin = validateLogin(login);
    var isValidPass = validatePassword(password);
    var isValidFullname = validateFullname(fullname);
    var isValidBirthdate = validateBirthdate(birthdate);
    var isValidPhone = validatePhone(phone);
    var isValidEmail = validateEmail(email);
    
    if (!isValidLogin || !isValidPass || !isValidFullname || 
        !isValidBirthdate || !isValidPhone || !isValidEmail) {
        showToast('Пожалуйста, исправьте ошибки в форме', 'danger');
        return;
    }
    
    var users = DB.getUsers();
    
    /* Проверка на существование логина */
    for (var i = 0; i < users.length; i++) {
        if (users[i].login === login.value.trim()) {
            showToast('Пользователь с таким логином уже существует', 'danger');
            return;
        }
    }
    
    var newUser = {
        id: Date.now(),
        login: login.value.trim(),
        password: password.value,
        fullname: fullname.value.trim(),
        birthdate: birthdate.value,
        phone: phone.value.trim(),
        email: email.value.trim(),
        registeredAt: new Date().toISOString(),
        lastLogin: null,
        avatar: null
    };
    
    users.push(newUser);
    DB.setUsers(users);
    
    showToast('Регистрация успешна! Теперь войдите в систему.', 'success');
    setTimeout(function() {
        window.location.href = 'login.html';
    }, 1500);
}

/**
 * ========================================
 * ОБРАБОТЧИК ФОРМЫ ВХОДА
 * ========================================
 */

function handleLogin(e) {
    e.preventDefault();
    
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    var alertDiv = document.getElementById('loginAlert');
    
    /* Проверка администратора */
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        DB.setCurrentUser({ 
            id: 'admin', 
            login: ADMIN_CREDENTIALS.username, 
            role: 'admin',
            fullname: 'Администратор'
        });
        currentUser = DB.getCurrentUser();
        showToast('Добро пожаловать в панель администратора', 'success');
        setTimeout(function() {
            window.location.href = 'admin.html';
        }, 500);
        return;
    }
    
    /* Проверка пользователя */
    var users = DB.getUsers();
    var foundUser = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].login === username && users[i].password === password) {
            foundUser = users[i];
            break;
        }
    }
    
    if (!foundUser) {
        alertDiv.style.display = 'block';
        alertDiv.textContent = 'Неправильный логин или пароль! Попробуйте снова.';
        showToast('Неверный логин или пароль', 'danger');
        return;
    }
    
    alertDiv.style.display = 'none';
    
    /* Обновляем время последнего входа */
    foundUser.lastLogin = new Date().toISOString();
    var allUsers = DB.getUsers();
    for (var j = 0; j < allUsers.length; j++) {
        if (allUsers[j].id === foundUser.id) {
            allUsers[j].lastLogin = foundUser.lastLogin;
            break;
        }
    }
    DB.setUsers(allUsers);
    
    DB.setCurrentUser(foundUser);
    currentUser = foundUser;
    
    showToast('Добро пожаловать, ' + foundUser.fullname + '!', 'success');
    setTimeout(function() {
        window.location.href = 'profile.html';
    }, 500);
}

/**
 * ========================================
 * ОБРАБОТЧИК ФОРМЫ ЗАЯВКИ
 * ========================================
 */

function handleApplication(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Пожалуйста, войдите в систему', 'danger');
        window.location.href = 'login.html';
        return;
    }
    
    var transport = document.getElementById('transportType');
    var startDate = document.getElementById('startDate');
    var payment = document.getElementById('paymentMethod');
    
    var isValid = true;
    
    if (!transport.value) {
        transport.closest('.form-group').classList.add('error');
        isValid = false;
    } else {
        transport.closest('.form-group').classList.remove('error');
        transport.closest('.form-group').classList.add('success');
    }
    
    if (!validateDateInput(startDate)) {
        isValid = false;
    }
    
    if (!payment.value) {
        payment.closest('.form-group').classList.add('error');
        isValid = false;
    } else {
        payment.closest('.form-group').classList.remove('error');
        payment.closest('.form-group').classList.add('success');
    }
    
    if (!isValid) {
        showToast('Пожалуйста, заполните все поля корректно', 'danger');
        return;
    }
    
    var apps = DB.getApplications();
    var newApp = {
        id: Date.now(),
        userId: currentUser.id,
        userFullname: currentUser.fullname,
        transport: transport.value,
        startDate: startDate.value,
        payment: payment.value,
        status: 'Новая',
        createdAt: new Date().toISOString(),
        reviewGiven: false
    };
    
    apps.push(newApp);
    DB.setApplications(apps);
    
    document.getElementById('applicationMessage').innerHTML = 
        '<div class="alert alert-success">Заявка успешно создана! Статус: Новая</div>';
    
    showToast('Заявка отправлена на согласование администратору', 'success');
    
    transport.value = '';
    startDate.value = '';
    payment.value = '';
    
    var groups = document.querySelectorAll('#applicationForm .form-group');
    for (var i = 0; i < groups.length; i++) {
        groups[i].classList.remove('success', 'error');
    }
    
    setTimeout(function() {
        window.location.href = 'profile.html';
    }, 1500);
}

/**
 * ========================================
 * ЛИЧНЫЙ КАБИНЕТ
 * ========================================
 */

function loadProfileData() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    /* Заполняем информацию о пользователе */
    fillUserProfile(currentUser);
    
    var apps = DB.getApplications();
    var userApps = [];
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].userId === currentUser.id) {
            userApps.push(apps[i]);
        }
    }
    
    var list = document.getElementById('applicationsList');
    
    if (userApps.length === 0) {
        list.innerHTML = 
            '<div class="empty-state">' +
                '<div class="empty-icon">-</div>' +
                '<h4>У вас пока нет заявок</h4>' +
                '<p style="color: var(--gray); font-size: 14px;">Создайте новую заявку на обучение</p>' +
                '<a href="application.html" class="btn btn-primary" style="margin-top: 12px;">Создать заявку</a>' +
            '</div>';
        return;
    }
    
    userApps.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    var html = '';
    for (var i = 0; i < userApps.length; i++) {
        var app = userApps[i];
        var statusClass = '';
        if (app.status === 'Новая') {
            statusClass = 'status-new';
        } else if (app.status === 'Идет обучение') {
            statusClass = 'status-learning';
        } else {
            statusClass = 'status-completed';
        }
        
        html += 
            '<div class="card" style="margin-bottom: 12px; animation: fadeIn 0.3s ease-out;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">' +
                    '<strong style="font-size: 16px;">' + app.transport + '</strong>' +
                    '<span class="status-badge ' + statusClass + '">' + app.status + '</span>' +
                '</div>' +
                '<div style="font-size: 14px; color: var(--gray); margin-top: 4px;">' +
                    'Дата: ' + app.startDate + ' | Оплата: ' + app.payment +
                    '<br>' +
                    '<small>Заявка #' + app.id + '</small>' +
                '</div>';
        
        if (app.status === 'Обучение завершено' && !app.reviewGiven) {
            html += 
                '<button onclick="selectForReview(\'' + app.id + '\')" class="btn btn-outline" style="margin-top: 8px; width: auto; padding: 6px 16px; font-size: 14px;">' +
                    'Оставить отзыв' +
                '</button>';
        } else if (app.reviewGiven) {
            html += 
                '<span style="font-size: 13px; color: var(--gray); display: inline-block; margin-top: 6px;">Отзыв оставлен</span>';
        } else if (app.status !== 'Обучение завершено') {
            html += 
                '<span style="font-size: 13px; color: var(--gray); display: inline-block; margin-top: 6px;">Ожидайте завершения обучения</span>';
        }
        
        html += '</div>';
    }
    
    list.innerHTML = html;
    
    var select = document.getElementById('reviewApplicationSelect');
    if (select) {
        var completedApps = [];
        for (var i = 0; i < userApps.length; i++) {
            if (userApps[i].status === 'Обучение завершено' && !userApps[i].reviewGiven) {
                completedApps.push(userApps[i]);
            }
        }
        
        if (completedApps.length === 0) {
            select.innerHTML = '<option value="">Нет завершенных заявок для отзыва</option>';
        } else {
            select.innerHTML = '<option value="">Выберите заявку</option>';
            for (var i = 0; i < completedApps.length; i++) {
                select.innerHTML += '<option value="' + completedApps[i].id + '">' + 
                    completedApps[i].transport + ' - ' + completedApps[i].startDate + '</option>';
            }
        }
    }
}

/* Заполнение профиля пользователя */
function fillUserProfile(user) {
    if (!user) return;
    
    var nameEl = document.getElementById('profileName');
    var loginEl = document.getElementById('profileLogin');
    var fullnameEl = document.getElementById('profileFullname');
    var birthdateEl = document.getElementById('profileBirthdate');
    var phoneEl = document.getElementById('profilePhone');
    var emailEl = document.getElementById('profileEmail');
    var registeredEl = document.getElementById('profileRegistered');
    var lastLoginEl = document.getElementById('profileLastLogin');
    var displayEl = document.getElementById('userDisplay');
    
    if (nameEl) nameEl.textContent = user.fullname;
    if (loginEl) loginEl.textContent = '@' + user.login;
    if (fullnameEl) fullnameEl.textContent = user.fullname;
    if (birthdateEl) birthdateEl.textContent = user.birthdate || 'Не указано';
    if (phoneEl) phoneEl.textContent = user.phone || 'Не указано';
    if (emailEl) emailEl.textContent = user.email || 'Не указано';
    
    if (registeredEl) {
        var regDate = user.registeredAt ? new Date(user.registeredAt) : new Date();
        registeredEl.textContent = formatDate(regDate);
    }
    
    if (lastLoginEl) {
        if (user.lastLogin) {
            var lastDate = new Date(user.lastLogin);
            lastLoginEl.textContent = formatDate(lastDate) + ', ' + formatTime(lastDate);
        } else {
            lastLoginEl.textContent = 'Первый вход';
        }
    }
    
    if (displayEl) displayEl.textContent = user.fullname;
    
    /* Аватар */
    var avatarImg = document.getElementById('avatarImage');
    if (avatarImg && user.avatar) {
        avatarImg.src = user.avatar;
    }
}

/* Форматирование даты */
function formatDate(date) {
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();
    return day + '.' + month + '.' + year;
}

/* Форматирование времени */
function formatTime(date) {
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
}

/* Смена аватарки */
function changeAvatar(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        var avatarImg = document.getElementById('avatarImage');
        if (avatarImg) {
            avatarImg.src = e.target.result;
            
            /* Сохраняем аватар в localStorage */
            var users = DB.getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === currentUser.id) {
                    users[i].avatar = e.target.result;
                    break;
                }
            }
            DB.setUsers(users);
            currentUser.avatar = e.target.result;
            DB.setCurrentUser(currentUser);
            
            showToast('Аватар обновлен', 'success');
        }
    };
    reader.readAsDataURL(file);
}

/* Выбор заявки для отзыва */
function selectForReview(appId) {
    var select = document.getElementById('reviewApplicationSelect');
    if (select) {
        select.value = appId;
        select.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Выберите рейтинг и напишите отзыв', 'info');
    }
}

