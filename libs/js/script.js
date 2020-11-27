let northEast = L.latLng(84.7, 178);
let southWest = L.latLng(-84.7, -178);      
let bounds = L.latLngBounds(southWest, northEast);    //Defines bounds for map so it doesn't repeat and cause problems with coords out of correct range.
let mymap = L.map("mapid", {minZoom: 4, maxZoom: 15, worldCopyJump: true}).setView([51.5074, 0.1278], 7);    //Defines map and map marker.
let marker;
let border;

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





function onMapClick(e) {      //Handles clicking on the map.
    

    if (marker) {
        mymap.removeLayer(marker);
    }
    marker = new L.marker()
    .setLatLng(e.latlng.wrap())
    .addTo(mymap);
    

    

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
                if (countryName) {
                    
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
    $("#modalTitle").html(countryName);
    
    let countryFeature = findFeatureFromName(countryName);
    let lat;
    let lng;
    let capital;
    let countryCode = countryFeature["properties"]["iso_a2"];
    let flagURL = "https://www.countryflags.io/" + countryCode + "/shiny/64.png";
    $('#flag').attr('src', flagURL);

    if (countryName == "The Netherlands") {   //Janky fix for "(The) Netherlands" naming problem.
        countryName = "Netherlands";
    }
    console.log(countryFeature);


    $.ajax({            
        url: "libs/php/getBasicInfo.php",      //Gets info for general info section.
        type: "GET",
        dataType: "json",
        data: {
            countryCode: countryCode,
        },
        success: function(result) {

            if (result.status.name == "ok") {
                
                $("#region").html(result["data"]["continent"]);
                $("#subregion").html(result["data"]["subregion"]);
                $("#countryCode").html(countryCode);
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
        data: {
            countryName: countryName,
        },
        success: function(result) {

            if (result.status.name == "ok") {
                if (countryName == "India") {                   //Fix for weird india json entry in api.
                    capital = result["data"][1]["capital"];
                    $("#language").html(result["data"][1]["languages"][0]["name"]);
                    $("#capital").html(capital);
                    $("#population").html(result["data"][1]["population"].toLocaleString('en', {useGrouping:true}));
                    $("#currency").html(result["data"][1]["currencies"][0]["name"]);
                } else {
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
                console.log(result);
                
            }
                
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
        
    })



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
            
            if (border) {
                mymap.removeLayer(border);
            }
            border = new L.geoJSON(countryFeature["geometry"]).addTo(mymap);
            



        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}
   

    