import fetch from 'node-fetch';
import express from 'express';
const app = express();

//Middleware para parsear JSON
app.use(express.json());

//Configurar ruta para le API
app.get('/cities/:cityName', 
   async (req, res) => {
    try {
        const response = await fetch(`https://search.reservamos.mx/api/v2/places?q=${req.params.cityName}`);
        
            const data = await response.json();
            const result = [];
            for(const element of data){
                if(element.lat && element.long){
                    var newObject = {
                            cityName: element.city_name
                        }

                        var API_KEY = "a5a47c18197737e8eeca634cd6acb581";
                        const responseOW = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${element.lat}&lon=${element.long}&exclude={minutely,hourly,alerts}&appid=${API_KEY}`);
                        const dataOW = await responseOW.json();
                        
                        const dailyTemperature = dataOW.daily
                        .slice(0, 7)
                        .map(day => ({
                            min: day.temp.min,
                            max: day.temp.max
                        }));

                        newObject['Temperature'] = dailyTemperature;
                        result.push(newObject);
                }
                
            }        
        res.json(result);

    } catch (error) {
        res.status(500).json({message: "Error fetching data", error: error.message});
    }
});

app.get('/', (req, res) => {
    res.send("Node JS api");
});

const port = process.env.port || 80;
app.listen(port, () => 
    console.log(`Iniciando puerto ${port}`)
);
//module.exports = app;



/*
INSTRUCCIONES:

API's functionality:
    : compare the wather forecast for the next 7 days, by day
    : send the city's name and fetch the maximun and minimum temperature for these places.


OpenWeather's API
    Request the information for an specific city. take the latitud and longitud
    API CALL: https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
    API key: a5a47c18197737e8eeca634cd6acb581

Reservamos API
    Find the coordinates of a givin city



Expected output:
    An endpoint that receives a city name and return a list of cities with it's weather forecast:

    Scope: 
        Params:
            Partial or total name of any city in Mexico
            Already implemented in REservamos API

        Results:
            List of cities that match the givin param including the maximum and minimum temperature fo the next 7 days (include only cities into results)

        
 
*/