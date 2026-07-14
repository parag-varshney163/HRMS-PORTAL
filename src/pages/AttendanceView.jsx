import { useEffect, useMemo, useState } from "react";

import AttendenceCalendar from "../components/attendence-view/AttendenceCalender";
import EmployeeProfile from "../components/attendence-view/EmployeeProfile";
import EmployeeList from "../components/attendence-view/EmployeeList";
import axiosInstance from "../api/axiosInstance";
import colors from "../constants/colors";


const AttendanceView = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [search, setSearch] = useState("");

  //----------------------------------------------------
  // Fetch Employees
  //----------------------------------------------------

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);

      const res = await axiosInstance.get("/api/v1/user/all-employees");

      const list = res.data?.data || [];

      setEmployees(list);

      if (list.length > 0) {
        setSelectedEmployee(list[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setEmployeeLoading(false);
    }
  };

  //----------------------------------------------------
  // Fetch Attendance
  //----------------------------------------------------

  const fetchAttendance = async (employeeId) => {
    if (!employeeId) return;

    try {
      setAttendanceLoading(true);

      const res = await axiosInstance.get(
        `/api/v1/attendance/all?search=${employeeId}`
      );

      setAttendance(res.data?.data?.records || []);
    } catch (err) {
      console.log(err);
      setAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  //----------------------------------------------------
  // Initial Load
  //----------------------------------------------------

  useEffect(() => {
    fetchEmployees();
  }, []);

  //----------------------------------------------------
  // Employee Changed
  //----------------------------------------------------

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee.employeeId);
    }
  }, [selectedEmployee]);

  //----------------------------------------------------
  // Search Employees
  //----------------------------------------------------

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;

    return employees.filter((emp) => {
      const keyword = search.toLowerCase();

      return (
        emp.name.toLowerCase().includes(keyword) ||
        emp.employeeId.toLowerCase().includes(keyword) ||
        emp.email.toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  return (
    <div
      className="h-full"
      style={{
        background: colors.pageGradient,
      }}
    >
      <div className="grid grid-cols-12 gap-5 h-full">

        {/* Left */}

        <div className="col-span-3">
          <EmployeeProfile
            employee={selectedEmployee}
            attendance={attendance}
            loading={attendanceLoading}
          />
        </div>

        {/* Center */}

        <div className="col-span-6">
          <AttendenceCalendar
            employee={selectedEmployee}
            attendance={attendance}
            loading={attendanceLoading}
          />
        </div>

        {/* Right */}

        <div className="col-span-3">
          <EmployeeList
            employees={filteredEmployees}
            selectedEmployee={selectedEmployee}
            onSelect={setSelectedEmployee}
            loading={employeeLoading}
            search={search}
            setSearch={setSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;