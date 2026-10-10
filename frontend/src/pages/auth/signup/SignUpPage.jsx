import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AtSign,
  Smartphone,
  Download,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import FallaLogo from "../../../components/common/FallaLogo";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ThemeLanguageControls from "../../../components/common/ThemeLanguageControls";
import { useLanguage } from "../../../context/LanguageContext";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { t, isRTL } = useLanguage();

  const queryClient = useQueryClient();

  // Signup Mutation -> Auto-login on success
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, fullName, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      return data;
    },
    onSuccess: () => {
      toast.success(t("accountCreatedToast") || "Account created successfully!");
      // 🚀 Logs the user straight in:
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-base-100 dark:bg-[#070a11] transition-colors duration-200">
      {/* Ambient Glowing Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Floating Theme & Language controls */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeLanguageControls
          compact={false}
          showLabels={false}
          className="bg-base-200/80 dark:bg-surface-100/80 p-1.5 rounded-2xl border border-black/5 dark:border-white/10 backdrop-blur-md shadow-lg"
        />
      </div>

      <div className="w-full max-w-5xl rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 shadow-2xl relative z-10">
        {/* Left Hero Pane (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 p-10 flex-col justify-between bg-gradient-to-br from-purple-500/10 via-base-200 to-base-300 dark:from-purple-950/40 dark:via-surface-100/60 dark:to-surface-200/40 ltr:border-r rtl:border-l border-black/10 dark:border-white/10 relative overflow-hidden text-start">
          <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          <div className="relative z-10">
            <FallaLogo
              className="w-12 h-12"
              showText={true}
              textClassName="text-2xl"
            />
          </div>

          <div className="space-y-4 relative z-10 my-auto py-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{t("createAccountTitle")}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {t("signupHeroHeading")}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              {t("signupHeroSubheading")}
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>{t("signupFeature1")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>{t("signupFeature2")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>{t("signupFeature3")}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 relative z-10">
            © {new Date().getFullYear()}{" "}
            {isRTL ? " نبأ." : "Naba social"}
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-base-100/95 dark:bg-[#0e121c]/90 text-start">
          <div className="lg:hidden flex items-center justify-center mb-6">
            <FallaLogo
              className="w-10 h-10"
              showText={true}
              textClassName="text-xl"
            />
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-6 text-center lg:text-start">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("createAccountTitle")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t("signupSubtitle")}
              </p>
            </div>

            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("emailAddress")}
                </label>
                <div className="relative flex items-center">
                  <Mail
                    className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3.5" : "left-3.5"}`}
                  />
                  <input
                    type="email"
                    required
                    className={`w-full glass-input rounded-2xl py-2.5 text-xs text-start ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                    placeholder={t("emailPlaceholder")}
                    name="email"
                    onChange={handleInputChange}
                    value={formData.email}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("username")}
                  </label>
                  <div className="relative flex items-center">
                    <AtSign
                      className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3.5" : "left-3.5"}`}
                    />
                    <input
                      type="text"
                      required
                      className={`w-full glass-input rounded-2xl py-2.5 text-xs text-start ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"}`}
                      placeholder={t("usernamePlaceholder")}
                      name="username"
                      onChange={handleInputChange}
                      value={formData.username}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("fullName")}
                  </label>
                  <div className="relative flex items-center">
                    <User
                      className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3.5" : "left-3.5"}`}
                    />
                    <input
                      type="text"
                      required
                      className={`w-full glass-input rounded-2xl py-2.5 text-xs text-start ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"}`}
                      placeholder={t("fullNamePlaceholder")}
                      name="fullName"
                      onChange={handleInputChange}
                      value={formData.fullName}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("currentPassword")}
                </label>
                <div className="relative flex items-center">
                  <Lock
                    className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3.5" : "left-3.5"}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className={`w-full glass-input rounded-2xl py-2.5 text-xs text-start ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                    placeholder={t("passwordPlaceholder")}
                    name="password"
                    onChange={handleInputChange}
                    value={formData.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? "left-3.5" : "right-3.5"} text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="gradient-btn w-full py-3.5 rounded-2xl text-xs font-bold mt-2 flex items-center justify-center gap-2 shadow-glow"
              >
                {isPending ? (
                  <>
                    <LoadingSpinner size="xs" />
                    <span>{t("creatingAccountButton")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("createAccountButton")}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </button>

              {isError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs text-center font-medium">
                  {error.message}
                </div>
              )}
            </form>

            {/* 📱 Download Android APK Button */}
            <div className="mt-5">
              <a
                href="/naba-social.apk"
                download="naba-social.apk"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-base-200/60 dark:bg-surface-100/60 border border-black/5 dark:border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isRTL ? "تحميل تطبيق نبأ" : "Download Naba App"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isRTL ? "ملف APK مباشر للهاتف" : "Direct APK file for your phone"}
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-base-100 dark:bg-surface-200 text-slate-500 group-hover:text-indigo-500 group-hover:translate-y-0.5 transition-all shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
              </a>
            </div>

            {/* Login Redirect */}
            <div className="mt-5 pt-5 border-t border-black/10 dark:border-white/[0.08] text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
                  className="font-bold text-indigo-500 hover:underline"
                >
                  {t("signInLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;