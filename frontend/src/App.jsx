import { Navigate, Route, Routes, Link, useLocation } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import BookmarksPage from "./pages/bookmarks/BookmarksPage";
import ProfilePage from "./pages/profile/ProfilePage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import FallaLogo from "./components/common/FallaLogo";
import ThemeLanguageControls from "./components/common/ThemeLanguageControls";
import Footer from "./components/common/Footer";

import { Toaster, toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { Home, Bell, Bookmark, User, LogOut } from "lucide-react";
import { useLanguage } from "./context/LanguageContext";
import { useTheme } from "./context/ThemeContext";

function App() {
	const location = useLocation();
	const queryClient = useQueryClient();
	const { t, isRTL } = useLanguage();
	const { isDark } = useTheme();

	// 1. Fetch current logged-in user
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	// 2. 🚪 Logout Mutation for Mobile Header
	const { mutate: logout, isPending: isLoggingOut } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success(t("logoutSuccessToast") || "Logged out successfully");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error(t("logoutFailedToast") || "Logout failed");
		},
	});

	if (isLoading) {
		return (
			<div className='min-h-screen flex flex-col justify-center items-center bg-base-100 dark:bg-[#070a11] gap-4 transition-colors duration-200'>
				<FallaLogo className='w-14 h-14 animate-pulse' showText={true} textClassName='text-2xl' />
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-base-100 dark:bg-[#0b0f19] text-base-content flex flex-col justify-between transition-colors duration-200'>
			
			{/* 📱 Mobile Top Header (Visible on sm & md screens, hidden on desktop lg+) */}
			{authUser && (
				<header className='lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-base-100/90 dark:bg-[#0d111a]/90 backdrop-blur-xl border-b border-black/10 dark:border-white/[0.08] transition-colors duration-200'>
					{/* Brand Logo */}
					<Link to='/' className='flex items-center gap-2'>
						<FallaLogo className='w-8 h-8' showText={true} textClassName='text-lg' />
					</Link>
					
					{/* Controls & Avatar & Logout Button */}
					<div className='flex items-center gap-2'>
						<ThemeLanguageControls compact={true} />
						
						{/* User Avatar Profile Link */}
						<Link to={`/profile/${authUser.username}`} className='shrink-0'>
							<img
								src={authUser.profileImg || "/avatar-placeholder.png"}
								alt={authUser.username}
								className='w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/40'
							/>
						</Link>

						{/* 🚪 Mobile Logout Icon Button */}
						<button
							onClick={() => logout()}
							disabled={isLoggingOut}
							title={t("navLogout") || "Logout"}
							className='p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition duration-200 shrink-0 flex items-center justify-center'
						>
							{isLoggingOut ? (
								<LoadingSpinner size='xs' />
							) : (
								<LogOut className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
							)}
						</button>
					</div>
				</header>
			)}

			{/* Main Layout Container */}
			<div className='flex justify-center max-w-7xl mx-auto w-full flex-1'>
				
				{/* 🖥️ Desktop Sidebar (Only visible on lg+ screens, hidden on md & sm) */}
				{authUser && (
					<div className="hidden lg:block shrink-0">
						<Sidebar />
					</div>
				)}

				{/* Main Content Area */}
				<main className='flex-1 flex justify-center pb-20 lg:pb-0 min-w-0 max-w-4xl'>
					<Routes>
						<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
						<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
						<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
						<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
						<Route path='/bookmarks' element={authUser ? <BookmarksPage /> : <Navigate to='/login' />} />
						<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
					</Routes>
				</main>

				{/* Desktop Right Panel (Hidden on small screens) */}
				{authUser && <RightPanel />}
			</div>

			{/* Global Footer */}
			<Footer />

			{/* 📱 Mobile Lower Bar Navigation (Visible on sm & md screens, hidden on desktop lg+) */}
			{authUser && (
				<nav className='lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-base-100/95 dark:bg-[#0d111a]/95 backdrop-blur-xl border-t border-black/10 dark:border-white/[0.08] flex items-center justify-around py-2 px-3 transition-colors duration-200 shadow-lg'>
					<Link
						to='/'
						className={`flex flex-col items-center gap-1 p-1 rounded-xl transition ${
							location.pathname === "/" ? "text-indigo-500 font-bold" : "text-slate-500 dark:text-slate-400"
						}`}
					>
						<Home className='w-5 h-5' />
						<span className='text-[10px]'>{t("navFeed")}</span>
					</Link>

					<Link
						to='/notifications'
						className={`flex flex-col items-center gap-1 p-1 rounded-xl transition ${
							location.pathname === "/notifications" ? "text-indigo-500 font-bold" : "text-slate-500 dark:text-slate-400"
						}`}
					>
						<Bell className='w-5 h-5' />
						<span className='text-[10px]'>{t("navNotifications")}</span>
					</Link>

					<Link
						to='/bookmarks'
						className={`flex flex-col items-center gap-1 p-1 rounded-xl transition ${
							location.pathname === "/bookmarks" ? "text-indigo-500 font-bold" : "text-slate-500 dark:text-slate-400"
						}`}
					>
						<Bookmark className='w-5 h-5' />
						<span className='text-[10px]'>{t("navBookmarks")}</span>
					</Link>

					<Link
						to={`/profile/${authUser.username}`}
						className={`flex flex-col items-center gap-1 p-1 rounded-xl transition ${
							location.pathname.startsWith("/profile") ? "text-indigo-500 font-bold" : "text-slate-500 dark:text-slate-400"
						}`}
					>
						<User className='w-5 h-5' />
						<span className='text-[10px]'>{t("navProfile")}</span>
					</Link>
				</nav>
			)}

			{/* Toast Notifications */}
			<Toaster
				position='bottom-center'
				toastOptions={{
					style: {
						background: isDark ? "#121724" : "#ffffff",
						color: isDark ? "#f8fafc" : "#0f172a",
						border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
						borderRadius: "16px",
						fontSize: "13px",
						boxShadow: isDark ? "0 10px 30px -10px rgba(0,0,0,0.5)" : "0 10px 30px -10px rgba(0,0,0,0.1)",
						fontFamily: isRTL ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif",
					},
					success: {
						iconTheme: {
							primary: "#6366f1",
							secondary: "#ffffff",
						},
					},
				}}
			/>
		</div>
	);
}

export default App;