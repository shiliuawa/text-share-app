
// Simplified script for a text sharing website

// DOM Elements
const contentEl = document.getElementById('content');
const fileInput = document.getElementById('fileInput');
const downloadExtEl = document.getElementById('downloadExt');
const mainContainer = document.getElementById('mainContainer');
const shareUrlEl = document.getElementById('shareUrl');
const sharePasswordEl = document.getElementById('sharePassword');
const shareLinkContainer = document.getElementById('shareLink');
const loadingIndicator = document.getElementById('loadingIndicator');
const langSelect = document.getElementById('langSelect');
const deletionTimeValueInput = document.getElementById('deletionTimeValue');
const deletionTimeUnitSelect = document.getElementById('deletionTimeUnit');
const burnAfterReadingCheckbox = document.getElementById('burnAfterReading');
const adminLoginContainer = document.getElementById('adminLoginContainer');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminDebug = document.getElementById('adminDebug');
const adminToggleButton = document.getElementById('adminToggleButton');
const adminPanel = document.getElementById('adminPanel');
const sharesList = document.getElementById('sharesList');
const adminShareModal = document.getElementById('adminShareModal');
const modalShareId = document.getElementById('modalShareId');
const modalContent = document.getElementById('modalContent');
const modalPassword = document.getElementById('modalPassword');
const modalBurnAfterReading = document.getElementById('modalBurnAfterReading');
const expirationDisplay = document.getElementById('expirationDisplay');
const darkModeToggle = document.getElementById('darkModeToggle');

let currentEditingShareId = null; // To keep track of the share being edited

// Translations
const translations = {
    zh: {
        main_title: 'Text Share App',
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
        refresh_shares: '刷新分享列表',
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
        toggle_dark_mode: '切换模式'
    },
    en: {
        main_title: 'Text Share App',
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
        refresh_shares: 'Refresh Share List',
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
        expires_in: 'Expires in:'
    }
};

let currentLang = 'zh';

// --- Core Functions ---

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // For buttons, titles, summaries, and options
            if (el.tagName === 'BUTTON' || el.tagName === 'H1' || el.tagName === 'TITLE' || el.tagName === 'SUMMARY' || el.tagName === 'OPTION') {
                el.textContent = translations[lang][key];
            }
            // For placeholders
            if (el.placeholder) {
                el.placeholder = translations[lang][key];
            }
        }
    });
    // Special cases
    document.title = translations[lang].main_title;
    contentEl.placeholder = translations[lang].content_placeholder;
    sharePasswordEl.placeholder = translations[lang].password_placeholder;
    downloadExtEl.placeholder = translations[lang].download_ext_placeholder;
    darkModeToggle.textContent = translations[currentLang].toggle_dark_mode;

    // Update deletion time unit options
    document.getElementById('deletionTimeUnit').options[0].textContent = translations[currentLang].unit_hour;
    document.getElementById('deletionTimeUnit').options[1].textContent = translations[currentLang].unit_day;
    document.getElementById('deletionTimeUnit').options[2].textContent = translations[currentLang].unit_month;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    darkModeToggle.textContent = translations[currentLang].toggle_dark_mode;
}


async function setRandomBackground() {
    try {
        const response = await fetch('https://www.loliapi.com/acg/');
        if (!response.ok) {
            console.error('Failed to fetch background image:', response.statusText);
            return;
        }
        const imageUrl = response.url; // The API directly redirects to the image
        document.body.style.backgroundImage = `url('${imageUrl}')`;
    } catch (error) {
        console.error('Error setting background image:', error);
    }
}

