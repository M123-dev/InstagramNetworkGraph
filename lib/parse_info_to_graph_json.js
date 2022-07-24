const fs = require("fs");
const appRoot = require("app-root-path");

const helper = require("./helpers.js");
const constants = require("./constants.js");

async function perso_info_to_graph_json() {
  let nodes = [];
  let links = [];

  const root_all_following_list = JSON.parse(
    fs.readFileSync(helper.getAllFollowingPath(constants.username_to_scrape))
  )["users"];

  for (let i = 0; i < root_all_following_list.length; i++) {
    let username = root_all_following_list[i]["username"];

    const x_profile_info = JSON.parse(
      fs.readFileSync(helper.getDataPath(username))
    );

    if (!nodes.some((el) => el.id === mutual))
    nodes.push({
      id: mutual["username"],
      profile_pic_url: x_profile_info["profile_pic_url"]
    });

    links.push({
      source: constants.username_to_scrape,
      target: username,
    });



    if (constants.use_edge_mutual_followed_by) {


      let mutual_count = x_profile_info["edge_mutual_followed_by"]["count"];
      let mutuals_list = x_profile_info["edge_mutual_followed_by"]["edges"];

      for (let j = 0; j < mutual_count; j++) {
        let mutual = mutuals_list[j]["node"];

        if (!nodes.some((el) => el.id === mutual))
          nodes.push({
            id: mutual["username"],
            profile_pic_url: mutuals["profile_pic_url"]
          });

        links.push({
          source: mutual["username"],
          target: username,
        });
      }
    } else {
      const x_all_following_list = JSON.parse(
        fs.readFileSync(helper.getAllFollowingPath(username))
      )["users"];
      for (let j = 0; j < x_all_following_list.length; j++) {
        let nested_username = root_all_following_list[i]["username"];

        if (!nodes.some((el) => el.id === nested_username))
          nodes.push({
            id: nested_username,
          });

        links.push({
          source: username,
          target: nested_username,
        });
      }
    }
  }

  let master_obj = {
    nodes: nodes,
    links: links,
  };

  fs.writeFile(
    `${appRoot}/d3-page/data.json`,
    JSON.stringify(master_obj),
    function (err) {
      if (err) {
        console.log(`Error writing master object for data visualization.`, err);
      }
    }
  );
}

perso_info_to_graph_json();

module.exports = {
  perso_info_to_graph_json,
};
