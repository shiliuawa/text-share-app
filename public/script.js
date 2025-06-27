
const debug = document.getElementById('debug');
const clipboardList = document.getElementById('clipboardList');
const renameInput = document.getElementById('renameInput');
const renameBtn = document.getElementById('renameBtn');
const downloadExt = document.getElementById('downloadExt');
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const passwordInput = document.getElementById('passwordInput');
const fileInput = document.getElementById('fileInput');
const shareUrl = document.getElementById('shareUrl');
let lastKey = null;
let lastContent = '';
let token = localStorage.getItem('authToken') || null;
let saveTimeout;

const translations = {
    zh: {
        title: '在线剪贴板',
        enter_password: '请输入密码',
        submit: '提交',
        add_clipboard: '添加剪贴板',
        delete_clipboard: '删除当前剪贴板',
        rename: '重命名',
        confirm_rename: '确认重命名',
        save: '保存',
        download: '下载',
        loading: '加载中...',
        copy_link: '复制链接'
    },
    en: {
        title: 'Online Clipboard',
        enter_password: 'Enter Password',
        submit: 'Submit',
        add_clipboard: 'Add Clipboard',
        delete_clipboard: 'Delete Current Clipboard',
        rename: 'Rename',
        confirm_rename: 'Confirm Rename',
        save: 'Save',
        download: 'Download',
        loading: 'Loading...',
        copy_link: 'Copy Link'
    }
};

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[lang][key];
        if (el.tagName === 'TITLE') document.title = translations[lang][key];
    });
    document.getElementById('content').placeholder = lang === 'zh' ? '在这里输入内容...' : 'Enter content here...';
}

