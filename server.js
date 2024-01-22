var express = require('express');
var cors = require('cors');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

var bodyParser = require('body-parser');

var app = express();
app.use(cors()); 
app.use(bodyParser.json());

const client_id = process.env.VITE_REACT_APP_CLIENT_ID;
const clientSecret = process.env.VITE_REACT_APP_CLIENT_SECRET;
const redirect_uri = process.env.VITE_REACT_APP_REDIRECT_URL; 

app.get('/getAccessToken', async function (req, res) {
    const code = req.query.code;
    const params = `?client_id=${client_id}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirect_uri}`; 
    console.log("here");
    await fetch(`https://github.com/login/oauth/access_token${params}`, {
        method: "POST",
        headers: {
        "Accept": "application/json",
        },
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        res.json(data);
    })
    .catch((error) => {
        console.error("Error fetching access token:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});

app.get('/getUserData', async function (req, res) {
  const authorizationHeader = req.get("Authorization");

  await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      "Authorization": authorizationHeader,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});


app.get('/getParticularUser', async function (req, res) {
    const username = req.get("Username");
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const authorizationHeader = req.get('Authorization');
    const userData = await fetch(`https://api.github.com/users/${username}`, {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
    });
    if (!userData.ok) {
      const errorData = await userData.json();
      return res.status(userData.status).json(errorData);
    }
    const data = await userData.json();
    res.json(data);
});

app.get('/getRepositories', async (req, res) => {
  const searchQuery = req.get("Reponame");

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const authorizationHeader = req.get('Authorization');
  const searchEndpoint = `https://api.github.com/search/repositories?q=${searchQuery}&per_page=10`;
  const searchResponse = await fetch(searchEndpoint, {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      return res.status(searchResponse.status).json(errorData);
    }

    const searchData = await searchResponse.json();
    res.json(searchData.items);
});

app.listen(4000, () => {
  console.log("server started");
});
