import express, { query } from 'express';
import axios from 'axios';
import ejs from 'ejs';
const app = express();
const port = 3000;
const API_URL = "https://accounts.spotify.com/api";
const SPOTIFY_API_URL = "https://api.spotify.com/v1"
const client_id = "7a870c8794734109b7847d708615ef1b";
const client_secret = "ebd66825106345b7a750bbc94d15a355";
const url_produccion = "https://capstoneproject-spotifyapi.onrender.com/";
const url_desarrollo = "http://localhost:3000/";
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
            redirect_uri: url_produccion,
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
        var scope = 'user-read-private user-read-email user-top-read';

        const loginURL = 'https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: url_produccion,
                state: state,
                show_dialog: true
            });
        //Redirecciona a la página de inicio de sesión de Spotify
        res.redirect(loginURL);
        }
    catch (error) {
        console.error('Error:', error);
    }
})

app.get("/", async (req, res) => {
    try {
    //Code es el código de autorización que se obtiene al iniciar sesión
    const code = req.query.code;
    //Access token es el token de acceso que se obtiene al canjear el code
    const accessToken = req.query.access_token;
    if(code && !accessToken){
        console.log("Canjeando code por access token");
        res.redirect(`/generate-token?code=${code}`);
    } 
    else if (accessToken) {
        console.log("Sesión iniciada con exito!");

        //Obtener información del usuario
        const user = await axios.get(SPOTIFY_API_URL + "/me", {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        
        //Obtener 5 canciones más escuchadas del mes actual del usuario
        const topTracks_Array = await axios.get(SPOTIFY_API_URL + "/me/top/tracks?" + 
            querystring.stringify({
                time_range: 'short_term',
                limit: 5
            }),{
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        console.log("Top Tracks:", topTracks_Array.data.items); 
        const topTracks = topTracks_Array.data.items; //Arreglo de canciones
        

        //Array de la información que se le enviará al frontend
        const data = {
            profile_picture: user.data.images[0].url,
            display_name: user.data.display_name,
            topTracks: topTracks,
            token: accessToken
        }
        //Imprimir información del usuario
        res.render("index.ejs", {data: data})

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
