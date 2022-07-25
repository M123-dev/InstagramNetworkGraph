const fs = require("fs");
const appRoot = require("app-root-path");

const helper = require("./helpers.js");
const constants = require("./constants.js");

let nodes = [];
let links = [];
// List of list's to later filter out dublicates
let links_2d_array = [];

function push_link(a, b, length) {
  links.push({
    source: a,
    target: b,
    length: length,
  })
}

async function parse_info_to_graph_json() {
  const root_all_following_list = JSON.parse(
    fs.readFileSync(helper.getAllFollowingPath(constants.username_to_scrape))
  )["users"];

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
      handle_all_following(x_profile_info, root_all_following_list);
    }
  }

  normalize_edge_size();

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
}

function handle_people_root_is_following(x_profile_info) {
  const profile_pic_url = x_profile_info["profile_pic_url"];
  const size = x_profile_info["edge_followed_by"]["count"];
  const username = x_profile_info["username"];

  if (!nodes.some((el) => el.id === username)) {
    nodes.push({
      id: username,
      profile_pic_url: profile_pic_url,
      size: size,
    });
  }

  //push_link(constants.username_to_scrape, username);
}


function handle_mutual_friends(x_profile_info) {
  const x_username = x_profile_info["username"];
  const mutual_count = x_profile_info["edge_mutual_followed_by"]["count"];
  const mutuals_list = x_profile_info["edge_mutual_followed_by"]["edges"];

  for (let j = 0; j < mutual_count; j++) {
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


// TODO: Fix
function handle_all_following(x_profile_info, root_all_following_list) {
  const x_username = x_profile_info["username"];

  const x_all_following_list = JSON.parse(
    fs.readFileSync(helper.getAllFollowingPath(x_username))
  )["users"];

  for (let j = 0; j < x_all_following_list.length; j++) {
    let nested_username = x_all_following_list[j]["username"];

    // Check for not shwoing people with no direct connection to the root user
    // Alert running without results in large quantities of data
    // E.g. account with ~50 following => 14.000 nodes
    if(nested_username !== constants.username_to_scrape){
      if(root_all_following_list.filter((e) => {e["username"] == nested_username}).length == 0){
        continue;
      }
    }




    let nested_x_profile_pic_url;
    let nested_x_size;
    try {
      const nested_x_profile_info = JSON.parse(
        fs.readFileSync(helper.getDataPath(nested_username))
      );
  
      nested_x_profile_pic_url = nested_x_profile_info["profile_pic_url"];
      nested_x_size = nested_x_profile_info["edge_followed_by"];
    }
    catch(err) {
      nested_x_profile_pic_url = x_all_following_list[j]["profile_pic_url"]
      nested_x_size = 0;
    }

    if (!nodes.some((el) => el.id === nested_username)) {
      nodes.push({
        id: nested_username,
        profile_pic_url: nested_x_profile_pic_url,
        size: nested_x_size,
      });
    }

    push_link(x_username, nested_username);
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

parse_info_to_graph_json();

module.exports = {
  parse_info_to_graph_json,
};
