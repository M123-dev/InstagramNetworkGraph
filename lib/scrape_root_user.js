const puppeteer = require("puppeteer");
const fs = require("fs");
const helper = require("./helpers.js");
const constants = require("./constants.js");




async function scrape_root_user(){


	let {browser, page, new_login} = await helper.getBrowser();
  

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

		// Warn wait for netork idle doesn't work here, due to timeout
		await page.waitForNavigation();
	} else {
		await page.goto("https://www.instagram.com/");
		// Warn wait for netork idle doesn't work here, due to timeout
		await page.waitForTimeout(5000);
	}

	// Save Session Cookies
	// Everytime not just for new logins as the cookies meight change due to refreshes of the session
	await helper.save_cookies(page);
	page = await helper.setUserAgent(page);

	const user = await helper.get_user_info(constants.username_to_scrape, page, 2000);
	console.log("Saved root profile info");

	let following_count = user["edge_follow"]["count"];

	await helper.get_user_all_following(user["id"], constants.username_to_scrape, page, following_count, 2000);
	console.log("Saved root all following ✅");

	await browser.close();

}

module.exports ={
	scrape_root_user,
};