export function saveToken(token: string) {
    localStorage.setItem('access_token', token);
}

export function getToken() {
    return localStorage.getItem('access_token');
}

export function removeToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
}

export function saveUser(user: { id: string; nickname: string; profileImage?: string }) {
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
    return !!getToken();
}
