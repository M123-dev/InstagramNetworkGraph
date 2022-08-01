# Instagram Network Graph

An all in one instagram scraper and analyzer for finding and visualizing clusters from people you are following.

# Example
![Example cluster](/assets/Cluster_dark.png?raw=true "Optional Title")

- [Other example assets](/assets/)

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

### Features

- Only sending a certain amount of requests per hour.
- Saving sessions to avoid logging in every time
- Persistent storing of scraped data.
- Scraping with an alt account
  - Automatically removing private accounts for re-scraping with the main account
- Configuring of node + link size
- Configuring of forces
- Mouse hover highlighting
- Node Drag + Drop
- Zoom + Drag
- <span style="color:#FF0000">C</span><span style="color:#FFBF00">o</span><span style="color:#80FF00">l</span><span style="color:#00FF40">o</span><span style="color:#00FFFF">r</span><span style="color:#0040FF">f</span><span style="color:#7F00FF">u</span><span style="color:#FF00BF">l</span> nodes. (Needs more performance)


## Authors

* Marvin M. - *Initial work* - [M123-dev](https://github.com/M123-dev)

See also the list of [contributors](https://github.com/your/repository/contributors) who
participated in this project.

## License


   Copyright 2022 Marvin Möltgen

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
   
   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   See the [LICENSE.md](LICENSE.md) file for more details.