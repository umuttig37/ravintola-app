# Umut's Mylly Bistro - Ravintola Web projekti (koulutehtävä)

Tämä projekti toteuttaa ravintola menuja, ostamiselle, 
hsl lähtöille metropolian kampukselta ja paljon muuta web sovelluksen (vanilla JS + Node/Express + SQLite).

## Ylläpidon tunnukset
- Sähköposti: admin@ravintola.local
- Salasana: admin123

## Ominaisuudet
- Päivän ruokalista Sodexon API:sta
- HSL-lähdöt kartalla + lista lähdöistä
- Kaksikielisyys (fi/en) oikean yläkulman kielipainikkeella
- Tiedotteet etusivulla + hallinnassa muokattavissa

## Tiedotteet
- Oletusdata: `server/data/news.json`
- Hallinnassa lisäys/poisto tallentaa tiedostoon

## API-rajapinnat
- Päivän ruokalista: `https://www.sodexo.fi/ruokalistat/output/daily_json/158/YYYY-MM-DD`
- HSL GraphQL: `https://api.digitransit.fi/routing/v2/hsl/gtfs/v1`
