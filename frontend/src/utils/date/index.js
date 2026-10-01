export const formatPostDate = (createdAt, language = "en") => {
	const isArabic = language === "ar" || (typeof window !== "undefined" && localStorage.getItem("falla_lang") === "ar");
	const currentDate = new Date();
	const createdAtDate = new Date(createdAt);

	const timeDifferenceInSeconds = Math.floor((currentDate - createdAtDate) / 1000);
	const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
	const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
	const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

	if (timeDifferenceInDays > 1) {
		return createdAtDate.toLocaleDateString(isArabic ? "ar-EG" : "en-US", { month: "short", day: "numeric" });
	} else if (timeDifferenceInDays === 1) {
		return isArabic ? "منذ يوم" : "1d";
	} else if (timeDifferenceInHours >= 1) {
		return isArabic ? `منذ ${timeDifferenceInHours} س` : `${timeDifferenceInHours}h`;
	} else if (timeDifferenceInMinutes >= 1) {
		return isArabic ? `منذ ${timeDifferenceInMinutes} د` : `${timeDifferenceInMinutes}m`;
	} else {
		return isArabic ? "الآن" : "Just now";
	}
};

export const formatMemberSinceDate = (createdAt, language = "en") => {
	if (!createdAt) return "";
	const isArabic = language === "ar" || (typeof window !== "undefined" && localStorage.getItem("falla_lang") === "ar");
	const date = new Date(createdAt);
	
	if (isArabic) {
		const arabicMonths = [
			"يناير",
			"فبراير",
			"مارس",
			"أبريل",
			"مايو",
			"يونيو",
			"يوليو",
			"أغسطس",
			"سبتمبر",
			"أكتوبر",
			"نوفمبر",
			"ديسمبر",
		];
		const month = arabicMonths[date.getMonth()];
		const year = date.getFullYear();
		return `${month} ${year}`;
	}

	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const month = months[date.getMonth()];
	const year = date.getFullYear();
	return `${month} ${year}`;
};
