require('dotenv').config();
/// 200 is a save guess as it's the limit for the official analytics api
/// the inofficial api has likely a higher limit as instagram won't block normal users so easily
/// feel free to go higher then that. Especially for users >500 followers this shouldn't be a problem
/// It can be set as low as wanted, a minimal limit of 2000ms after every request is enforced automatically
const requests_per_hour = 1000;

const username_value = process.env.USERNAME;
const password_value = process.env.PASSWORD;
const username_to_scrape = process.env.USERNAME_TO_SCRAPE;

// TODO: To implement
/// You can scrape either for people who you follow [true],
/// or people who are following you [false].
const you_follow = true; 

/// Instagram provides a list of mutual friends when scraping the data about the main profile
/// When using this a amount of O(N) queries is needed but the results may not be as accurate. 
/// If set to false it's O(2*N) queries. 
/// This option of course doesn't work when you use a alt account for scraping.
const use_edge_mutual_followed_by = true;
const headless = false;

// Normalizing the size of the nodes
const min_node = 10;
const max_node = 100;

module.exports ={
    username_value, password_value, headless, requests_per_hour, username_to_scrape, you_follow, use_edge_mutual_followed_by, min_node, max_node,
}