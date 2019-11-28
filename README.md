# Functional-programming

## Het concept
Ik wil een wereldkaart maken, waarop alle foto's uit de collectie worden geplot. Je kunt hierdoor de foto's zien op de kaart, en zien waar ze zijn gemaakt. Later wil ik nog interactie toevoegen, dat je door de tijd kan klikken en dat je dan de foto's ziet veranderen. 

<img width="1071" alt="Website" src="https://user-images.githubusercontent.com/43337685/68882923-5713ad80-0710-11ea-82e1-c6cbec8c3702.png">

## Beschrijving
Op de wereldkaart zie je per land één foto, die een beeld geeft van de collectie foto's van dit land. De doelgroep is heel breed, het kan eigenlijk voor iedereen leuk zijn om te zien. Omdat de foto's heel variërend zijn is het leuk om er naar te kijken. Omdat de foto's heel zwaar zijn, zie je hier 10 foto's. 

## Data

De data die ik heb gebruikt komt van https://collectie.wereldculturen.nl/. Dit is een verzameling van allerlei objecten over de hele wereld van vroeger. Deze data is enorm breed en kan variëren van maskers uit Afrika tot foto's van dansende mensen in Azië. 

Voor mijn eigen idee heb ik nodig
* Objecten met type foto
* Titel van deze objecten
* Foto van de objecten
* Longitude en latitude
* Land waar ze vandaan komen

Omdat er heel veel foto's zijn en er maar een beperkt aantal foto's kunnen worden ingeladen, heb ik mijn query zo geschreven dat er uit elk lan één object wordt opgehaald. Dit zorgt ervoor dat er veel verpreiding is over de hele kaart. 

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

# een foto per land (met type, img, lat en long van de plaats
SELECT  (SAMPLE(?cho) AS ?cho) 
	(SAMPLE(?title) AS ?title) 
        (SAMPLE(?typeLabel) AS ?type) 
        (SAMPLE(?img) AS ?img) 
        (SAMPLE(?lat) AS ?lat)
        (SAMPLE(?long) AS ?long)
        ?landLabel 

WHERE {
  # vind alleen foto's
  <https://hdl.handle.net/20.500.11840/termmaster1397> skos:narrower* ?type .
  ?type skos:prefLabel ?typeLabel .   
  ?cho edm:object ?type .

  # ?cho dc:title ?title .
  ?cho edm:isShownBy ?img .
  ?cho dc:title ?title .

  # vind bij de objecten het land
  ?cho dct:spatial ?place .
  ?place skos:exactMatch/gn:parentCountry ?land .
  # ?place skos:prefLabel ?placeName .
  ?land gn:name ?landLabel .
  
  # vind bij de plaats van de foto de lat/long
  ?place skos:exactMatch/wgs84:lat ?lat .
  ?place skos:exactMatch/wgs84:long ?long .      

} GROUP BY ?landLabel
ORDER BY ?landLabel 
```

### Lege waardes
Mijn data is dus verdeeld in één foto per land, er komen geen lege waardes uit de data zelf. Elke foto heeft een titel, een afbeelding, een longitude & latitude en een land. Wel zijn er niet van alle landen ook objecten, dit zou je ook kunnen zien als lege waardes. Bij deze landen laat ik het plaatje niet zien op de kaart. 

## Data opgeschoond

De data die uit deze query komt heb ik ook opgeschoond. Zo heb ik ervoor gezorgd dat de nesting beter is en zorg ik dat er voor alle images 'https' komt te staan, in plaats van 'http'. De data ziet er in mijn console log als volgt uit:

<img width="652" alt="DataQuery" src="https://user-images.githubusercontent.com/43337685/68883516-81199f80-0711-11ea-90ad-dbd05bb0e963.png">

## Features

- [x] Foto's geplot op een wereldkaart
- [ ] Klikken door de tijd, je ziet de verandering van de foto's
- [ ] Klikken op de foto's, je ziet de foto groot met een title en beschrijving 

## Bronnen
* [Clean Data](https://www.freecodecamp.org/news/the-junior-developers-guide-to-writing-super-clean-and-readable-code-cd2568e08aae/)
* [Functional Programming doc](https://docs.google.com/presentation/d/1ynCL4B4DyQ65V3cvjfZvbT2a9YrITbhUUUICoOjAP4c/edit#slide=id.g7081ab7627_0_38)
* [Introductie D3](https://d3js.org/#introduction)
* [YouTube tutorials D3 - 1](https://www.youtube.com/watch?v=-RQWC4I2I1s&list=PL9yYRbwpkykvOXrZumtZWbuaXWHvjD8gi&index=4)
* [YouTube tutorials D3 - 2](https://www.youtube.com/watch?v=IyIAR65G-GQ&list=PL9yYRbwpkykvOXrZumtZWbuaXWHvjD8gi&index=12)
* [D3 World Map - van Laurens](https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0)

## Credits
* Laurens, code van D3
* Manouk

## Wat ik heb geleerd
* Data opschonen
* SPARQL meer leren
* Werken met D3
* Meer javascript kennis
