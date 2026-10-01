const ProfileHeaderSkeleton = () => {
	return (
		<div className='w-full animate-pulse'>
			{/* Top nav skeleton */}
			<div className='flex items-center gap-6 px-4 py-3 border-b border-white/[0.06] bg-surface-200/50'>
				<div className='w-9 h-9 rounded-full bg-slate-800' />
				<div className='space-y-1.5'>
					<div className='h-4 w-32 bg-slate-800 rounded-md' />
					<div className='h-3 w-16 bg-slate-800/60 rounded-md' />
				</div>
			</div>

			{/* Cover banner skeleton */}
			<div className='h-48 sm:h-60 w-full bg-gradient-to-r from-slate-800/60 via-slate-800/80 to-slate-800/40 relative'>
				{/* Avatar skeleton */}
				<div className='absolute -bottom-14 left-5 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 p-1.5 ring-4 ring-[#0b0f19]'>
					<div className='w-full h-full rounded-2xl bg-slate-800' />
				</div>
			</div>

			{/* Action button skeleton */}
			<div className='flex justify-end px-5 pt-4 pb-2'>
				<div className='h-10 w-28 bg-slate-800/80 rounded-xl' />
			</div>

			{/* Info section skeleton */}
			<div className='px-5 mt-6 space-y-4'>
				<div className='space-y-2'>
					<div className='h-5 w-40 bg-slate-800 rounded-md' />
					<div className='h-3.5 w-24 bg-slate-800/60 rounded-md' />
					<div className='h-3.5 w-3/4 bg-slate-800/70 rounded-md pt-1' />
				</div>

				<div className='flex gap-4 pt-1'>
					<div className='h-4 w-24 bg-slate-800/50 rounded-md' />
					<div className='h-4 w-32 bg-slate-800/50 rounded-md' />
				</div>

				<div className='flex gap-5 pt-2'>
					<div className='h-4 w-20 bg-slate-800/70 rounded-md' />
					<div className='h-4 w-20 bg-slate-800/70 rounded-md' />
				</div>
			</div>

			{/* Tabs skeleton */}
			<div className='flex border-b border-white/[0.06] mt-6 bg-surface-200/30'>
				<div className='flex-1 py-3.5 flex justify-center'>
					<div className='h-4 w-16 bg-slate-800 rounded-md' />
				</div>
				<div className='flex-1 py-3.5 flex justify-center'>
					<div className='h-4 w-16 bg-slate-800/60 rounded-md' />
				</div>
			</div>
		</div>
	);
};

export default ProfileHeaderSkeleton;
