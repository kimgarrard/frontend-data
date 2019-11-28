/*jslint browser: true, devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true, white: true*/
/*eslint-env browser*/
/*eslint 'no-console':0*/

import "babel-polyfill"
import { select, json, geoPath, geoNaturalEarth1, zoom, event } from 'd3';
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
		?title
       #(SAMPLE(?title) AS ?title)
        (SAMPLE(?typeLabel) AS ?type)
        (SAMPLE(?img) AS ?img)
				(SAMPLE(?placeName) AS ?placeName)
        (SAMPLE(?landLabel) AS ?landLabel)
				(SAMPLE(?date) AS ?date)
				(SAMPLE(?lat) AS ?lat)
				(SAMPLE(?long) AS ?long)

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

 ?cho dct:created ?date .
 BIND (xsd:gYear(?date) AS ?year) .
 FILTER (?year < xsd:gYear("2100"))

 FILTER langMatches(lang(?title), "ned")

} GROUP BY ?title
LIMIT 200`



const inputLabels = [
  {
    year: '1850 - 1900'
  },
  {
    year: '1900 - 1950'
  },
  {
    year: '1950 - 2000'
  }
];



const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-06/sparql"

const svg = select('svg')
const svgDiv = select('.svgDiv')
const detailsDiv = select('.detailsDiv')
const width = 200
const height = 200
const projection = geoNaturalEarth1()
const pathGenerator = geoPath().projection(projection)

const g = svg.append('g');

//functies setupMap() en drawMap() van Laurens
//https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0
drawMap()
// zoomToMap()
getData()
let data;
let filteredData

// const height = 500;
// const width = 800;
// svg
//  .attr(“viewBox”, “90 0 ” + width + ” ” + height)

//Alle data functies aanroepen
//Code van Laurens
//https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3
async function getData() {
  data = await loadJSONData(endpoint, query)
  //pas werken met data wanneer data is omgezet in json
  data = data.map(cleanData)
  data = changeImageURL(data)
	data = addDateRange(data)
	data = changeDateRange(data)
	console.log("changeImageURL", data)
	console.log('before', data)
  filteredData = transformData(data)
	console.log('after', data)
	//data = filterByYear(data)
	// data = setupInput(data, inputLabels)
	// setupInput(data)
	setupInput(filteredData)
  plotImages(data)
  //console.log('Schone Data:', data)
	//selectionChanged();
	console.log("filteredData", filteredData)
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

//Nest the data per date
function transformData(source){
  let transformed = d3.nest()
  	.key(function(d) { return d.dateRange; }).sortKeys(d3.ascending)
		.entries(source);
	transformed.push({ key: "Alle jaren", values: source, })
  transformed.forEach(yearRange => {
    yearRange.amount = yearRange.values.length
  })
  return transformed
}

//Vervang 'http' door 'https'
function changeImageURL(results){
  results.map(result => {
    result.img = result.img.replace('http', 'https')
  })
  return results
}

//Voeg een datRange toe met het exacte jaartal
function addDateRange(){
  data.map(result => {
		result.dateRange = result.date
  })
	return data
}

//Vervang het jaartal door de juiste dateRange
function changeDateRange(){
  data.map(result => {
		if (result.dateRange > 1849 && result.dateRange < 1900) {
			result.dateRange = result.dateRange.replace(result.dateRange, '1850 - 1900')
		}

		if (result.dateRange > 1899 && result.dateRange < 1950) {
			result.dateRange = result.dateRange.replace(result.dateRange, '1900 - 1950')
		}

		if (result.dateRange > 1949 && result.dateRange < 2000) {
			result.dateRange = result.dateRange.replace(result.dateRange, '1950 - 2000')
		}

		if (result.dateRange > 1999) {
			result.dateRange = result.dateRange.replace(result.dateRange, '2000 en later')
		}
  })
	console.log("structure", data)
	return data
}

function drawMap() {
  json('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(data => {
    const countries = feature(data, data.objects.countries);
    g
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
    })
}

function filterByYear(results) {
//Hulp van Coen
let newArray = results.filter(result => {
	return result.date < 1900
})

console.log('newArray: ', newArray)

return newArray
}



function plotImages(plottableImages) {

		console.log('plottableImages', plottableImages)

    let images = g
      .selectAll('.images')
      .data(plottableImages)

		//exit


		//update
		images
			.attr('xlink:href', d => d.img)
			.attr('class', 'images')
			.attr('x', function(d) {
				return projection([d.long, d.lat])[0]
			})
			.attr('y', function(d) {
				return projection([d.long, d.lat])[1]
			})
			.on("mouseover", d => showDetails(d))
			.on("mouseout", hideDetails)

		//enter
		images
		  .enter()
  		//dankzij hulp van Laurens
      .append('image')
        .attr('xlink:href', d => d.img)
        .attr('class', 'images')
        .attr('x', function(d) {
          return projection([d.long, d.lat])[0]
        })
        .attr('y', function(d) {
          return projection([d.long, d.lat])[1]
        })
  			.on("mouseover", d => showDetails(d))
        .on("mouseout", hideDetails);

		images.exit().remove();

		console.log('enter update exit', images)

}


function showDetails(d) {
    detailsDiv
      .append("h2")
        .attr('class', 'DetailsTekst')
        .text(d.title);

    detailsDiv
  		.append("p")
        .attr('class', 'DetailsTekst')
        .text('Plaats: ' + d.placeName + ", " + d.landLabel);

		detailsDiv
  		.append("p")
        .attr('class', 'DetailsTekst')
        .text('Jaar: ' + d.date);

  	detailsDiv
  		.append("img")
  		.attr('src', d.img)
  		.attr('class', 'DetailsImg')

}

function hideDetails() {
    detailsDiv
      .selectAll('h2, img, p')
        .remove()
}

svg.call(zoom().on('zoom', () => {
  g.attr('transform', event.transform);
}))



// window.onload = function(){
// 		var schema = {
// 				fields: [
// 						{type: 'dropdown', display: 'Country',
// 								values: ['1850 - 1900', '1900 - 1950', '1950 - 2000']
// 						}
// 				]
// 		};
//
// 		var form = d3.select("form");
//
// 		var p = form.selectAll("p")
// 				.data(schema.fields)
// 				.enter()
// 				.append("p")
// 				.each(function(d){
// 						var self = d3.select(this);
// 						var label = self.append("label")
// 								.text(d.display)
// 								.style("width", "100px")
// 								.style("display", "inline-block");
//
// 						if(d.type == 'dropdown'){
// 						var select = self.append("select")
// 										.attr("name", "country")
// 										.selectAll("option")
// 										.data(d.values)
// 										.enter()
// 										.append("option")
// 										.text(function(d) { return d; });
// 						}
//
// 				});
// }






//Voorbeeld van Laurens
// https://beta.vizhub.com/Razpudding/4a61de4a4034423a98ae79d0135781f7?edit=files&file=index.js
function setupInput(yearsArray){
  const form = d3.select('form')
    .select('select')
		//.attr('class', 'select-css')
    .on('change', selectionChanged)
    .selectAll('option')
    .data(yearsArray)
    //.enter()
    //.append('option')
		//.attr('class', 'option')
		// <option value="" disabled selected>Select your option</option>
    .attr('value', d => d.key)
    .text(d => d.key)

		return data;

}

//This function will change the graph when the user selects another variable
function selectionChanged() {
  //'this' refers to the form element!
  console.log("Changing graph to reflect this variable", this.value)
	let year = this.value;
	console.log('year', year)

	console.log('dataSelection', data)

	let newArray;
	let pNumber = select('.numberOfImages')

	console.log('testestrest', filteredData)

	console.log('this', this)
	if (year == '1850 - 1900') {
		pNumber.text('Aantal fotos: ' + filteredData[0].amount)
		newArray = data.filter(result => {
			return result.dateRange == '1850 - 1900'
		})
	}

	if (year == '1900 - 1950') {
		pNumber.text('Aantal fotos: ' + filteredData[1].amount)
		newArray = data.filter(result => {
			return result.dateRange == '1900 - 1950'
		})
	}

	if (year == '1950 - 2000') {
		pNumber.text('Aantal fotos: ' + filteredData[2].amount)
		newArray = data.filter(result => {
			return result.dateRange == '1950 - 2000'
		})
	}

	if (year == '2000 en later') {
		pNumber.text('Aantal fotos: ' + filteredData[3].amount)
		newArray = data.filter(result => {
			return result.dateRange == '2000 en later'
		})
	}

	if (year == 'Alle jaren') {
		pNumber.text('Aantal fotos: ' + filteredData[4].amount)
		// newArray = filteredData.filter(result => {
		// 	let test = result.key == 'Alle jaren'
		// 	console.log('result', test)
		// 	return result.key == 'Alle jaren'

			newArray = data.filter(result => {
				return result
		})
	}

	plotImages(newArray)

	console.log('newArray: ', newArray)

	return newArray;

}





// function filterByYear(results) {
// //Hulp van Coen
// let newArray = results.filter(result => {
// 	return result.date < 1900
// })
//
// console.log('newArray: ', newArray)
//
// return newArray
// }
