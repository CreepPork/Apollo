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

## Requirements
- Node >= 10.15.3
- NPM >= 6.4.1


## Setup
- Get the code
- `npm install`
- `cp .env.example .env`
- Configure the `.env` file
- `npm run build`
- **Linux only** If you want `pm2` support
  - `python3 setupPm2.py`
  - `pm2 list`
  - `pm2 start pm2.config.js`
  - Good to go! Don't run `npm start`.
- `npm start`
- Good to go!


## Available commands
- `!update` to quickly get info about the server status.
- `!updateForce` to create a new message about the server status.
