const express = require("express");
const appRoot = require("app-root-path");
const constants = require("./constants.js");

const scrape_root_user = require("./scrape_root_user.js");
const scrape_all_users = require("./scrape_all_users.js");
const parse_info_to_graph_json = require("./parse_info_to_graph_json.js");
const remove_private_accounts = require("./remove_private_accounts.js");

const app = express();
const port = 3000;

async function graph_host(){


	app.use(express.static(`${appRoot}/d3-page/`));
	app.use(express.static(`${appRoot}/config-page/`));
	app.use(express.urlencoded( {extended: true} ));

	app.set("etag", false);
	app.use((req, res, next) => {
		res.set("Cache-Control", "no-store");
		next();
	});

	app.get("/", function(req, res) {
		res.redirect("/config");
	});

	app.get("/config", function(req, res) {
		res.sendFile(`${appRoot}/config-page/config.html`);
	});

	app.post("/graph", function(req, res) {
		res.sendFile(`${appRoot}/d3-page/graph.html`);
	});

	app.get("/graph", function(req, res) {
		res.sendFile(`${appRoot}/d3-page/graph.html`);
	});

	app.listen(port, () => {
		console.log(`Example app listening on port ${port} --- localhost:3000/`);
	});

	app.post("/scrape_root_user", async function(req, res) {
		set_config(req);
		await scrape_root_user.scrape_root_user();
		res.sendStatus(200);
	});

	app.post("/scrape_all_users", async function(req, res) {
		set_config(req);
		await scrape_all_users.scrape_all_users();
		res.sendStatus(200);
	});

	app.post("/remove_private_accounts", async function(req, res) {
		set_config(req);
		await remove_private_accounts.remove_private_accounts();
		res.sendStatus(200);
	});

	app.post("/generate_data_set", async function(req, res) {
		set_config(req);
		await parse_info_to_graph_json.parse_info_to_graph_json();
		res.sendStatus(200);
	});

}

graph_host();

function set_config(req){
	let values = req.body;
	constants.username_value = values["email"];
	constants.password_value = values["password"];
	constants.username_to_scrape = values["username"];
	constants.requests_per_hour = parseInt(values["requests_per_hour"]);
	constants.use_edge_mutual_followed_by = (values["use_edge_mutual_followed_by"] === "on");
	constants.headless = values["headless"] === "on";
	constants.link_multiplier = parseInt(values["link_multiplier"]);
	constants.min_link_size = parseInt(values["min_link_size"]);
	constants.normal_link_size = parseInt(values["normal_link_size"]);
	constants.max_link_size = parseInt(values["max_link_size"]);
	constants.min_node = parseInt(values["min_node"]);
	constants.max_node = parseInt(values["max_node"]);
	constants.multiply_node = parseInt(values["multiply_node"]);
	constants.attraceForce = parseInt(values["attraceForce"]);
	constants.link_strength = parseFloat(values["link_strength"]);
	constants.colorful = (values["colorful"] === "on");
	constants.two_fa = (values["2fa"] === "on");
}


module.exports = {
	graph_host,
};
