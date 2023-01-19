const express = require("express");
const app = express(); //Creating an instance
app.use(express.json()); // Making express know we are sending json data

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db;
// Connecting the server and database
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is up and running");
    });
  } catch (e) {
    console.log(`Db error ${e}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API-1 Getting all Players
app.get("/players/", async (request, response) => {
  //Processing the request
  const getAllPlayersQuery = `
        SELECT *
        FROM  cricket_team
        ORDER BY player_id`;
  //Executing Query on database
  const playersArray = await db.all(getAllPlayersQuery);
  //Sending Response
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API-2 Creating a New Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const addPlayerQuery = `
          INSERT INTO
          cricket_team (player_name,jersey_number,role)
      VALUES
        (
         ' ${player_name}',
          ${jersey_number},
          '${role}'
        );`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API-3 get a player
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  playerId = playerId.slice(1);
  const getPlayerQuery = `
        SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API-4 update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
      UPDATE
        cricket_team
      SET
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}';
      WHERE
        player_id=${playerId}`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//API-5 delete player details
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM
            cricket_team
        WHERE
            player_id=${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
