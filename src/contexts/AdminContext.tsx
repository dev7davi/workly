import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface AdminContextType {
    viewingUserId: string | null;
    viewingUserEmail: string | null;
    setViewingUser: (userId: string | null, email: string | null) => void;
    isMaster: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [viewingUserId, setViewingUserId] = useState<string | null>(() => localStorage.getItem("workly_admin_viewing_id"));
    const [viewingUserEmail, setViewingUserEmail] = useState<string | null>(() => localStorage.getItem("workly_admin_viewing_email"));

    const isMaster = user?.email === "service_master@workly.com" || user?.email === "dev7.davi@gmail.com";

    const setViewingUser = (userId: string | null, email: string | null) => {
        if (userId) {
            localStorage.setItem("workly_admin_viewing_id", userId);
            localStorage.setItem("workly_admin_viewing_email", email || "");
        } else {
            localStorage.removeItem("workly_admin_viewing_id");
            localStorage.removeItem("workly_admin_viewing_email");
        }
        setViewingUserId(userId);
        setViewingUserEmail(email);
    };

    // If user logs out or stops being master, clear viewing state
    useEffect(() => {
        if (!isMaster) {
            setViewingUserId(null);
            setViewingUserEmail(null);
            localStorage.removeItem("workly_admin_viewing_id");
            localStorage.removeItem("workly_admin_viewing_email");
        }
    }, [isMaster]);

    return (
        <AdminContext.Provider value={{ viewingUserId, viewingUserEmail, setViewingUser, isMaster }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};
