# Instagram Network Graph

An all in one Instagram scraper and analyzer for finding and visualizing clusters from people you are following.

## Example

* [Interactive example with mock data](https://m123-dev.github.io/InstagramNetworkGraph/graph.html?mock_version=true)

![Example cluster](/assets/Cluster_dark.png?raw=true "Optional Title")

* [Other example assets](/assets/)

## Getting Started

This project runs on Node.js and does the scraping via a headless chromium instance. It's tested with Node v18.4.0 on Windows 10 & 11.

### Install Node

* [Download Node](https://nodejs.org/en/download/)

### Install dependencies

``` bash
npm install
```

### Run the project

``` bash
npm run start
```

After that you will be presented a GUI on [localhost:3000/](http://localhost:3000/config) for configuration.

## Features

* Only sending a certain amount of requests per hour.
* Saving sessions to avoid logging in every time
* Persistent storing of scraped data.
* Scraping with an alt account
  * Automatically removing private accounts for re-scraping with the main account
* Configuring of node + link size
* Configuring of forces
* Mouse hover highlighting
* Node Drag + Drop
* Zoom + Drag
* <span style="color:#FF0000">C</span><span style="color:#FFBF00">o</span><span style="color:#80FF00">l</span><span style="color:#00FF40">o</span><span style="color:#00FFFF">r</span><span style="color:#0040FF">f</span><span style="color:#7F00FF">u</span><span style="color:#FF00BF">l</span> nodes. (Needs more performance)
* 2FA support

## Stack

* Puppeteer is used for scraping
* Express.js for config and page hosting
* d3.js for graph generation

## FAQ

* Why not use a pre made plugin for scraping?
  * Normally, Instagram only provides a list of ~20 people you are following, and you have to do a follow-up request for getting the next 20. This is of course not viable for scraping more than a thousand accounts. My workaround for this, a little (probably) bug in the Instagram private API isn't supported by any plugin I could find, so I decided on doing it like this.

## Authors

* Marvin M. - *Initial work* - [M123-dev](https://github.com/M123-dev)

See also the list of [contributors](https://github.com/your/repository/contributors) who
participated in this project.

## Disclaimer

This project is in no way affiliated with, authorized, maintained or endorsed by Instagram or any of its affiliates or subsidiaries. This is an independent and unofficial project.

Please note that this is a research project. I am by no means responsible for any usage of this tool. Use it on your behalf. I'm also not responsible if your accounts get banned due to the extensive use of this tool. Use at your own risk.

## License

   Copyright 2022 Marvin Möltgen

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   <http://www.apache.org/licenses/LICENSE-2.0>

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   See the [LICENSE.md](LICENSE.md) file for more details.
