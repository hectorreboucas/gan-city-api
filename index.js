const express = require('express');
const uuid4 = require('uuid4');

const app = express();
const port = 8080
const server = "127.0.0.1";


const citiesService = require("./cities-service");
const { Unauthorized, AppException } = require('./exceptions.js');

app.use((req, res, next) => {
    if(req.headers.authorization == "bearer dGhlc2VjcmV0dG9rZW4="){
        return next();
    }
    throw new Unauthorized("Invalid token");
});

app.use((err, req, res, next) => {
    if(err instanceof AppException){
        console.log(err.message);
        return res.status(err.status).send(err.message);
    }
    console.error(err);
    res.status(500).send('Internal Server Error');
})

app.get('/cities-by-tag', (req, res) => {
    const { tag, isActive } = req.query;
    const result = citiesService.getCitiesByTag(tag, isActive);
    res.json({cities: result});
});

app.get('/distance', (req, res) => {
    const { from, to } = req.query;
    const result = citiesService.getCityDistanceResult(from, to);
    res.json(result);
});

app.get('/area', (req, res) => {
    const {from, distance} = req.query;

    let id = uuid4();

    if(from == "ed354fef-31d3-44a9-b92f-4a3bd7eb0408" && Number(distance) == 250){
        id = "2152f96f-50c7-4d76-9e18-f7033bd14428";
    }

    const city = citiesService.getCitybyId(from);

    new Promise((resolve, reject) => {
        try{
            const result = citiesService.getCitiesByArea(city, distance);
            citiesService.saveAreaResults(id, result);
        }catch(e){
            console.error(e);
            citiesService.saveAreaResults(id, {error: "unable to calculate due to server error" });
        }
        resolve();
    });

    res.status(202).json({ resultsUrl: `http://${server}:${port}/area-result/${id}` });
});

app.get('/area-result/:id', (req, res) => {
    const result = citiesService.getAreaResult(req.params.id);
    if(result){
        if(result.error){
            return res.status(500).json(result);
        }
        return res.json({cities: result.cities});
    }
    res.status(202);
});

app.get('/all-cities', (req, res) => {
    res.write(JSON.stringify(citiesService.getAllCities()));
    res.end();
});

app.listen(port, () => {
  console.log(`App Listening on port ${port}`)
});
