const RightPanelSkeleton = () => {
	return (
		<div className='flex items-center justify-between gap-3 py-2.5 animate-pulse'>
			<div className='flex items-center gap-3 min-w-0'>
				<div className='w-10 h-10 rounded-full bg-slate-800/80 shrink-0' />
				<div className='space-y-1.5 min-w-0'>
					<div className='h-3.5 w-24 bg-slate-800 rounded-md' />
					<div className='h-3 w-16 bg-slate-800/60 rounded-md' />
				</div>
			</div>
			<div className='h-8 w-16 bg-slate-800/80 rounded-xl shrink-0' />
		</div>
	);
};

export default RightPanelSkeleton;
