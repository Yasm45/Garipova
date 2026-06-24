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

/* Индексы слайдов */
var mainSlideIndex = 0;
var profileSlideIndex = 0;
var slideInterval = null;

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

/**
 * ========================================
 * ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
 * ========================================
 */

document.addEventListener('DOMContentLoaded', function() {
    /* Инициализация всех слайдеров */
    initSliders();
    
    /* Проверка авторизации */
    checkAuth();
    
    /* Отображение имени пользователя */
    updateUserDisplay();
    
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
    }
});

/**
 * ========================================
 * СЛАЙДЕР
 * ========================================
 */

function initSliders() {
    var mainSlider = document.getElementById('mainSlider');
    if (mainSlider) {
        initSlider(mainSlider, 'main');
    }
    
    var profileSlider = document.getElementById('profileSlider');
    if (profileSlider) {
        initSlider(profileSlider, 'profile');
    }
    
    startAutoSlide();
}

function initSlider(track, id) {
    var container = track.closest('.slider-container');
    if (!container) return;
    
    var images = track.querySelectorAll('img');
    var total = images.length;
    var dotsContainer = container.querySelector('.slider-dots');
    
    if (total === 0) return;
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (var i = 0; i < total; i++) {
            var dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.dataset.index = i;
            (function(index) {
                dot.addEventListener('click', function() {
                    goToSlide(id, index);
                });
            })(i);
            dotsContainer.appendChild(dot);
        }
    }
    
    if (id === 'main') {
        window.mainSlider = track;
        window.mainDots = dotsContainer;
        window.mainTotal = total;
        window.mainSlideIndex = 0;
    } else if (id === 'profile') {
        window.profileSlider = track;
        window.profileDots = dotsContainer;
        window.profileTotal = total;
        window.profileSlideIndex = 0;
    }
}

function goToSlide(id, index) {
    var track, dots, total;
    
    if (id === 'main') {
        track = window.mainSlider;
        dots = window.mainDots;
        total = window.mainTotal;
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        window.mainSlideIndex = index;
    } else if (id === 'profile') {
        track = window.profileSlider;
        dots = window.profileDots;
        total = window.profileTotal;
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        window.profileSlideIndex = index;
    } else {
        return;
    }
    
    if (!track) return;
    
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
    var mainSlider = document.getElementById('mainSlider');
    var profileSlider = document.getElementById('profileSlider');
    
    if (mainSlider && mainSlider.offsetParent !== null) {
        var idx = (window.mainSlideIndex || 0) + 1;
        goToSlide('main', idx);
    } else if (profileSlider && profileSlider.offsetParent !== null) {
        var idx = (window.profileSlideIndex || 0) + 1;
        goToSlide('profile', idx);
    }
    resetAutoSlide();
}

function prevSlide() {
    var mainSlider = document.getElementById('mainSlider');
    var profileSlider = document.getElementById('profileSlider');
    
    if (mainSlider && mainSlider.offsetParent !== null) {
        var idx = (window.mainSlideIndex || 0) - 1;
        goToSlide('main', idx);
    } else if (profileSlider && profileSlider.offsetParent !== null) {
        var idx = (window.profileSlideIndex || 0) - 1;
        goToSlide('profile', idx);
    }
    resetAutoSlide();
}

function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(function() {
        var mainSlider = document.getElementById('mainSlider');
        var profileSlider = document.getElementById('profileSlider');
        
        if (mainSlider && mainSlider.offsetParent !== null) {
            var idx = (window.mainSlideIndex || 0) + 1;
            goToSlide('main', idx);
        } else if (profileSlider && profileSlider.offsetParent !== null) {
            var idx = (window.profileSlideIndex || 0) + 1;
            goToSlide('profile', idx);
        }
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
    
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
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
        if (errorMsg) errorMsg.textContent = 'Введите корректный email (например: example@mail.ru)';
        return false;
    }
    
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    return true;
}

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
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    DB.setUsers(users);
    
    console.log('Зарегистрирован пользователь:', newUser);
    console.log('Все пользователи:', DB.getUsers());
    
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
    
    console.log('Попытка входа. Логин:', username, 'Пароль:', password);
    
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
    console.log('Все пользователи в базе:', users);
    
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
    DB.setCurrentUser(foundUser);
    currentUser = foundUser;
    
    console.log('Найден пользователь:', foundUser);
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
    
    var display = document.getElementById('userDisplay');
    if (display) {
        display.textContent = currentUser.fullname;
    }
    
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
                '<span style="font-size: 13px; color: #28a745; display: inline-block; margin-top: 6px;">Отзыв оставлен</span>';
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

