let ValidationModule = (() => {
    let PublicData = {};

    /**
     * This function is used to check if the date or the sol the user inserted is within
     * a valid range of values.
     * returns bool
     */

    const onlyChars = function (kind) {
        const name = document.getElementById(`${kind}`).value.trim();

        const valid = /^[a-zA-Z]+$/.test(name) && name !== "";

        if (valid) { // good name
            document.getElementById(`${kind}Invalid`).classList.add("d-none"); // remove the error
            return true;
        }// else, invalid
        document.getElementById(`${kind}Invalid`).classList.remove("d-none");
        return false; // display error

    };

    const isMatching = function (pw1, pw2){
        if (pw1 === pw2){
            document.getElementById("notMatchingPassword").classList.add("d-none"); // remove the error
            return true;
        }// else, invalid
        document.getElementById("notMatchingPassword").classList.remove("d-none");
        return false; // display error

    }

    const isLongEnough = function (pw1, pw2){
        const LENGTH = 8;
        if (pw1.length == LENGTH && pw2.length == LENGTH){
            document.getElementById("shortPassword").classList.add("d-none"); // remove the error
            return true;
        }// else, invalid
        document.getElementById("shortPassword").classList.remove("d-none");
        return false; // display error

    }


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// a function which calls the two other functions above, and returns if the data was valid
    PublicData.validateRegistrationForm = function (form) {

        const v1 = form.checkValidity();
        const v2 = onlyChars("firstName");
        const v3 = onlyChars("lastName");
        // NOT EMPTY


        return v1 && v2 && v3;
    };

    PublicData.validatePasswordForm = function (form) {

        const v1 = form.checkValidity();

        // NO TRIM HERE as " " is a legit character for password!
        const pw1 = document.getElementById("pass1").value;
        const pw2 = document.getElementById("pass2").value;

        const v2 = isMatching(pw1, pw2);
        const v3 = isLongEnough(pw1, pw2);


        return v1 && v2 && v3;
    };

    return PublicData;
})();

document.addEventListener('DOMContentLoaded', function () {


    let registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (event) {

            event.preventDefault(); // no annoying refresh

            if (!ValidationModule.validateRegistrationForm(registrationForm)) {// validation failed
                event.stopPropagation();
            } else { // succeed
                const email = document.getElementById("email").value.trim().toLowerCase();

                fetch(`/api/users/${email}`)
                    .then((res) => {
                        return res.json()
                    }).then((data) => {
                    if (data["found"]) {
                        document.getElementById(`emailInvalid`).classList.remove("d-none");

                    } else {
                        document.getElementById(`emailInvalid`).classList.add("d-none");
                        registrationForm.submit()
                    }
                }).catch((d) => {
                    console.log("in catch")
                })
            }

            registrationForm.classList.add('was-validated');
        }, false);
    }


    let passwordsForm = document.getElementById('choosePassword');
    if (passwordsForm) {
        passwordsForm.addEventListener('submit', function (event) {

            event.preventDefault(); // no annoying refresh

            if (!ValidationModule.validatePasswordForm(passwordsForm)) {// validation failed
                event.stopPropagation();
            } else { // succeed

                passwordsForm.submit()

            }

            passwordsForm.classList.add('was-validated');
        }, false);
    }


});