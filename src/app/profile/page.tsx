"use client";

import { useApp } from "@/context/AppContext";
import { useState, useRef } from "react";
import Header from "@/components/Header";

export default function UserProfile() {
    const { user } = useApp();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        username: user?.username || "",
        role: user?.role || "",
        department: user?.department || "",
        employeeId: user?.employeeId || "",
    });

    const [editForm, setEditForm] = useState({ ...form });

    const [passwords, setPasswords] = useState({
        current: "",
        newPass: "",
        confirm: "",
    });
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    const avatarRef = useRef<HTMLInputElement>(null);
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatarSrc(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    function openEditModal() {
        setEditForm({ ...form });
        setShowEditModal(true);
    }

    function handleSaveEdit() {
        setForm({ ...editForm });
        setShowEditModal(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }

    async function handleChangePassword() {
        setPwError("");
        setPwSuccess("");
        if (!passwords.current) return setPwError("Enter your current password.");
        if (passwords.newPass.length < 8)
            return setPwError("Password must be at least 8 characters long.");
        if (passwords.newPass !== passwords.confirm)
            return setPwError("New passwords do not match.");

        const res = await fetch("/api/verify-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: form.username, password: passwords.current }),
        });
        if (!res.ok) return setPwError("Current password is incorrect.");

        // TODO: call API to save new password in DB

        setPwSuccess("Password changed successfully!");
        setPasswords({ current: "", newPass: "", confirm: "" });
        setTimeout(() => {
            setPwSuccess("");
            setShowPasswordModal(false);
        }, 2000);
    }

    const profileFields = [
        { label: "Full Name:", value: form.name },
        { label: "Email:", value: form.email },
        { label: "Username:", value: form.username },
        { label: "Role:", value: form.role },
        { label: "Department:", value: form.department },
        { label: "Employee ID:", value: form.employeeId },
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f4f6f9",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Header />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                {saveSuccess && (
                    <div
                        style={{
                            position: "fixed",
                            top: 24,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "#e8f5e9",
                            border: "1px solid #a5d6a7",
                            borderRadius: 8,
                            padding: "12px 24px",
                            color: "#2e7d32",
                            fontWeight: 600,
                            fontSize: 14,
                            zIndex: 500,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        ✓ Profile updated successfully.
                    </div>
                )}

                <div
                    style={{
                        background: "white",
                        borderRadius: 14,
                        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        width: "100%",
                        maxWidth: 520,
                    }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
                            padding: "36px 0 28px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 12,
                            borderBottom: "1px solid #e8f5e9",
                        }}
                    >
                        <div
                            style={{ position: "relative", cursor: "pointer" }}
                            onClick={() => avatarRef.current?.click()}
                            title="Click to change photo"
                        >
                            <div
                                style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: "50%",
                                    border: "3px solid #2e7d32",
                                    background: "#c8e6c9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                }}
                            >
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#2e7d32">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                )}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 2,
                                    right: 2,
                                    background: "#2e7d32",
                                    borderRadius: "50%",
                                    width: 26,
                                    height: 26,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid white",
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <input
                            ref={avatarRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarChange}
                        />
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 17, color: "#222" }}>
                                {form.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#777",
                                    marginTop: 2,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}
                            >
                                {form.role} · {form.department}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: "24px 36px 8px" }}>
                        {profileFields.map(({ label, value }) => (
                            <div
                                key={label}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "130px 1fr",
                                    alignItems: "center",
                                    marginBottom: 14,
                                    gap: 12,
                                }}
                            >
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
                                    {label}
                                </span>
                                <input
                                    value={value}
                                    disabled
                                    style={{
                                        padding: "9px 14px",
                                        borderRadius: 7,
                                        border: "1.5px solid #e0e0e0",
                                        fontSize: 14,
                                        background: "#fafafa",
                                        color: "#333",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "center",
                            padding: "20px 36px 28px",
                        }}
                    >
                        <button
                            onClick={openEditModal}
                            style={{
                                background: "#2e7d32",
                                color: "white",
                                border: "none",
                                borderRadius: 7,
                                padding: "10px 28px",
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => {
                                setPwError("");
                                setPwSuccess("");
                                setPasswords({ current: "", newPass: "", confirm: "" });
                                setShowPasswordModal(true);
                            }}
                            style={{
                                background: "white",
                                color: "#2e7d32",
                                border: "1.5px solid #2e7d32",
                                borderRadius: 7,
                                padding: "10px 24px",
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {showEditModal && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 300,
                            padding: 24,
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowEditModal(false);
                        }}
                    >
                        <div
                            style={{
                                background: "white",
                                borderRadius: 12,
                                width: "100%",
                                maxWidth: 420,
                                boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    background: "#2e7d32",
                                    padding: "16px 24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        color: "white",
                                        fontSize: 16,
                                        fontWeight: 700,
                                    }}
                                >
                                    Edit Profile
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        fontSize: 20,
                                        cursor: "pointer",
                                        lineHeight: 1,
                                        padding: 0,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ padding: "24px 24px 8px" }}>
                                {[
                                    { label: "Full Name:", key: "name" },
                                    { label: "Email:", key: "email" },
                                    { label: "Department:", key: "department" },
                                ].map(({ label, key }) => (
                                    <div key={key} style={{ marginBottom: 16 }}>
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "#555",
                                                marginBottom: 5,
                                            }}
                                        >
                                            {label}
                                        </label>
                                        <input
                                            value={editForm[key as keyof typeof editForm]}
                                            onChange={(e) =>
                                                setEditForm((p) => ({ ...p, [key]: e.target.value }))
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: 7,
                                                border: "1.5px solid #ddd",
                                                fontSize: 14,
                                                outline: "none",
                                                boxSizing: "border-box",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    padding: "12px 24px 24px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    style={{
                                        background: "white",
                                        color: "#555",
                                        border: "1.5px solid #ccc",
                                        borderRadius: 7,
                                        padding: "9px 22px",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    style={{
                                        background: "#2e7d32",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 7,
                                        padding: "9px 22px",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPasswordModal && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 300,
                            padding: 24,
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowPasswordModal(false);
                        }}
                    >
                        <div
                            style={{
                                background: "white",
                                borderRadius: 12,
                                width: "100%",
                                maxWidth: 420,
                                boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    background: "#2e7d32",
                                    padding: "16px 24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        color: "white",
                                        fontSize: 16,
                                        fontWeight: 700,
                                    }}
                                >
                                    Change Password
                                </h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        fontSize: 20,
                                        cursor: "pointer",
                                        lineHeight: 1,
                                        padding: 0,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ padding: "24px 24px 8px" }}>
                                {[
                                    { label: "Current Password:", key: "current" },
                                    { label: "New Password:", key: "newPass" },
                                    { label: "Confirm Password:", key: "confirm" },
                                ].map(({ label, key }) => (
                                    <div key={key} style={{ marginBottom: 16 }}>
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "#555",
                                                marginBottom: 5,
                                            }}
                                        >
                                            {label}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwords[key as keyof typeof passwords]}
                                            onChange={(e) => {
                                                setPasswords((p) => ({ ...p, [key]: e.target.value }));
                                                setPwError("");
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: 7,
                                                border: pwError
                                                    ? "1.5px solid #e74c3c"
                                                    : "1.5px solid #ddd",
                                                fontSize: 14,
                                                outline: "none",
                                                boxSizing: "border-box",
                                            }}
                                        />
                                    </div>
                                ))}

                                {pwError && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#c0392b",
                                            background: "#fef0f0",
                                            padding: "8px 12px",
                                            borderRadius: 6,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {pwError}
                                    </div>
                                )}
                                {pwSuccess && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#2e7d32",
                                            background: "#e8f5e9",
                                            padding: "8px 12px",
                                            borderRadius: 6,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {pwSuccess}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    padding: "12px 24px 24px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{
                                        background: "white",
                                        color: "#555",
                                        border: "1.5px solid #ccc",
                                        borderRadius: 7,
                                        padding: "9px 22px",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    style={{
                                        background: "#2e7d32",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 7,
                                        padding: "9px 22px",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}