function selectForReview(appId) {
    var select = document.getElementById('reviewApplicationSelect');
    if (select) {
        select.value = appId;
        select.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Выберите рейтинг и напишите отзыв', 'info');
    }
}

/**
 * ========================================
 * ЗВЕЗДНЫЙ РЕЙТИНГ И ОТЗЫВЫ
 * ========================================
 */

var selectedRating = 0;

function initStarRating() {
    var stars = document.querySelectorAll('.star-rating .star');
    for (var i = 0; i < stars.length; i++) {
        (function(star) {
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.dataset.value);
                updateStars(selectedRating);
            });
            star.addEventListener('mouseenter', function() {
                var value = parseInt(this.dataset.value);
                highlightStars(value);
            });
            star.addEventListener('mouseleave', function() {
                highlightStars(selectedRating);
            });
        })(stars[i]);
    }
}

function updateStars(rating) {
    var stars = document.querySelectorAll('.star-rating .star');
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].classList.add('active');
        } else {
            stars[i].classList.remove('active');
        }
    }
}

function highlightStars(rating) {
    var stars = document.querySelectorAll('.star-rating .star');
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].classList.add('active');
        } else {
            stars[i].classList.remove('active');
        }
    }
}

function submitReview() {
    if (!currentUser) {
        showToast('Пожалуйста, войдите в систему', 'danger');
        return;
    }
    
    var select = document.getElementById('reviewApplicationSelect');
    var text = document.getElementById('reviewText');
    var message = document.getElementById('reviewMessage');
    
    if (!select.value) {
        message.innerHTML = '<div class="alert alert-danger">Выберите заявку для отзыва</div>';
        showToast('Выберите заявку', 'danger');
        return;
    }
    
    if (selectedRating === 0) {
        message.innerHTML = '<div class="alert alert-danger">Поставьте оценку (1-5 звезд)</div>';
        showToast('Поставьте оценку', 'warning');
        return;
    }
    
    if (!text.value.trim() || text.value.trim().length < 5) {
        message.innerHTML = '<div class="alert alert-danger">Напишите отзыв (минимум 5 символов)</div>';
        showToast('Напишите более развернутый отзыв', 'warning');
        return;
    }
    
    var reviews = DB.getReviews();
    var newReview = {
        id: Date.now(),
        userId: currentUser.id,
        applicationId: parseInt(select.value),
        rating: selectedRating,
        text: text.value.trim(),
        createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    DB.setReviews(reviews);
    
    var apps = DB.getApplications();
    var appIndex = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === parseInt(select.value)) {
            appIndex = i;
            break;
        }
    }
    if (appIndex !== -1) {
        apps[appIndex].reviewGiven = true;
        DB.setApplications(apps);
    }
    
    var starsText = '';
    for (var i = 0; i < selectedRating; i++) {
        starsText += '*';
    }
    message.innerHTML = '<div class="alert alert-success">Спасибо за отзыв! ' + starsText + '</div>';
    showToast('Отзыв сохранен!', 'success');
    
    text.value = '';
    selectedRating = 0;
    updateStars(0);
    select.value = '';
    
    setTimeout(function() {
        loadProfileData();
    }, 1000);
}

/**
 * ========================================
 * АДМИН ПАНЕЛЬ
 * ========================================
 */

