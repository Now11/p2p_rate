import { test } from 'playwright/test';

const nbuExchangeURL = `https://bank.gov.ua/ua/markets/exchangerates?date=${getNextWorkday()}&period=daily`;

const binanceRate = 'https://p2p.binance.com/trade/PrivatBank/USDT?fiat=UAH';

async function sendTelegramMessage(message) {
	const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${
		process.env.CHAT_ID
	}&text=${encodeURIComponent(message)}`;

	await fetch(url, { method: 'POST' });
}

test('Exhange Rate', async ({ page }) => {
	await page.goto(nbuExchangeURL, { timeout: 30_000, waitUntil: 'networkidle' });

	const uahToUsdNBU = Number(
		(
			await page
				.locator('#exchangeRates tbody tr')
				.filter({ has: page.locator('.hidden-sm', { hasText: '840' }) })
				.locator('td')
				.nth(4)
				.textContent()
		).replace(',', '.'),
	).toFixed(2);

	await page.goto(binanceRate, { timeout: 30_000, waitUntil: 'domcontentloaded' });
	const uahToUsdBinance = Number(
		await page.locator('tbody tr td').nth(1).locator('[class*=text-primaryText]').textContent(),
	);

	const diff = (uahToUsdNBU / uahToUsdBinance) * 100 - 100;
	await sendTelegramMessage(
		`На Дату: ${getNextWorkday()}\n\nНБУ                      ${uahToUsdNBU}\nБинанс                ${uahToUsdBinance}\nРазница (%)      ${diff.toFixed(
			2,
		)}%\nРазница              ${(uahToUsdBinance - uahToUsdNBU).toFixed(2)}`,
	);
});

function getNextWorkday() {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

	if (isWeekend) {
		today.setDate(today.getDate() + (dayOfWeek === 0 ? 1 : 2));
	}

	return `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1)
		.toString()
		.padStart(2, '0')}.${today.getFullYear()}`;
}
