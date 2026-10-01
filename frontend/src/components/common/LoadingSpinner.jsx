import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
	const sizeMap = {
		xs: "w-3.5 h-3.5 border-2",
		sm: "w-4 h-4 border-2",
		md: "w-6 h-6 border-[2.5px]",
		lg: "w-10 h-10 border-3",
		xl: "w-14 h-14 border-4",
	};

	const sizeClasses = sizeMap[size] || sizeMap.md;

	return (
		<div className={`relative inline-flex items-center justify-center ${className}`}>
			<div
				className={`${sizeClasses} rounded-full border-slate-700/40 border-t-indigo-500 border-r-purple-500 animate-spin`}
			/>
		</div>
	);
};

export default LoadingSpinner;
