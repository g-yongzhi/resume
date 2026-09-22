const API_BASE_URL = 'http://localhost:3000/api';
const detailContainer = document.getElementById('detail-container');

function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

async function fetchWallpaperDetail(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/wallpapers/${id}`);
        const result = await res.json();
        if (result.success && result.data) {
            renderDetail(result.data);
        } else {
            detailContainer.innerHTML = `<div class='error-message'>壁纸不存在或已被删除</div>`;
        }
    } catch (err) {
        detailContainer.innerHTML = `<div class='error-message'>加载失败，请稍后重试</div>`;
    }
}

function renderDetail(data) {
    const categories = data.categories ? data.categories.split(',') : [];
    // 构建图片URL，使用完整路径
    const imageUrl = `/uploads/${data.filename}`;
    
    detailContainer.innerHTML = `
        <div class="detail-img">
            <img src="${imageUrl}" alt="${data.original_filename}" onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
        </div>
        <div class="detail-info">
            <h2>${data.original_filename}</h2>
            <div class="meta">上传者：${data.uploader_name || '未知'}<br>分辨率：${data.resolution}<br>下载次数：${data.download_count}</div>
            <div class="categories">
                ${categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
            <button class="download-btn" onclick="downloadWallpaper(${data.id}, '${data.original_filename}')">下载壁纸</button>
        </div>
    `;
}

window.downloadWallpaper = function(id, filename) {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/wallpapers/${id}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 页面加载
const wallpaperId = getQueryParam('id');
if (wallpaperId) {
    fetchWallpaperDetail(wallpaperId);
} else {
    detailContainer.innerHTML = `<div class='error-message'>参数错误</div>`;
} 