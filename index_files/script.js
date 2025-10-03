/**
 * PageTranslate - Интеграция с виджетом Yandex Translate
 *
 * @author Sergey Agapov
 * @contact Telegram: @handpc
 * @contact Email: handpc@mail.ru
 * @github https://github.com/handpc/pagetranslate
 */

class PageTranslate {
    constructor() {
        this.config = this.getConfig();
        this.storageKey = 'yt-widget';
        this.currentLang = null;
        this.init();
    }

    /**
     * Получение конфигурации из DOM элемента
     */
    getConfig() {
        const paramsElement = document.getElementById("pagetranslate-params");
        if (!paramsElement) {
            throw new Error("PageTranslate params element not found");
        }
        return JSON.parse(paramsElement.getAttribute("data-params"));
    }

    /**
     * Инициализация переводчика
     */
    init() {
        this.setupStorage();
        this.currentLang = this.getCurrentLanguage();
        this.setupHtml();
        this.setupEventHandlers();
        this.loadYandexWidget();
    }

    /**
     * Настройка localStorage с языком по умолчанию, если не существует
     */
    setupStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            this.setLanguage(this.config.langDefault);
        }
    }

    /**
     * Получение текущего языка из localStorage
     */
    getCurrentLanguage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                return data.lang || this.config.langDefault;
            }
        } catch (e) {
            console.warn("Error parsing stored language:", e);
        }
        return this.config.langDefault;
    }

    /**
     * Установка языка в localStorage
     */
    setLanguage(lang) {
        const data = { lang: lang, active: true };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.currentLang = lang;
    }

    /**
     * Настройка HTML элементов и атрибутов
     */
    setupHtml() {
        // Обновляем все виджеты с текущим языком
        this.updateAllWidgets();

        // Устанавливаем направление RTL для RTL языков
        if (this.isRtlLanguage(this.currentLang)) {
            document.documentElement.setAttribute("dir", "rtl");
        }

        // Помечаем элементы, которые не должны переводиться
        this.markNonTranslatableElements();

        // Настраиваем классы виджета
        this.setupWidgetClasses();
    }

    /**
     * Обновление всех переключателей с текущим языком
     */
    updateAllWidgets() {
        // Обновляем все dropdown кнопки
        this.updateDropdownButtons();
        
        // Обновляем активные состояния всех элементов языков
        this.updateActiveStates();
    }

    /**
     * Обновление всех кнопок dropdown с текущим языком
     */
    updateDropdownButtons() {
        const dropdownButtons = document.querySelectorAll('.pagetranslate-dropdown .pagetranslate-langs');
        dropdownButtons.forEach(button => {
            // Устанавливаем атрибут для CSS флага
            button.setAttribute('data-current-lang', this.currentLang);
            
            // Получаем название языка из соответствующей кнопки в меню
            const langName = this.getLanguageNameFromButton(this.currentLang);
            button.textContent = langName;
            
            // Добавляем title для доступности на мобильных
            button.setAttribute('title', langName);
        });
    }

    /**
     * Обновление активных состояний всех элементов языков
     */
    updateActiveStates() {
        // Убираем активный класс со всех элементов
        const allLangElements = document.querySelectorAll('[data-pagetranslate-lang]');
        allLangElements.forEach(element => {
            element.classList.remove('pagetranslate-lang-active');
        });

        // Добавляем активный класс к элементам текущего языка
        const activeElements = document.querySelectorAll(`[data-pagetranslate-lang="${this.currentLang}"]`);
        activeElements.forEach(element => {
            element.classList.add('pagetranslate-lang-active');
        });
    }

    /**
     * Получение названия языка из кнопки в DOM
     */
    getLanguageNameFromButton(lang) {
        // Ищем кнопку с нужным языком в любом из виджетов
        const langButton = document.querySelector(`[data-pagetranslate-lang="${lang}"]`);
        if (langButton) {
            // Возвращаем текстовое содержимое кнопки, очищенное от лишних пробелов
            return langButton.textContent.trim();
        }
        
        // Fallback - возвращаем код языка в верхнем регистре
        return lang.toUpperCase();
    }

    /**
     * Проверка, является ли язык RTL
     */
    isRtlLanguage(lang) {
        if (!this.config.langsRtl) return false;
        return this.config.langsRtl.toLowerCase().includes(lang.toLowerCase());
    }

    /**
     * Помечаем элементы с data-pagetranslate-off как не переводимые
     */
    markNonTranslatableElements() {
        const elements = document.querySelectorAll("[data-pagetranslate-off]");
        elements.forEach(element => {
            element.classList.add("notranslate");
            element.setAttribute("translate", "no");
        });
    }

    /**
     * Настройка классов виджета
     */
    setupWidgetClasses() {
        const widgetType = this.config.widgetType || 'dropdown'; // dropdown или block
        const theme = this.config.theme;
        const showFlags = this.config.showFlags;

        // Добавляем класс для типа виджета
        document.body.classList.add(`pagetranslate-${widgetType}`);

        if (theme) {
            document.body.classList.add(`pagetranslate-theme-${theme}`);
        }

        if (showFlags === false) {
            document.body.classList.add('pagetranslate-no-flags');
        }
    }


    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        document.addEventListener("click", (event) => {
            const langElement = event.target.closest("[data-pagetranslate-lang]");
            const dropdownToggle = event.target.closest(".pagetranslate-langs");
            
            if (langElement) {
                this.handleLanguageChange(langElement);
            } else if (dropdownToggle && dropdownToggle.classList.contains('open')) {
                this.closeDropdown();
            } else if (dropdownToggle) {
                this.openDropdown(dropdownToggle);
            } else {
                this.closeDropdown();
            }
        });
        
        // Закрытие всех dropdown при клике вне них
        document.addEventListener("click", (event) => {
            if (!event.target.closest(".pagetranslate-dropdown")) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Обработка смены языка
     */
    handleLanguageChange(element) {
        const newLang = element.getAttribute("data-pagetranslate-lang");
        if (newLang && newLang !== this.currentLang) {
            this.setLanguage(newLang);
            this.updateAllWidgets(); // Обновляем все виджеты синхронно
            this.closeAllDropdowns(); // Закрываем все dropdown'ы
            window.location.reload();
        }
    }

    /**
     * Открытие dropdown
     */
    openDropdown(toggleElement) {
        this.closeAllDropdowns(); // Закрываем все открытые dropdown
        
        const dropdown = toggleElement.closest('.pagetranslate-dropdown');
        if (dropdown) {
            const menu = dropdown.querySelector('.pagetranslate-menu');
            if (menu) {
                toggleElement.classList.add('open');
                menu.classList.add('show');
            }
        }
    }

    /**
     * Закрытие всех dropdown
     */
    closeAllDropdowns() {
        const openDropdowns = document.querySelectorAll('.pagetranslate-langs.open');
        openDropdowns.forEach(toggle => {
            toggle.classList.remove('open');
            const menu = toggle.closest('.pagetranslate-dropdown')?.querySelector('.pagetranslate-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        });
    }

    /**
     * Закрытие dropdown (алиас для обратной совместимости)
     */
    closeDropdown() {
        this.closeAllDropdowns();
    }

    /**
     * Загрузка виджета Yandex Translate
     */
    loadYandexWidget() {
        // Создаем контейнер для виджета
        const widgetContainer = document.createElement("div");
        widgetContainer.id = "pageTranslateWidget";
        widgetContainer.style.display = "none";
        document.body.appendChild(widgetContainer);

        // Создаем и загружаем скрипт Yandex
        const script = document.createElement("script");
        const supportedLangs = this.getSupportedLanguages();
        const langParam = supportedLangs.length > 0 ? supportedLangs.join(',') : this.config.langDefault;

        script.src = `https://translate.yandex.net/website-widget/v1/widget.js?widgetId=${widgetContainer.id}&pageLang=${this.config.langDefault}&widgetTheme=light&autoMode=false`;
        script.onload = () => this.onWidgetLoaded();

        document.head.appendChild(script);
    }

    /**
     * Получение массива поддерживаемых языков
     */
    getSupportedLanguages() {
        // Поддержка массива языков в формате: ["ru", "en", "zh"]
        if (this.config.languages && Array.isArray(this.config.languages)) {
            return this.config.languages;
        }

        // Возврат к одному языку
        return [this.config.langDefault];
    }

    /**
     * Вызывается при загрузке виджета Yandex
     */
    onWidgetLoaded() {
        // Виджет готов, дополнительная настройка не требуется
        // console.log("Виджет Yandex Translate успешно загружен");
    }

    /**
     * Публичный метод для программного изменения языка
     */
    changeLanguage(lang) {
        if (this.getSupportedLanguages().includes(lang)) {
            this.setLanguage(lang);
            this.updateAllWidgets(); // Синхронизируем все виджеты
            window.location.reload();
        } else {
            console.warn(`Язык ${lang} не поддерживается`);
        }
    }

    /**
     * Публичный метод для получения текущего языка
     */
    getCurrentLang() {
        return this.currentLang;
    }

    /**
     * Публичный метод для получения поддерживаемых языков
     */
    getSupportedLangs() {
        return this.getSupportedLanguages();
    }

    /**
     * Публичный метод для синхронизации всех виджетов на странице
     */
    syncAllWidgets() {
        this.updateAllWidgets();
    }
}

// Инициализация при готовности DOM
document.addEventListener("DOMContentLoaded", () => {
    try {
        window.pageTranslate = new PageTranslate();
    } catch (error) {
        console.error("Ошибка инициализации PageTranslate:", error);
    }
});