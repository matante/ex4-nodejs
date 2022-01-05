const APIKEY = "GlDtOhfxcpLXGEcCNa7VXgCchnlAJXIpFigptnse";
/**
 * This is the main closure of the program.
 * It defines sub-closures.
 * The program lets the user get photos from NASA, which were taken by rovers and cameras.
 */
(function () {
    "use strict";

    /**
     * This simple module is used to pop a modal in the website.
     */
    let ModalsModule = (() => {
        let PublicData = {};

        /**
         * A function which receive information and shows it as a modal.
         * @param modalOuterTitle - The text which will be shown at the top
         * @param modalInnerTitle - the inner title of the modal
         * @param modalInnerText - the text itself
         */
        PublicData.popAModal = function (modalOuterTitle, modalInnerTitle, modalInnerText) {
            let myModal = new bootstrap.Modal(document.getElementById("myModals"), {});
            document.getElementById("modalOuterTitle").innerText = `${modalOuterTitle}`;
            document.getElementById("modalInnerTitle").innerText = `${modalInnerTitle}`;
            document.getElementById("modalInnerText").innerText = `${modalInnerText}`;
            myModal.show();
        };

        return PublicData;
    })(); // end of ModalsModule

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     * A module which is used to fetch data, be it API, images and so on, and grab information
     * from the input area of the html and deliver it to JavaScript
     */
    let DataFetcher = (() => {
        let PublicData = {};

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /**
         * A boolean function which tells if a connection was successful
         * @param response - a promise as returned from a fetch()
         * @returns {boolean} - true if succeed, false otherwise
         */
        const received = function (response) {
            return response.status >= 200 && response.status < 300;
        };

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /**
         * An async function, which is used to fetch information and return it as json.
         * @param url - the url of the site we want to access
         * @param extraParameters - queries, such as date camera etc
         * @returns {Promise<any>} - a promise in the json format, or error if failed
         */
        PublicData.getJSON = async function (url, extraParameters) {

            // attach all the extra parameters into one string with & between queries
            let esc = encodeURIComponent;
            let query = Object.keys(extraParameters)
                .map(k => esc(k) + '=' + esc(extraParameters[k]))
                .join('&');

            url += `${query}`; // insert in the end of the url

            const response = await fetch(url, {method: "get", extraParameters});

            if (received(response)) {
                return Promise.resolve(response.json());
            } else {
                return Promise.reject(new Error(response.statusText));
            }

        };

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /* The next functions used to get information from the html dom*/
        PublicData.getDateOrSol = function () {
            return document.getElementById("dateValidation").value.trim();
        }; // grab the information from the date or sol text input

        PublicData.getRoverName = function () {
            const roverOptions = document.getElementById("ValidationRover").options;
            return roverOptions[roverOptions.selectedIndex].innerText; // get the selected option
        };

        PublicData.getCameraName = function () {
            const cameraOptions = document.getElementById("ValidationCamera").options;
            return cameraOptions[cameraOptions.selectedIndex].innerText.split(" (")[0]; // only the first word
        };

        return PublicData;
    })();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     * This module is used to validate the information given and make sure everything is running smoothly
     */
    let ValidationModule = (() => {
        let PublicData = {};

        // check if the user filled all fields of the form
        const filledAllFields = function (form) {
            return form.checkValidity();
        };
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        /**
         * This function is used to check if the date or the sol the user inserted is within
         * a valid range of values.
         * returns bool
         */
        const validDate = function () {
            const rover = DataFetcher.getRoverName();
            let date = DataFetcher.getDateOrSol();

            if (date.includes("-")) { // in the date format ==> is a date and not a sol
                // get the range of the mission
                const start = ManifestSModule.landingDateOf(rover).split("-");
                const end = ManifestSModule.maxDateOf(rover).split("-");
                date = date.split("-");

                // make a Date variable
                const starting = new Date(start[0], parseInt(start[1]) - 1, start[2]);
                const ending = new Date(end[0], parseInt(end[1]) - 1, end[2]);
                const toCheck = new Date(date[0], parseInt(date[1]) - 1, date[2]);

                const valid = starting <= toCheck && toCheck <= ending;

                if (valid) { // in the right range
                    document.getElementById("invalidDateOrSol").classList.add("d-none"); // remove the error
                    return true;
                }// else, invalid
                document.getElementById("invalidDateOrSol").classList.remove("d-none");
                return false; // display error

            } else { // is a sol and not a date
                // get the sol of the mission
                const maxSol = ManifestSModule.maxSolOf(rover);
                return 0 <= date && date <= maxSol;
            }
        };

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // a function which calls the two other functions above, and returns if the data was valid
        PublicData.validateForm = function (form) {
            return filledAllFields(form) && validDate();
        };

        return PublicData;
    })();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /*
    * This module is used to hold the information regarding any of the missions, so we can fetch
    * the information only one time and then access it quickly
    */
    let ManifestSModule = (() => {
        let PublicData = {};

        /**
         * a class which holds information regarding a mission
         * @type {Manifest}
         */
        let Manifest = class Manifest {
            constructor(mission, landing_date, max_date, max_sol) {
                this.Mission = mission; // same as rover
                this.Landing_Date = landing_date;
                this.Max_Date = max_date;
                this.Max_Sol = max_sol;
            }
        };

        let manifests = []; // an array of all the missions

        /**
         * a function which is used to fetch the information from NASA site and insert it into
         * a Manifest object, and insert these objects into an array
         */
        (function () {
            for (let manifest of ["Curiosity", "Opportunity", "Spirit"]) { // the missions
                const url = `https://api.nasa.gov/mars-photos/api/v1/manifests/${manifest}?`;

                DataFetcher.getJSON(url, {api_key: APIKEY})
                    .then(data => { // data is now in json format
                        // get the information
                        const landingDate = data["photo_manifest"]["landing_date"];
                        const maxData = data["photo_manifest"]["max_date"];
                        const maxSol = data["photo_manifest"]["max_sol"];
                        // make a new Manifest and push it to the array
                        manifests.push(new Manifest(manifest, landingDate, maxData, maxSol));
                    }).catch(() => { // failed
                    ModalsModule.popAModal("Network Error", "No Internet Connection",
                        "Seems you are not connected to the internet. You can not use this site without internet connection. Make sure you have a valid connection and try again.");
                });
            } // end of for

        })(); // end of function

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        /**
         * used to return a specific mission
         * @param rover - the name of the mission
         * @returns {*} // the details about the dates of that mission
         */
        const findRover = function (rover) {
            for (let manifest of manifests) {
                if (manifest.Mission === rover) {
                    return manifest;
                }// we assume the name is right
            }
        }; // end of function

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // all these function used to return the specific information regarding a specific mission, as received in "rover"
        PublicData.landingDateOf = function (rover) {
            return findRover(rover).Landing_Date;
        };
        PublicData.maxDateOf = function (rover) {
            return findRover(rover).Max_Date;
        };
        PublicData.maxSolOf = function (rover) {
            return findRover(rover).Max_Sol;
        };


        return PublicData;

    })();


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /*
    * This module is used to hold information regarding photos
    */
    let PhotosModule = (() => {
        let PublicData = {};

        /*
        * define a class Photo which holds information regarding a specific photo
        */
        let Photo = class Photo {
            constructor(id, date, sol, camera, mission, url) {
                this.ID = id;
                this.Earth_Date = date;
                this.Sol = sol;
                this.Camera = camera;
                this.Mission = mission;
                this.url = url;
            }
        }; // end of class

        let currentSearchPhotos = [];

        let savedPhotos = []; // holds all the photos that the user saved

        const isAlreadySaved = function (otherID) { // avoid double saving
            for (let photo of savedPhotos) {
                if (photo.ID === otherID)
                    return true;
            }
            return false;
        };


        PublicData.displaySearchResult = function () {
            currentSearchPhotos = []; // for each search
            let spinner = document.getElementById("spinner"); // loading symbol
            spinner.classList.remove("d-none");

            const rover = DataFetcher.getRoverName(); // get it from the html
            const camera = DataFetcher.getCameraName();
            const date = DataFetcher.getDateOrSol();

            const myParams = { // will be sent later with a fetch request
                api_key: APIKEY,
            };

            date.includes("-") ? // is in date format or is a sol
                myParams.earth_date = date : myParams.sol = date;


            let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?`;
            DataFetcher.getJSON(url, myParams)  // fetch
                .then((returnedAPI) => { // succeed, add to the html

                    let html = "";
                    let placeToAdd = document.getElementById("searchResults");

                    for (let photo of returnedAPI["photos"]) { // go over all of the photos from this search
                        if (photo["camera"]["name"] === camera) { // same camera as read from user
                            const id = photo["id"];
                            const earth_date = photo["earth_date"]; // may be different than "date" from earlier as before could be sol
                            const sol = photo["sol"];
                            const url = photo["img_src"];

                            // add a photo to the array
                            currentSearchPhotos.push(new Photo(id, earth_date, sol, camera, rover, url));

                            // make the inner html according to the current photo
                            html +=
                                `<div class="col-6 col-md-5 col-lg-3">
                                    <div class="card" pt-3 id="${id}" style="width: 18rem;">
                                        <img src=${url} class="card-img-top" alt="A photo from Mars">
                                        <div class="card-body">
                                            <p class="card-text">Earth date: ${earth_date}</p>
                                            <p class="card-text">Sol: ${sol}</p>
                                            <p class="card-text">Camera: ${camera}</p>
                                            <p class="card-text">Mission: ${rover}</p>
                                            <button type="button" class="btn btn-save btn-info" >Save</button>
                                            <a href=${url} class="btn btn-primary btn-outline-secondary text-white" target="_blank">Full size</a>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                                <div class="col-md-1"></div>`;
                        } // end of if ("photo handler")
                    } // end of for

                    if (!currentSearchPhotos.length) { // no results
                        html = `<p>Search yielded no results, try different parameters :)</p>`;
                    }

                    placeToAdd.innerHTML = html;

                    spinner.classList.add("d-none"); // remove the loading gif
                    connectSaveButtons(); // after all the photos are ready, need to connect the buttons


                }).catch(() => { // failed, no api returned
                ModalsModule.popAModal("Network Error", "Could not retrieve data", "NASA servers are not available right now, please try again later.");
                spinner.classList.add("d-none"); // remove the loading gif

            });

        }; // end of function

        // gets a photo and an id, and adds it to the saved list and to the carousel
        const addToSavedPhotos = function (photo, id) {
            addPhotoToList(photo, id);
            addPhotoToCarousel(photo, id);
        };

        // add a photo to the saved list
        const addPhotoToList = function (photo, id) {

            let savedArea = document.getElementById("savedPhotosList");
            document.getElementById("empty").innerText = "";

            let res = `<ol start="${id + 1}">`;

            res += `<li><a href=${photo.url} target="_blank">Image ID: ${photo.ID}</a><br>
                        Earth date: ${photo.Earth_Date}, Sol: ${photo.Sol}, Camera: ${photo.Camera}</li>`;

            res += `</ol>`;
            savedArea.innerHTML += res;

        } // end of function


        // add a photo from the saved list to the carousel
        const addPhotoToCarousel = function (photo, id) {
            let carouselIDS = document.getElementById("carouselIDS");

            carouselIDS.innerHTML += `<button type="button" data-bs-target="#carousel" data-bs-slide-to="${id}" ${id != 0 ? "" : `class="active"`}aria-current="true" aria-label="${photo.ID}"></button>`;

            let carouselInner = document.getElementById("carouselInner");
            carouselInner.innerHTML +=
                `<div class="carousel-item ${id != 0 ? "active" : ""}active">
                    <img src="${photo.url}" class="d-block w-100" alt="${photo.ID}">
                    <div class="carousel-caption d-none d-md-block">
                        <h3>Photo ${photo.ID} </h3>
                        <h5>Taken by ${photo.Camera} during the ${photo.Mission} mission in ${photo.Earth_Date}.</h5>
                        <a href=${photo.url} class="btn btn-primary btn-outline-secondary text-white" target="_blank">Full size</a>
                    </div>
                </div>`;

        }; // end of function

        // this function is used to connect the save buttons with an event
        const connectSaveButtons = function () {
            const buttons = document.getElementsByClassName("btn-save");

            for (let button of buttons) {

                button.addEventListener("click", function () {

                    const currButtonID = Number(button.parentElement.parentElement.attributes["id"].value); // convert to int
                    if (isAlreadySaved(currButtonID)) {
                        ModalsModule.popAModal("Invalid action", "Duplicated photo", "This photo is already saved earlier. You can not save a photo more than one time");
                    } else { //  need to add to the list

                        for (let photo of currentSearchPhotos) {
                            if (photo.ID === currButtonID) { // found the right photo
                                savedPhotos.push(photo); // add it to the saved photo array
                                addToSavedPhotos(photo, savedPhotos.indexOf(photo)); // and to the list and carousel
                                break; // no need to search rest of the array
                            } // of if
                        } // of photos for
                    }// of else

                    // buttons to modify start/stop slide show, theses code lines are here because otherwise the async function cancels it
                    let startShow = document.getElementById("startShow");
                    startShow.addEventListener("click", function () {
                        document.getElementById("carousel").classList.remove("d-none");
                    });

                    let stopShow = document.getElementById("stopShow");
                    stopShow.addEventListener("click", function () {
                        document.getElementById("carousel").classList.add("d-none");
                    });
                }); // of listener
            } // of buttons for
        }; // of function

        return PublicData;
    })();


    document.addEventListener('DOMContentLoaded', (event) => { // wait for page to load

        let form = document.getElementById('inputForm');
        form.addEventListener('submit', function (event) {

            event.preventDefault(); // no annoying refresh
            if (!ValidationModule.validateForm(form)) { // validation failed
                event.stopPropagation();
            } else { // succeed
                PhotosModule.displaySearchResult();
            }

            form.classList.add('was-validated');
        }, false);


        let reset = document.getElementById("resetBtn");
        reset.addEventListener("click", function () {
            document.getElementById("inputForm").reset();
            document.getElementById("searchResults").innerHTML = "";
            form.classList.remove('was-validated');
        });

        let whoAmI = document.getElementById("whoAmI");
        whoAmI.addEventListener("click", function () {
            ModalsModule.popAModal("About me", "Matan Tenenboim", "matante@edu.hac.ac.il");
        });

    });


})();
