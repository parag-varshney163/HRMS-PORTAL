import { FileSignature, Download, Mail, FileText, Inbox } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import FilterDropDown from "../components/ui/FilterDropDown";
import useNotification from "../hooks/useNotification.jsx";
import SearchBar from "../components/ui/SearchBar";
import DataTable from "../components/ui/DataTable";
import axiosInstance from "../api/axiosInstance";
// Components
import Button from "../components/ui/Button";
import colors from "../constants/colors.js";


// ─── HELPER: TEMPLATE MAPPING ───
const templateOptionsMap = {
  "Standard Full-Time": "fulltime",
  Internship: "intern",
};
const templateOptions = Object.keys(templateOptionsMap);

const reverseTemplateMap = {
  fulltime: "Standard Full-Time",
  intern: "Internship",
};

export default function OfferLetters() {
  const notify = useNotification();

  // ─── FORM STATE ───
  const [form, setForm] = useState({
    candidateName: "",
    email: "",
    designation: "",
    department: "",
    ctc: "",
    dateOfJoining: "",
    templateType: "fulltime",
    // 🚨 NEW: Added required fields for fulltime breakdown
    basicSalary: "",
    hra: "",
    specialAllowance: "",
    pf: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── HISTORY TABLE STATE ───
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ─── DEBOUNCE SEARCH ───
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── API: FETCH GENERATED LETTERS ───
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const url = debouncedSearch.trim()
        ? `/api/v1/offer-letter?candidateName=${encodeURIComponent(debouncedSearch)}`
        : `/api/v1/offer-letter`;

      const { data } = await axiosInstance.get(url);

      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch offer letters", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ─── API: GENERATE LETTER ───
  const handleGenerate = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.candidateName || !form.ctc || !form.dateOfJoining) {
      notify.error("Validation Error", "Please fill all required fields.");
      return;
    }

    // 🚨 Clean the numeric inputs so the backend doesn't crash on commas
    const parseCurrency = (val) =>
      Number(String(val).replace(/[^0-9.-]+/g, "")) || 0;

    const payload = {
      templateType: form.templateType,
      candidateName: form.candidateName,
      designation: form.designation,
      department: form.department,
      ctc: parseCurrency(form.ctc),
      dateOfJoining: form.dateOfJoining,
    };

    // 🚨 IF FULLTIME: Ensure breakdown fields exist and append them to payload
    if (form.templateType === "fulltime") {
      if (
        !form.basicSalary ||
        !form.hra ||
        !form.specialAllowance ||
        !form.pf
      ) {
        notify.error(
          "Validation Error",
          "Please fill in the complete Salary Breakdown.",
        );
        return;
      }
      payload.basicSalary = parseCurrency(form.basicSalary);
      payload.hra = parseCurrency(form.hra);
      payload.specialAllowance = parseCurrency(form.specialAllowance);
      payload.pf = parseCurrency(form.pf);
    }

    try {
      setIsGenerating(true);

      // We store the whole response just in case, but we don't strictly require data.success anymore
      const response = await axiosInstance.post(
        "/api/v1/offer-letter/generate",
        payload,
      );

      // 🚨 IF THE CODE REACHES HERE, THE API SUCCEEDED! 🚨

      notify.success("Success", "Offer letter generated.");

      // Reset form completely
      setForm({
        candidateName: "",
        email: "",
        designation: "",
        department: "",
        ctc: "",
        dateOfJoining: "",
        templateType: "fulltime",
        basicSalary: "",
        hra: "",
        specialAllowance: "",
        pf: "",
      });

      // Immediately trigger the history refresh to update the table
      fetchHistory();

      // If it sends a raw PDF, this safely does nothing.
      const pdfUrl =
        response.data?.data?.documentUrl ||
        response.data?.url ||
        response.data?.pdfUrl;
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
      }
    } catch (error) {
      notify.error(
        "Generation Failed",
        error.response?.data?.message || "Could not generate offer letter.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // const handleSendEmail = (row) => {
  //   notify.success(
  //     "Email Queued",
  //     `Offer letter is being sent to ${row.candidateName}.`,
  //   );
  // };

  // ─── DATA TABLE COLUMNS ───
  const columns = [
    {
      key: "candidate",
      label: "Candidate Info",
      width: "2fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {row.candidateName}
          </p>
          <p className="text-xs text-text-secondary truncate">
            Dept. {row.department}
          </p>
        </div>
      ),
    },
    {
      key: "designation",
      label: "Role",
      width: "1.5fr",
      align: "left",
      render: (val, row) => (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {val}
          </p>
          <p className="text-xs text-text-secondary truncate capitalize">
            {row.templateType}
          </p>
        </div>
      ),
    },
    {
      key: "ctc",
      label: "CTC",
      width: "1fr",
      align: "center",
      render: (val) => {
        // 'val' is already the number (e.g., 288000)
        return (
          <span className="font-bold text-text-primary">
            ₹{(val || 0).toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "dateOfJoining",
      label: "Joining Date",
      width: "1fr",
      align: "left",
      render: (val) => (
        <span className="text-sm text-text-secondary">
          {val ? new Date(val).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "1fr",
      align: "right",
      render: (_, row) => {
        const documentUrl = row.documentUrl || row.url || row.pdfUrl;
        return (
          <div className="flex justify-end gap-2">
            {documentUrl && (
              <button
                onClick={() => window.open(documentUrl, "_blank")}
                className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            )}
            {/* <button
              onClick={() => handleSendEmail(row)}
              className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl transition-colors cursor-pointer"
              title="Email to Candidate"
            >
              <Mail size={16} />
            </button> */}
          </div>
        );
      },
    },
  ];

  return (
    <div className="py-2 flex flex-col gap-8 w-full pb-10 animate-in fade-in">
      {/* ─── PAGE HEADER ─── */}
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Offer Letter <span className="text-accent">Generator</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Generate, download, and email official offer letters.
          </p>
        </div>
      </div> */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 rounded-3xl border px-6 py-5"
        style={{
          background: colors.cardBg,
          borderColor: colors.cardBorder,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
            style={{
              background: colors.accentLight,
              color: colors.accentDark,
            }}
          >
            <FileSignature size={28} />
          </div>

          <div>
            <h2
              className="text-3xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Offer Letter{" "}
              <span style={{ color: colors.accentDark }}>Generator</span>
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              Generate, download, and email professionally formatted offer letters
              with a single click.
            </p>
          </div>
        </div>

        <div
          className="hidden lg:flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: colors.hover,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: colors.successLight,
              color: colors.success,
            }}
          >
            <FileText size={18} />
          </div>

          <div>
            <p
              className="text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              Status
            </p>

            <p
              className="font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Ready to Generate
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ─── LEFT: GENERATOR FORM ─── */}
        {/* <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                <FileSignature size={20} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Letter Details
              </h3>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Template Type
                </label>
                <div
                  className={
                    isGenerating ? "opacity-50 pointer-events-none" : ""
                  }
                >
                  <FilterDropDown
                    options={templateOptions}
                    defaultLabel={reverseTemplateMap[form.templateType]}
                    width="100%"
                    onSelect={(selectedDisplayStr) => {
                      handleChange(
                        "templateType",
                        templateOptionsMap[selectedDisplayStr],
                      );
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Candidate Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.candidateName}
                  onChange={(e) =>
                    handleChange("candidateName", e.target.value)
                  }
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Candidate Email *
                </label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Designation
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Frontend Dev"
                    value={form.designation}
                    onChange={(e) =>
                      handleChange("designation", e.target.value)
                    }
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Department
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Engineering"
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Total CTC *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="₹ 8,00,000"
                    value={form.ctc}
                    onChange={(e) => handleChange("ctc", e.target.value)}
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Date of Joining *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.dateOfJoining}
                    onChange={(e) =>
                      handleChange("dateOfJoining", e.target.value)
                    }
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer"
                  />
                </div>
              </div>

              
              {form.templateType === "fulltime" && (
                <div className="pt-3 border-t border-card-border/50 mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-sm font-bold text-text-primary mb-1">
                    Salary Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-1">
                        Basic Salary *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="₹ 4,00,000"
                        value={form.basicSalary}
                        onChange={(e) =>
                          handleChange("basicSalary", e.target.value)
                        }
                        className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-1">
                        HRA *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="₹ 2,00,000"
                        value={form.hra}
                        onChange={(e) => handleChange("hra", e.target.value)}
                        className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-1">
                        Special Allowance *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="₹ 1,50,000"
                        value={form.specialAllowance}
                        onChange={(e) =>
                          handleChange("specialAllowance", e.target.value)
                        }
                        className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-1">
                        PF *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="₹ 50,000"
                        value={form.pf}
                        onChange={(e) => handleChange("pf", e.target.value)}
                        className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-card-border mt-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full justify-center py-3.5 font-bold"
                  icon={isGenerating ? null : FileText}
                >
                  {isGenerating ? "Generating PDF..." : "Generate Offer Letter"}
                </Button>
              </div>
            </form>
          </div>
        </div> */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div
            className="rounded-3xl p-6 sticky top-6 shadow-sm border"
            style={{
              background: colors.cardBg,
              borderColor: colors.cardBorder,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: colors.accentLight,
                  color: colors.accentDark,
                }}
              >
                <FileSignature size={22} />
              </div>

              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Letter Details
                </h3>

                <p
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Fill candidate information to generate an offer letter.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Template */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Template Type
                </label>

                <div
                  className={isGenerating ? "opacity-50 pointer-events-none" : ""}
                >
                  <FilterDropDown
                    options={templateOptions}
                    defaultLabel={reverseTemplateMap[form.templateType]}
                    width="100%"
                    onSelect={(selectedDisplayStr) =>
                      handleChange(
                        "templateType",
                        templateOptionsMap[selectedDisplayStr]
                      )
                    }
                  />
                </div>
              </div>

              {/* Candidate Name */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Candidate Full Name *
                </label>

                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={form.candidateName}
                  onChange={(e) =>
                    handleChange("candidateName", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    background: colors.inputBg,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Candidate Email *
                </label>

                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    background: colors.inputBg,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Designation + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Designation
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Frontend Developer"
                    value={form.designation}
                    onChange={(e) =>
                      handleChange("designation", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      background: colors.inputBg,
                      borderColor: colors.cardBorder,
                      color: colors.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Department
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Engineering"
                    value={form.department}
                    onChange={(e) =>
                      handleChange("department", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      background: colors.inputBg,
                      borderColor: colors.cardBorder,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* CTC + DOJ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Total CTC *
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="₹ 8,00,000"
                    value={form.ctc}
                    onChange={(e) => handleChange("ctc", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      background: colors.inputBg,
                      borderColor: colors.cardBorder,
                      color: colors.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Date of Joining *
                  </label>

                  <input
                    required
                    type="date"
                    value={form.dateOfJoining}
                    onChange={(e) =>
                      handleChange("dateOfJoining", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none cursor-pointer"
                    style={{
                      background: colors.inputBg,
                      borderColor: colors.cardBorder,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* Salary Breakdown */}
              {form.templateType === "fulltime" && (
                <div
                  className="rounded-2xl p-5 mt-2 animate-in fade-in"
                  style={{
                    background: colors.secondary,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <h4
                    className="font-bold mb-4"
                    style={{ color: colors.textPrimary }}
                  >
                    Salary Breakdown
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Basic Salary",
                        key: "basicSalary",
                        placeholder: "₹ 4,00,000",
                      },
                      {
                        label: "HRA",
                        key: "hra",
                        placeholder: "₹ 2,00,000",
                      },
                      {
                        label: "Special Allowance",
                        key: "specialAllowance",
                        placeholder: "₹ 1,50,000",
                      },
                      {
                        label: "PF",
                        key: "pf",
                        placeholder: "₹ 50,000",
                      },
                    ].map((field) => (
                      <div key={field.key}>
                        <label
                          className="block text-[11px] font-semibold uppercase mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {field.label}
                        </label>

                        <input
                          required
                          type="text"
                          placeholder={field.placeholder}
                          value={form[field.key]}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                          style={{
                            background: colors.cardBg,
                            borderColor: colors.cardBorder,
                            color: colors.textPrimary,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div
                className="pt-5"
                style={{
                  borderTop: `1px solid ${colors.cardBorder}`,
                }}
              >
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full justify-center py-3.5 font-semibold rounded-xl"
                  bg={colors.buttonBg}
                  hoverBg={colors.buttonHover}
                  text="#fff"
                  icon={isGenerating ? null : FileText}
                >
                  {isGenerating
                    ? "Generating PDF..."
                    : "Generate Offer Letter"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* ─── RIGHT: RECENT LETTERS TABLE ─── */}
        {/* <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="w-full sm:w-75">
              <SearchBar
                placeholder="Search generated letters..."
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                width="100%"
              />
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl flex-1 flex flex-col overflow-hidden">
            {history.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-secondary m-4 border border-dashed border-card-border rounded-xl">
                <Inbox size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-lg text-text-primary">
                  No documents found
                </p>
                <p className="text-sm mt-1">
                  Generate your first offer letter to see it here.
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={history}
                loading={loading}
                paginationMode="client"
              />
            )}
          </div>
        </div> */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
            <div>
              <h3
                className="text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                Generated{" "}
                <span style={{ color: colors.accentDark }}>
                  Offer Letters
                </span>
              </h3>

              <p
                className="text-sm mt-1"
                style={{ color: colors.textSecondary }}
              >
                View, search, download and manage previously generated offer letters.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <SearchBar
                placeholder="Search candidate or email..."
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                width="100%"
              />
            </div>
          </div>

          {/* History Card */}
          <div
            className="flex-1 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            {history.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: colors.accentLight,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <Inbox
                    size={32}
                    color={colors.accentDark}
                  />
                </div>

                <h3
                  className="text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  No Offer Letters Found
                </h3>

                <p
                  className="text-sm mt-2 max-w-md leading-relaxed"
                  style={{ color: colors.textSecondary }}
                >
                  Generate your first offer letter to start building your document
                  history. Generated letters can be downloaded, emailed, and searched
                  anytime.
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={history}
                loading={loading}
                paginationMode="client"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
