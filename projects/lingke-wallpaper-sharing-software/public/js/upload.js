const API_BASE_URL = 'http://localhost:3000/api';

const uploadForm = document.getElementById('upload-form');
const imageInput = document.getElementById('image');
const previewImg = document.getElementById('preview');
const resolutionSelect = document.getElementById('resolution');
const categoriesSelect = document.getElementById('categories');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// 预览图片
imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.style.display = 'none';
    }
});

// 加载分类
async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const result = await res.json();
        if (result.success) {
            categoriesSelect.innerHTML = '';
            result.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categoriesSelect.appendChild(option);
            });
        }
    } catch (err) {
        errorMessage.textContent = '加载分类失败';
    }
}

fetchCategories();

// 上传壁纸
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMessage.textContent = '';
    errorMessage.textContent = '';

    const file = imageInput.files[0];
    const resolution = resolutionSelect.value;
    const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(opt => opt.value);

    if (!file || !resolution || selectedCategories.length === 0) {
        errorMessage.textContent = '请填写完整信息';
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('resolution', resolution);
    formData.append('categories', JSON.stringify(selectedCategories));

    const token = localStorage.getItem('token');
    if (!token) {
        errorMessage.textContent = '请先登录';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/wallpapers`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });
        const result = await res.json();
        if (result.success) {
            successMessage.textContent = '上传成功！';
            uploadForm.reset();
            previewImg.style.display = 'none';
        } else {
            errorMessage.textContent = result.message || '上传失败';
        }
    } catch (err) {
        errorMessage.textContent = '网络错误，请稍后重试';
    }
}); 