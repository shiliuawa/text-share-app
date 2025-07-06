document.addEventListener('DOMContentLoaded', () => {
    try {
        // --- STATE MANAGEMENT ---
        const state = {
            lang: 'zh',
            isDarkMode: false,
            adminToken: null,
            currentEditingShareId: null,
            attachedFile: null, // { name: string, type: string, data: string (base64) }
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

            // Attachment elements
            attachmentContainer: document.getElementById('attachmentContainer'),
            attachedFileName: document.getElementById('attachedFileName'),
            clearAttachmentButton: document.getElementById('clearAttachmentButton'),
            filePreview: document.getElementById('filePreview'),

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
                file_too_large: '文件不能超过 25MB',
                upload_error: '文件读取失败',
                upload_file: '上传文件',
                clear_attachment: '清除附件',
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
                file_too_large: 'File cannot exceed 25MB',
                upload_error: 'Failed to read file',
                upload_file: 'Upload File',
                clear_attachment: 'Clear Attachment',
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
            console.log('Applying translations for language:', state.lang);
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

            // Update deletion time unit options
            dom.deletionTimeUnit.options[0].textContent = translations[lang].unit_hour;
            dom.deletionTimeUnit.options[1].textContent = translations[lang].unit_day;
            dom.deletionTimeUnit.options[2].textContent = translations[lang].unit_month;
        };

        const setLanguage = (lang) => {
            console.log('Setting language to:', lang);
            state.lang = lang;
            localStorage.setItem('language', lang);
            applyTranslations();
        };

        const updateDarkModeButtonText = () => {
            console.log('Updating dark mode button text. isDarkMode:', state.isDarkMode);
            dom.darkModeToggle.textContent = state.isDarkMode 
                ? translations[state.lang].switch_to_light_mode 
                : translations[state.lang].switch_to_dark_mode;
        };

        const toggleDarkMode = () => {
            console.log('Toggling dark mode. Current state:', state.isDarkMode);
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
                } else {
                    console.error('Failed to fetch background image:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error setting background image:', error);
            }
        };

        const handleFileUpload = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // 25MB limit for KV storage
            const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; 
            if (file.size > MAX_FILE_SIZE_BYTES) {
                showNotification(translations[state.lang].file_too_large, 'error');
                dom.fileInput.value = ''; // Clear the file input
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // Store file data as base64
                state.attachedFile = {
                    name: file.name,
                    type: file.type,
                    data: e.target.result // Base64 string
                };
                renderFilePreview(state.attachedFile);
                dom.fileInput.value = ''; // Clear the file input
            };
            reader.onerror = () => {
                showNotification(translations[state.lang].upload_error, 'error');
                dom.fileInput.value = ''; // Clear the file input
            };
            // Read file as Data URL (Base64)
            reader.readAsDataURL(file);
        };

        const renderFilePreview = (file) => {
            dom.filePreview.innerHTML = ''; // Clear previous preview
            dom.attachedFileName.textContent = file.name;
            dom.attachmentContainer.style.display = 'block';

            const fileType = file.type.split('/')[0]; // 'image', 'audio', 'video', 'application'

            if (fileType === 'image') {
                const img = document.createElement('img');
                img.src = file.data;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'contain';
                dom.filePreview.appendChild(img);
            } else if (fileType === 'audio') {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = file.data;
                audio.style.width = '100%';
                dom.filePreview.appendChild(audio);
            } else if (fileType === 'video') {
                const video = document.createElement('video');
                video.controls = true;
                video.src = file.data;
                video.style.maxWidth = '100%';
                video.style.maxHeight = '200px';
                dom.filePreview.appendChild(video);
            } else if (file.type === 'application/pdf') {
                const iframe = document.createElement('iframe');
                iframe.src = file.data;
                iframe.style.width = '100%';
                iframe.style.height = '300px';
                iframe.style.border = 'none';
                dom.filePreview.appendChild(iframe);
            } else {
                // For other file types, just show a generic icon or text
                const p = document.createElement('p');
                p.textContent = `Preview not available for ${file.type} files.`;
                dom.filePreview.appendChild(p);
            }
        };

        const clearAttachment = () => {
            state.attachedFile = null;
            dom.attachmentContainer.style.display = 'none';
            dom.attachedFileName.textContent = '';
            dom.filePreview.innerHTML = '';
            dom.fileInput.value = ''; // Clear the file input
        };

        const downloadContent = () => {
            let dataToDownload;
            let mimeType;
            let filename;

            if (state.attachedFile) {
                // If there's an attached file, download it
                dataToDownload = base64toBlob(state.attachedFile.data, state.attachedFile.type);
                mimeType = state.attachedFile.type;
                filename = state.attachedFile.name;
            } else {
                // Otherwise, download the content from the textarea
                const content = dom.content.value;
                if (!content) return; // If no content and no attachment, do nothing

                dataToDownload = new Blob([content], { type: 'text/plain;charset=utf-8' });
                mimeType = 'text/plain;charset=utf-8';
                const ext = dom.downloadExt.value.trim() || 'txt';
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                filename = id ? `shared-${id}.${ext}` : `text-share.${ext}`;
            }

            const url = window.URL.createObjectURL(dataToDownload);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        };

        // Helper function to convert base64 to Blob
        const base64toBlob = (base64, mimeType) => {
            const byteString = atob(base64.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeType });
        };

        const createShareLink = async () => {
            const content = dom.content.value;
            const password = dom.sharePassword.value;
            const burnAfterReading = dom.burnAfterReading.checked;

            if (!content.trim() && !state.attachedFile) {
                showNotification(translations[state.lang].content_empty, 'error');
                return;
            }

            dom.loadingIndicator.style.display = 'block';
            dom.mainContainer.classList.add('loading');

            // Calculate expirationTtl based on user input
            const timeValue = parseInt(dom.deletionTimeValue.value, 10);
            const timeUnit = dom.deletionTimeUnit.value;
            let expirationTtl = 0;

            if (isNaN(timeValue) || timeValue <= 0) {
                showNotification('请输入有效的删除时间', 'error');
                dom.loadingIndicator.style.display = 'none';
                dom.mainContainer.classList.remove('loading');
                return;
            }

            switch (timeUnit) {
                case 'hour':
                    expirationTtl = timeValue * 3600;
                    break;
                case 'day':
                    expirationTtl = timeValue * 86400;
                    break;
                case 'month':
                    expirationTtl = timeValue * 2592000; // Approximate 30 days per month
                    break;
                default:
                    expirationTtl = 2592000; // Default to 1 month if unit is invalid
            }

            // Client-side validation for expirationTtl (1 hour to 3 months)
            const minTtl = 3600; // 1 hour
            const maxTtl = 7776000; // 3 months (approx. 90 days)

            if (expirationTtl < minTtl || expirationTtl > maxTtl) {
                showNotification(`删除时间必须在 ${minTtl / 3600} 小时到 ${Math.round(maxTtl / 2592000)} 个月之间`, 'error');
                dom.loadingIndicator.style.display = 'none';
                dom.mainContainer.classList.remove('loading');
                return;
            }

            try {
                const response = await fetch('/api/create-share-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content,
                        password,
                        expirationTtl,
                        burnAfterReading,
                        attachedFile: state.attachedFile // Include attached file data
                    })
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const { key } = await response.json();
                dom.shareUrl.value = `${window.location.origin}${window.location.pathname}?id=${key}`;
                dom.shareLinkContainer.style.display = 'flex';
                showNotification(translations[state.lang].create_success, 'success');

                // Clear content and attachment after successful share
                dom.content.value = '';
                clearAttachment();

            } catch (error) {
                console.error('Error creating share link:', error);
                showNotification(translations[state.lang].create_error, 'error');
            } finally {
                dom.loadingIndicator.style.display = 'none';
                dom.mainContainer.classList.remove('loading');
            }
        };

        const loadSharedContent = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (!id) {
                // This is the main page for creating new shares, not viewing one.
                setView('mainContainer');
                return;
            }

            dom.loadingIndicator.style.display = 'block';
            dom.mainContainer.classList.add('loading');

            // Hide creation-related UI elements when viewing a shared link
            dom.content.style.display = 'none';
            dom.fileInput.style.display = 'none';
            dom.downloadExt.style.display = 'none';
            dom.downloadButton.style.display = 'none';
            dom.sharePassword.style.display = 'none';
            dom.createShareButton.style.display = 'none';
            dom.advancedOptions.style.display = 'none';
            dom.shareLinkContainer.style.display = 'none';

            try {
                let password = '';
                let response = await fetch(`/api/content?key=${id}`);

                if (response.status === 401) { // Unauthorized, likely needs a password
                    password = prompt(translations[state.lang].enter_password_prompt);
                    if (password === null) { // User cancelled prompt
                        dom.markdownOutput.textContent = 'Password entry cancelled.';
                        dom.markdownOutput.style.display = 'block';
                        return;
                    }
                    response = await fetch(`/api/content?key=${id}`, {
                        headers: { 'Authorization': `Bearer ${password}` }
                    });
                }

                if (response.status === 403) { // Forbidden, wrong password
                    alert(translations[state.lang].wrong_password);
                    dom.markdownOutput.textContent = 'Incorrect password.';
                    dom.markdownOutput.style.display = 'block';
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json(); // Expecting JSON now

                // Handle content
                if (data.content) {
                    dom.markdownOutput.innerHTML = marked.parse(data.content);
                    dom.markdownOutput.style.display = 'block';
                } else {
                    dom.markdownOutput.style.display = 'none';
                }

                // Handle attached file
                if (data.attachedFile) {
                    state.attachedFile = data.attachedFile;
                    renderFilePreview(state.attachedFile);
                    dom.downloadExt.value = state.attachedFile.name.split('.').pop() || 'txt';
                    dom.downloadExt.style.display = 'inline-block';
                    dom.downloadButton.style.display = 'inline-block';
                } else {
                    clearAttachment(); // Ensure no old attachment is shown
                }

                // Display expiration time if available
                const expiresAtHeader = response.headers.get('X-Expires-At');
                if (expiresAtHeader) {
                    const expiresDate = new Date(parseInt(expiresAtHeader) * 1000);
                    dom.expirationDisplay.textContent = `${translations[state.lang].expires_in} ${expiresDate.toLocaleString()}`;
                    dom.expirationDisplay.style.display = 'block';
                } else {
                    dom.expirationDisplay.style.display = 'none';
                }

                // If burn after reading is enabled, delete the content after it's read
                if (response.headers.get('X-Burn-After-Reading') === 'true') {
                    await fetch(`/api/content?key=${id}`, {
                        method: 'DELETE'
                    });
                }

            } catch (error) {
                console.error('Error loading content:', error);
                dom.markdownOutput.textContent = translations[state.lang].load_error;
                dom.markdownOutput.style.display = 'block';
                showNotification(translations[state.lang].load_error, 'error');
            } finally {
                dom.loadingIndicator.style.display = 'none';
                dom.mainContainer.classList.remove('loading');
            }
        };

        // --- EVENT LISTENERS ---
        const setupEventListeners = () => {
            console.log('Setting up event listeners...');
            dom.langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
            dom.darkModeToggle.addEventListener('click', toggleDarkMode);
            dom.fileInput.addEventListener('change', handleFileUpload);
            dom.createShareButton.addEventListener('click', createShareLink);
            dom.clearAttachmentButton.addEventListener('click', clearAttachment);
            dom.downloadButton.addEventListener('click', downloadContent);
            // ... other event listeners
        };

        // --- INITIALIZATION ---
        const init = () => {
            console.log('Initializing application...');
            try {
                // Populate language selector
                for (const langCode in translations) {
                    const option = document.createElement('option');
                    option.value = langCode;
                    option.textContent = translations[langCode].language_name;
                    dom.langSelect.appendChild(option);
                }

                // Load preferences
                // Load preferences
            const savedDarkMode = localStorage.getItem('darkMode');
            state.isDarkMode = savedDarkMode !== 'disabled';
            document.body.classList.toggle('dark-mode', state.isDarkMode);

            const savedLang = localStorage.getItem('language') || 'zh';
            dom.langSelect.value = savedLang;
            setLanguage(savedLang);

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
    } catch (e) {
        console.error("Top-level script error:", e);
        document.body.innerHTML = '<h1>A critical error occurred. Please check the console for details.</h1>';
    }
});