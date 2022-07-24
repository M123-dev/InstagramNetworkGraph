const scrape_root_user = require('./lib/scrape_root_user.js');
const scrape_all_users = require('./lib/scrape_all_users.js');



// TODO: Implement followed by support
// TODO: Realtime chart
// TODO: Handle privat accounts
// TODO: Handle profile picture

(async () => {


    scrape_root_user.scrape_root_user();
    scrape_all_users.scrape_all_users();




})();