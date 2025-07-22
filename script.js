// 配置常量
const CONFIG = {
    API_KEY: "RELACE_ADMIN_2023", // 私有仓库中存储
    FILE_REPO: "wujianson/dir",
    MIRRORS: {
        github: "https://github.com/wujianson/dir/raw/main/",
        bgithub: "https://bgithub.xyz/wujianson/dir/raw/main/"
    },
    MAX_FILE_SIZE: 100 * 1024 * 1024 // 100MB
};

// 状态管理
let appState = {
    mode: "guest",
    currentMirror: "github",
    authToken: localStorage.getItem('relace_token') || "",
    isAuthenticated: false
};

// 初始化
function initApp() {
    setupEventListeners();
    checkMirrorStatus();
    loadFileList();
    updateUI();
}

// 设置事件监听
function setupEventListeners() {
    // 模式切换
    document.getElementById('guest-btn').addEventListener('click', () => switchMode('guest'));
    document.getElementById('admin-btn').addEventListener('click', () => switchMode('admin'));
    
    // 镜像选择
    document.querySelectorAll('.mirror-option').forEach(btn => {
        btn.addEventListener('click', function() {
            appState.currentMirror = this.dataset.mirror;
            updateMirrorSelection();
            loadFileList();
        });
    });
}

// 切换模式
function switchMode(mode) {
    appState.mode = mode;
    updateUI();
    
    if (mode === 'admin' && !appState.isAuthenticated) {
        document.getElementById('admin-auth').classList.remove('hidden');
    }
}

// 验证API密钥
function verifyKey() {
    const inputKey = document.getElementById('api-key').value;
    const statusEl = document.getElementById('auth-status');
    
    if (inputKey === CONFIG.API_KEY) {
        appState.isAuthenticated = true;
        appState.authToken = inputKey;
        localStorage.setItem('relace_token', inputKey);
        statusEl.textContent = "✓ 验证成功";
        statusEl.style.color = "green";
        updateUI();
    } else {
        statusEl.textContent = "✗ 密钥无效";
        statusEl.style.color = "red";
    }
}

// 加载文件列表
async function loadFileList() {
    try {
        // 尝试获取自动生成的文件列表
        const response = await fetch(`${CONFIG.MIRRORS[appState.currentMirror]}file-list.json`);
        const files = await response.json();
        renderFileList(files);
        document.getElementById('last-updated').textContent = `(最后更新: ${new Date().toLocaleString()})`;
    } catch (error) {
        console.error("加载文件列表失败:", error);
        renderErrorState();
    }
}

// 渲染文件列表
function renderFileList(files) {
    const container = document.getElementById('file-list');
    let html = '';
    
    files.forEach(file => {
        const fileUrl = `${CONFIG.MIRRORS[appState.currentMirror]}${encodeURIComponent(file.name)}`;
        html += `
            <div class="file-item">
                <span class="file-name">${file.name}</span>
                <a href="${fileUrl}" download class="download-btn">
                    下载 (${formatSize(file.size)})
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html || "<p>暂无可用文件</p>";
}

// 文件上传
async function startUpload() {
    if (!appState.isAuthenticated) return;
    
    const input = document.getElementById('file-input');
    if (!input.files.length) {
        alert("请先选择文件");
        return;
    }

    const progressEl = document.getElementById('upload-progress');
    
    try {
        // 这里需要实现实际的上传逻辑
        // 以下是模拟实现
        progressEl.innerHTML = "<p>开始上传处理...</p>";
        
        for (let file of input.files) {
            progressEl.innerHTML += `<p>处理文件: ${file.name}</p>`;
            
            // 验证文件
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                throw new Error(`${file.name} 超过大小限制`);
            }
            
            // 模拟上传延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            progressEl.innerHTML += `<p>✓ ${file.name} 上传成功</p>`;
        }
        
        progressEl.innerHTML += "<p>所有文件处理完成！正在更新列表...</p>";
        setTimeout(loadFileList, 2000);
    } catch (error) {
        progressEl.innerHTML += `<p style="color:red">上传错误: ${error.message}</p>`;
    }
}

// 辅助函数
function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// 初始化
window.onload = initApp;
