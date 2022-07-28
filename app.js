const scrape_root_user = require('./lib/scrape_root_user.js');
const scrape_all_users = require('./lib/scrape_all_users.js');
const { parse_info_to_graph_json } = require('./lib/parse_info_to_graph_json.js');
const { graph_host } = require('./d3-page/graph-host.js');



// TODO: Implement followed by support
// TODO: Handle profile picture
// TODO: Setting for showing people with a certain amount of mutual friends but no direct link to root
// TODO: Allow to show non direct mutual friends

(async () => {


    scrape_root_user.scrape_root_user();
    scrape_all_users.scrape_all_users();
    parse_info_to_graph_json();
    graph_host();





})();