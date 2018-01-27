(function () {

    function toDM(degrees, pos, neg) {
        let positive = true;
        if (degrees < 0) {
            positive = false;
            degrees = -degrees;
        }

        let degreesFull = Math.floor(degrees);

        let minutes = 60 * (degrees - degreesFull);
        let minutesRounded = minutes.toFixed(3);

        if (minutesRounded === 60) {
            minutesRounded = "0.000";
            degreesFull += 1;
        }

        if (degreesFull < 10) {
            degreesFull = "0" + degreesFull;
        }

        if (minutesRounded < 10) {
            minutesRounded = "0" + minutesRounded;
        }

        return (degreesFull + "°" + minutesRounded + "'" + (positive ? pos : neg));
    }

    function formatDM(coords) {
        return `${toDM(coords.latitude, "N", "S")} ${toDM(coords.longitude, "E", "W")} (±${coords.accuracy.toFixed(0)}m)`;
    }


    if (document.getElementById("puraisu-form")) {

        document.getElementById("tz").value = moment.tz.guess();

        if (navigator && navigator.geolocation) {
            const coordsEl = document.getElementById("coordinates");
            const accInd = document.getElementById("accuracy");
            let indClass = "fa-spin";
            const searchClass = "fa-compass";
            const foundClass = "fa-location-arrow";
            const errorClass = "fa-exclamation-triangle";
            navigator.geolocation.watchPosition(pos => {
                const {latitude, longitude, accuracy, altitude, altitudeAccuracy} = pos.coords;
                coordsEl.value = JSON.stringify({latitude, longitude, accuracy, altitude, altitudeAccuracy});
                accInd.title = formatDM(pos.coords);
                accInd.classList.remove(searchClass, indClass);
                if (accuracy <= 10) {
                    indClass = "green";
                } else if (accuracy <= 50) {
                    indClass = "yellow";
                } else if (accuracy <= 1000) {
                    indClass = "orange";
                } else {
                    indClass = "red";
                }
                accInd.classList.add(foundClass, indClass);
            }, err => {
                console.error(err);
                coordsEl.value = "";
                accInd.title = err;
                accInd.classList.remove(foundClass, searchClass, indClass);
                indClass = "red";
                accInd.classList.add(errorClass);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            })
        }

        const typeInputs = Array.from(document.getElementsByClassName("type-input"));
        const customTypeInput = document.getElementById("customtype-input");
        const typeChanged = function (event) {
            if (event.target.id === "customtype") {
                customTypeInput.name = "type";
                customTypeInput.style.display = "inline";
                customTypeInput.required = true;
                typeInputs.forEach(i => i.name = "");
            } else {
                typeInputs.forEach(i => i.name = "type");
                customTypeInput.name = "";
                customTypeInput.value = "";
                customTypeInput.style.display = "none";
                customTypeInput.required = false;
                event.target.checked = true;
            }
        };
        typeInputs.forEach(e => e.addEventListener("click", typeChanged));

        const locationInputs = Array.from(document.getElementsByClassName("location-input"));
        const customLocationInput = document.getElementById("customlocation-input");
        const locationChanged = function (event) {
            if (event.target.id === "customlocation") {
                customLocationInput.name = "location";
                customLocationInput.style.display = "inline";
                customLocationInput.required = true;
                locationInputs.forEach(i => i.name = "");
            } else {
                locationInputs.forEach(i => i.name = "location");
                customLocationInput.name = "";
                customLocationInput.value = "";
                customLocationInput.style.display = "none";
                customLocationInput.required = false;
                event.target.checked = true;
            }
        };
        locationInputs.forEach(e => e.addEventListener("click", locationChanged));
    }
})();