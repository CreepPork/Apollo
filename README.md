# Apollo

## Discord Bot to display Arma 3 server info
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
- Permissions for force command
- Mentions a role when server is down
- Displays when bot is refreshing info
- Times to refresh before failing and displaying on Discord

## Requirements
- Node >= 10.15.3
- NPM >= 6.4.1


## Setup
- Get the code
- `npm install`
- `cp .env.example .env`
- Configure the `.env` file
- `npm run build`
- `npm start`
- Good to go!


## Available commands
- `!update` to quickly get info about the server status.
- `!updateForce` to create a new message about the server status.
