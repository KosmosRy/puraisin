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
        return `${toDM(coords.latitude, "N", "S")} ${toDM(coords.longitude, "E", "W")} (±${coords.accuracy})`;
    }


    if (document.getElementById("puraisu-form")) {

        if (navigator && navigator.geolocation) {
            const coordsEl = document.getElementById("coordinates");
            const accInd = document.getElementById("accuracy");
            navigator.geolocation.watchPosition(pos => {
                const {latitude, longitude, accuracy} = pos.coords;
                coordsEl.value = `${latitude},${longitude}±${accuracy}`;
                accInd.title = formatDM(pos.coords);
                if (accuracy <= 10) {
                    accInd.className = "green";
                } else if (accuracy <= 50) {
                    accInd.className = "yellow";
                } else {
                    accInd.className = "red";
                }
            }, err => {
                console.error(err);
                coordsEl.value = "";
                accInd.className = "red";
                accInd.title = "ei paikkatietoja";
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