async function verifyPassword() {
    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';
    const password = passwordInput.value.trim();
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            body: JSON.stringify({ password }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('密码错误');
        const { token: newToken } = await response.json();
        localStorage.setItem('authToken', newToken);
        token = newToken;
        authContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        debug.innerText = '成功';
        debug.className = 'success';
        initClipboardList();
    } catch (error) {
        console.error('密码验证失败:', error);
        debug.innerText = '失败';
        debug.className = 'failure';
        alert(translations[localStorage.getItem('language') || 'zh'].enter_password + '错误');
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function initClipboardList() {
    try {
        const response = await fetch('/api/list', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('获取列表失败');
        const keys = await response.json();
        clipboardList.innerHTML = '';
        keys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.text = key;
            clipboardList.appendChild(option);
        });
        if (keys.length === 0) {
            const option = document.createElement('option');
            option.value = 'default';
            option.text = '默认剪贴板';
            clipboardList.appendChild(option);
        }
        sortClipboardList();
        loadContent();
    } catch (error) {
        console.error('初始化剪贴板列表失败:', error);
        debug.innerText = '失败';
        debug.className = 'failure';
    }
}

async function loadContent() {
    const clipboardKey = clipboardList.value;
    if (clipboardKey === lastKey) {
        document.getElementById('content').value = lastContent || '';
        debug.innerText = '成功';
        debug.className = 'success';
        updateShareLink(clipboardKey);
        return;
    }
    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';
    try {
        const response = await fetch(`/api/content?key=${clipboardKey}`, {
            
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('加载失败');
        lastContent = await response.text();
        lastKey = clipboardKey;
        document.getElementById('content').value = lastContent || '';
        debug.innerText = '成功';
        debug.className = 'success';
        updateShareLink(clipboardKey);
    } catch (error) {
        console.error('加载内容失败:', error);
        debug.innerText = '失败';
        debug.className = 'failure';
        document.getElementById('content').value = translations[localStorage.getItem('language') || 'zh'].loading + '失败，请检查网络或刷新';
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function saveContent() {
    const clipboardKey = clipboardList.value;
    const content = document.getElementById('content').value;
    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';
    try {
        const response = await fetch(`/api/content?key=${clipboardKey}`, {
            method: 'POST',
            body: content,
            headers: {
                'Content-Type': 'text/plain',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('保存失败');
        debug.innerText = '成功';
        debug.className = 'success';
        alert(translations[localStorage.getItem('language') || 'zh'].save + '成功');
    } catch (error) {
        console.error('保存内容失败:', error);
        debug.innerText = '失败';
        debug.className = 'failure';
        alert(translations[localStorage.getItem('language') || 'zh'].save + '失败，请重试');
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
    }
    await loadContent();
}

function downloadContent() {
    const content = document.getElementById('content').value;
    if (!content) {
        showNotification(translations[localStorage.getItem('language') || 'zh'].download + '失败：内容为空', 'error');
        debug.innerText = '失败';
        debug.className = 'failure';
        return;
    }
    const clipboardKey = clipboardList.value;
    const ext = downloadExt.value.trim() || 'txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clipboardKey}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    debug.innerText = '成功';
    debug.className = 'success';
}

async function addClipboard() {
    const existingKeys = Array.from(clipboardList.options).map(option => option.value);
    let newKey = `clipboard-${existingKeys.length + 1}`;
    while (existingKeys.includes(newKey)) {
        newKey = `clipboard-${existingKeys.length + 1}-${Math.random().toString(36).substr(2, 5)}`;
    }
    const newOption = document.createElement('option');
    newOption.value = newKey;
    newOption.text = newKey;
    clipboardList.appendChild(newOption);
    sortClipboardList();
    clipboardList.value = newKey;
    document.getElementById('content').value = '';
    debug.innerText = '成功';
    debug.className = 'success';
    await loadContent();
}

async function deleteClipboard() {
    if (clipboardList.options.length <= 1) {
        showNotification(translations[localStorage.getItem('language') || 'zh'].delete_clipboard + '至少保留一个', 'error');
        debug.innerText = '失败';
        debug.className = 'failure';
        return;
    }
    const clipboardKey = clipboardList.value;
    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';
    try {
        const response = await fetch(`/api/content?key=${clipboardKey}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('删除失败');
        clipboardList.remove(clipboardList.selectedIndex);
        clipboardList.value = clipboardList.options[0].value;
        debug.innerText = '成功';
        debug.className = 'success';
        showNotification('剪贴板删除成功', 'success');
        await loadContent();
    } catch (error) {
        console.error('删除失败:', error);
        debug.innerText = '失败';
        debug.className = 'failure';
        showNotification('剪贴板删除失败', 'error');
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function deleteAllClipboards() {
    if (!confirm('您确定要删除所有剪贴板吗？此操作不可撤销！')) {
        return;
    }
    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';
    try {
        const response = await fetch('/api/delete-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('删除所有剪贴板失败');
        showNotification('所有剪贴板已成功删除', 'success');
        initClipboardList(); // Re-initialize to show empty list or default
    } catch (error) {
        console.error('删除所有剪贴板失败:', error);
        showNotification(`删除所有剪贴板失败: ${error.message}`, 'error');
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function showRenameInput() {
    renameInput.style.display = 'inline';
    renameBtn.style.display = 'inline';
    renameInput.value = clipboardList.options[clipboardList.selectedIndex].text;
    renameInput.focus();
}

async function renameClipboard() {
    const newName = renameInput.value.trim();
    if (!newName) {
        alert(translations[localStorage.getItem('language') || 'zh'].rename + '名称不可为空');
        debug.innerText = '失败';
        debug.className = 'failure';
        return;
    }
    const oldKey = clipboardList.value;
    const existingKeys = Array.from(clipboardList.options).map(option => option.value);
    if (existingKeys.includes(newName) && newName !== oldKey) {
        alert(translations[localStorage.getItem('language') || 'zh'].rename + '名称已存在');
        debug.innerText = '失败';
        debug.className = 'failure';
        return;
    }

    if (newName === oldKey) {
        renameInput.style.display = 'none';
        renameBtn.style.display = 'none';
        return;
    }

    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';

    try {
        const response = await fetch('/api/rename', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldKey: oldKey, newKey: newName })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || '重命名失败');
        }

        // Update the UI
        const selectedOption = clipboardList.options[clipboardList.selectedIndex];
        selectedOption.value = newName;
        selectedOption.text = newName;
        sortClipboardList();
        clipboardList.value = newName;
        renameInput.style.display = 'none';
        renameBtn.style.display = 'none';
        debug.innerText = '成功';
        debug.className = 'success';
        
        // No need to call loadContent() as the content hasn't changed, just the key
        lastKey = newName; // Update lastKey to prevent unnecessary re-fetch
        updateShareLink(newName);


    } catch (error) {
        console.error('重命名失败:', error);
        debug.innerText = `失败: ${error.message}`;
        debug.className = 'failure';
        alert('重命名失败: ' + error.message);
        // If rename fails, refresh the list to ensure consistency
        await initClipboardList();
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function sortClipboardList() {
    const options = Array.from(clipboardList.options);
    options.sort((a, b) => a.value.localeCompare(b.value, 'zh', { numeric: true }));
    while (clipboardList.firstChild) {
        clipboardList.removeChild(clipboardList.firstChild);
    }
    options.forEach(option => clipboardList.appendChild(option));
}

fileInput.addEventListener('change', async function () {
    const file = fileInput.files[0];
    if (!file) {
        debug.innerText = '失败';
        debug.className = 'failure';
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert(translations[localStorage.getItem('language') || 'zh'].upload + '失败：文件不得超过10MB');
        debug.innerText = '失败';
        debug.className = 'failure';
        return;
    }
    const fileName = file.name.split('.').slice(0, -1).join('.') || 'uploaded-file';
    const fileExt = file.name.split('.').pop() || 'txt';
    const existingKeys = Array.from(clipboardList.options).map(option => option.value);
    let newKey = fileName;
    let suffix = 1;
    while (existingKeys.includes(newKey)) {
        newKey = `${fileName}-${suffix}`;
        suffix++;
    }
    mainContainer.classList.add('loading');
    document.getElementById('loadingIndicator').style.display = 'block';
    try {
        const content = await file.text();
        const response = await fetch(`/api/content?key=${newKey}`, {
            method: 'POST',
            body: content,
            headers: {
                'Content-Type': 'text/plain',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('上传失败');
        const newOption = document.createElement('option');
        newOption.value = newKey;
        newOption.text = newKey;
        clipboardList.appendChild(newOption);
        sortClipboardList();
        clipboardList.value = newKey;
        downloadExt.value = fileExt;
        document.getElementById('content').value = content;
        debug.innerText = '成功';
        debug.className = 'success';
    } catch (error) {
        console.error('上传失败:', error);
        debug.innerText = '失败';
        debug.className = 'failure';
        alert(translations[localStorage.getItem('language') || 'zh'].upload + '失败，请重试');
    } finally {
        mainContainer.classList.remove('loading');
        document.getElementById('loadingIndicator').style.display = 'none';
        fileInput.value = '';
    }
});

document.getElementById('content').addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveContent, 5000);
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveContent();
    } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        downloadContent();
    }
});

function updateShareLink(key) {
    const shareLink = document.getElementById('shareLink');
    shareUrl.value = `${window.location.origin}/api/share/${key}`;
    shareLink.style.display = 'block';
}

function copyShareLink() {
    shareUrl.select();
    document.execCommand('copy');
    alert(translations[localStorage.getItem('language') || 'zh'].copy_link + '成功');
    debug.innerText = '成功';
    debug.className = 'success';
}

window.onload = () => {
    const savedLang = localStorage.getItem('language') || 'zh';
    document.getElementById('langSelect').value = savedLang;
    setLanguage(savedLang);
    if (token) {
        authContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        initClipboardList();
    } else {
        authContainer.style.display = 'block';
    }
};
