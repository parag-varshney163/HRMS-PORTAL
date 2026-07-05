import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

import useNotification from "../../hooks/useNotification";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import Button from "../ui/Button";


export default function MarkAttendanceModal({
    open,
    onClose,
    onSuccess,
}) {
    const notify = useNotification();

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [saving, setSaving] = useState(false);

    const [users, setUsers] = useState([]);
    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        userId: "",
        fromDate: today,
        toDate: today,
        status: "present",
        notes: "",
    });

    useEffect(() => {
        if (!open) return;

        fetchUsers();
    }, [open]);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);

            const { data } = await axiosInstance.get(
                "/api/v1/user/all-users"
            );

            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (err) {
            console.error(err);
            notify.error(
                "Error",
                "Unable to fetch employees."
            );
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.userId) {
            notify.error("Validation", "Please select employee.");
            return;
        }
        if (form.toDate < form.fromDate) {
            notify.error(
                "Validation",
                "To Date cannot be earlier than From Date."
            );
            return;
        }

        try {
            setSaving(true);

            const { data } = await axiosInstance.post(
                "/api/v1/attendance/mark-attendance",
                form
            );

            if (data.success) {
                notify.success("Success", data.message);

                onSuccess?.();

                onClose();

                setForm({
                    userId: "",
                    fromDate: today,
                    toDate:today,
                    status: "present",
                    notes: "",
                });
            }
        } catch (err) {
            notify.error(
                "Error",
                err.response?.data?.message ||
                "Unable to mark attendance."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div
                className="w-full max-w-lg rounded-2xl"
                style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                }}
            >
                {/* Header */}

                <div
                    className="flex justify-between items-center p-5 border-b"
                    style={{
                        borderColor: colors.cardBorder,
                    }}
                >
                    <h2
                        className="text-xl font-bold"
                        style={{
                            color: colors.textPrimary,
                        }}
                    >
                        Mark Attendance
                    </h2>

                    <button onClick={onClose}>
                        <X color={colors.textSecondary} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Employee */}

                    <div>
                        <label
                            className="block text-sm mb-2"
                            style={{
                                color: colors.textPrimary,
                            }}
                        >
                            Employee
                        </label>

                        <select
                            value={form.userId}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    userId: e.target.value,
                                })
                            }
                            disabled={loadingUsers}
                            className="w-full rounded-lg px-4 py-3 outline-none"
                            style={{
                                background: colors.inputBg,
                                border: `1px solid ${colors.cardBorder}`,
                                color: colors.textPrimary,
                            }}
                        >
                            <option value="">
                                {loadingUsers
                                    ? "Loading Employees..."
                                    : "Select Employee"}
                            </option>

                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.userId} • {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}

                    {/* <div>
                        <label
                            className="block text-sm mb-2"
                            style={{
                                color: colors.textPrimary,
                            }}
                        >
                            Date
                        </label>

                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    date: e.target.value,
                                })
                            }
                            className="w-full rounded-lg px-4 py-3"
                            style={{
                                background: colors.inputBg,
                                border: `1px solid ${colors.cardBorder}`,
                                color: colors.textPrimary,
                            }}
                        />
                    </div> */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                className="block text-sm mb-2"
                                style={{ color: colors.textPrimary }}
                            >
                                From Date
                            </label>

                            <input
                                type="date"
                                value={form.fromDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fromDate: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg px-4 py-3"
                                style={{
                                    background: colors.inputBg,
                                    border: `1px solid ${colors.cardBorder}`,
                                    color: colors.textPrimary,
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-sm mb-2"
                                style={{ color: colors.textPrimary }}
                            >
                                To Date
                            </label>

                            <input
                                type="date"
                                value={form.toDate}
                                min={form.fromDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        toDate: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg px-4 py-3"
                                style={{
                                    background: colors.inputBg,
                                    border: `1px solid ${colors.cardBorder}`,
                                    color: colors.textPrimary,
                                }}
                            />
                        </div>
                    </div>

                    {/* Status */}

                    <div>
                        <label
                            className="block text-sm mb-2"
                            style={{
                                color: colors.textPrimary,
                            }}
                        >
                            Status
                        </label>

                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status: e.target.value,
                                })
                            }
                            className="w-full rounded-lg px-4 py-3"
                            style={{
                                background: colors.inputBg,
                                border: `1px solid ${colors.cardBorder}`,
                                color: colors.textPrimary,
                            }}
                        >
                            <option value="present">Present</option>

                            <option value="half_day">Half Day</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>

                    {/* Notes */}

                    <div>
                        <label
                            className="block text-sm mb-2"
                            style={{
                                color: colors.textPrimary,
                            }}
                        >
                            Notes
                        </label>

                        <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    notes: e.target.value,
                                })
                            }
                            className="w-full rounded-lg px-4 py-3 resize-none"
                            style={{
                                background: colors.inputBg,
                                border: `1px solid ${colors.cardBorder}`,
                                color: colors.textPrimary,
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}

                <div
                    className="flex justify-end gap-3 p-5 border-t"
                    style={{
                        borderColor: colors.cardBorder,
                    }}
                >
                    <Button
                        bg={colors.danger}
                        text="#fff"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        bg={colors.success}
                        text="#fff"
                        disabled={saving}
                        onClick={handleSubmit}
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            "Mark Attendance"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
