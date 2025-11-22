import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { User } from '../types';

interface UserWithPassword extends User {
    password?: string; // Password is not required for social logins
}

type SocialProvider = 'google' | 'apple' | 'discord';

interface AuthContextType {
    currentUser: User | null;
    restrictions: string[];
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string) => Promise<void>;
    socialLogin: (provider: SocialProvider) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    addRestriction: (item: string) => void;
    removeRestriction: (index: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER: User = {
    name: 'Guest Chef',
    email: 'guest@chefculina.com'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const userJson = localStorage.getItem('currentUser');
            return userJson ? JSON.parse(userJson) : GUEST_USER;
        } catch (error) {
            console.error("Failed to parse currentUser from localStorage", error);
            return GUEST_USER;
        }
    });

    const [restrictions, setRestrictions] = useState<string[]>([]);
    const restrictionsKey = useMemo(() => currentUser ? `restrictions_${currentUser.email}` : null, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
        
        // Load restrictions for the current user
        if (restrictionsKey) {
            try {
                const savedRestrictions = localStorage.getItem(restrictionsKey);
                setRestrictions(savedRestrictions ? JSON.parse(savedRestrictions) : []);
            } catch (error) {
                console.error("Failed to parse restrictions from localStorage", error);
                setRestrictions([]);
            }
        } else {
            setRestrictions([]); // Clear restrictions if no user
        }

    }, [currentUser, restrictionsKey]);

    useEffect(() => {
        // Save restrictions whenever they change for the logged-in user
        if (restrictionsKey) {
            try {
                localStorage.setItem(restrictionsKey, JSON.stringify(restrictions));
            } catch (error) {
                console.error("Failed to save restrictions to localStorage", error);
            }
        }
    }, [restrictions, restrictionsKey]);


    const getUsers = (): UserWithPassword[] => {
        try {
            const usersJson = localStorage.getItem('users');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (error) {
            return [];
        }
    };

    const saveUsers = (users: UserWithPassword[]) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const login = async (email: string, pass: string): Promise<void> => {
        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (user) {
            const { password, ...userWithoutPass } = user;
            setCurrentUser(userWithoutPass);
        } else {
            throw new Error("auth.errors.invalidCredentials");
        }
    };

    const signup = async (name: string, email: string, pass: string): Promise<void> => {
        const users = getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error("auth.errors.emailExists");
        }
        const newUser: UserWithPassword = { name, email, password: pass };
        users.push(newUser);
        saveUsers(users);
        const { password, ...userWithoutPass } = newUser;
        setCurrentUser(userWithoutPass);
    };
    
    const socialLogin = async (provider: SocialProvider): Promise<void> => {
        // This is a simulation of a social login flow.
        const users = getUsers();
        const mockEmail = `user.${Math.floor(Math.random() * 10000)}@${provider}.social`;
        const mockName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
        
        let user = users.find(u => u.email.endsWith(`@${provider}.social`));

        if (user) {
            const { password, ...userWithoutPass } = user;
            setCurrentUser(userWithoutPass);
        } else {
            const newUser: UserWithPassword = { name: mockName, email: mockEmail };
            users.push(newUser);
            saveUsers(users);
            setCurrentUser(newUser);
        }
    };

    const logout = () => {
        setCurrentUser(GUEST_USER);
    };

    const updateUser = (updatedUser: User) => {
        if (!currentUser) return;
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            const password = users[userIndex].password;
            users[userIndex] = { ...updatedUser, password };
            saveUsers(users);
        }

        setCurrentUser(updatedUser);
    };

    const addRestriction = (item: string) => {
        if (item && !restrictions.includes(item)) {
            setRestrictions(prev => [...prev, item]);
        }
    };

    const removeRestriction = (index: number) => {
        setRestrictions(prev => prev.filter((_, i) => i !== index));
    };

    const value = { currentUser, restrictions, login, signup, socialLogin, logout, updateUser, addRestriction, removeRestriction };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};