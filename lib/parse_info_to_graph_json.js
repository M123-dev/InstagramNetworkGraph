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


    let x_username = root_all_following_list[i]["username"];

    const x_profile_info = JSON.parse(
      fs.readFileSync(helper.getDataPath(x_username))
    );

    const profile_pic_url = x_profile_info["profile_pic_url"];
    const size = x_profile_info["edge_followed_by"]["count"];

    if (!nodes.some((el) => el.id === x_username)){
      console.log(`Add ${x_username}`)
      nodes.push({
        id: x_username,
        profile_pic_url: profile_pic_url,
        size: size,
      });
    }


    links.push({
      source: constants.username_to_scrape,
      target: x_username,
    });



    if (constants.use_edge_mutual_followed_by) {
      let mutual_count = x_profile_info["edge_mutual_followed_by"]["count"];
      let mutuals_list = x_profile_info["edge_mutual_followed_by"]["edges"];

      for (let j = 0; j < mutual_count; j++) {
        let mutual = mutuals_list[j]["node"];

        if (!nodes.some((el) => el.id === mutual["username"])){
          console.log(`Add ${mutual["username"]}`)
          nodes.push({
            id: mutual["username"],
            profile_pic_url: "http://localhost:3000/favicon.ico",
            size: constants.min_node,
          });
        }
        links.push({
          source: mutual["username"],
          target: x_username,
        });
      }
    } else {
      const x_all_following_list = JSON.parse(
        fs.readFileSync(helper.getAllFollowingPath(username))
      )["users"];

      for (let j = 0; j < x_all_following_list.length; j++) {
        let nested_username = root_all_following_list[i]["username"];


        const nested_x_profile_info = JSON.parse(
          fs.readFileSync(helper.getDataPath(x_username))
        );
    
        const nested_x_profile_pic_url = nested_x_profile_info["profile_pic_url"];
        const nested_x_size = nested_x_profile_info["edge_followed_by"];

        if (!nodes.some((el) => el.id === nested_username)){
          console.log(`Add ${nested_username}`)
          nodes.push({
            id: nested_username,
            profile_pic_url: nested_x_profile_pic_url,
            size: nested_x_size,
          });
        }
          


        links.push({
          source: x_username,
          target: nested_username,
        });
      }
    }
  }

  let max = 0;
  for(let i = 0; i<nodes.length; i++){
    let node = nodes[i];
    if(node.size > max){
      max = node.size;
    }
  } 
  console.log(max);

  // Normalizing the scale from min to max
  for(let i = 0; i < nodes.length; i++){
    
    let node = nodes[i];
    let new_value = Math.min(Math.max(parseInt((constants.max_node / max) * node.size), constants.min_node), constants.max_node);
    node.size = new_value;
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
