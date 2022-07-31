require("dotenv").config();

/* Actually non of them is const, this is bc it can be overwritten by the web GUI, they shouldn't be changed after that though;*/

/// 200 is a save guess as it's the limit for the official analytics api
/// the inofficial api has likely a higher limit as instagram won't block normal users so easily
/// feel free to go higher then that. Especially for users >500 followers this shouldn't be a problem
/// It can be set as low as wanted, a minimal limit of 2000ms after every request is enforced automatically
let requests_per_hour = 200;

let username_value = process.env.IG_USERNAME;
let password_value = process.env.IG_PASSWORD;
let username_to_scrape = process.env.IG_USERNAME_TO_SCRAPE;

// TODO: To implement
/// You can scrape either for people who you follow [true],
/// or people who are following you [false].
let you_follow = true;

/// NOT RECOMMENDED AS IT ONLY SHOWS THE FIRST THREE MUTUAL FRIENDS
/// Instagram provides a list of mutual friends when scraping the data about the main profile
/// When using this a amount of O(N) queries is needed but the results may not be as accurate.
/// If set to false it's O(2*N) queries.
/// This option of course doesn't work when you use a alt account for scraping.
let use_edge_mutual_followed_by = false;
let headless = false;

// Normalizing the size of the nodes
let min_node = 10;
let max_node = 100;

// Normalizing the size of the nodes
let min_link_size = 10;
let normal_link_size = 300;
let link_multiplier = 200;
let max_link_size = 4000;

module.exports = {
  username_value,
  password_value,
  headless,
  requests_per_hour,
  username_to_scrape,
  you_follow,
  use_edge_mutual_followed_by,
  min_node,
  max_node,
  link_multiplier,
  max_link_size,
  min_link_size,
  normal_link_size,
};
