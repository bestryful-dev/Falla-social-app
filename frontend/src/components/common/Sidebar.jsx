import { Link, useLocation } from "react-router-dom";
import { Home, Bell, Bookmark, User, LogOut } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";
import FallaLogo from "./FallaLogo";
import ThemeLanguageControls from "./ThemeLanguageControls";
import { useLanguage } from "../../context/LanguageContext";
import { useSocket } from "../../context/SocketContext"; // 👈 Socket hook

const Sidebar = () => {
	const location = useLocation();
	const queryClient = useQueryClient();
	const { t, isRTL } = useLanguage();
	const { socket } = useSocket();

	// 1. Fetch unread notifications count
	const { data: unreadCount = 0 } = useQuery({
		queryKey: ["unreadNotificationsCount"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications/unread-count");
				const data = await res.json();
				return data?.count || 0;
			} catch {
				return 0;
			}
		},
	});

	// 2. 🔔 Real-time notification socket listener
	useEffect(() => {
		if (!socket) return;

		const handleNewNotification = () => {
			queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		};

		socket.on("newNotification", handleNewNotification);

		return () => socket.off("newNotification", handleNewNotification);
	}, [socket, queryClient]);

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

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const navItems = [
		{
			to: "/",
			label: t("navFeed"),
			icon: Home,
			active: location.pathname === "/",
		},
		{
			to: "/notifications",
			label: t("navNotifications"),
			icon: Bell,
			active: location.pathname === "/notifications",
			isNotification: true,
		},
		{
			to: "/bookmarks",
			label: t("navBookmarks"),
			icon: Bookmark,
			active: location.pathname === "/bookmarks",
		},
		{
			to: authUser ? `/profile/${authUser.username}` : "/login",
			label: t("navProfile"),
			icon: User,
			active: location.pathname === `/profile/${authUser?.username}`,
		},
	];

	return (
		<aside className='w-16 md:w-60 lg:w-64 shrink-0'>
			<div className='sticky top-0 h-screen flex flex-col justify-between p-2 sm:p-3 md:p-4 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] bg-base-100/90 dark:bg-[#0d111a]/80 backdrop-blur-xl transition-colors duration-200'>
				
				{/* Top section: Logo & Nav */}
				<div className='flex flex-col gap-6'>
					{/* Brand Logo Header */}
					<Link
						to='/'
						className='flex items-center gap-3 px-2.5 py-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.04] transition duration-200 group justify-center md:justify-start'
					>
						<FallaLogo className='w-10 h-10' showText={true} textClassName='text-xl hidden md:block' />
					</Link>

					{/* Navigation Links */}
					<nav className='flex flex-col gap-1.5'>
						{navItems.map((item) => {
							const IconComponent = item.icon;
							return (
								<Link
									key={item.to}
									to={item.to}
									className={`flex items-center justify-center md:justify-start gap-3.5 px-3 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group relative ${
										item.active
											? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-600 dark:text-white border border-indigo-500/30 shadow-sm dark:shadow-glow"
											: "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.05]"
									}`}
								>
									<div
										className={`p-1.5 rounded-xl relative transition-all duration-200 ${
											item.active
												? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
												: "text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 group-hover:bg-black/5 dark:group-hover:bg-white/[0.05]"
										}`}
									>
										<IconComponent className='w-5 h-5' />
										
										{/* 🔔 Red Notification Badge */}
										{item.isNotification && unreadCount > 0 && (
											<span className='absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm'>
												{unreadCount > 9 ? "9+" : unreadCount}
											</span>
										)}
									</div>
									
									<span className='hidden md:block tracking-wide'>{item.label}</span>
									
									{item.active && (
										<span className={`hidden md:block absolute ${isRTL ? "left-3" : "right-3"} w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#818cf8]`} />
									)}
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Bottom section: Theme / Language Switcher + User Profile Card */}
				<div className='pt-3 border-t border-black/10 dark:border-white/[0.08] flex flex-col gap-2 md:gap-3'>
					{/* Theme and Language Controls */}
					<div className='hidden md:flex items-center justify-between px-1 py-1'>
						<ThemeLanguageControls compact={false} showLabels={true} />
					</div>

					{/* Mobile only icon controls */}
					<div className='flex md:hidden justify-center'>
						<ThemeLanguageControls compact={true} />
					</div>

					{/* User Card: Stacks vertically on icon sidebar (w-16) and horizontally on desktop (md:w-60) */}
					{authUser && (
						<div className='flex flex-col md:flex-row items-center justify-between p-1.5 md:p-2 rounded-2xl bg-surface-100 dark:bg-surface-100/60 border border-black/5 dark:border-white/[0.05] hover:border-black/10 dark:hover:border-white/[0.1] transition duration-200 gap-1.5 md:gap-0 group'>
							<Link
								to={`/profile/${authUser.username}`}
								className='flex items-center justify-center md:justify-start gap-2.5 min-w-0 flex-1'
								title={authUser.fullName}
							>
								<div className='relative shrink-0'>
									<img
										src={authUser.profileImg || "/avatar-placeholder.png"}
										alt={authUser.username}
										className='w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover ring-2 ring-indigo-500/40'
									/>
									<span className={`absolute -bottom-0.5 ${isRTL ? "-left-0.5" : "-right-0.5"} w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100`} />
								</div>
								<div className='hidden md:flex flex-col min-w-0 text-start'>
									<p className='text-xs font-bold text-slate-800 dark:text-white truncate leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition'>
										{authUser.fullName}
									</p>
									<p className='text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight'>
										@{authUser.username}
									</p>
								</div>
							</Link>

							{/* Logout button */}
							<button
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
								disabled={isLoggingOut}
								title={t("navLogout") || "Logout"}
								className='p-1.5 md:p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition duration-200 shrink-0 flex items-center justify-center'
							>
								<LogOut className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
							</button>
						</div>
					)}
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;