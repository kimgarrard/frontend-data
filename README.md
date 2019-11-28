# Functional-programming
[![Netlify Status](https://api.netlify.com/api/v1/badges/975fc1ed-9d0d-49ac-babf-37d17f8720dc/deploy-status)](https://app.netlify.com/sites/thirsty-keller-e65b29/deploys)

## Het concept
Een wereldkaart waarop alle foto's uit de collectie worden geplot. Je kunt hierdoor de foto's zien op de kaart, en zien waar ze zijn gemaakt. Ook kun je over de foto's heen bewegen voor details en kun je door de tijd heen klikken. 

<img width="1680" alt="ScreenshotSite" src="https://user-images.githubusercontent.com/43337685/69807422-8aad0800-11e5-11ea-897e-8fca6d0ec6c2.png">

## Beschrijving
Op de wereldkaart zie je per lattitude en longitude één foto, die een beeld geeft van de collectie foto's van dit gebied. De doelgroep is heel breed, het kan eigenlijk voor iedereen leuk zijn om te zien. Omdat de foto's heel variërend zijn is het leuk om er naar te kijken. Wanneer je met de muis over de foto's beweegt, zie je links op de pagina de details. Hier zie je de foto in het groot met de titel, de plaatsnaam met het land en het jaartal. Ook kun je door de tijd heen klikken, je ziet de foto's op de kaart dan veranderen en bovenaan zie je hoeveel foto's er uit die tijd zijn. Verder kun je ook in- en uitzoomen op de kaart. 

## Data
De data die ik heb gebruikt komt van https://collectie.wereldculturen.nl/. Dit is een verzameling van allerlei objecten over de hele wereld van vroeger. Deze data is enorm breed en kan variëren van maskers uit Afrika tot foto's van dansende mensen in Azië. 

Voor mijn eigen idee heb ik gebruikt
* Objecten met type foto
* Titel van deze objecten
* Foto van de objecten
* Longitude en latitude
* Land waar ze vandaan komen
* Jaartal van deze objecten

Mijn query heb ik zo geschreven dat deze alleen foto's bevat met een exact jaartal. Ook heb ik group by title gedaan, omdat hierdoor alleen unieke foto's tevoorschein komen. 

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
        (SAMPLE(?title) AS ?title)
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
 ?place skos:prefLabel ?placeName .
 ?place skos:exactMatch/wgs84:lat ?lat .
 ?place skos:exactMatch/wgs84:long ?long .

 # vind bij de plaats het land
 ?place skos:exactMatch/gn:parentCountry ?land .
 ?land gn:name ?landLabel .

 ?cho dct:created ?date .
 BIND (xsd:gYear(?date) AS ?year) .
 FILTER (?year < xsd:gYear("2100"))

 FILTER langMatches(lang(?title), "ned")

} GROUP BY ?title 
```

### Lege waardes
Er komen geen lege waardes uit de data zelf. Elke foto heeft een titel, een afbeelding, een jaartal, een longitude & latitude en een land. Niet alle plaatsen / landen hebben een object, dit zou je ook kunnen zien als lege waardes. Bij deze plaatsen laat ik de foto niet zien op de kaart. 

## Data opgeschoond en genest
De data die uit deze query komt heb ik ook opgeschoond. Zo heb ik ervoor gezorgd dat voor alle images 'https' komt te staan, in plaats van 'http'. Ook heb ik een nieuwe key aangemaakt, namelijke dateRange. Dit is een range waar het jaartal binnenvalt. De data heb ik weer genest met als key de dateRange. 

De data ziet er in mijn console log als volgt uit:

<img width="499" alt="DataConsole" src="https://user-images.githubusercontent.com/43337685/69813223-0a40d400-11f2-11ea-905d-bccffe9171eb.png">

## Features
- [x] Foto's geplot op een wereldkaart
- [x] Hoveren over de foto's, je ziet de foto groot met een titel, plaats en jaartal.
- [x] Klikken door de tijd, je ziet de verandering van de foto's
- [x] In- en uitzoomen op de kaart

## Bronnen
* [Clean Data](https://www.freecodecamp.org/news/the-junior-developers-guide-to-writing-super-clean-and-readable-code-cd2568e08aae/)
* [Functional Programming doc](https://docs.google.com/presentation/d/1ynCL4B4DyQ65V3cvjfZvbT2a9YrITbhUUUICoOjAP4c/edit#slide=id.g7081ab7627_0_38)
* [Introductie D3](https://d3js.org/#introduction)
* [YouTube tutorials D3 - 1](https://www.youtube.com/watch?v=-RQWC4I2I1s&list=PL9yYRbwpkykvOXrZumtZWbuaXWHvjD8gi&index=4)
* [YouTube tutorials D3 - 2](https://www.youtube.com/watch?v=IyIAR65G-GQ&list=PL9yYRbwpkykvOXrZumtZWbuaXWHvjD8gi&index=12)
* [D3 World Map - van Laurens](https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0)

## Credits
* Laurens, code van D3
* Lennart, hulp met parcel en netlify
* Kris, hulp met pushen naar github via Command Line
* Manouk

## Wat ik heb geleerd
* Data opschonen
* SPARQL meer leren
* Werken met D3
* Meer javascript kennis
* Werken met parcel
* Github pushen met Command Line
