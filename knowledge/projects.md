# Projektit

## AI-CV-chatbot

Ville rakensi omaan CV-sivustoonsa AI-chatbotin, jonka avulla vierailija voi kysyä hänen työkokemuksestaan, koulutuksestaan, projekteistaan ja teknologioistaan.

Käyttöliittymä on toteutettu HTML:llä, CSS:llä ja JavaScriptillä. Selain lähettää viestin Azure Static Web Appsin `/api/chat`-rajapintaan. Azure Function välittää pyynnön API-avaimella suojatulle Ollama Proxy -palvelulle. Tailscale Funnel välittää HTTPS-pyynnön Villen omalla Windows-koneella toimivalle proxylle, joka kutsuu paikallista Ollamaa ja `villebot`-mallia. Vastaus kulkee samaa reittiä takaisin selaimelle. Ollamaa ei julkaista suoraan internetiin.

Projekti yhdistää käyttöliittymän, HTTP-rajapinnan, Azure Functions -taustapalvelun, salaisuuksien palvelinpuolisen käsittelyn, paikallisen AI-mallin ja GitHub Actions -julkaisun.

## NuortenRiksu

WordPressillä ja Xamarin.Formsilla toteutettu Android- ja iOS-sovellus. Projektiin kuului Riihimäen kaupungin Liikkuvakoulu-hankkeen mobiilisovelluksen ja verkkosivuston kehittäminen ja toteutus.

## DigiSport

Kouluprojektina suunniteltu ja toteutettu Xamarin.Forms-mobiilisovellus liikkumisen kirjaamiseen Google Mapsin avulla. CV:n mukaan sovellus kohdistui Androidille ja iOS:lle.

## Muita asiakas- ja verkkotöitä

CV listaa WordPressin modernisointia TeleVicon Oy:lle, yhteydenottolomakkeen laskurin Selectial Finance Oy:lle, ASP.NET Core -työtä Bouncy Oy:lle, sisällöntuotantoa Offlex Oy:lle, hakukoneoptimointia Vantaanmusiikki Oy:lle, WordPress-sivuston Cyber Solutions Oy:lle, Shopify-verkkokaupan Neeta Oy:lle sekä WordPress-verkkokaupan muokkausta Luxtierille.

CV mainitsee myös Ravintola Mallaskasken WordPress-verkkokaupan ja lisäosien ohjelmoinnin sekä verkkosivuston muuntamisen Google Play -kauppaan julkaistavaksi mobiilisovellukseksi. Vitabalans Oy:lle tehtiin WordPress-sivustojen ylläpitoa ja vanhojen sivujen modernisointia.
