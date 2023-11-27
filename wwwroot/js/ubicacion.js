let mapa = null;

let latitud = 19.541142;
let longitud = -96.9271873;

let latitudHome;
let longitudHome;
let transportesSelect = document.getElementById("Transporte");
let rutaCheck = document.querySelector("#Ruta");
let directionsRenderer = new google.maps.DirectionsRenderer();

//dibujar el mapa
function dibujaMapa() {
    mapa = $('#mapa').locationpicker({
        location: {latitude: latitud, longitude: longitud}, 
        radius: 300, 
        addressFormat: 'point_of_interest', 
        inputBinding: {
            latitudeInput: $('#Latitud'), 
            longitudeInput: $('#Longitud'), 
            locationNameInput: $('#Localizador')
        }, 
        enableAutocomplete: true, 
        enableReverseGeocode: true, 
        onchanged: function(currentLocation, radius, isMarkerDropped) {
            latitud = currentLocation.latitude;
            longitud = currentLocation.longitude;
            distancia();
        }
    });
}

function miUbicacion() {
    //obtiene el mapa
    let mapContext = mapa.locationpicker('map');
    //probamos el api de geolocalizacion
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitudHome = position.coords.latitude;
                longitudHome = position.coords.longitude;
                new google.maps.Marker({
                    position: {lat: latitudHome, lng: longitudHome}, 
                    map: mapContext.map, 
                    title: "Esta es tu ubicación actual", 
                    icon: "images/home.png"
                });
                distancia();
            }, 
            () => {
                $('#Distancia').val("La localización no está activada.");
            }
        );
    }
    else 
    {
        $('#Distancia').val("El navegador no soporta geolocalización.");
    }
}

//funcion para calcular distancia y tiempo
function distancia() {
    //obtiene el mapa
    let mapContext = mapa.locationpicker('map');

    //inicia los servicios para la distancia
    const service = new google.maps.DistanceMatrixService();
    const selectedMode = document.getElementById("Transporte").value;

    //petición para la distancia
    const origen = {lat: latitudHome, lng: longitudHome};
    const destino = {lat: latitud, lng: longitud};
    const request = {
        origins: [origen], 
        destinations: [destino], 
        travelMode: google.maps.TravelMode[selectedMode], 
        unitSystem: google.maps.UnitSystem.METRIC, 
        avoidHighways: false, 
        avoidTolls: false,
    };
    //distancia usando google matrix
    service.getDistanceMatrix(request).then((response) => {
        if(response.rows.length > 0) {
            $('#Distancia').val(response.rows[0].elements[0].distance.text);
            $('#Tiempo').val(response.rows[0].elements[0].duration.text);
        }
    });
    if (rutaCheck.checked) {
        const directionsService = new google.maps.DirectionsService();
        directionsRenderer.setMap(mapContext.map);

        directionsService
            .route({
                origin: origen,
                destination: destino,
                // Javascript nos permite acceder a la constante usando corchetes y un valor 
                // de cadena como la propiedad
                travelMode: google.maps.TravelMode[selectedMode],
            })
            .then((response) => {
                directionsRenderer.setDirections(response);
            });
    }else{
        directionsRenderer.setMap(null);
    }
}

// Calcula la distancia al cambiar de transporte
[transportesSelect,rutaCheck].forEach(item => {
    item.addEventListener("change", function () {
        distancia();
    });
});

// Se inicia cuando la página ha cargado por completo
$(function () {
    dibujaMapa();
    miUbicacion();
});