import express, { query } from 'express';
import axios from 'axios';
import ejs from 'ejs';
const app = express();
const port = 3000;
const API_URL = "https://accounts.spotify.com/api";
const SPOTIFY_API_URL = "https://api.spotify.com/v1"
const client_id = "7a870c8794734109b7847d708615ef1b";
const client_secret = "ebd66825106345b7a750bbc94d15a355";
import querystring from 'querystring';
let accessToken;

app.use(express.static("public"));
app.use("/css",express.static("./node_modules/bootstrap/dist/css"));

app.get("/generate-token", async (req, res) => {
    try {
        const code = req.query.code;
        console.log("Generando token de acceso... /generate-token");
        const tokenRequest = await axios.post( API_URL + "/token", 
        querystring.stringify({
            code: code,
            redirect_uri: 'http://localhost:3000/',
            grant_type: 'authorization_code'
        }), 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            }
        }
        );
        accessToken = tokenRequest.data.access_token; //Access_Token
        console.log('Access_Token Generado: ', tokenRequest.data.access_token); //Access_Token
        res.redirect("/" + `?access_token= ${accessToken}`);
    } catch (error) {
        console.error('Error:', error);
    }
})

app.get("/login", async (req, res) => {
    try {
        console.log("Entró al login... /login");
        //random string 16 characters
        var state = 'randomStringrandomString';
        var scope = 'user-read-private user-read-email';

        const loginURL = 'https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: 'http://localhost:3000/',
                state: state,
                show_dialog: true
            });
        //console.log(login.data);
        res.redirect(loginURL);
        }
    catch (error) {
        console.error('Error:', error);
    }
})

app.get("/", async (req, res) => {
    //console.log(accessToken);
    //Verifica si existe token de acceso
    try {
    const code = req.query.code;
    const accessToken = req.query.access_token;
    //If code exists meaning user is logged in but there is no access token
    if(code && !accessToken){
        //Canjear code por access token
        console.log("Canjeando code por access token");
        res.redirect(`/generate-token?code=${code}`);
    } 
    //If access token exists
    else if (accessToken) {
        console.log("Sesión iniciada con exito!")
        res.render("index.ejs", {token: accessToken})

    } else {
        console.log("No hay token de acceso ni code");
        res.render("index.ejs");
    }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