function loadAdminData() {
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    var apps = DB.getApplications();
    adminFilteredData = [];
    for (var i = 0; i < apps.length; i++) {
        adminFilteredData.push(apps[i]);
    }
    adminCurrentPage = 1;
    renderAdminTable();
    updateAdminCount();
}

function updateAdminCount() {
    var countEl = document.getElementById('adminCount');
    if (countEl) {
        countEl.textContent = 'Всего: ' + adminFilteredData.length + ' заявок';
    }
}

function filterApplications() {
    var search = document.getElementById('adminSearch').value.toLowerCase().trim();
    var statusFilter = document.getElementById('adminStatusFilter').value;
    
    var apps = DB.getApplications();
    adminFilteredData = [];
    for (var i = 0; i < apps.length; i++) {
        var matchSearch = apps[i].userFullname.toLowerCase().indexOf(search) !== -1;
        var matchStatus = statusFilter === '' || apps[i].status === statusFilter;
        if (matchSearch && matchStatus) {
            adminFilteredData.push(apps[i]);
        }
    }
    
    adminCurrentPage = 1;
    renderAdminTable();
    updateAdminCount();
}

function renderAdminTable() {
    var tbody = document.getElementById('adminTableBody');
    var pagination = document.getElementById('adminPagination');
    
    if (!tbody) return;
    
    var totalItems = adminFilteredData.length;
    var totalPages = Math.ceil(totalItems / adminItemsPerPage);
    if (totalPages === 0) totalPages = 1;
    
    if (totalItems === 0) {
        tbody.innerHTML = 
            '<tr>' +
                '<td colspan="6" style="text-align: center; padding: 30px; color: var(--gray);">' +
                    '<div style="font-size: 40px; margin-bottom: 8px;">-</div>' +
                    'Заявок не найдено' +
                '</td>' +
            '</tr>';
        pagination.innerHTML = '';
        return;
    }
    
    var start = (adminCurrentPage - 1) * adminItemsPerPage;
    var end = Math.min(start + adminItemsPerPage, totalItems);
    var pageItems = adminFilteredData.slice(start, end);
    
    var html = '';
    for (var i = 0; i < pageItems.length; i++) {
        var app = pageItems[i];
        var statusClass = '';
        if (app.status === 'Новая') {
            statusClass = 'status-new';
        } else if (app.status === 'Идет обучение') {
            statusClass = 'status-learning';
        } else {
            statusClass = 'status-completed';
        }
        
        var selectedNew = app.status === 'Новая' ? 'selected' : '';
        var selectedLearning = app.status === 'Идет обучение' ? 'selected' : '';
        var selectedCompleted = app.status === 'Обучение завершено' ? 'selected' : '';
        
        html += 
            '<tr class="fade-in">' +
                '<td><strong>#' + app.id + '</strong></td>' +
                '<td>' + app.userFullname + '</td>' +
                '<td>' + app.transport + '</td>' +
                '<td>' + app.startDate + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + app.status + '</span></td>' +
                '<td>' +
                    '<select onchange="changeStatus(' + app.id + ', this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px; width: 100%;">' +
                        '<option value="Новая" ' + selectedNew + '>Новая</option>' +
                        '<option value="Идет обучение" ' + selectedLearning + '>Идет обучение</option>' +
                        '<option value="Обучение завершено" ' + selectedCompleted + '>Обучение завершено</option>' +
                    '</select>' +
                '</td>' +
            '</tr>';
    }
    
    tbody.innerHTML = html;
    
    var pagHtml = '';
    pagHtml += '<button onclick="changePage(\'prev\')" ' + (adminCurrentPage === 1 ? 'disabled' : '') + '>&lt;</button>';
    
    for (var i = 1; i <= totalPages; i++) {
        if (i === adminCurrentPage) {
            pagHtml += '<button class="active">' + i + '</button>';
        } else if (i === 1 || i === totalPages || Math.abs(i - adminCurrentPage) <= 1) {
            pagHtml += '<button onclick="changePage(' + i + ')">' + i + '</button>';
        } else if (i === adminCurrentPage - 2 || i === adminCurrentPage + 2) {
            pagHtml += '<button disabled>...</button>';
        }
    }
    
    pagHtml += '<button onclick="changePage(\'next\')" ' + (adminCurrentPage === totalPages ? 'disabled' : '') + '>&gt;</button>';
    pagination.innerHTML = pagHtml;
}

