const PostSkeleton = () => {
	return (
		<div className='p-4 border-b border-white/[0.06] bg-surface-200/40 backdrop-blur-sm animate-pulse'>
			<div className='flex items-start gap-3.5'>
				{/* Avatar skeleton */}
				<div className='w-11 h-11 rounded-full bg-slate-800/80 shrink-0 ring-2 ring-white/5' />
				
				<div className='flex-1 space-y-3 pt-1'>
					{/* Header skeleton */}
					<div className='flex items-center gap-2'>
						<div className='h-4 w-28 bg-slate-800 rounded-md' />
						<div className='h-3.5 w-20 bg-slate-800/60 rounded-md' />
						<div className='h-3.5 w-12 bg-slate-800/40 rounded-md ml-auto' />
					</div>
					
					{/* Content lines */}
					<div className='space-y-2'>
						<div className='h-3.5 w-11/12 bg-slate-800/70 rounded-md' />
						<div className='h-3.5 w-4/5 bg-slate-800/60 rounded-md' />
					</div>

					{/* Image banner placeholder */}
					<div className='h-48 w-full bg-slate-800/40 rounded-2xl border border-white/5' />

					{/* Actions bar */}
					<div className='flex justify-between items-center pt-2 max-w-md'>
						<div className='h-4 w-12 bg-slate-800/50 rounded-full' />
						<div className='h-4 w-12 bg-slate-800/50 rounded-full' />
						<div className='h-4 w-12 bg-slate-800/50 rounded-full' />
						<div className='h-4 w-6 bg-slate-800/50 rounded-full' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default PostSkeleton;
