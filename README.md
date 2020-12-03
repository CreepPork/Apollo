# Apollo
> Discord bot that allows to get status updates on your Arma 3 server.

<img src="https://i.imgur.com/CymcikZ.png" height="512" />

![Status](https://i.imgur.com/zNfXrdZ.png)

<details>
  <summary>More Images</summary>
  
  - In case something goes wrong in the bot internals, the following status is displayed.  
  ![Bot failure](https://i.gyazo.com/efc38aece91856d5396503cad0849c23.png)
  
  - If the server goes down or is not responding the following message is created and removed once the server goes up. The given role (only roles work) will be pinged.  
  ![Server is down](https://i.gyazo.com/239cbd9c28e07e4bd5c4e6560aab8045.png)
  ![Activity](https://i.gyazo.com/ef9fd8d66e3d4aef98ebc618c3643e97.png)
  
  - While the bot is gathering or processing information the bot's status is set to typing and it will display in the given channel that it is typing.  
  ![Is typing](https://i.gyazo.com/8ed96f3358b6e8c8472fead49156e5ad.png)
  
  - There are two different commands for updating the current server information: `!update` and `!updateForce` (both can be adjusted). Command `!update` will update the current posted message with the latest information. Command `!updateForce` creates a new message and removes the old one and posts new information (can be limited to the server manager role to prevent abuse).  
  ![No permissions](https://i.gyazo.com/f7e737fae37dc0c399f157da0f764128.png)
  
  - Locale support - out of the box support for English and Latvian. Easy setup for a new language.  
  ![Latvian locale](https://i.gyazo.com/f346e70713da313298d2c777ea08fe86.png)

  - Maintenance mode is a easy, toggable feature that prevents server down pings from being posted and doesn't poll the server until the mode is toggled again.
  ![Maintenance mode embed message](https://i.gyazo.com/de8b2c8df19ad04b5ad36dcc399e4aea.png)
  ![Private message when enabled](https://i.gyazo.com/45da0c4ea051e9f2a87f163df75ac3e9.png)

  - A specific role is available to be pinged when a certain threshold of players is reached. This allows Discord users to get a ping when a configurable amount of players are on the server. Apollo also provides a way of adding these roles via a emoji reaction which assigns and removes the given role.
  ![Pinged role threshold is reached](https://i.gyazo.com/ff04b7e4a32ef280ce6059004223efd2.png)

</details>

## Features
- Locale support (by default includes English and Latvian)
- Displays server name
- Server status online/offline
- Steam connect address
- Map
- Mission name
- Player count
- List of players with time hh:mm
- Refresh timestamp
- Activity refreshes on shorthand info
- Handles server not responding
- Permissions for force command (also takes into account above roles)
  - On permission fail can be customized to return a message in the message channel or direct message to user
- Mentions a role when server is down
- Displays when bot is refreshing info
- Times to refresh before failing and displaying on Discord
- Sentry error managment
- Maintenance mode to stop it polling the server unnecessarily without taking the bot down
- Pings a specific role when a configurable threshold is reached (also provides role assignment via a reaction)

## Requirements
- Node >= **12.x**
- NPM

## Upgrade guide to v3
1. Upgrade your Node.js version to 12.x or above
2. In `https://discord.com/developers/applications/xxx/bot` page, enable the toggle `SERVER MEMBERS INTENT`. This is now required for Apollo to fetch your server users, due to recent API changes.

## Setup
- Get the code
- `npm install`
- `cp .env.example .env`
- Configure the `.env` file
- `npm run build`
- **Linux only** If you want `pm2` support
  - `pm2 start pm2.config.js`
  - Good to go! Don't run `npm start`.
- `npm start`
- Good to go!


## Adding a new locale
1. `cp src/locales/en.ts src/locales/<language-tag>.ts`
2. Rewrite strings for your locale
3. Configure `LOCALE=<language-tag>` to match your new file
4. `npm run build`
5. Done!


## Available commands
- `!update` to quickly get info about the server status.
- `!updateForce` to create a new message about the server status.
- `!maintenanceMode` to toggle Apollo's maintenance mode feature.
