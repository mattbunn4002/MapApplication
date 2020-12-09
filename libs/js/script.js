let northEast = L.latLng(84.7, 178);
let southWest = L.latLng(-84.7, -178);      
let bounds = L.latLngBounds(southWest, northEast);    //Defines bounds for map so it doesn't repeat and cause problems with coords out of correct range.
let mymap = L.map("mapid", {minZoom: 3, maxZoom: 15, worldCopyJump: true}).setView([51.5074, 0.1278], 7);    //Defines map and map marker.
let border;
let capitalCoords = [];

for (index in capitalCities) {
    
    let entry = [capitalCities[index]["CapitalName"], capitalCities[index]["CapitalLatitude"], capitalCities[index]["CapitalLongitude"]];
    capitalCoords.push(entry);
}


for (let i = 0; i < capitalCoords.length; i++) {
    marker = new L.marker([capitalCoords[i][1], capitalCoords[i][2]]).on("click", onMapClick)
      .bindPopup(capitalCoords[i][0])
      .addTo(mymap);
  }



L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxBounds: bounds,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWF0dGJ1bm40MDAyIiwiYSI6ImNraGo3aW5uNzFjcmQycm53dGZ4ZnU4enEifQ.nb0a39QcUywQy2WWHa-iJw'
}).addTo(mymap);




function findFeatureFromName(countryName) {
    let countryFeature = features.find((entry) => {
        return entry["properties"]["name"] == countryName;
    });
    return countryFeature;
}

function temperatureColorFunc(temp_c) {
    if (temp_c <= -20) {
        return "rgb(0,255,255)";
    } else if (temp_c <= 0) {
        return "rgb(0, 128, 255)";
    } else if (temp_c <= 10) {
        return "rgb(255,255,102)";
    } else if (temp_c <= 20) {
        return "rgb(255,200, 1)";
    } else if (temp_c <= 30) {
        return "rgb(255, 128, 0)";
    } else {
        return "rgb(204, 0, 0)";
    }
}

function articleDisplayFunc(articleArray) {
    if (articleArray[0]) {
        $("#articleOne").css("display", "block");
    } else {
        $("#articleOne").css("display", "none");
    }
    if (articleArray[5]) {
        $("#articleTwo").css("display", "block");
    } else {
        $("#articleTwo").css("display", "none");
    }
    if (articleArray[10]) {
        $("#articleThree").css("display", "block");
    } else {
        $("#articleThree").css("display", "none");
    }
}