function changePage(page) {
    var totalPages = Math.ceil(adminFilteredData.length / adminItemsPerPage);
    if (totalPages === 0) totalPages = 1;
    
    if (page === 'prev' && adminCurrentPage > 1) {
        adminCurrentPage--;
    } else if (page === 'next' && adminCurrentPage < totalPages) {
        adminCurrentPage++;
    } else if (typeof page === 'number' && page >= 1 && page <= totalPages) {
        adminCurrentPage = page;
    }
    
    renderAdminTable();
}

function changeStatus(appId, newStatus) {
    var apps = DB.getApplications();
    var appIndex = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === appId) {
            appIndex = i;
            break;
        }
    }
    
    if (appIndex === -1) {
        showToast('Заявка не найдена', 'danger');
        return;
    }
    
    var oldStatus = apps[appIndex].status;
    apps[appIndex].status = newStatus;
    DB.setApplications(apps);
    
    showToast('Статус заявки #' + appId + ' изменен: "' + oldStatus + '" -> "' + newStatus + '"', 'success');
    
    if (newStatus === 'Обучение завершено') {
        setTimeout(function() {
            showToast('Обучение завершено! Пользователь может оставить отзыв.', 'info');
        }, 600);
    }
    
    adminFilteredData = DB.getApplications();
    filterApplications();
}

function sortTable(column) {
    var sortMap = ['id', 'userFullname', 'transport', 'startDate'];
    var key = sortMap[column];
    
    if (adminSortColumn === column) {
        adminSortAsc = !adminSortAsc;
    } else {
        adminSortColumn = column;
        adminSortAsc = true;
    }
    
    adminFilteredData.sort(function(a, b) {
        var valA = a[key] || '';
        var valB = b[key] || '';
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return adminSortAsc ? -1 : 1;
        if (valA > valB) return adminSortAsc ? 1 : -1;
        return 0;
    });
    
    renderAdminTable();
    showToast('Сортировка по ' + key + (adminSortAsc ? ' (по возрастанию)' : ' (по убыванию)'), 'info');
}

/**
 * ========================================
 * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ========================================
 */

function showToast(message, type) {
    if (!type) type = 'info';
    
    var oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();
    
    var toast = document.createElement('div');
    toast.className = 'toast';
    
    var colors = {
        success: '#28a745',
        danger: '#dc3545',
        info: '#007bff',
        warning: '#ffc107'
    };
    
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(function() {
            toast.remove();
        }, 400);
    }, 3000);
}

function logout() {
    DB.clearCurrentUser();
    currentUser = null;
    showToast('Вы вышли из системы', 'info');
    setTimeout(function() {
        window.location.href = '../../index.html';
    }, 500);
    return false;
}

function updateUserDisplay() {
    currentUser = DB.getCurrentUser();
    
    var display = document.getElementById('userDisplay');
    if (display && currentUser) {
        display.textContent = currentUser.fullname;
    }
    
    var displayNav = document.getElementById('userDisplayNav');
    if (displayNav && currentUser) {
        displayNav.textContent = currentUser.fullname;
    }
}

function checkAuth() {
    var currentPage = window.location.pathname.split('/').pop();
    var protectedPages = ['profile.html', 'application.html', 'admin.html'];
    
    var isProtected = false;
    for (var i = 0; i < protectedPages.length; i++) {
        if (currentPage === protectedPages[i]) {
            isProtected = true;
            break;
        }
    }
    
    if (isProtected && !currentUser) {
        window.location.href = 'login.html';
    }
    
    if (currentPage === 'admin.html' && (!currentUser || currentUser.role !== 'admin')) {
        window.location.href = 'login.html';
    }
}