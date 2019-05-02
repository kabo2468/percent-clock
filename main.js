let dateDiff, updateOffset, nowDate, updateFreq = 500;
function formatDate(date) {
	'use strict';
	const y = date.getFullYear();
	const m = date.getMonth() + 1;
	const d = date.getDate();
	const h = date.getHours();
	const min = date.getMinutes();
	const sec = date.getSeconds();
	return `${y}年${m}月${d}日 ${h}時${String(min).padStart(2, '0')}分${String(sec).padStart(2, '0')}秒`;
}
// 1年何日か
function getDaysLeapYear(year) {
    if (year < 4) return 365;
    return year%4 === 0 && year%100 !== 0 || year%400 === 0 ? 366 : 365;
}
// 1世紀何日か
function getDaysCentury(century) {
    const startDate = new Date((century - 1) * 100 + 1, 1, 1);
    const endDate = new Date(century * 100 + 1, 1, 1);
    const ds = endDate - startDate;
    return ds / 1000 / 60 / 60 / 24;
}
// 時間合わせ
function getDateOffset() {
	'use strict';
	const localDate = Date.now();
	$.ajax({
		type: 'GET',
		url: `https://ntp-a1.nict.go.jp/cgi-bin/json?${localDate / 1000}`,
		dataType: 'json'
	})
		.done(function(res) {
			dateDiff = res.st * 1000 + (localDate - res.it * 1000) / 2 - localDate;
		})
		.fail(function() {
			dateDiff = 0;
		});
	updateOffset = true;
}
// ループ
function clock() {
	'use strict';
	nowDate = new Date(Date.now() + dateDiff);

	if (dateDiff !== undefined) {
		$('#now-clock-text').html(formatDate(nowDate));
	}

	if (nowDate.getSeconds() === 30) {
		if (updateOffset === false) {
			getDateOffset();
		}
	} else {
		updateOffset = false;
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

    $('#minute').attr('aria-valuenow', min * 100);
    $('#minute').css('width', `${min * 100}%`);
    $('#minute').text(`${(min * 100).toFixed(2)} %`);
    $('#hour').attr('aria-valuenow', hour * 100);
    $('#hour').css('width', `${hour * 100}%`);
    $('#hour').text(`${(hour * 100).toFixed(2)} %`);
    $('#day').attr('aria-valuenow', day * 100);
    $('#day').css('width', `${day * 100}%`);
    $('#day').text(`${(day * 100).toFixed(2)} %`);
    $('#week').attr('aria-valuenow', week * 100);
    $('#week').css('width', `${week * 100}%`);
    $('#week').text(`${(week * 100).toFixed(2)} %`);
    $('#month').attr('aria-valuenow', month * 100);
    $('#month').css('width', `${month * 100}%`);
    $('#month').text(`${(month * 100).toFixed(2)} %`);
    $('#year').attr('aria-valuenow', year * 100);
    $('#year').css('width', `${year * 100}%`);
    $('#year').text(`${(year * 100).toFixed(2)} %`);
    $('#century').attr('aria-valuenow', century * 100);
    $('#century').css('width', `${century * 100}%`);
    $('#century').text(`${(century * 100).toFixed(2)} %`);

	setTimeout(clock, updateFreq);
}

(() => {
    'use strict';
	getDateOffset();
})();
$(() => {
    'use strict';
    clock();
});

$('#ok-btn').on('click', function () {
    updateFreq = $('#update-freq').val();
});
