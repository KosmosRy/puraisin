(function () {

    if (document.getElementById("puraisu-form")) {
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
                customLocationInput.style.display = "none";
                customLocationInput.required = false;
                event.target.checked = true;
            }
        };
        locationInputs.forEach(e => e.addEventListener("click", locationChanged));
    }
})();