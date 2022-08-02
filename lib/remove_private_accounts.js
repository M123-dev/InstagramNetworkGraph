const fs = require("fs");
const appRoot = require("app-root-path");

const helper = require("./helpers.js");
const constants = require("./constants.js");


async function remove_private_accounts() {
	let all_following_files = fs.readdirSync(`${appRoot}/data/allFollowing`);

	let user_count = 0;
	let file_count = 0;
	for(let i = 0; i < all_following_files.length; i++){

		const all_following_list = JSON.parse(fs.readFileSync(`${appRoot}/data/allFollowing/${all_following_files[i]}`))["users"] || [];

		if(all_following_list.length === 0){
			user_count++;
			file_count++;
			fs.unlinkSync(`${appRoot}/data/allFollowing/${all_following_files[i]}`);
		}

	}

	let profile_info_files = fs.readdirSync(`${appRoot}/data/profile`);

	for(let i = 0; i < profile_info_files.length; i++){

		const profile_info = JSON.parse(fs.readFileSync(`${appRoot}/data/profile/${profile_info_files[i]}`));

		if(profile_info["is_private"] == true && profile_info["followed_by_viewer"] == false){
			file_count++;
			fs.unlinkSync(`${appRoot}/data/profile/${profile_info_files[i]}`);
		}

	}

	console.log(`Removed ${user_count} empty (likely private) users equals to ${file_count} files`);


}

module.exports = {
	remove_private_accounts,
};