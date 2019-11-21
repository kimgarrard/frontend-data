import { select, json, geoPath, geoNaturalEarth1, zoom } from 'd3';
import { feature } from 'topojson';

const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX gn: <http://www.geonames.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
# een foto per lat long (met type, img, lat en long van de plaats
SELECT  (SAMPLE(?cho) AS ?cho)
        (SAMPLE(?title) AS ?title)
        (SAMPLE(?typeLabel) AS ?type)
        (SAMPLE(?img) AS ?img)
		(SAMPLE(?placeName) AS ?placeName)
        (SAMPLE(?landLabel) AS ?landLabel)
        ?lat
        ?long

WHERE {
 # vind alleen foto's
 <https://hdl.handle.net/20.500.11840/termmaster1397> skos:narrower* ?type .
 ?type skos:prefLabel ?typeLabel .
 ?cho edm:object ?type .
  
 ?cho edm:isShownBy ?img .
 ?cho dc:title ?title .
  
 # vind bij de plaats van de foto de lat/long
 ?cho dct:spatial ?place .
 ?place skos:exactMatch/wgs84:lat ?lat .
 ?place skos:exactMatch/wgs84:long ?long .
  
 # vind bij de plaats van de het land
 ?place skos:exactMatch/gn:parentCountry ?land .
 ?place skos:prefLabel ?placeName .
 ?land gn:name ?landLabel .
  
} GROUP BY ?lat ?long
LIMIT 10`

const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-06/sparql"

const svg = select('svg')
const detailsDiv = select('.detailsDiv')
const width = 200
const height = 200
const projection = geoNaturalEarth1()
const pathGenerator = geoPath().projection(projection)

//functies setupMap() en drawMap() van Laurens
//https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0
setupMap()
drawMap()
zoomToMap()
data()

//Alle data functies aanroepen
//Code van Laurens
//https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3
async function data() {
  let data = await loadJSONData(endpoint, query)
  //pas werken met data wanneer data is omgezet in json
  data = data.map(cleanData)
  data = changeImageURL(data)
  //code van Laurens, aangepast naar type
  // data = transformData(data)
  console.log(data)
  data = plotImages(data)
}

//Code van Laurens
//Load the data and return a promise which resolves with said data
function loadJSONData(url, query){
  return json(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.results.bindings)
}

//Code van Laurens
//This function gets the nested value out of the object in each property in our data
function cleanData(data){
   let result = {}
    Object.entries(data)
    	.map(([key, propValue]) => { 		
				result[key] = propValue.value
  	})
   return result
}

//Vervang 'http' door 'https'
function changeImageURL(results){
  results.map(result => {
    result.img = result.img.replace('http', 'https')
  })    
  return results
}

// //Nest the data per type
// function transformData(source){
//   let transformed =  d3.nest()
// 		.key(function(d) { return d.type; })
// 		.entries(source);
//   transformed.forEach(type => {
//     type.amount = type.values.length
//   })
//   return transformed
// }

function setupMap(){
  svg
    .append('path')
      .attr('class', 'sphere')
      .attr('d', pathGenerator({ type: 'Sphere' }))
}

function drawMap() {
  json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
    const countries = feature(data, data.objects.countries);
    svg  
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
  })
}

function zoomToMap(){
  svg
    .call(d3.zoom()
      	.extent([[0, 0], [width, height]])
      	.scaleExtent([1, 2])
      	.on("zoom", zoomed));
}

function zoomed() {
    svg.attr("transform", d3.event.transform);
  }

function plotImages(dataImg) {
    svg
      .selectAll('imageDiv')
      .data(dataImg)
      .enter()
  		//dankzij hulp van Laurens
      .append('image')
        .attr("xlink:href", d => d.img)
        .attr('class', 'images')
        .attr('x', function(d) {
          return projection([d.long, d.lat])[0]
        })
        .attr('y', function(d) {
          return projection([d.long, d.lat])[1]
        })
  			.on("mouseover", d => showDetails(d))
        .on("mouseout", hideDetails);
  	return dataImg
}

function showDetails(d) {
    detailsDiv
      .append("p")
        //.text('test')
        .attr('class', 'DetailsTekst')
        .text(d.title);
                
        console.log('test:', d.title)
  
  detailsDiv
  	.append("img")
  	.attr('src', d.img)
  	.attr('class', 'DetailsImg')
}

function hideDetails() {  
    detailsDiv
      .selectAll('p, img')
        .remove()
}

