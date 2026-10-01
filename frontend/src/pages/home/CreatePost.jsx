import { Image, Smile, X, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useLanguage } from "../../context/LanguageContext";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const imgRef = useRef(null);
	const { t, isRTL } = useLanguage();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img }) => {
			try {
				const res = await fetch("/api/posts/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text, img }),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},

		onSuccess: () => {
			setText("");
			setImg(null);
			if (imgRef.current) imgRef.current.value = null;
			toast.success(t("postSuccessToast"));
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!text.trim() && !img) {
			toast.error(t("postEmptyToast"));
			return;
		}
		createPost({ text, img });
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const quickEmojis = ["✨", "🔥", "🚀", "💡", "❤️", "🎉", "👀", "🙌"];

	const handleAddEmoji = (emoji) => {
		setText((prev) => prev + emoji);
	};

	return (
		<div className='p-4 border-b border-black/10 dark:border-white/[0.08] bg-base-100/70 dark:bg-surface-200/40 backdrop-blur-md transition-colors duration-200'>
			<div className='flex gap-3.5 items-start'>
				{/* User Avatar */}
				<div className='relative shrink-0'>
					<img
						src={authUser?.profileImg || "/avatar-placeholder.png"}
						alt={authUser?.username}
						className='w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/30'
					/>
					<span className={`absolute -bottom-0.5 ${isRTL ? "-left-0.5" : "-right-0.5"} w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100`} />
				</div>

				{/* Post Form */}
				<form className='flex flex-col gap-3 w-full' onSubmit={handleSubmit}>
					<div className='relative'>
						<textarea
							className='w-full p-2 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base resize-none border-none focus:outline-none min-h-[75px] text-start'
							placeholder={t("createPostPlaceholder")}
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows={3}
						/>
					</div>

					{/* Image Preview if selected */}
					{img && (
						<div className='relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-h-80 w-full group bg-black/5 dark:bg-black/40'>
							<button
								type='button'
								className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md transition-all duration-200 shadow-lg z-10`}
								onClick={() => {
									setImg(null);
									if (imgRef.current) imgRef.current.value = null;
								}}
							>
								<X className='w-4 h-4' />
							</button>
							<img src={img} className='w-full h-auto max-h-80 object-contain rounded-2xl' alt='Upload preview' />
						</div>
					)}

					{/* Emoji row if opened */}
					{showEmojiPicker && (
						<div className='flex items-center gap-1.5 p-2 rounded-xl bg-base-200 dark:bg-surface-100/90 border border-black/5 dark:border-white/10'>
							<span className='text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1'>
								<Sparkles className='w-3 h-3 text-indigo-400' /> {t("quickEmoji")}
							</span>
							{quickEmojis.map((emoji) => (
								<button
									key={emoji}
									type='button'
									onClick={() => handleAddEmoji(emoji)}
									className='p-1 text-base hover:scale-125 transition-transform duration-150'
								>
									{emoji}
								</button>
							))}
						</div>
					)}

					{/* Action Buttons Toolbar */}
					<div className='flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/[0.06]'>
						<div className='flex items-center gap-1.5'>
							<button
								type='button'
								onClick={() => imgRef.current.click()}
								className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition duration-200 text-xs font-semibold'
							>
								<Image className='w-4 h-4 text-indigo-500 dark:text-indigo-400' />
								<span className='hidden sm:inline'>{t("image")}</span>
							</button>

							<button
								type='button'
								onClick={() => setShowEmojiPicker(!showEmojiPicker)}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition duration-200 text-xs font-semibold ${
									showEmojiPicker
										? "text-purple-600 dark:text-purple-300 bg-purple-500/20"
										: "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10"
								}`}
							>
								<Smile className='w-4 h-4 text-purple-500 dark:text-purple-400' />
								<span className='hidden sm:inline'>{t("emoji")}</span>
							</button>

							<input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} />
						</div>

						<div className='flex items-center gap-3'>
							{text.length > 0 && (
								<span className='text-[11px] font-mono text-slate-400 dark:text-slate-500'>
									{text.length} {t("charsCount")}
								</span>
							)}

							<button
								type='submit'
								disabled={isPending || (!text.trim() && !img)}
								className='gradient-btn px-5 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
							>
								{isPending ? (
									<>
										<LoadingSpinner size='xs' />
										<span>{t("postingButton")}</span>
									</>
								) : (
									<>
										<Send className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
										<span>{t("postButton")}</span>
									</>
								)}
							</button>
						</div>
					</div>

					{isError && (
						<div className='p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs'>
							{error.message}
						</div>
					)}
				</form>
			</div>
		</div>
	);
};

export default CreatePost;
