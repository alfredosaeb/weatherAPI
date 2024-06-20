import fetch from 'node-fetch';
import express from 'express';
const app = express();

//Middleware to parse JSON
app.use(express.json());

//Configure route to get cities and the max/min temperature of them.
app.get('/cities/:cityName', 
   async (req, res) => {
    try {
        //API to fetch information based of a city's search (:cityName). This includes the lat/lon of the cities.
        const response = await fetch(`https://search.reservamos.mx/api/v2/places?q=${req.params.cityName}`);

            const data = await response.json();
            const result = [];

            //Based on the results. it will execute the OpenWeather API to fetch the max/min temperature of each city. 
            for(const element of data){
                if(element.lat && element.long){
                    var newObject = {
                            cityName: element.city_name
                        }

                        //API to fetch the temperature of each location based on the lat/lon.
                        var API_KEY = "a5a47c18197737e8eeca634cd6acb581";
                        const responseOW = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${element.lat}&lon=${element.long}&exclude={minutely,hourly,alerts}&appid=${API_KEY}`);
                        const dataOW = await responseOW.json();
                        
                        //Map the max/min temp of each city
                        const dailyTemperature = dataOW.daily
                            .slice(0, 7)
                            .map(day => ({
                                min: day.temp.min,
                                max: day.temp.max
                            }));

                        //Include the temp information into the final object with the expected results.
                        newObject['temperature'] = dailyTemperature;
                        result.push(newObject);
                }
                
            }        
        res.json(result);

    } catch (error) {
        res.status(500).json({message: "Error fetching data", error: error.message});
    }
});

app.get('/', (req, res) => {
    res.send("Weather Forecast's API");
});

const port = process.env.port || 80;
app.listen(port, () => 
    console.log(`Initializing port... ${port}`)
);



/*
INSTRUCTIONS:

API's functionality:
    : compare the weather forecast for the next 7 days, by day
    : send the city's name and fetch the maximum and minimum temperature for these places.

OpenWeather's API
    Request the information for an specific city. take the lat and lon
    API CALL: https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
    API key: a5a47c18197737e8eeca634cd6acb581

Reservamos API
    Find the coordinates of a givin city
    API CALL: https://search.reservamos.mx/api/v2/places?q=${req.params.cityName}


Expected output:
    An endpoint that receives a city name and return a list of cities with it's weather forecast:

    Scope: 
        Params:
            Partial or total name of any city in Mexico
                (Already implemented in Reservamos API)

        Results:
            List of cities (that match the givin param) including the maximum and minimum temperature 
            for the next 7 days (include only cities into results)
*/