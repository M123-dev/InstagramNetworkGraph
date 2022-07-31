const fs = require("fs");
const appRoot = require("app-root-path");

const helper = require("./helpers.js");
const constants = require("./constants.js");

let nodes = [];
let links = [];
let following_amount = [];
let all_following_cache = new Map();
let profile_info_cache = new Map();

async function parse_info_to_graph_json() {
  fs.writeFile(
    `${appRoot}/d3-page/config.json`,
    JSON.stringify({
      username: constants.username_to_scrape,
      attraceForce: constants.attraceForce,
      link_strength: constants.link_strength,
    }),
    function (err) {
      if (err) {
        console.log(`Error writing root user file.`, err);
      }
    }
  );

  const root_all_following_list = get_all_following_cache(
    constants.username_to_scrape
  );

  const root_profile_info = get_profile_info_cache(
    constants.username_to_scrape
  );
  const root_profile_pic_url = root_profile_info["profile_pic_url"];

  if (!nodes.some((el) => el.id === constants.username_to_scrape)) {
    nodes.push({
      id: constants.username_to_scrape,
      profile_pic_url: root_profile_pic_url,
      // Is overwritten anyways
      size: "is_root",
    });
  }

  if (constants.use_edge_mutual_followed_by) {
    console.log("WARN: Use edge mutual followed by. Its way less accurate");
  } else {
    console.log("Handle all following");
  }

  // For every user the root user is following
  for (let i = 0; i < root_all_following_list.length; i++) {
    const x_profile_info = get_profile_info_cache(
      root_all_following_list[i]["username"]
    );
    following_amount.push(x_profile_info["edge_follow"]["count"]);
    handle_people_root_is_following(x_profile_info);

    if (constants.use_edge_mutual_followed_by) {
      console.log("USE EDGE MUTUAL FOLLOWED BY");
      handle_mutual_friends(x_profile_info);
    } else {
      handle_all_following(
        root_all_following_list[i]["username"],
        root_all_following_list
      );
    }
  }

  normalize_node_size();

  if (!constants.use_edge_mutual_followed_by) {
    invert_link_length();
  }

  console.log(`Writing data set to: "${appRoot}/d3-page/data.json"`);
  fs.writeFile(
    `${appRoot}/d3-page/data.json`,
    JSON.stringify({
      nodes: nodes,
      links: links,
    }),
    function (err) {
      if (err) {
        console.log(`Error writing master object for data visualization.`, err);
      }
    }
  );
  console.log(`Created data set with ${nodes.length} nodes and ${links.length} links ✅`);
}

function push_link(a, b, length_param) {
  if (
    links.some(
      (e) =>
        (e.source == a && e.target == b) || (e.source == b && e.target == a)
    )
  ) {
    return;
  }

  let length;

  if (length_param !== undefined) {
    length = length_param;
  } else if (!constants.use_edge_mutual_followed_by) {
    length = calculate_mutual_amount(a, b);
  }

  links.push({
    source: a,
    target: b,
    mutual_amount: length,
  });
}

function handle_people_root_is_following(x_profile_info) {
  const profile_pic_url = x_profile_info["profile_pic_url"];
  const username = x_profile_info["username"];

  let size = constants.min_node;
  if (!constants.use_edge_mutual_followed_by) {
    size = calculate_mutual_amount(constants.username_to_scrape, username);
  }

  if (!nodes.some((el) => el.id === username)) {
    nodes.push({
      id: username,
      profile_pic_url: profile_pic_url,
      size: size,
    });
  }
  if (constants.use_edge_mutual_followed_by) {
    push_link(constants.username_to_scrape, username);
  } else {
    push_link(constants.username_to_scrape, username, size);
  }
}

function handle_mutual_friends(x_profile_info) {
  console.log("Handle mutual friends");
  const x_username = x_profile_info["username"];
  const mutuals_list = x_profile_info["edge_mutual_followed_by"]["edges"];

  for (let j = 0; j < mutuals_list.length; j++) {
    let mutual = mutuals_list[j]["node"];

    if (!nodes.some((el) => el.id === mutual["username"])) {
      nodes.push({
        id: mutual["username"],
        profile_pic_url: "http://localhost:3000/favicon.ico",
        size: 1,
      });
    }

    push_link(mutual["username"], x_username);
  }
}

