import { useEffect, useState } from "react";
import { User, AtSign, Mail, Link as LinkIcon, Lock, Key, Save, Edit3 } from "lucide-react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useLanguage } from "../../context/LanguageContext";

const EditProfileModal = ({ authUser }) => {
	const { t, isRTL } = useLanguage();
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "",
				username: authUser.username || "",
				email: authUser.email || "",
				bio: authUser.bio || "",
				link: authUser.link || "",
				newPassword: "",
				currentPassword: "",
			});
		}
	}, [authUser]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		await updateProfile(formData);
		const modal = document.getElementById("edit_profile_modal");
		if (modal) modal.close();
	};

	return (
		<>
			<button
				className='px-4 py-2 rounded-xl text-xs font-bold bg-base-200 dark:bg-surface-100/90 border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				<Edit3 className='w-3.5 h-3.5 text-indigo-500' />
				<span>{t("editProfile")}</span>
			</button>

			<dialog id='edit_profile_modal' className='modal modal-bottom sm:modal-middle'>
				<div className='modal-box bg-base-100 dark:bg-[#111622] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-2xl max-w-lg transition-colors duration-200'>
					
					{/* Modal Header */}
					<div className='flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10'>
						<div className='text-start'>
							<h3 className='font-bold text-base text-slate-900 dark:text-white leading-tight'>{t("updateProfileTitle")}</h3>
							<p className='text-xs text-slate-500 dark:text-slate-400'>{t("updateProfileSubtitle")}</p>
						</div>
						<form method='dialog'>
							<button className='btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-900 dark:hover:text-white'>✕</button>
						</form>
					</div>

					{/* Form */}
					<form className='flex flex-col gap-4 mt-4 text-start' onSubmit={handleSubmit}>
						
						{/* Basic Info */}
						<div className='space-y-3'>
							<p className='text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400'>
								{t("profileInfoSection")}
							</p>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<div>
									<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
										{t("fullName")}
									</label>
									<div className='relative flex items-center'>
										<User className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3" : "left-3"}`} />
										<input
											type='text'
											placeholder={t("fullNamePlaceholder")}
											className={`w-full glass-input rounded-xl py-2 text-xs text-start ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
											value={formData.fullName}
											name='fullName'
											onChange={handleInputChange}
										/>
									</div>
								</div>

								<div>
									<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
										{t("username")}
									</label>
									<div className='relative flex items-center'>
										<AtSign className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3" : "left-3"}`} />
										<input
											type='text'
											placeholder={t("usernamePlaceholder")}
											className={`w-full glass-input rounded-xl py-2 text-xs text-start ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
											value={formData.username}
											name='username'
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>

							<div>
								<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
									{t("emailAddress")}
								</label>
								<div className='relative flex items-center'>
									<Mail className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3" : "left-3"}`} />
									<input
										type='email'
										placeholder={t("emailPlaceholder")}
										className={`w-full glass-input rounded-xl py-2 text-xs text-start ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
										value={formData.email}
										name='email'
										onChange={handleInputChange}
									/>
								</div>
							</div>

							<div>
								<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
									{t("bio")}
								</label>
								<div className='relative'>
									<textarea
										placeholder={t("bioPlaceholder")}
										className='w-full glass-input rounded-xl p-3 text-xs resize-none text-start'
										rows={2}
										value={formData.bio}
										name='bio'
										onChange={handleInputChange}
									/>
								</div>
							</div>

							<div>
								<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
									{t("websiteLink")}
								</label>
								<div className='relative flex items-center'>
									<LinkIcon className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3" : "left-3"}`} />
									<input
										type='text'
										placeholder={t("websitePlaceholder")}
										className={`w-full glass-input rounded-xl py-2 text-xs text-start ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
										value={formData.link}
										name='link'
										onChange={handleInputChange}
									/>
								</div>
							</div>
						</div>

						{/* Security */}
						<div className='space-y-3 pt-2 border-t border-black/10 dark:border-white/[0.08]'>
							<p className='text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400'>
								{t("securitySection")}
							</p>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<div>
									<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
										{t("currentPassword")}
									</label>
									<div className='relative flex items-center'>
										<Lock className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3" : "left-3"}`} />
										<input
											type='password'
											placeholder={t("passwordPlaceholder")}
											className={`w-full glass-input rounded-xl py-2 text-xs text-start ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
											value={formData.currentPassword}
											name='currentPassword'
											onChange={handleInputChange}
										/>
									</div>
								</div>

								<div>
									<label className='text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block'>
										{t("newPassword")}
									</label>
									<div className='relative flex items-center'>
										<Key className={`w-4 h-4 text-slate-400 absolute ${isRTL ? "right-3" : "left-3"}`} />
										<input
											type='password'
											placeholder={t("passwordPlaceholder")}
											className={`w-full glass-input rounded-xl py-2 text-xs text-start ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
											value={formData.newPassword}
											name='newPassword'
											onChange={handleInputChange}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className='flex justify-end gap-2 pt-4 border-t border-black/10 dark:border-white/10'>
							<form method='dialog'>
								<button
									type='button'
									onClick={() => document.getElementById("edit_profile_modal").close()}
									className='px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] transition'
								>
									{t("cancel")}
								</button>
							</form>
							<button
								type='submit'
								disabled={isUpdatingProfile}
								className='gradient-btn px-5 py-2 rounded-xl text-xs flex items-center gap-1.5'
							>
								{isUpdatingProfile ? (
									<>
										<LoadingSpinner size='xs' />
										<span>{t("savingChanges")}</span>
									</>
								) : (
									<>
										<Save className='w-3.5 h-3.5' />
										<span>{t("saveChanges")}</span>
									</>
								)}
							</button>
						</div>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop bg-black/60 backdrop-blur-sm'>
					<button className='cursor-default'>{t("cancel")}</button>
				</form>
			</dialog>
		</>
	);
};

export default EditProfileModal;
