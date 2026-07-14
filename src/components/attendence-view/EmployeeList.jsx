import { Search } from "lucide-react";

import colors from "../../constants/colors";


const EmployeeList = ({
  employees = [],
  selectedEmployee,
  onSelect,
  loading,
  search,
  setSearch,
}) => {
  return (
    <div
      className="h-full rounded-2xl flex flex-col overflow-hidden shadow-sm"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* Header */}

      <div
        className="px-5 py-4 border-b"
        style={{
          borderColor: colors.cardBorder,
        }}
      >
        <h2
          className="text-lg font-semibold"
          style={{
            color: colors.textPrimary,
          }}
        >
          Employees
        </h2>

        <div className="relative mt-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            color={colors.textMuted}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee..."
            className="w-full rounded-xl py-2.5 pl-10 pr-4 outline-none border text-sm"
            style={{
              background: colors.inputBg,
              borderColor: colors.cardBorder,
              color: colors.textPrimary,
            }}
          />
        </div>
      </div>

      {/* Employee List */}

      <div className="flex-1 overflow-y-auto">

        {loading ? (
          <div className="space-y-3 p-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 rounded-full"
                  style={{ background: colors.cardBorder }}
                />

                <div className="flex-1 space-y-2">
                  <div
                    className="h-3 rounded"
                    style={{ background: colors.cardBorder }}
                  />

                  <div
                    className="h-3 rounded w-2/3"
                    style={{ background: colors.cardBorder }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div
            className="h-full flex justify-center items-center text-sm"
            style={{ color: colors.textMuted }}
          >
            No Employee Found
          </div>
        ) : (
          employees.map((employee) => {
            const active =
              selectedEmployee?.userId === employee.userId;

            return (
              <div
                key={employee.userId}
                onClick={() => onSelect(employee)}
                className="cursor-pointer transition-all duration-200 border-l-4"
                style={{
                  borderColor: active
                    ? colors.accent
                    : "transparent",

                  background: active
                    ? colors.activeMenuBg
                    : colors.cardBg,
                }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    background: active
                      ? colors.activeMenuBg
                      : "transparent",
                  }}
                >
                  {/* Avatar */}

                  <div className="relative">

                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        background: colors.blue,
                      }}
                    >
                      {employee.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2"
                      style={{
                        background: employee.isOnline
                          ? colors.success
                          : colors.danger,

                        borderColor: colors.cardBg,
                      }}
                    />
                  </div>

                  {/* Details */}

                  <div className="flex-1 overflow-hidden">

                    <h4
                      className="font-semibold truncate"
                      style={{
                        color: colors.textPrimary,
                      }}
                    >
                      {employee.name}
                    </h4>

                    <p
                      className="text-xs truncate"
                      style={{
                        color: colors.textSecondary,
                      }}
                    >
                      {employee.designation}
                    </p>

                    <p
                      className="text-xs"
                      style={{
                        color: colors.textMuted,
                      }}
                    >
                      {employee.employeeId}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
