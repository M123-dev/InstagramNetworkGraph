const puppeteer = require("puppeteer");
const fs = require("fs");
const helper = require("./helpers.js");
const constants = require("./constants.js");

async function scrape_all_users() {
  console.log("START!");
  let { browser, page, new_login } = await helper.getBrowser();

  if (new_login) {
    throw "Please login first";
  }

  await page.goto("https://www.instagram.com/");
  // Warn wait for netork idle doesn't work here, due to timeout
  await page.waitForTimeout(5000);

  // Save Session Cookies
  // Everytime not just for new logins as the cookies meight change due to refreshes of the session
  await helper.save_cookies(page);
  page = await helper.setUserAgent(page);

  if (
    !fs.existsSync(helper.getAllFollowingPath(constants.username_to_scrape))
  ) {
    throw "No allFollowing file found, please run scrape_root_user.js before";
  }

  const all_following_obj = JSON.parse(
    fs.readFileSync(helper.getAllFollowingPath(constants.username_to_scrape))
  );

  if (all_following_obj["message"] === "login_required") {
    throw "Login required";
  }

  const list = all_following_obj["users"];
  const length = list.length;

  const ms_per_houer = 3600000;
  let wait_time = ms_per_houer / constants.requests_per_hour;

  if (wait_time < 2000) {
    wait_time = 2000;
  }

  for (let i = 0; i < length; i++) {
    let small_user_obj = list[i];
    let username = small_user_obj["username"];
    let user_info_obj;

    if (fs.existsSync(helper.getDataPath(username))) {
      console.log(
        `(${i}/${length - 1}) Already scraped profile from ${username}`
      );
      // If we already scraped the user we load it's persistant data to be able to query all_following
      user_info_obj = await JSON.parse(
        fs.readFileSync(helper.getDataPath(username))
      );
    } else {
      user_info_obj = await helper.get_user_info(username, page, wait_time);
      console.log(
        `(${i}/${length - 1}) Finished scraping info from ${username}`
      );
    }

    if (constants.use_edge_mutual_followed_by) {
      continue;
    }

    if (
      user_info_obj["is_private"] == true &&
      user_info_obj["followed_by_viewer"] == false
    ) {
      console.log(
        `(${i}/${length - 1}) User: ${
          user_info_obj["username"]
        } is private skipping it's all following file, consider using [lib/remove_private_accounts.js] to remove all private accounts, then you can rescrape them with your main account. \n(${i}/${
          length - 1
        }) ALERT: Removing without rescraping breaks the diagramm`
      );

      fs.writeFile(
        getAllFollowingPath(username),
        JSON.stringify({
          users: [],
        }),
        function (err) {
          if (err) {
            console.log(
              `The all following file from ${username} could not be written.`,
              err
            );
          }
        }
      );

      continue;
    }

    if (fs.existsSync(helper.getAllFollowingPath(username))) {
      console.log(
        `(${i}/${length - 1}) Already scraped extended profile from ${username}`
      );
      continue;
    }

    let id = user_info_obj["id"];
    let following_count = user_info_obj["edge_follow"]["count"];

    await helper.get_user_all_following(
      id,
      username,
      page,
      following_count,
      wait_time
    );
    console.log(
      `(${i}/${length - 1}) Finished extended scraping from ${username}`
    );
  }
  console.log("Finished scraping ✅");
  browser.close();
}

module.exports = {
  scrape_all_users,
};
