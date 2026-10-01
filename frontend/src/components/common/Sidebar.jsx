import { Link, useLocation } from "react-router-dom";
import { Home, Bell, Bookmark, User, LogOut } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import FallaLogo from "./FallaLogo";
import ThemeLanguageControls from "./ThemeLanguageControls";
import { useLanguage } from "../../context/LanguageContext";

const Sidebar = () => {
	const location = useLocation();
	const queryClient = useQueryClient();
	const { t, isRTL } = useLanguage();

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
			toast.success(t("logoutSuccessToast"));
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error(t("logoutFailedToast"));
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
			<div className='sticky top-0 h-screen flex flex-col justify-between p-3 md:p-4 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] bg-base-100/90 dark:bg-[#0d111a]/80 backdrop-blur-xl transition-colors duration-200'>
				
				{/* Top section: Logo & Nav */}
				<div className='flex flex-col gap-6'>
					{/* Brand Logo Header */}
					<Link
						to='/'
						className='flex items-center gap-3 px-2.5 py-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.04] transition duration-200 group'
					>
						<FallaLogo className='w- h-10' showText={true} textClassName='text-xl hidden md:block' />
					</Link>

					{/* Navigation Links */}
					<nav className='flex flex-col gap-1.5'>
						{navItems.map((item) => {
							const IconComponent = item.icon;
							return (
								<Link
									key={item.to}
									to={item.to}
									className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group relative ${
										item.active
											? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-600 dark:text-white border border-indigo-500/30 shadow-sm dark:shadow-glow"
											: "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.05]"
									}`}
								>
									<div
										className={`p-1.5 rounded-xl transition-all duration-200 ${
											item.active
												? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
												: "text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 group-hover:bg-black/5 dark:group-hover:bg-white/[0.05]"
										}`}
									>
										<IconComponent className='w-5 h-5' />
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
				<div className='pt-3 border-t border-black/10 dark:border-white/[0.08] flex flex-col gap-3'>
					{/* Theme and Language Controls */}
					<div className='hidden md:flex items-center justify-between px-1 py-1'>
						<ThemeLanguageControls compact={false} showLabels={true} />
					</div>

					{/* Mobile only icon controls */}
					<div className='flex md:hidden justify-center'>
						<ThemeLanguageControls compact={true} />
					</div>

					{/* User Card */}
					{authUser && (
						<div className='flex items-center justify-between p-2 rounded-2xl bg-surface-100 dark:bg-surface-100/60 border border-black/5 dark:border-white/[0.05] hover:border-black/10 dark:hover:border-white/[0.1] transition duration-200 group'>
							<Link
								to={`/profile/${authUser.username}`}
								className='flex items-center gap-2.5 min-w-0 flex-1'
							>
								<div className='relative shrink-0'>
									<img
										src={authUser.profileImg || "/avatar-placeholder.png"}
										alt={authUser.username}
										className='w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/40'
									/>
									<span className={`absolute -bottom-0.5 ${isRTL ? "-left-0.5" : "-right-0.5"} w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100`} />
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

							<button
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
								disabled={isLoggingOut}
								title={t("navLogout")}
								className='p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition duration-200 shrink-0'
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
