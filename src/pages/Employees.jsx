/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Users, UserCheck, Clock, UserX } from "lucide-react";

// Components
import StatsCard from "../components/ui/StatsCard";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import ProfileCard from "../components/ui/ProfileCard";
import AddEmployeeModal from "../components/Employee/AddEmployeeModal";
import axiosInstance from "../api/axiosInstance";
import useNotification from "../hooks/useNotification.jsx";
import ManageCompensationModal from "../components/Employee/ManageCompansationModal.jsx";

import { Wallet } from "lucide-react"; // Import Wallet icon

const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Employees",
    icon: Users,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    key: "active",
    label: "Active",
    icon: UserCheck,
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  {
    key: "onLeave",
    label: "On Leave",
    icon: Clock,
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  {
    key: "inactive",
    label: "Inactive",
    icon: UserX,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
];

const Employees = () => {
  const notify = useNotification();

  // ─── STATE ───
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [compModalOpen, setCompModalOpen] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");

  // ─── HELPER: Map API Data to UI ───
  const mapApiToEmployee = (apiData) => ({
    _id: apiData.userId || apiData._id,
    empId: apiData.employeeId || apiData.userId,
    name: apiData.name,
    firstName: apiData.firstName,
    lastName: apiData.lastName,
    email: apiData.email,
    phone: apiData.phoneNumber || "N/A",
    department: apiData.department || "General",
    departmentId: apiData.departmentId, // 🚨 Ensure department ID maps to modal
    designation: apiData.designation || "N/A",
    status: apiData.status
      ? apiData.status.charAt(0).toUpperCase() + apiData.status.slice(1)
      : "Active",
    avatar: apiData.avatar || null,
    gender: apiData.gender,
    birthdate: apiData.birthdate || apiData.dob,
    address: apiData.address,
    city: apiData.city,
    state: apiData.state,
    zipCode: apiData.zipCode,

    // 🚨 NEW: Employment API Data
    employmentId: apiData.employmentId,
    joiningDate: apiData.joiningDate,
    employmentType: apiData.employmentType,
    workLocation: apiData.workLocation,
    reportingManager: apiData.reportingManager,
    systemRole: apiData.role || "employee",
  });

  // ─── 400ms DEBOUNCE EFFECT ───
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── API: FETCH DATA ───
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);

      const url = debouncedSearch.trim()
        ? `/api/v1/user/all-employees?search=${debouncedSearch}`
        : `/api/v1/user/all-employees`;

      const [listRes, statsRes] = await Promise.allSettled([
        axiosInstance.get(url),
        axiosInstance.get("/api/v1/user/employees-stats"),
      ]);

      if (listRes.status === "fulfilled" && listRes.value.data.success) {
        setEmployees(listRes.value.data.data.map(mapApiToEmployee));
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        const s = statsRes.value.data.data;
        setStats({
          total: s.totalEmployees || 0,
          active: s.activeCount || 0,
          onLeave: s.onLeaveCount || 0,
          inactive: s.inactiveCount || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ─── API: TWO-STEP SAVE EMPLOYEE ───
  // ─── API: TWO-STEP SAVE EMPLOYEE (STRICT MODE) ───
  const handleSaveEmployee = async (formData) => {
    try {
      // 1️⃣ Payload for User API (Personal Details)
      const userPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dob: formData.birthdate,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        department: formData.department,
        designation: formData.designation,
        status: "active",
        role: formData.systemRole || "employee",
      };

      let userResponse;
      let savedUserId;

      if (editingEmployee) {
        userResponse = await axiosInstance.put(
          `/api/v1/user/${editingEmployee._id}`,
          userPayload,
        );
        savedUserId = editingEmployee._id;
      } else {
        userPayload.password = "Password@123";
        userResponse = await axiosInstance.post(
          "/api/v1/user/create",
          userPayload,
        );
        savedUserId = userResponse.data?.data?._id || userResponse.data?._id;
      }

      // 🚨 STRICT CHECK 1: Did User save fail?
      if (!userResponse.data.success) {
        return {
          success: false,
          message:
            userResponse.data.message || "Failed to save personal details.",
        };
      }

      // 2️⃣ Payload for Employment API (Job Details)
      if (savedUserId) {
        const employmentPayload = {
          user: savedUserId,
          joiningDate: formData.joiningDate,
          department: formData.department,
          designation: formData.designation,
          employmentType: formData.employmentType,
          workLocation: formData.workLocation,
          systemRole: formData.systemRole || "employee",
          status: "active",
        };

        if (formData.reportingManager) {
          employmentPayload.reportingManager = formData.reportingManager;
        }

        try {
          if (editingEmployee && editingEmployee.employmentId) {
            await axiosInstance.put(
              `/api/v1/employment/${editingEmployee.employmentId}`,
              employmentPayload,
            );
          } else {
            await axiosInstance.post("/api/v1/employment", employmentPayload);
          }
        } catch (empErr) {
          // 🚨 STRICT CHECK 2: If Employment API fails, STOP! Do not close modal.
          console.error("Employment API Error:", empErr);
          return {
            success: false,
            message:
              empErr.response?.data?.message ||
              "User created, but job details failed to save. Please check inputs and save again.",
          };
        }
      }

      // 🚨 ONLY CLOSES IF BOTH APIs SUCCEED
      setModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
      notify.success(
        editingEmployee ? "Updated" : "Created",
        "Employee record saved completely.",
      );
      return { success: true };
    } catch (error) {
      console.error("Save failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "A network error occurred while saving.",
      };
    }
  };

  // ─── API: DELETE EMPLOYEE ───
  const handleDeleteEmployee = async (employeeId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this employee?",
      )
    )
      return;

    try {
      const response = await axiosInstance.delete(`/api/v1/user/${employeeId}`);
      if (response.data.success) {
        notify.success("Deleted", "Employee removed successfully.");
        fetchEmployees();
      }
    } catch (error) {
      notify.error(
        "Delete Failed",
        error.response?.data?.message || "Could not delete employee.",
      );
    }
  };

  // ─── HANDLER: OPEN EDIT MODAL ───
  const handleEditEmployee = (employee) => {
    let { firstName, lastName } = employee;
    if (!firstName || !lastName) {
      const parts = employee.name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }
    setEditingEmployee({ ...employee, firstName, lastName });
    setModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp) => {
    if (selectedDepartment === "All Departments") return true;
    return emp.department === selectedDepartment;
  });

  return (
    <div className="py-2 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Employee <span className="text-accent">Directory</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage your organization's workforce
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="custom"
            bg="#22C55E" // Green color to distinguish from onboarding
            text="#FFFFFF"
            size="sm"
            icon={Wallet}
            onClick={() => setCompModalOpen(true)}
            className="rounded-xl py-2.5 px-4 w-full sm:w-auto justify-center"
          >
            Compensation
          </Button>

          <Button
            variant="custom"
            bg="#3B82F6"
            text="#FFFFFF"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
            className="rounded-xl py-2.5 px-4 w-full sm:w-auto justify-center"
          >
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {STATS_CONFIG.map((stat) => (
          <StatsCard
            key={stat.key}
            icon={stat.icon}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
            value={loading ? "..." : stats[stat.key]}
            label={stat.label}
          />
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-card border border-card-border rounded-xl p-4 mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-text-secondary animate-pulse">
            Loading directory...
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <p className="text-lg font-medium">No employees found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {filteredEmployees.map((emp) => (
            <ProfileCard
              key={emp._id || emp.empId}
              data={emp}
              variant="employee"
              onEdit={() => handleEditEmployee(emp)}
              onDelete={() => handleDeleteEmployee(emp._id)}
            />
          ))}
        </div>
      )}

      <ManageCompensationModal
        open={compModalOpen}
        onClose={() => setCompModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh data if your employee cards show salary/bank info
          fetchEmployees();
        }}
      />

      {/* Add/Edit Modal */}
      <AddEmployeeModal
        key={
          modalOpen ? (editingEmployee ? editingEmployee._id : "add") : "closed"
        }
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />
    </div>
  );
};

export default Employees;
