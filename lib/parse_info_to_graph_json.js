const fs = require("fs");
const appRoot = require("app-root-path");

const helper = require("./helpers.js");
const constants = require("./constants.js");

let nodes = [];
let links = [];

function push_link(a, b, length) {
  links.push({
    source: a,
    target: b,
    length: length,
  });
}

async function parse_info_to_graph_json() {

  fs.writeFile(
    `${appRoot}/d3-page/root.json`,
    JSON.stringify({
      "username": constants.username_to_scrape,
    }),
    function (err) {
      if (err) {
        console.log(`Error writing root user file.`, err);
      }
    }
  );


  const root_all_following_list = JSON.parse(
    fs.readFileSync(helper.getAllFollowingPath(constants.username_to_scrape))
  )["users"];

  if (constants.use_edge_mutual_followed_by) {
    console.log("WARN: Use edge mutual followed by. Its way less accurate");
  } else {
    console.log("Handle all following");
  }

  // For every user the root user is following
  for (let i = 0; i < root_all_following_list.length; i++) {
    const x_profile_info = JSON.parse(
      fs.readFileSync(
        helper.getDataPath(root_all_following_list[i]["username"])
      )
    );
    handle_people_root_is_following(x_profile_info);

    if (constants.use_edge_mutual_followed_by) {
      handle_mutual_friends(x_profile_info);
    } else {
      handle_all_following(
        root_all_following_list[i]["username"],
        root_all_following_list
      );
    }
  }

  if (!constants.use_edge_mutual_followed_by) {
    console.log("Calculating link length");
    handle_all_following_link_length();
  }

  console.log("Normalizing node size");
  normalize_edge_size();

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
  console.log("Created data set");
}

function handle_people_root_is_following(x_profile_info) {
  const profile_pic_url = x_profile_info["profile_pic_url"];
  const username = x_profile_info["username"];

  if (!nodes.some((el) => el.id === username)) {
    nodes.push({
      id: username,
      profile_pic_url: profile_pic_url,
    });
  }

  push_link(constants.username_to_scrape, username);
}

function handle_mutual_friends(x_profile_info) {
  const x_username = x_profile_info["username"];
  const mutual_count = x_profile_info["edge_mutual_followed_by"]["count"];
  const mutuals_list = x_profile_info["edge_mutual_followed_by"]["edges"];

  for (let j = 0; j < mutuals_list.length; j++) {

    let mutual = mutuals_list[j]["node"];

    if (!nodes.some((el) => el.id === mutual["username"])) {
      nodes.push({
        id: mutual["username"],
        profile_pic_url: "http://localhost:3000/favicon.ico",
        size: constants.min_node,
      });
    }

    push_link(mutual["username"], x_username, mutual_count);
  }
}

async function handle_all_following(username, root_all_following_list) {
  console.log(`Handle all following ${username}`)

  const nested_all_following_list = JSON.parse(
    fs.readFileSync(helper.getAllFollowingPath(username))
  )["users"] || [];

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

    // NEEDS TO BE LEFT IN, just adds root user
    if (!nodes.some((el) => el.id === nested_username)) {
      nodes.push({
        id: nested_username,
        profile_pic_url: "http://localhost:3000/favicon.ico",
        size: constants.min_node,
      });
    }

    push_link(username, nested_username);
  }
}

function handle_all_following_link_length() {
  const map = new Map();

  let max = 0;
  for (let j = 0; j < links.length; j++) {
    let link = links[j];
    let source = link["source"];
    let target = link["target"];

    if (!map.has(source)) {
      map.set(source, 0);
    }

    if (!map.has(target)) {
      map.set(target, 0);
    }

    let new_source = map.get(source) + 1;
    let new_target = map.get(target) + 1;

    if (new_source > max) {
      max = new_source;
    }

    if (new_target > max) {
      max = new_target;
    }

    map.set(source, new_source);
    map.set(target, new_target);
  }

  // TODO: remove duplicates

  // Normalizing the link size
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    if (
      link.source !== constants.username_to_scrape &&
      link.target !== constants.username_to_scrape
    ) {
      links[i].length = constants.normal_link_value;
      continue;
    }

    let username;
    if (link.target !== constants.username_to_scrape) {
      username = link.target;
    } else {
      username = link.source;
    }

    let new_value = Math.min(
      parseInt((100 / map.get(username)) * constants.link_multiplier),
      constants.max_link_size
    );
    links[i].length = new_value;
  }

  // Setting the size to the amount of mutual friends
  for(let i = 0; i < nodes.length; i++){
    let node = nodes[i];
    node.size = map.get(nodes[i].id);
    nodes[i] = node;
  }

}

function normalize_edge_size() {
  // Getting the max amount of followers
  let max = 0;
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.size > max) {
      max = node.size;
    }
  }

  // Normalizing the scale from min to max
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let new_value = Math.min(
      Math.max(
        parseInt((constants.max_node / max) * node.size),
        constants.min_node
      ),
      constants.max_node
    );
    node.size = new_value;
  }
}

module.exports = {
  parse_info_to_graph_json,
};
