
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

// Translations
const translations = {
    zh: {
        main_title: '文本分享',
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
        download_ext_placeholder: '后缀名'
    },
    en: {
        main_title: 'Text Share',
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
        download_ext_placeholder: 'extension'
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
            // For buttons and titles
            if (el.tagName === 'BUTTON' || el.tagName === 'H1' || el.tagName === 'TITLE') {
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
}


async function createShareLink() {
    const content = contentEl.value;
    if (!content.trim()) {
        showNotification(translations[currentLang].content_empty, 'error');
        return;
    }

    setLoading(true);
    const password = sharePasswordEl.value;

    try {
        const response = await fetch('/api/create-share-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, password })
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
    const savedLang = localStorage.getItem('language') || 'zh';
    langSelect.value = savedLang;
    setLanguage(savedLang);
    loadSharedContent();
};
