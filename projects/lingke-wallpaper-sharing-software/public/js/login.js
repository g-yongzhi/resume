const API_BASE_URL = 'http://localhost:3000/api';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchLink = document.getElementById('switch-link');
const formTitle = document.getElementById('form-title');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

let isLogin = true;

switchLink.addEventListener('click', () => {
    isLogin = !isLogin;
    if (isLogin) {
        loginForm.style.display = '';
        registerForm.style.display = 'none';
        formTitle.textContent = '登录';
        switchLink.textContent = '没有账号？注册';
        loginError.textContent = '';
        registerError.textContent = '';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = '';
        formTitle.textContent = '注册';
        switchLink.textContent = '已有账号？登录';
        loginError.textContent = '';
        registerError.textContent = '';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) {
        loginError.textContent = '请输入用户名和密码';
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await res.json();
        if (result.success) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('username', result.data.user.username);
            window.location.href = 'index.html';
        } else {
            loginError.textContent = result.message || '登录失败';
        }
    } catch (err) {
        loginError.textContent = '网络错误，请稍后重试';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    if (!username || !password) {
        registerError.textContent = '请输入用户名和密码';
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await res.json();
        if (result.success) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('username', result.data.user.username);
            window.location.href = 'index.html';
        } else {
            registerError.textContent = result.message || '注册失败';
        }
    } catch (err) {
        registerError.textContent = '网络错误，请稍后重试';
    }
}); 