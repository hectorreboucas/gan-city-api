const fs = require('fs');
const { NotFound } = require('./exceptions');

const cities = JSON.parse(fs.readFileSync("./addresses.json"));
const areaResults = JSON.parse(fs.readFileSync("./area-results.json"));

function getCitybyId(guid){
    const city = cities.find(c => c.guid == guid);
    if(!city){
        throw new NotFound(`city not found ${guid}`);
    }
    return city;
}

function getCitiesByTag(tag, isActive){
    return cities.filter(c => c.isActive == Boolean(isActive) && c.tags.includes(tag));
}

function getCitiesByArea(city, distanceKM){
    return cities.filter(c => city.guid != c.guid && getDistanceKM(city, c) <= Number(distanceKM));
}

function getAllCities(){
    return cities;
}

function saveAreaResults(id, result){
    areaResults[id] = {status: 200, cities: result};
    fs.writeFileSync("area-results.json", JSON.stringify(areaResults));
}

function getAreaResult(id){
    const areaResult = areaResults[id];
    if(!areaResult){
        throw new NotFound(`area ${id} not found`);
    }
    return areaResult;
}

function getCityDistanceResult(guidFrom, guidTo){
    const from = getCitybyId(guidFrom);
    const to = getCitybyId(guidTo);

    const distance = round(getDistanceKM(from, to), 2);
    return {
        from,
        to,
        unit: "km",
        distance
    }
}

function round(number, decimals){
    const pow = Math.pow(10, decimals);
    return Math.round(number*pow)/pow;
}

function getDistanceKM(city1, city2){
    const earthRadiusKM = 6371;
    const deg2rad = (deg) => deg * (Math.PI/180);
    const lat1 = deg2rad(city1.latitude);
    const lat2 = deg2rad(city2.latitude);
    const lon1 = deg2rad(city1.longitude);
    const lon2 = deg2rad(city2.longitude);
    return Math.acos(
                        Math.sin(lat1) * Math.sin(lat2) +
                        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2-lon1)
                    )*earthRadiusKM;
}

module.exports = {
    getCitybyId,
    getCitiesByTag,
    getAllCities,
    getCitiesByArea,
    saveAreaResults,
    getAreaResult,
    getCityDistanceResult
}