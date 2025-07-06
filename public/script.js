document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        lang: 'zh',
        isDarkMode: false,
        adminToken: null,
        currentEditingShareId: null,
    };

    // --- DOM ELEMENTS ---
    const dom = {
        // Main View
        mainContainer: document.getElementById('mainContainer'),
        content: document.getElementById('content'),
        markdownOutput: document.getElementById('markdown-output'),
        expirationDisplay: document.getElementById('expirationDisplay'),
        fileInput: document.getElementById('fileInput'),
        downloadExt: document.getElementById('downloadExt'),
        downloadButton: document.getElementById('downloadButton'),
        sharePassword: document.getElementById('sharePassword'),
        createShareButton: document.getElementById('createShareButton'),
        advancedOptions: document.getElementById('advancedOptions'),
        deletionTimeValue: document.getElementById('deletionTimeValue'),
        deletionTimeUnit: document.getElementById('deletionTimeUnit'),
        burnAfterReading: document.getElementById('burnAfterReading'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        shareLinkContainer: document.getElementById('shareLinkContainer'),
        shareUrl: document.getElementById('shareUrl'),
        copyLinkButton: document.getElementById('copyLinkButton'),

        // Admin Login View
        adminLoginContainer: document.getElementById('adminLoginContainer'),
        adminPasswordInput: document.getElementById('adminPasswordInput'),
        adminLoginButton: document.getElementById('adminLoginButton'),
        backToMainFromLogin: document.getElementById('backToMainFromLogin'),
        adminDebug: document.getElementById('adminDebug'),

        // Admin Panel View
        adminPanel: document.getElementById('adminPanel'),
        refreshSharesButton: document.getElementById('refreshSharesButton'),
        sharesList: document.getElementById('sharesList'),
        backToMainFromPanel: document.getElementById('backToMainFromPanel'),

        // Admin Modal
        adminShareModal: document.getElementById('adminShareModal'),
        modalShareId: document.getElementById('modalShareId'),
        modalContent: document.getElementById('modalContent'),
        modalPassword: document.getElementById('modalPassword'),
        modalBurnAfterReading: document.getElementById('modalBurnAfterReading'),
        saveShareChangesButton: document.getElementById('saveShareChangesButton'),
        closeModalButton: document.getElementById('closeModalButton'),

        // Global Controls
        langSelect: document.getElementById('langSelect'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        adminToggleButton: document.getElementById('adminToggleButton'),
        notification: document.getElementById('notification'),
    };

    // --- TRANSLATIONS ---
    const translations = {
        zh: {
            main_title: '文本分享',
            language_name: '简体中文',
            share: '分享',
            download: '下载',
            loading: '正在处理...',
            copy_link: '复制链接',
            copy_success: '链接已复制!',
            copy_error: '复制失败',
            create_success: '分享链接已创建!',
            create_error: '创建链接失败',
            load_error: '加载内容失败',
            content_empty: '内容不能为空',
            file_too_large: '文件不能超过 1MB',
            upload_error: '文件读取失败',
            upload_file: '上传文件',
            enter_password_prompt: '请输入访问密码:',
            wrong_password: '密码错误',
            content_placeholder: '在这里粘贴或输入文本...',
            password_placeholder: '为分享链接设置密码 (可选)',
            download_ext_placeholder: '后缀名',
            advanced_options: '高级选项',
            deletion_time: '删除时间',
            unit_hour: '小时',
            unit_day: '天',
            unit_month: '月',
            burn_after_reading: '阅后即焚',
            admin_login_title: '管理员登录',
            admin_login_button: '登录',
            back_to_main: '返回',
            admin_toggle: '管理员登录',
            admin_login_success: '管理员登录成功！',
            admin_login_failure: '管理员密码错误！',
            admin_panel_title: '管理员面板',
            refresh_shares: '刷新列表',
            share_id: 'ID',
            share_password_protected: '密码保护',
            share_created_at: '创建时间',
            share_expires_at: '过期时间',
            share_burn_after_reading: '阅后即焚',
            view: '查看',
            edit: '编辑',
            delete: '删除',
            save: '保存',
            cancel: '取消',
            share_updated: '分享已更新！',
            expires_in: '过期时间:',
            toggle_dark_mode: '切换模式',
            switch_to_dark_mode: '切换到暗黑模式',
            switch_to_light_mode: '切换到亮色模式'
        },
        en: {
            main_title: 'Text Share App',
            language_name: 'English',
            share: 'Share',
            download: 'Download',
            loading: 'Processing...',
            copy_link: 'Copy Link',
            copy_success: 'Link copied!',
            copy_error: 'Failed to copy',
            create_success: 'Share link created!',
            create_error: 'Failed to create link',
            load_error: 'Failed to load content',
            content_empty: 'Content cannot be empty',
            file_too_large: 'File cannot exceed 1MB',
            upload_error: 'Failed to read file',
            upload_file: 'Upload File',
            enter_password_prompt: 'Please enter the password to view:',
            wrong_password: 'Incorrect password',
            content_placeholder: 'Paste or type text here...',
            password_placeholder: 'Set a password for the link (optional)',
            download_ext_placeholder: 'extension',
            advanced_options: 'Advanced Options',
            deletion_time: 'Deletion Time',
            unit_hour: 'Hour',
            unit_day: 'Day',
            unit_month: 'Month',
            burn_after_reading: 'Burn After Reading',
            admin_login_title: 'Admin Login',
            admin_login_button: 'Login',
            back_to_main: 'Back',
            admin_toggle: 'Admin Login',
            admin_login_success: 'Admin login successful!',
            admin_login_failure: 'Incorrect admin password!',
            admin_panel_title: 'Admin Panel',
            refresh_shares: 'Refresh List',
            share_id: 'ID',
            share_password_protected: 'Password Protected',
            share_created_at: 'Created At',
            share_expires_at: 'Expires At',
            share_burn_after_reading: 'Burn After Reading',
            view: 'View',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            share_updated: 'Share updated!',
            expires_in: 'Expires in:',
            toggle_dark_mode: 'Switch Mode',
            switch_to_dark_mode: 'Switch to Dark Mode',
            switch_to_light_mode: 'Switch to Light Mode'
        }
    };

    // --- FUNCTIONS ---

    const setView = (viewName) => {
        dom.mainContainer.style.display = 'none';
        dom.adminLoginContainer.style.display = 'none';
        dom.adminPanel.style.display = 'none';
        if (dom[viewName]) {
            dom[viewName].style.display = 'block';
        }
    };

    const showNotification = (message, type = 'success') => {
        dom.notification.textContent = message;
        dom.notification.className = `notification ${type} show`;
        setTimeout(() => {
            dom.notification.classList.remove('show');
        }, 3000);
    };

    const applyTranslations = () => {
        const lang = state.lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
        document.title = translations[lang].main_title;
        updateDarkModeButtonText();
    };

    const setLanguage = (lang) => {
        state.lang = lang;
        localStorage.setItem('language', lang);
        applyTranslations();
    };

    const updateDarkModeButtonText = () => {
        dom.darkModeToggle.textContent = state.isDarkMode 
            ? translations[state.lang].switch_to_light_mode 
            : translations[state.lang].switch_to_dark_mode;
    };

    const toggleDarkMode = () => {
        state.isDarkMode = !state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        localStorage.setItem('darkMode', state.isDarkMode ? 'enabled' : 'disabled');
        updateDarkModeButtonText();
    };

    const setRandomBackground = async () => {
        try {
            const response = await fetch('https://www.loliapi.com/acg/');
            if (response.ok) {
                document.body.style.backgroundImage = `url('${response.url}')`;
            }
        } catch (error) {
            console.error('Error setting background image:', error);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) { // 1MB limit
            showNotification(translations[state.lang].file_too_large, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            dom.content.value = e.target.result;
            const fileNameParts = file.name.split('.');
            if (fileNameParts.length > 1) {
                dom.downloadExt.value = fileNameParts.pop();
            } else {
                dom.downloadExt.value = 'txt';
            }
        };
        reader.onerror = () => {
            showNotification(translations[state.lang].upload_error, 'error');
        };
        reader.readAsText(file);
        dom.fileInput.value = ''; // Reset for next upload
    };

    const createShareLink = async () => {
        // Implementation for creating a share link
    };

    const loadSharedContent = async () => {
        // Implementation for loading shared content
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        dom.langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
        dom.darkModeToggle.addEventListener('click', toggleDarkMode);
        dom.fileInput.addEventListener('change', handleFileUpload);
        dom.createShareButton.addEventListener('click', createShareLink);
        // ... other event listeners
    };

    // --- INITIALIZATION ---
    const init = () => {
        try {
            // Populate language selector
            for (const langCode in translations) {
                const option = document.createElement('option');
                option.value = langCode;
                option.textContent = translations[langCode].language_name;
                dom.langSelect.appendChild(option);
            }

            // Load preferences
            const savedLang = localStorage.getItem('language') || 'zh';
            dom.langSelect.value = savedLang;
            setLanguage(savedLang);

            const savedDarkMode = localStorage.getItem('darkMode');
            state.isDarkMode = savedDarkMode !== 'disabled';
            document.body.classList.toggle('dark-mode', state.isDarkMode);
            updateDarkModeButtonText();

            // Setup event listeners
            setupEventListeners();

            // Initial UI setup
            setView('mainContainer');
            loadSharedContent();
            setRandomBackground();

        } catch (error) {
            console.error('Initialization failed:', error);
            document.body.innerHTML = '<h1>Application failed to load. Please check the console.</h1>';
        }
    };

    init();
});