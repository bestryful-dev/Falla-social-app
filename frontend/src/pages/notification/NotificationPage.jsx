import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Bell, Heart, UserPlus, Repeat2, MoreVertical, Trash2, CheckCheck } from "lucide-react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useLanguage } from "../../context/LanguageContext";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { t, isRTL } = useLanguage();

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success(t("notificationsClearedToast"));
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full transition-colors duration-200'>
			
			{/* Header */}
			<div className='sticky top-0 z-20 backdrop-blur-xl bg-base-100/90 dark:bg-[#0d111a]/85 border-b border-black/10 dark:border-white/[0.08] px-5 py-4 flex justify-between items-center transition-colors duration-200'>
				<div className='flex items-center gap-2.5'>
					<div className='p-2 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'>
						<Bell className='w-4 h-4' />
					</div>
					<div className='text-start'>
						<h1 className='font-bold text-base text-slate-900 dark:text-white leading-tight'>
							{t("notificationsTitle")}
						</h1>
						<p className='text-[11px] text-slate-500 dark:text-slate-400'>
							{t("notificationsSubtitle")}
						</p>
					</div>
				</div>

				{/* Dropdown Menu */}
				<div className='dropdown dropdown-end'>
					<div
						tabIndex={0}
						role='button'
						className='p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] transition duration-150'
					>
						<MoreVertical className='w-4 h-4' />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content z-[30] menu p-2 shadow-2xl bg-base-100 dark:bg-[#141a29] border border-black/10 dark:border-white/10 rounded-2xl w-56 mt-1'
					>
						<li>
							<button
								onClick={() => deleteNotifications()}
								disabled={isDeleting || !notifications || notifications.length === 0}
								className='text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 py-2 font-semibold'
							>
								<Trash2 className='w-3.5 h-3.5' />
								<span>{t("clearAllNotifications")}</span>
							</button>
						</li>
					</ul>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className='flex justify-center items-center py-20'>
					<LoadingSpinner size='lg' />
				</div>
			)}

			{/* Empty State */}
			{!isLoading && notifications?.length === 0 && (
				<div className='flex flex-col items-center justify-center p-16 text-center'>
					<div className='w-16 h-16 rounded-3xl bg-base-200 dark:bg-surface-100 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-inner'>
						<CheckCheck className='w-8 h-8 text-emerald-500' />
					</div>
					<h3 className='font-bold text-slate-800 dark:text-slate-200 text-base'>
						{t("allCaughtUp")}
					</h3>
					<p className='text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1'>
						{t("allCaughtUpDesc")}
					</p>
				</div>
			)}

			{/* Notifications List */}
			{!isLoading && notifications && notifications.length > 0 && (
				<div className='divide-y divide-black/5 dark:divide-white/[0.04]'>
					{notifications.map((notification) => {
						const isFollow = notification.type === "follow";
						const isLike = notification.type === "like";
						const isShare = notification.type === "share" || notification.type === "repost";

						return (
							<Link
								to={`/profile/${notification.from.username}`}
								key={notification._id}
								className='flex items-center gap-4 p-4 hover:bg-base-200/60 dark:hover:bg-surface-100/50 transition-colors duration-200 group'
							>
								{/* Notification Type Icon Badge */}
								<div className='shrink-0'>
									{isFollow && (
										<div className='w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform'>
											<UserPlus className='w-5 h-5' />
										</div>
									)}
									{isLike && (
										<div className='w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform'>
											<Heart className='w-5 h-5 fill-rose-500' />
										</div>
									)}
									{isShare && (
										<div className='w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform'>
											<Repeat2 className='w-5 h-5' />
										</div>
									)}
								</div>

								{/* Sender Avatar */}
								<div className='relative shrink-0'>
									<img
										src={notification.from.profileImg || "/avatar-placeholder.png"}
										alt={notification.from.username}
										className='w-10 h-10 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/10 group-hover:ring-indigo-500/50 transition'
									/>
								</div>

								{/* Notification Content */}
								<div className='flex-1 min-w-0 text-start'>
									<p className='text-xs text-slate-800 dark:text-slate-200 leading-relaxed'>
										<span className='font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition'>
											{notification.from.fullName}
										</span>{" "}
										<span className='text-slate-500 dark:text-slate-400 font-normal'>
											@{notification.from.username}
										</span>{" "}
										{isFollow ? (
											<span className='text-indigo-600 dark:text-indigo-300 font-medium'>
												{t("followedYou")}
											</span>
										) : isShare ? (
											<span className='text-emerald-600 dark:text-emerald-400 font-medium'>
												{t("sharedYourPost")}
											</span>
										) : (
											<span className='text-rose-500 dark:text-rose-400 font-medium'>
												{t("likedYourPost")}
											</span>
										)}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default NotificationPage;
