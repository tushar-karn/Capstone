import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch (err) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (formData) => {
        const res = await api.post('/auth/register', formData);
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = { user, token, loading, login, register, logout, updateUser };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
