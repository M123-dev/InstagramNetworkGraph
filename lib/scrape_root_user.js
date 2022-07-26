const helper = require("./helpers.js");
const constants = require("./constants.js");
const fs = require("fs");

async function scrape_root_user() {
	try {
		let { browser, page, new_login } = await helper.getBrowser();

		// Only login if the credentials weren't used before
		if (new_login) {
			await page.goto("https://instagram.com");

			await page.waitForTimeout(5000);

			// Allow needed cookies
			const form = await page.$("button.aOOlW");
			await form.evaluate((form) => form.click());

			await page.waitForTimeout(1000);

			// Enter credentials
			await page.focus(
				"#loginForm > div > div:nth-child(1) > div > label > input"
			);
			await page.keyboard.type(constants.username_value);

			await page.focus(
				"#loginForm > div > div:nth-child(2) > div > label > input"
			);
			await page.keyboard.type(constants.password_value);

			const loginButton = await page.$(
				"#loginForm > div > div:nth-child(3) > button > div"
			);
			await loginButton.evaluate((a) => a.click());

			await page.waitForNavigation();

			if (constants.two_fa) {
				await page.waitForNavigation({ timeout: 60000 });
			}
		} else {
			await page.goto("https://www.instagram.com/");
			// Warn wait for network idle doesn't work here, due to timeout
			await page.waitForTimeout(5000);
		}

		// Save Session Cookies
		// Every time not just for new logins as the cookies might change due to refreshes of the session
		await helper.save_cookies(page);
		page = await helper.setUserAgent(page);

		const user = await helper.get_user_info(
			constants.username_to_scrape,
			page,
			2000
		);
		console.log("Saved root profile info");

		let following_count = user["edge_follow"]["count"];

		await helper.get_user_all_following(
			user["id"],
			constants.username_to_scrape,
			page,
			following_count,
			2000
		);
		console.log("Saved root all following ✅");

		await browser.close();
	} catch (e) {
		console.log("Failed");
		console.log(e);

		if (fs.existsSync(helper.getCookiePath(constants.username_value))) {
			console.log("Removing failed session");
			fs.unlinkSync(helper.getCookiePath(constants.username_value));
		}
	}
}

module.exports = {
	scrape_root_user,
};
