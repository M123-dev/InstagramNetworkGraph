const fs = require("fs");
const puppeteer = require("puppeteer");
const appRoot = require("app-root-path");

const constants = require("./constants.js");

let getCookiePath = (username) => `${appRoot}/sessions/${username}.json`;

let getDataPath = (username) => `${appRoot}/data/profile/${username}.json`;

let getAllFollowingPath = (username) =>
	`${appRoot}/data/allFollowing/allFollowing-${username}.json`;

// Store profile
let storePersistantUser = (username, user_obj) => {
	fs.writeFile(getDataPath(username), JSON.stringify(user_obj), function (err) {
		if (err) {
			console.log(`The profile from ${username} could not be written.`, err);
		}
	});
};

let getBrowser = async () => {
	let new_login = true;
	const browser = await puppeteer.launch({
		headless: constants.headless,
		ignoreDefaultArgs: ["--disable-extensions"],
	});
	const page = await browser.newPage();

	const previousSession = fs.existsSync(
		getCookiePath(constants.username_value)
	);
	if (previousSession) {
		// If file exist load the cookies
		const cookiesString = fs.readFileSync(
			getCookiePath(constants.username_value)
		);
		const parsedCookies = JSON.parse(cookiesString);
		if (parsedCookies.length !== 0) {
			for (let cookie of parsedCookies) {
				await page.setCookie(cookie);
			}
			console.log(
				`Session from ${constants.username_value} has been loaded in the browser`
			);
			new_login = false;
		}
	}
	return { browser, page, new_login };
};

let setUserAgent = async (page) => {
	// We need a android user agent as api/v1/users/web_profile_info/?username=username
	// needs additional steps to work when on web
	// Needs to be done after the login to avoid further noticed to download the app instead
	await page.setUserAgent("Instagram 219.0.0.12.117 Android");
	return page;
};

let save_cookies = async (page) => {
	const cookiesObject = await page.cookies();
	// Write cookies to temp file to be used in other profile pages
	fs.writeFile(
		getCookiePath(constants.username_value),
		JSON.stringify(cookiesObject),
		function (err) {
			if (err) {
				console.log("The session file could not be written.", err);
			}
			console.log("Session has been successfully saved");
		}
	);
};

let get_user_info = async (username, page, wait_time) => {
	await page.goto(
		`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`
	);

	await page.waitForTimeout(wait_time);

	// A point for a safe fail
	await page.content();
	let extended_users_obj;
	let cut_extended_user;
	try {
		extended_users_obj = await page.evaluate(() => {
			return JSON.parse(document.querySelector("body").innerText);
		});
		cut_extended_user = extended_users_obj["data"]["user"];

		if (cut_extended_user === null) {
			console.log(
				`It's not possible to scrape ${username}, it's likely a restricted account. Added a temporary object`
			);
			cut_extended_user =
        {
        	username: username,
        	is_private: false,
        	edge_mutual_followed_by: {
        		count: 0,
        		edges: [],
        	},
        	followed_by_viewer: true,
        	profile_pic_url: "http://localhost:3000/favicon.ico",
        	edge_followed_by: {
        		count: 0,
        	},
        	edge_follow: {
        		count: 0,
        	},
        };
		}
	} catch (err) {
		console.log(
			`Error happend while parsing profile, please check https://i.instagram.com/api/v1/users/web_profile_info/?username=${username} to work with headless=false`
		);
	}
	storePersistantUser(username, cut_extended_user);
	return cut_extended_user;
};

let get_user_all_following = async (
	id,
	username,
	page,
	following_count,
	wait_time
) => {
	await page.goto(
		`https://i.instagram.com/api/v1/friendships/${id}/following/?count=${following_count}`
	);

	await page.waitForTimeout(wait_time);

	let all_following_obj;

	try {
		all_following_obj = await page.evaluate(() => {
			return JSON.parse(document.querySelector("body").innerText);
		});
	} catch (err) {
		console.log(
			"Error happend while parsing root profile, please check https://i.instagram.com/api/v1/users/web_profile_info/?username=<yourUsername> to work with constants.headless=false"
		);
	}

	fs.writeFile(
		getAllFollowingPath(username),
		JSON.stringify(all_following_obj),
		function (err) {
			if (err) {
				console.log(
					`The all following file from ${username} could not be written.`,
					err
				);
			}
		}
	);
};

module.exports = {
	getCookiePath,
	getDataPath,
	storePersistantUser,
	getBrowser,
	save_cookies,
	setUserAgent,
	getAllFollowingPath,
	get_user_info,
	get_user_all_following,
};