async function createShareLink() {
    const content = contentEl.value;
    if (!content.trim()) {
        showNotification(translations[currentLang].content_empty, 'error');
        return;
    }

    setLoading(true);
    const password = sharePasswordEl.value;
    const burnAfterReading = burnAfterReadingCheckbox.checked;

    // Calculate expirationTtl based on user input
    const timeValue = parseInt(deletionTimeValueInput.value, 10);
    const timeUnit = deletionTimeUnitSelect.value;
    let expirationTtl = 0;

    if (isNaN(timeValue) || timeValue <= 0) {
        showNotification('请输入有效的删除时间', 'error');
        setLoading(false);
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
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('/api/create-share-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, password, expirationTtl, burnAfterReading })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const { key } = await response.json();
        shareUrlEl.value = `${window.location.origin}${window.location.pathname}?id=${key}`;
        shareLinkContainer.style.display = 'flex';
        showNotification(translations[currentLang].create_success, 'success');

    } catch (error) {
        console.error('Error creating share link:', error);
        showNotification(translations[currentLang].create_error, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadSharedContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // Initially hide elements that should only be visible on the creation page
    // This ensures they are hidden by default if an ID is present
    if (id) {
        document.querySelector('[onclick="createShareLink()"]').style.display = 'none';
        fileInput.style.display = 'none';
        sharePasswordEl.style.display = 'none';
        document.querySelector('.share-controls').style.display = 'none';
        document.getElementById('advancedOptions').style.display = 'none';
        document.querySelector('h1[data-i18n="main_title"]').style.display = 'none';
    }

    if (!id) {
        // This is the main page for creating new shares, not viewing one.
        mainContainer.style.display = 'block';
        return;
    }

    setLoading(true);

    try {
        let password = '';
        // First, try to get it without a password
        let response = await fetch(`/api/content?key=${id}`);

        if (response.status === 401) { // Unauthorized, likely needs a password
            password = prompt(translations[currentLang].enter_password_prompt);
            if (password === null) { // User cancelled prompt
                 contentEl.value = 'Password entry cancelled.';
                 return;
            }
            response = await fetch(`/api/content?key=${id}`, {
                headers: { 'Authorization': `Bearer ${password}` }
            });
        }

        if (response.status === 403) { // Forbidden, wrong password
            alert(translations[currentLang].wrong_password);
            contentEl.value = 'Incorrect password.';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.text();
        contentEl.value = content;
        contentEl.readOnly = true; // Make content read-only when viewing

        // Hide creation-related UI elements
        document.querySelector('[onclick="createShareLink()"]').style.display = 'none';
        fileInput.style.display = 'none';
        sharePasswordEl.style.display = 'none';
        document.querySelector('.share-controls').style.display = 'none';
        document.getElementById('advancedOptions').style.display = 'none';
        document.querySelector('h1[data-i18n="main_title"]').style.display = 'none';

        // Display expiration time if available
        const expiresAtHeader = response.headers.get('X-Expires-At');
        if (expiresAtHeader) {
            const expiresDate = new Date(parseInt(expiresAtHeader) * 1000);
            expirationDisplay.textContent = `${translations[currentLang].expires_in} ${expiresDate.toLocaleString()}`;
            expirationDisplay.style.display = 'block';
        } else {
            expirationDisplay.style.display = 'none';
        }

        // If burn after reading is enabled, delete the content after it's read
        if (response.headers.get('X-Burn-After-Reading') === 'true') {
            await fetch(`/api/content?key=${id}`, {
                method: 'DELETE'
            });
        }


    } catch (error) {
        console.error('Error loading content:', error);
        contentEl.value = translations[currentLang].load_error;
        showNotification(translations[currentLang].load_error, 'error');
    } finally {
        setLoading(false);
        mainContainer.style.display = 'block';
    }
}


// --- Utility Functions ---

function setLoading(isLoading) {
    if (isLoading) {
        mainContainer.classList.add('loading');
        loadingIndicator.style.display = 'block';
    } else {
        mainContainer.classList.remove('loading');
        loadingIndicator.style.display = 'none';
    }
}

function downloadContent() {
    const content = contentEl.value;
    if (!content) return;

    const ext = downloadExtEl.value.trim() || 'txt';
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const filename = id ? `shared-${id}.${ext}` : `text-share.${ext}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function copyShareLink() {
    shareUrlEl.select();
    try {
        document.execCommand('copy');
        showNotification(translations[currentLang].copy_success, 'success');
    } catch (err) {
        showNotification(translations[currentLang].copy_error, 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = type; // 'success' or 'error'
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// --- Admin Functions ---
let adminToken = localStorage.getItem('adminToken') || null;

function toggleAdminLogin() {
    if (adminLoginContainer.style.display === 'block') {
        adminLoginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
    } else {
        mainContainer.style.display = 'none';
        adminLoginContainer.style.display = 'block';
        adminPasswordInput.value = '';
        adminDebug.textContent = '';
    }
}

function showMainContainer() {
    adminLoginContainer.style.display = 'none';
    adminPanel.style.display = 'none'; // Hide admin panel when going back to main
    adminShareModal.style.display = 'none'; // Hide modal when going back to main
    mainContainer.style.display = 'block';
}

async function adminLogin() {
    const password = adminPasswordInput.value;
    if (!password) {
        adminDebug.textContent = '请输入密码';
        adminDebug.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            throw new Error(translations[currentLang].admin_login_failure);
        }

        const { token } = await response.json();
        localStorage.setItem('adminToken', token);
        adminToken = token;
        adminDebug.textContent = translations[currentLang].admin_login_success;
        adminDebug.style.color = 'green';
        
        // On successful login, hide login and show admin panel
        adminLoginContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAllShares(); // Load shares after successful login

    } catch (error) {
        console.error('Admin login error:', error);
        adminDebug.textContent = error.message;
        adminDebug.style.color = 'red';
        showNotification(error.message, 'error');
    }
}

async function loadAllShares() {
    sharesList.innerHTML = ''; // Clear previous list
    sharesList.appendChild(document.createTextNode(translations[currentLang].loading));

    try {
        const response = await fetch('/api/admin/list', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const shares = await response.json();
        sharesList.innerHTML = ''; // Clear loading text

        if (shares.length === 0) {
            sharesList.appendChild(document.createTextNode('没有分享内容。'));
            return;
        }

        shares.forEach(share => {
            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.style.border = '1px solid #eee';
            li.style.padding = '10px';
            li.style.borderRadius = '5px';

            const createdAt = new Date(share.metadata.createdAt).toLocaleString();
            const expiresAt = share.metadata.expiration ? new Date(share.metadata.expiration * 1000).toLocaleString() : '永不';

            li.innerHTML = `
                <strong>${translations[currentLang].share_id}:</strong> ${share.name}<br>
                <strong>${translations[currentLang].share_password_protected}:</strong> ${share.metadata.passwordHash ? '是' : '否'}<br>
                <strong>${translations[currentLang].share_created_at}:</strong> ${createdAt}<br>
                <strong>${translations[currentLang].share_expires_at}:</strong> ${expiresAt}<br>
                <strong>${translations[currentLang].share_burn_after_reading}:</strong> ${share.metadata.burnAfterReading ? '是' : '否'}<br>
                <button onclick="viewShare('${share.name}')" class="secondary" style="margin-right: 5px;">${translations[currentLang].view}</button>
                <button onclick="editShare('${share.name}')" class="secondary" style="margin-right: 5px;">${translations[currentLang].edit}</button>
                <button onclick="deleteShare('${share.name}')" class="danger">${translations[currentLang].delete}</button>
            `;
            sharesList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading shares:', error);
        sharesList.innerHTML = `加载分享列表失败: ${error.message}`;
        sharesList.style.color = 'red';
    }
}

async function viewShare(id) {
    try {
        const response = await fetch(`/api/admin/view?key=${id}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error(await response.text());
        const shareData = await response.json();

        modalShareId.textContent = `分享 ID: ${id}`;
        modalContent.value = shareData.content;
        modalContent.readOnly = true;
        modalPassword.style.display = 'none'; // Hide password input for view
        modalBurnAfterReading.checked = shareData.burnAfterReading;
        modalBurnAfterReading.disabled = true; // Disable checkbox for view
        document.querySelector('#adminShareModal button[onclick="saveShareChanges()"]').style.display = 'none'; // Hide save button

        adminShareModal.style.display = 'flex';
        currentEditingShareId = id;

    } catch (error) {
        console.error('Error viewing share:', error);
        showNotification(`查看分享 ${id} 失败: ${error.message}`, 'error');
    }
}

async function editShare(id) {
    try {
        const response = await fetch(`/api/admin/view?key=${id}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error(await response.text());
        const shareData = await response.json();

        modalShareId.textContent = `编辑分享 ID: ${id}`;
        modalContent.value = shareData.content;
        modalContent.readOnly = false;
        modalPassword.style.display = 'block'; // Show password input for edit
        modalPassword.value = ''; // Clear password field
        modalBurnAfterReading.checked = shareData.burnAfterReading;
        modalBurnAfterReading.disabled = false; // Enable checkbox for edit
        document.querySelector('#adminShareModal button[onclick="saveShareChanges()"]').style.display = 'inline-block'; // Show save button

        adminShareModal.style.display = 'flex';
        currentEditingShareId = id;

    } catch (error) {
        console.error('Error editing share:', error);
        showNotification(`编辑分享 ${id} 失败: ${error.message}`, 'error');
    }
}

async function saveShareChanges() {
    if (!currentEditingShareId) return;

    const id = currentEditingShareId;
    const content = modalContent.value;
    const password = modalPassword.value; // Can be empty string to remove password
    const burnAfterReading = modalBurnAfterReading.checked;

    try {
        const response = await fetch('/api/admin/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ key: id, content, password, burnAfterReading })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        showNotification(translations[currentLang].share_updated, 'success');
        closeAdminShareModal();
        loadAllShares(); // Refresh the list after saving

    } catch (error) {
        console.error('Error saving share changes:', error);
        showNotification(`保存分享 ${id} 失败: ${error.message}`, 'error');
    }
}

function closeAdminShareModal() {
    adminShareModal.style.display = 'none';
    currentEditingShareId = null;
}

async function deleteShare(id) {
    if (!confirm(`确定要删除分享: ${id} 吗？`)) {
        return;
    }
    try {
        const response = await fetch(`/api/admin/delete?key=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
        showNotification(`分享 ${id} 已删除`, 'success');
        loadAllShares(); // Refresh the list
    } catch (error) {
        console.error('Error deleting share:', error);
        showNotification(`删除分享 ${id} 失败: ${error.message}`, 'error');
    }
}


// --- Event Listeners ---

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
        showNotification(translations[currentLang].file_too_large, 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        contentEl.value = e.target.result;
        // Set the download extension based on the uploaded file's extension
        const fileNameParts = file.name.split('.');
        if (fileNameParts.length > 1) {
            downloadExtEl.value = fileNameParts.pop();
        } else {
            downloadExtEl.value = 'txt'; // Default to txt if no extension
        }
    };
    reader.onerror = () => {
        showNotification(translations[currentLang].upload_error, 'error');
    };
    reader.readAsText(file);
    fileInput.value = ''; // Reset for next upload
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // In this new model, Ctrl+S should not trigger an auto-save.
        // It could, however, trigger the "Create Share Link" action.
        createShareLink();
    }
});

window.onload = () => {
    // Populate language select
    for (const langCode in translations) {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = translations[langCode].main_title; // Using main_title as display text for language
        langSelect.appendChild(option);
    }

    const savedLang = localStorage.getItem('language') || 'zh';
    langSelect.value = savedLang;
    setLanguage(savedLang);
    loadSharedContent();
    setRandomBackground(); // Set random background on load

    // Set default values for deletion time
    deletionTimeValueInput.value = 24; // Default to 24 hours
    deletionTimeUnitSelect.value = 'hour';

    // Dark mode initialization
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled' || savedDarkMode === null) { // Default to dark mode if no preference
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    darkModeToggle.textContent = translations[currentLang].toggle_dark_mode;

    darkModeToggle.addEventListener('click', toggleDarkMode);
};