function handle_all_following(username, root_all_following_list) {
  console.log(`Handle all following ${username}`);

  const nested_all_following_list = get_all_following_cache(username) || [];

  let length = nested_all_following_list.length;

  for (let i = 0; i < length; i++) {
    let nested_username = nested_all_following_list[i]["username"];

    let isFollowedByRootUser = root_all_following_list.some((element) => {
      if (
        element.username === nested_username ||
        nested_username === constants.username_to_scrape
      ) {
        return true;
      }

      return false;
    });

    if (!isFollowedByRootUser) {
      continue;
    }

    push_link(username, nested_username);
  }
}

//let users_following_map = new Map();
function calculate_mutual_amount(source, target) {
  // Don't calculate distance between other persons, works by removing the following tree lines.
  /*if (
    source !== constants.username_to_scrape &&
    target !== constants.username_to_scrape
  ) {
    return "normal";
  }*/

  let non_root_map = new Map();

  let source_all_following = get_all_following_cache(source);
  let target_all_following = get_all_following_cache(target);

  let count = 0;

  for (let i = 0; i < source_all_following.length; i++) {
    non_root_map.set(source_all_following[i]["username"], null);
  }

  for (let i = 0; i < target_all_following.length; i++) {
    if (non_root_map.has(target_all_following[i]["username"])) {
      count++;
    }
  }

  return count;
}

function normalize_node_size() {
  console.log("Normalizing node size");

  let average =
    following_amount.reduce((a, b) => a + b) / following_amount.length;

  console.log("Average " + average);
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    let target_following_amount = get_profile_info_cache(node.id)[
      "edge_follow"
    ]["count"];
    let new_size =
      (node.size / (target_following_amount + average)) *
      constants.multiply_node;

    nodes[i].size = new_size;
  }

  // Getting the max amount of mutual
  let max = 0;
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.username == constants.username_to_scrape) {
      continue;
    }
    if (node.size > max) {
      max = node.size;
    }
  }

  // Normalizing the scale from min to max
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    if (node.id === constants.username_to_scrape) {
      nodes[i].size = constants.max_node;
      continue;
    }

    let new_value = Math.min(
      Math.max(
        parseInt((constants.max_node / max) * node.size),
        constants.min_node
      ),
      constants.max_node
    );
    nodes[i].size = new_value;
  }
}

// The initial link length is set to the amount of mutual friends,
// to group people with lots of friends together invert this value
// Using f(x) = -1 * x + max + min value; for some distance
function invert_link_length() {
  console.log("Invert link length");

  let max = 0;
  for (let i = 0; i < links.length; i++) {
    if (links[i].mutual_amount === "normal") {
      continue;
    }
    if (links[i].mutual_amount > max) {
      max = links[i].mutual_amount;
    }
  }

  for (let i = 0; i < links.length; i++) {
    /*
    if(links[i].target !== constants.username_to_scrape && links[i].source !== constants.username_to_scrape){
      links[i].length = constants.normal_link_size;
      continue;
    }*/

    links[i].length =
      -1 * links[i].mutual_amount + max + constants.min_link_size;
  }

  // Not needed but good for debugging data.json
  links = links.sort(function (a, b) {
    return b - a;
  });
}

function get_all_following_cache(username) {
  let all_following;
  if (!all_following_cache.has(username)) {
    all_following = JSON.parse(
      fs.readFileSync(helper.getAllFollowingPath(username))
    )["users"];
    all_following_cache.set(username, all_following);
  } else {
    all_following = all_following_cache.get(username);
  }
  return all_following;
}

function get_profile_info_cache(username) {
  let profile_info;
  if (!profile_info_cache.has(username)) {
    profile_info = JSON.parse(fs.readFileSync(helper.getDataPath(username)));
    profile_info_cache.set(username, profile_info);
  } else {
    profile_info = profile_info_cache.get(username);
  }
  return profile_info;
}

module.exports = {
  parse_info_to_graph_json,
};
