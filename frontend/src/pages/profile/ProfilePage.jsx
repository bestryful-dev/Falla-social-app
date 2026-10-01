import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Link as LinkIcon, Camera, Sparkles, Check, Heart, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { useLanguage } from "../../context/LanguageContext";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");
	const { t, isRTL, language } = useLanguage();

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const { username } = useParams();

	const { follow, isPending: isFollowingPending } = useFollow();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const {
		data: user,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			try {
				const res = await fetch(`/api/users/profile/${username}`);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

	const isMyProfile = authUser?._id === user?._id;
	const memberSinceDate = formatMemberSinceDate(user?.createdAt, language);
	const amIFollowing = authUser?.following?.includes(user?._id);

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	return (
		<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full transition-colors duration-200'>
			
			{/* Top bar with back button */}
			<div className='sticky top-0 z-20 backdrop-blur-xl bg-base-100/90 dark:bg-[#0d111a]/85 border-b border-black/10 dark:border-white/[0.08] px-4 py-3 flex items-center gap-4 transition-colors duration-200'>
				<Link
					to='/'
					className='p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition duration-200'
				>
					<ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
				</Link>
				<div className='flex flex-col min-w-0 text-start'>
					<h1 className='font-bold text-base text-slate-900 dark:text-white truncate leading-tight'>
						{user?.fullName || t("navProfile")}
					</h1>
					<p className='text-[11px] text-slate-500 dark:text-slate-400'>
						@{user?.username || username}
					</p>
				</div>
			</div>

			{/* Loading Skeleton */}
			{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}

			{/* User Not Found */}
			{!isLoading && !isRefetching && !user && (
				<div className='flex flex-col items-center justify-center p-16 text-center'>
					<h2 className='text-lg font-bold text-slate-800 dark:text-white'>{t("userNotFoundTitle")}</h2>
					<p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>{t("userNotFoundDesc")}</p>
					<Link to='/' className='gradient-btn px-4 py-2 rounded-xl text-xs mt-4'>
						{t("backToFeed")}
					</Link>
				</div>
			)}

			{/* Profile Content */}
			{!isLoading && !isRefetching && user && (
				<div className='flex flex-col'>
					
					{/* Cover Banner */}
					<div className='relative h-44 sm:h-56 w-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-800/40 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 group'>
						{(coverImg || user?.coverImg) ? (
							<img
								src={coverImg || user?.coverImg}
								className='h-full w-full object-cover'
								alt='Profile Cover'
							/>
						) : (
							<div className='w-full h-full bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center'>
								<Sparkles className='w-12 h-12 text-indigo-500/30' />
							</div>
						)}

						{/* Cover Edit Trigger */}
						{isMyProfile && (
							<button
								type='button'
								onClick={() => coverImgRef.current.click()}
								className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} p-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-lg opacity-80 group-hover:opacity-100 transition duration-200`}
								title={t("changeCoverPhoto")}
							>
								<Camera className='w-4 h-4' />
							</button>
						)}

						<input
							type='file'
							hidden
							accept='image/*'
							ref={coverImgRef}
							onChange={(e) => handleImgChange(e, "coverImg")}
						/>
						<input
							type='file'
							hidden
							accept='image/*'
							ref={profileImgRef}
							onChange={(e) => handleImgChange(e, "profileImg")}
						/>

						{/* Profile Avatar */}
						<div className={`absolute -bottom-14 ${isRTL ? "right-5" : "left-5"} group/avatar`}>
							<div className='relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-base-100 ring-4 ring-base-100 shadow-2xl transition-colors duration-200'>
								<img
									src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
									alt={user?.fullName}
									className='w-full h-full rounded-2xl object-cover'
								/>
								{isMyProfile && (
									<button
										type='button'
										onClick={() => profileImgRef.current.click()}
										className='absolute inset-1 rounded-2xl bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition duration-200 backdrop-blur-xs'
										title={t("changeAvatar")}
									>
										<Camera className='w-6 h-6' />
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Action Buttons Row */}
					<div className='flex justify-end items-center gap-2 px-5 pt-3 pb-2 min-h-[52px]'>
						{/* Unsaved Changes Banner */}
						{(coverImg || profileImg) && (
							<button
								className='gradient-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-glow animate-bounce'
								disabled={isUpdatingProfile}
								onClick={async () => {
									await updateProfile({ coverImg, profileImg });
									setProfileImg(null);
									setCoverImg(null);
								}}
							>
								{isUpdatingProfile ? (
									<>
										<LoadingSpinner size='xs' />
										<span>{t("savingChanges")}</span>
									</>
								) : (
									<>
										<Check className='w-3.5 h-3.5' />
										<span>{t("savePhotoChanges")}</span>
									</>
								)}
							</button>
						)}

						{isMyProfile && <EditProfileModal authUser={authUser} />}

						{!isMyProfile && (
							<button
								className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1.5 ${
									amIFollowing
										? "bg-base-200 border border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:border-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10"
										: "gradient-btn"
								}`}
								disabled={isFollowingPending}
								onClick={() => follow(user?._id)}
							>
								{isFollowingPending ? (
									<LoadingSpinner size='xs' />
								) : amIFollowing ? (
									t("following")
								) : (
									t("follow")
								)}
							</button>
						)}
					</div>

					{/* User Profile Details */}
					<div className='px-5 mt-4 flex flex-col gap-4 text-start'>
						<div>
							<h2 className='text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2'>
								{user?.fullName}
							</h2>
							<p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>@{user?.username}</p>
							
							{user?.bio && (
								<p className='text-xs text-slate-700 dark:text-slate-200 mt-2.5 leading-relaxed whitespace-pre-line'>
									{user.bio}
								</p>
							)}
						</div>

						{/* Metadata badges */}
						<div className='flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400'>
							{user?.link && (
								<a
									href={user.link.startsWith("http") ? user.link : `https://${user.link}`}
									target='_blank'
									rel='noreferrer'
									className='flex items-center gap-1.5 text-indigo-500 hover:underline'
								>
									<LinkIcon className='w-3.5 h-3.5' />
									<span className='truncate max-w-xs'>{user.link}</span>
								</a>
							)}

							<div className='flex items-center gap-1.5 text-slate-500 dark:text-slate-400'>
								<Calendar className='w-3.5 h-3.5 text-slate-400' />
								<span>{t("joined")} {memberSinceDate}</span>
							</div>
						</div>

						{/* Follow stats counter cards */}
						<div className='flex gap-3 pt-1'>
							<div className='px-3.5 py-1.5 rounded-xl bg-base-200 dark:bg-surface-100/60 border border-black/5 dark:border-white/[0.05] flex items-center gap-1.5'>
								<span className='font-bold text-sm text-slate-900 dark:text-white'>{user?.following?.length || 0}</span>
								<span className='text-xs text-slate-500 dark:text-slate-400'>{t("followingCount")}</span>
							</div>
							<div className='px-3.5 py-1.5 rounded-xl bg-base-200 dark:bg-surface-100/60 border border-black/5 dark:border-white/[0.05] flex items-center gap-1.5'>
								<span className='font-bold text-sm text-slate-900 dark:text-white'>{user?.followers?.length || 0}</span>
								<span className='text-xs text-slate-500 dark:text-slate-400'>{t("followers")}</span>
							</div>
						</div>
					</div>

					{/* Profile Tabs */}
					<div className='flex border-b border-black/10 dark:border-white/[0.08] mt-6 bg-base-200/50 dark:bg-surface-200/30'>
						<button
							type='button'
							className={`flex-1 py-3.5 text-xs font-bold transition duration-200 relative flex items-center justify-center gap-2 ${
								feedType === "posts" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
							}`}
							onClick={() => setFeedType("posts")}
						>
							<FileText className={`w-3.5 h-3.5 ${feedType === "posts" ? "text-indigo-500" : ""}`} />
							<span>{t("feedPosts")}</span>
							{feedType === "posts" && (
								<span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-glow' />
							)}
						</button>

						<button
							type='button'
							className={`flex-1 py-3.5 text-xs font-bold transition duration-200 relative flex items-center justify-center gap-2 ${
								feedType === "likes" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
							}`}
							onClick={() => setFeedType("likes")}
						>
							<Heart className={`w-3.5 h-3.5 ${feedType === "likes" ? "text-rose-500" : ""}`} />
							<span>{t("feedLikes")}</span>
							{feedType === "likes" && (
								<span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-glow' />
							)}
						</button>
					</div>

					{/* Posts feed list */}
					<Posts feedType={feedType} username={username} userId={user?._id} />
				</div>
			)}
		</div>
	);
};

export default ProfilePage;
