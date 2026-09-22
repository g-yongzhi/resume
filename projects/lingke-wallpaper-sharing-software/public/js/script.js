const API_BASE_URL = 'http://localhost:3000/api';

const wallpapersContainer = document.getElementById('wallpapers-container');
const categoryList = document.getElementById('category-list');
const loadMoreBtn = document.getElementById('load-more-btn');

let currentPage = 1;
let currentCategoryId = null;

// 获取分类列表
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const result = await response.json();

        if (result.success) {
            displayCategories(result.data);
        } else {
            console.error('获取分类失败:', result.message);
        }
    } catch (error) {
        console.error('获取分类出错:', error);
    }
}

// 显示分类列表
function displayCategories(categories) {
    categoryList.innerHTML = '';
    // 添加"所有分类"选项
    const allCategoriesItem = document.createElement('li');
    const allCategoriesLink = document.createElement('a');
    allCategoriesLink.href = '#';
    allCategoriesLink.textContent = '所有分类';
    allCategoriesLink.addEventListener('click', () => {
        currentCategoryId = null;
        currentPage = 1;
        wallpapersContainer.innerHTML = ''; // 清空现有壁纸
        fetchWallpapers();
    });
    allCategoriesItem.appendChild(allCategoriesLink);
    categoryList.appendChild(allCategoriesItem);

    categories.forEach(category => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = category.name;
        link.addEventListener('click', () => {
            currentCategoryId = category.id;
            currentPage = 1;
            wallpapersContainer.innerHTML = ''; // 清空现有壁纸
            fetchWallpapers(currentCategoryId);
        });
        listItem.appendChild(link);
        categoryList.appendChild(listItem);
    });
}

// 获取壁纸列表
async function fetchWallpapers(categoryId = null, page = 1, limit = 10) {
    try {
        let url = `${API_BASE_URL}/wallpapers?page=${page}&limit=${limit}`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            displayWallpapers(result.data);
            // 如果返回的壁纸数量少于limit，隐藏加载更多按钮
            if (result.data.length < limit) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        } else {
            console.error('获取壁纸失败:', result.message);
        }
    } catch (error) {
        console.error('获取壁纸出错:', error);
    }
}

// 显示壁纸列表
function displayWallpapers(wallpapers) {
    wallpapers.forEach(wallpaper => {
        const wallpaperItem = document.createElement('div');
        wallpaperItem.classList.add('wallpaper-item');
        
        // 构建图片URL，使用完整路径
        const imageUrl = `/uploads/${wallpaper.filename}`;
        
        wallpaperItem.innerHTML = `
            <a href="wallpaper-detail.html?id=${wallpaper.id}">
                <img src="${imageUrl}" alt="${wallpaper.original_filename}" onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
            </a>
            <div class="info">
                <p>${wallpaper.original_filename}</p>
                <p>分辨率: ${wallpaper.resolution}</p>
            </div>
        `;
        wallpapersContainer.appendChild(wallpaperItem);
    });
}

// 加载更多按钮点击事件
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchWallpapers(currentCategoryId, currentPage);
});

// 页面加载时加载分类和壁纸
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchWallpapers();
}); 