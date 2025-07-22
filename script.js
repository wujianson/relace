/*
// 配置区 - 需要修改为您的仓库
const CONFIG = {
    REPO: "wujianson/dir",
    MIRRORS: {
        bgithub: "https://bgithub.xyz/wujianson/dir/raw/main/",
        fastgit: "https://hub.fastgit.org/wujianson/dir/raw/main/",
        jsdelivr: "https://cdn.jsdelivr.net/gh/wujianson/dir/"
    },
    CACHE_TIME: 60 * 60 * 1000 // 1小时缓存
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initMirrorSelection();
    loadFileListWithSpeedTest();
});

// 镜像源选择
function initMirrorSelection() {
    document.querySelectorAll('.mirror').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('.mirror.active').classList.remove('active');
            this.classList.add('active');
            loadFileList(this.dataset.mirror);
        });
    });
}

// 带速度测试的文件加载
async function loadFileListWithSpeedTest() {
    const speedTestEl = document.getElementById('speed-test');
    const mirrors = Object.keys(CONFIG.MIRRORS);
    
    // 并行测试所有镜像速度
    const results = await Promise.allSettled(
        mirrors.map(mirror => testMirrorSpeed(mirror))
    );
    
    // 选择最快的可用镜像
    const fastest = results
        .filter(r => r.status === 'fulfilled')
        .sort((a, b) => a.value.time - b.value.time)[0];
    
    if (fastest) {
        speedTestEl.textContent = `${fastest.value.mirror} (${fastest.value.time}ms)`;
        loadFileList(fastest.value.mirror);
    } else {
        speedTestEl.textContent = "所有镜像不可用";
        loadFileList('bgithub'); // 回退到主镜像
    }
}

// 镜像速度测试
async function testMirrorSpeed(mirror) {
    const start = performance.now();
    await fetch(`${CONFIG.MIRRORS[mirror]}file-list.json`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
    });
    const time = Math.round(performance.now() - start);
    return { mirror, time };
}

// 加载文件列表
async function loadFileList(mirror = 'bgithub') {
    const fileListEl = document.getElementById('file-list');
    fileListEl.innerHTML = "<p>加载中...</p>";
    
    try {
        // 尝试从缓存读取
        const cacheKey = `fileList_${mirror}`;
        const cached = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        
        if (cached && cacheTime && Date.now() - cacheTime < CONFIG.CACHE_TIME) {
            renderFileList(JSON.parse(cached), mirror);
            return;
        }
        
        // 从镜像源获取
        const response = await fetch(`${CONFIG.MIRRORS[mirror]}file-list.json`, {
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) throw new Error(`${mirror}加载失败`);
        
        const files = await response.json();
        
        // 缓存结果
        localStorage.setItem(cacheKey, JSON.stringify(files));
        localStorage.setItem(`${cacheKey}_time`, Date.now());
        
        renderFileList(files, mirror);
    } catch (error) {
        console.error(error);
        fileListEl.innerHTML = `
            <div class="error">
                <p>⚠️ 加载失败: ${error.message}</p>
                <button onclick="loadFileList('bgithub')">切换到主镜像</button>
            </div>
        `;
    }
}

// 渲染文件列表
function renderFileList(files, mirror) {
    const fileListEl = document.getElementById('file-list');
    let html = '';
    
    files.forEach(file => {
        const fileUrl = `${CONFIG.MIRRORS[mirror]}${encodeURIComponent(file.name)}`;
        html += `
            <div class="file-item">
                <span>${file.name}</span>
                <a href="${fileUrl}" download>下载</a>
            </div>
        `;
    });
    
    fileListEl.innerHTML = html || "<p>暂无文件</p>";
}
*/
// 配置适配您的仓库结构
const CONFIG = {
    REPO: "wujianson/dir",
    MIRRORS: {
        bgithub: "https://bgithub.xyz/wujianson/dir/raw/main/",
        ghproxy: "https://ghproxy.com/https://github.com/wujianson/dir/raw/main/"
    },
    EXCLUDE: [  // 需要排除的文件
        "README.md", 
        "LICENSE", 
        ".gitignore", 
        "file-list.json"
    ]
};

// 文件加载逻辑
async function loadFileList(mirror = 'bgithub') {
    try {
        const response = await fetch(`${CONFIG.MIRRORS[mirror]}file-list.json?t=${Date.now()}`);
        const files = (await response.json())
            .filter(file => !CONFIG.EXCLUDE.includes(file.name));
        
        renderFileList(files, mirror);
    } catch (error) {
        console.error("加载失败:", error);
        // 回退方案：尝试直接列出文件
        await loadFallbackList(mirror);
    }
}

// 备用加载方案
async function loadFallbackList(mirror) {
    try {
        // 通过GitHub API获取原始文件列表
        const apiRes = await fetch(`https://api.github.com/repos/${CONFIG.REPO}/contents`);
        const files = (await apiRes.json())
            .filter(item => item.type === "file")
            .filter(file => !CONFIG.EXCLUDE.includes(file.name));
        
        renderFileList(files.map(f => ({
            name: f.name,
            size: f.size,
            path: f.path
        })), mirror);
    } catch (error) {
        document.getElementById('file-list').innerHTML = `
            <div class="error">
                <p>⚠️ 无法加载文件列表</p>
                <p>错误详情: ${error.message}</p>
            </div>
        `;
    }
}
