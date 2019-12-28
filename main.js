let dateDiff = 0, nowDate, updateFreq = 500, isCompact = true;
const formatDate = date => {
	'use strict';
	const y = date.getFullYear();
	const m = date.getMonth() + 1;
	const d = date.getDate();
	const h = date.getHours();
	const min = date.getMinutes();
	const sec = date.getSeconds();
	return `${y}年${m}月${d}日 ${h}時${String(min).padStart(2, '0')}分${String(sec).padStart(2, '0')}秒`;
};
// 1年何日か
const getDaysLeapYear = year => {
	if (year < 4) return 365;
	return year%4 === 0 && year%100 !== 0 || year%400 === 0 ? 366 : 365;
};
// 1世紀何日か
const getDaysCentury = century => {
	const startDate = new Date((century - 1) * 100 + 1, 1, 1);
	const endDate = new Date(century * 100 + 1, 1, 1);
	const ds = endDate - startDate;
	return ds / 1000 / 60 / 60 / 24;
};
// 時間合わせ
const getDateOffset = () => {
	'use strict';
	const localDate = Date.now();
	$.ajax({
		type: 'GET',
		url: `https://ntp-a1.nict.go.jp/cgi-bin/json?${localDate / 1000}`,
		dataType: 'json'
	})
		.done(function(res) {
			dateDiff = res.st * 1000 + (localDate - res.it * 1000) / 2 - localDate;
		});
};
const setValue = (id, val) => {
	$(`#${id}`).attr('aria-valuenow', val * 100);
	$(`#${id}`).css('width', `${val * 100}%`);
	if (isCompact) {
		$(`#${id}`).text(`${(val * 100).toFixed(2)} %`);
	} else {
		$(`#${id}`).text(`${val * 100} %`);
	}
};
// ループ
const clock = () => {
	'use strict';
	nowDate = new Date(Date.now() + dateDiff);

	if (dateDiff !== undefined) {
		$('#now-clock-text').html(formatDate(nowDate));
	}
	
	const ms = nowDate.getMilliseconds() / 1000;
	const min = (nowDate.getSeconds() + ms) / 60;
	const hour = (nowDate.getMinutes() + min) / 60;
	const day = (nowDate.getHours() + hour) / 24;
	const week = (nowDate.getDay() + day) / 7;
	const month = (nowDate.getDate() - 1 + day) / new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getDate();

	let yearDay = 0;
	for (let i = 0; i < nowDate.getMonth(); i++) {
		yearDay += new Date(nowDate.getFullYear(), i + 1, 0).getDate();
	}
	const year = (yearDay + nowDate.getDate() - 1 + day) / getDaysLeapYear(nowDate.getFullYear());
	
	const startDate = new Date((Math.floor((nowDate.getFullYear() + 99) / 100) - 1) * 100 + 1, 1, 1);
	const ds = nowDate.getTime() - startDate;
	const centDays = ds / 1000 / 60 / 60 / 24;
	const century = centDays / getDaysCentury(Math.floor((nowDate.getFullYear() + 99) / 100));

	setValue('minute', min);
	setValue('hour', hour);
	setValue('day', day);
	setValue('week', week);
	setValue('month', month);
	setValue('year', year);
	setValue('century', century);

	setTimeout(clock, updateFreq);
};

(() => {
	'use strict';
	getDateOffset();
	setInterval(getDateOffset, 1000 * 60);
})();
$(() => {
	'use strict';
	clock();
});

$('#ok-btn').on('click', function () {
	updateFreq = $('#update-freq').val();
});

$('#dark-switch').on('change', function () {
	$('body').toggleClass('bg-dark');
	$('h1, h3, p, .col-md-1').toggleClass('text-light');
	$('.progress').toggleClass('bg-secondary');
});

$('#compact-switch').on('change', function () {
	isCompact = !isCompact;
});