function onMapClick(e) {      //Handles clicking on the map.
    
    if ((parseInt(window.innerWidth) <= 480) && ($("#modal").css("display") != "none")) {   
        $("#modal").fadeOut(200); 
        return;                                        //On mobile screens when tapping outside boundary of modal the modal should fade out.
    }

    $.ajax({            //AJAX call to php file that gets country name from openCage after providing the coords.
        url: "libs/php/getCountryNameFromCoords.php",
        type: "GET",
        dataType: "json",
        data: {
            lat: e.latlng["lat"],
            lng: e.latlng["lng"],
            
        },
        success: function(result) {
            

            if (result.status.name == "ok") {
                
                let countryName = result["data"]["results"][0]["components"]["country"];
                updateModal(countryName);
                addCountryBorder(countryName);
                if (findFeatureFromName(countryName)) {
                    
                    $("#innerSelect").val(countryName);
                    $("#modal").fadeIn(200);
                }
                
            }
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}

$("#modalCross").on("click", () => {     //Functionality for back button in modal
    $("#modal").fadeOut(200);
})


mymap.on("click", onMapClick);    //Binds onMapClick to click events on the map.


function updateModal(countryName) {   /* Changes the content of the modal (does not make it fade in) */
    
    
    let countryFeature = findFeatureFromName(countryName);
    if (!countryFeature) {
        return;
    }
    $("#modalTitle").html(countryName);
    let lat;
    let lng;
    let capital;
    let currencyCode;
    let countryCodeISO2 = countryFeature["properties"]["iso_a2"];
    let countryCodeISO3 = countryFeature["properties"]["iso_a3"];
    let flagURL = "libs/img/flags/flags/48/" + countryName + ".png";
    $('#flag').attr('src', flagURL);

    if (countryName == "The Netherlands") {   //Janky fix for "(The) Netherlands" naming problem.
        countryName = "Netherlands";
    }
    if (countryName == "Democratic Republic of the Congo" || countryName == "Republic of the Congo") {    
        countryName = "Congo";            //Fix for problems caused by congo being named different things in different apis.
    }
    if (countryName == "South Korea") {
        countryName = "Korea (Republic of)";
    }
    if (countryName == "North Korea") {
        countryName = "Korea (Democratic People's Republic of)";
    }
    


    $.ajax({            
        url: "libs/php/getBasicInfo.php",      //Gets info for general info section.
        type: "GET",
        async: false,
        dataType: "json",
        data: {
            countryCode: countryCodeISO2,
        },
        success: function(result) {
           
            if (result.status.name == "ok") {
                
                $("#region").html(result["data"]["continent"]);
                $("#subregion").html(result["data"]["subregion"]);
                $("#countryCode").html(countryCodeISO2);
                $("#nationality").html(result["data"]["nationality"]);
                $("#weekStart").html(result["data"]["start_of_week"]);
                lat = result["data"]["geo"]["latitude"];
                lng = result["data"]["geo"]["longitude"];
                
            }
                
        }
    })
    

    $.ajax({            
        url: "libs/php/getMoreBasicInfo.php",                   //Gets more info for general info section.
        type: "GET",
        dataType: "json",
        async: false,
        data: {
            countryName: countryName,
        },
        success: function(result) {
            

            if (result.status.name == "ok") {
                
                if (countryName == "India" || countryName == "South Korea") {                   //Fix for weird india json entry in api.
                    capital = result["data"][1]["capital"];
                    currencyCode = result["data"][1]["currencies"][0]["code"];
                    $("#language").html(result["data"][1]["languages"][0]["name"]);
                    $("#capital").html(capital);
                    $("#population").html(result["data"][1]["population"].toLocaleString('en', {useGrouping:true}));
                    $("#currency").html(result["data"][1]["currencies"][0]["name"]);
                } else {
                    currencyCode = result["data"][0]["currencies"][0]["code"];
                    capital = result["data"][0]["capital"];
                    $("#language").html(result["data"][0]["languages"][0]["name"]);
                    $("#capital").html(capital);
                    $("#population").html(result["data"][0]["population"].toLocaleString('en', {useGrouping:true}));
                    $("#currency").html(result["data"][0]["currencies"][0]["name"]);
                }
            }
                
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
        
    });
    $.ajax({            
        url: "libs/php/getExchangeRate.php",      //Gets exchange rate.
        type: "GET",
        async: false,
        dataType: "json",
        data: {
            
        },
        success: function(result) {
           
            if (result.status.name == "ok") {
                let exchangeRate = result["data"]["rates"][currencyCode];
                $("#exchangeRate").html(exchangeRate);
            }
                
        }
    })
    

    $.ajax({            
        url: "libs/php/getWeatherInfo.php",              //Gets weather info for weather info section.
        type: "GET",
        dataType: "json",
        data: {
            capital: capital,
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                
                $("#weatherCapital").html(capital);
                $("#condition").html(result["data"]["current"]["condition"]["text"]);
                $("#conditionImg").attr("src", result["data"]["current"]["condition"]["icon"]);
                $("#temp").html(result["data"]["current"]["temp_c"]);
                $("#tempSymbol").css("color", temperatureColorFunc(result["data"]["current"]["temp_c"]));
                $("#windSpeed").html(result["data"]["current"]["wind_mph"]);
                $("#humidity").html(result["data"]["current"]["humidity"]);
                $("#humidity").attr("value", result["data"]["current"]["humidity"]);
                $("#windDir").html(result["data"]["current"]["wind_dir"]);
                $("#feelsLike").html(result["data"]["current"]["feelslike_c"]);
                $("#feelsLikeSymbol").css("color", temperatureColorFunc(result["data"]["current"]["feelslike_c"]));
                $("#vis").html(result["data"]["current"]["vis_miles"]);
                $("#pressure").html(result["data"]["current"]["pressure_mb"]);
                $("#precip").html(result["data"]["current"]["precip_mm"]);
                if (result["data"]["current"]["is_day"] == 1) {
                    $("#isDay").attr("src", "libs/img/tick.png");
                } else {
                    $("#isDay").attr("src", "libs/img/redCross.png");
                }
            }
                
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
        
    });

    $.ajax({            
        url: "libs/php/getTimezoneInfo.php",              //Gets timezone info for timezone info section.
        type: "GET",
        dataType: "json",
        data: {
            lat: lat,
            lng: lng
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                $("#timezoneCapital").html(capital);
                $("#localTime").html(result["data"]["time"]);
                $("#timezoneId").html(result["data"]["timezoneId"]);
                $("#gmtOffset").html(result["data"]["gmtOffset"]);
                $("#sunrise").html(result["data"]["sunrise"]);
                $("#sunset").html(result["data"]["sunset"]);
            }
                
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
        
    });

    
    
    

    $.ajax({            
        url: "libs/php/getNewsInfo.php",              //Gets news info for news section.
        type: "GET",
        dataType: "json",
        data: {
            capital: capital
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                
                

                articleDisplayFunc(result["data"]["articles"]);
                if (result["data"]["articles"][0]) {
                    $("#articleOneTitle").html(result["data"]["articles"][0]["title"]);
                    $("#articleOneAuthor").html(result["data"]["articles"][0]["author"]);
                    $("#articleOneLink").attr("href", result["data"]["articles"][0]["url"]);
                    $("#articleOneLink").html(result["data"]["articles"][0]["url"]);
                    $("#articleOneContent").html(result["data"]["articles"][0]["description"]);
                    $("#articleOneImg").attr("src", result["data"]["articles"][0]["urlToImage"]);

                    if (result["data"]["articles"][5]) {
                        $("#articleTwoTitle").html(result["data"]["articles"][5]["title"]);
                        $("#articleTwoAuthor").html(result["data"]["articles"][5]["author"]);
                        $("#articleTwoLink").attr("href", result["data"]["articles"][5]["url"]);
                        $("#articleTwoLink").html(result["data"]["articles"][5]["url"]);
                        $("#articleTwoContent").html(result["data"]["articles"][5]["description"]);
                        $("#articleTwoImg").attr("src", result["data"]["articles"][5]["urlToImage"]);
                    
                        if (result["data"]["articles"][8]) {
                            $("#articleThreeTitle").html(result["data"]["articles"][10]["title"]);
                            $("#articleThreeAuthor").html(result["data"]["articles"][10]["author"]);
                            $("#articleThreeLink").attr("href", result["data"]["articles"][10]["url"]);
                            $("#articleThreeLink").html(result["data"]["articles"][10]["url"]);
                            $("#articleThreeContent").html(result["data"]["articles"][10]["description"]);
                            $("#articleThreeImg").attr("src", result["data"]["articles"][10]["urlToImage"]);
                        }   
                    }
                }
            }
                
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            
        }
        
    });


    $.ajax({            //Gets weather info for weather info section.
        url: "libs/php/getForecastInfo.php",              
        type: "GET",
        dataType: "json",
        data: {
            capital: capital,
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                $("#tomorrowDate").html(tomorrow.toDateString());
                $("#fConditionImg").attr("src", result["data"]["forecast"]["forecastday"][1]["day"]["condition"]["icon"]);
                $("#fAvTemp").html(result["data"]["forecast"]["forecastday"][1]["day"]["avgtemp_c"]);
                $("#fAvTempSymbol").css("color", temperatureColorFunc(result["data"]["forecast"]["forecastday"][1]["day"]["avgtemp_c"]));
                $("#fMaxTemp").html(result["data"]["forecast"]["forecastday"][1]["day"]["maxtemp_c"]);
                $("#fMaxTempSymbol").css("color", temperatureColorFunc(result["data"]["forecast"]["forecastday"][1]["day"]["maxtemp_c"]));
                $("#fCapital").html(capital);
                $("#fHumidity").html(result["data"]["forecast"]["forecastday"][1]["day"]["avghumidity"]);
                $("#fHumidity").attr("value", result["data"]["forecast"]["forecastday"][1]["day"]["avghumidity"]);
                $("#rainChance").html(result["data"]["forecast"]["forecastday"][1]["day"]["daily_chance_of_rain"]);
                $("#rainChance").attr("value", result["data"]["forecast"]["forecastday"][1]["day"]["daily_chance_of_rain"]);
                $("#snowChance").html(result["data"]["forecast"]["forecastday"][1]["day"]["daily_chance_of_snow"]);
                $("#snowChance").attr("value", result["data"]["forecast"]["forecastday"][1]["day"]["daily_chance_of_snow"]);
            }
                
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
        
    });


}





let features;
let countryList = [];

/* AJAX call to retrieve country names from countryBorders.geo.json for select in navbar */
$(document).ready( () => {
    
    if ("geolocation" in navigator) {
        const geoLocation = navigator.geolocation.getCurrentPosition((position) => {
            
            mymap.panTo(new L.LatLng(position["coords"]["latitude"], position["coords"]["longitude"], ))
        });
        
    } 

    $.ajax({
        url: "libs/countryBorders.geo.json",
        type: "GET",
        dataType: "json",
        data: {
        },
        success: function(result) {
            
                $("#innerSelect").html(function() {
                    let newHTML = "<option id='firstOption'>Country List ▿</option>";
                    features = result["features"];
                    

                    for (let i=0; i < features.length; i++) {
                        countryList.push(features[i]["properties"]["name"]);
                    }
                    
                    countryList.sort();  /* makes the country list alphabetical */

                    for (index in countryList) {
                        let country = countryList[index];
                        
                        
                        let nextOption = "<option value= '"+ country + "' >" + countryList[index] + "</option>";
                        newHTML += nextOption;
                        
                    }
                    return newHTML;

                }
                    
                    );

                
                
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
                                                        //Add another ajax call here that finds coords of all capital cities and put them in an array

})




$("#innerSelect").on("change", () => {     //Handles changing the country select.
    addCountryBorder($("#innerSelect").val());  /* Calls function that adds country border to map */
    
    $("#modal").fadeIn(200);                //Makes modal appear.
    updateModal($("#innerSelect").val());   //Updates modal content.

    $.ajax({                              /* AJAX call that retrieves central coords (to recentre at) from a given country name */
        url: "libs/php/getCoordsFromCountryName.php",
        type: "GET",
        dataType: "json",
        data: {
            countryName: $("#innerSelect").val(),
            
        },
        success: function(result) {

            

            if (result.status.name == "ok") {
                
                mymap.panTo(new L.LatLng(result["data"][0]["geometry"]["lat"] , result["data"][0]["geometry"]["lng"]))
                
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
           console.log(errorThrown);
        }
            

})
});


/* Function responsible for adding border to a given country */
function addCountryBorder(countryName) {
    
    $.ajax({
        url: "libs/countryBorders.geo.json",
        type: "GET",
        dataType: "json",
        data: {
            
        },
        success: function(result) {
            let features = result["features"];

            let countryFeature = findFeatureFromName(countryName);
            if (!countryFeature) {
                return;
            }
            if (border) {
                mymap.removeLayer(border);
            }
            border = new L.geoJSON(countryFeature["geometry"], {
                style: {
                color: "black",
                
                }
            }
                ).addTo(mymap);
            
            mymap.panTo(border.getBounds().getCenter());
            mymap.fitBounds(border.getBounds());


        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}
   

    