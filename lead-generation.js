// [ VARIABLES ]
let currentQuestion = 0;
let totalQuestions = $(".lead-gen_question").length - 1;

// [ FIRST ]
// Check for parameters to populate the fields
let urlParams = getURLParameters();
if (urlParams["Email"]) {
    $("#your-email").val(urlParams["Email"]);
    $("[type=email]").val(urlParams["Email"]);
    // Skip first slide if email exists
    $(".lead-gen_form-next").click();
    currentQuestion++;
}




































let input = document.querySelector("#phone-number"),
        dialCode = document.querySelector(".dial-code"),
        errorMsg = document.querySelector("#lead-gen-invalid-number"),
        validMsg = document.querySelector("#lead-gen-valid-number");

    let iti = intlTelInput(input, {
        initialCountry: "auto",
        geoIpLookup: function (callback) {
            fetch("https://ipapi.co/json")
                .then(function (res) { return res.json(); })
                .then(function (data) { callback(data.country_code); })
                .catch(function () { callback("us"); });
        },
        placeholderNumberType: "MOBILE",
        separateDialCode: true
    });

    let updateInputValue = function (event) {
        dialCode.value = "+" + iti.getSelectedCountryData().dialCode;
    };
    input.addEventListener("input", updateInputValue, false);
    input.addEventListener("countrychange", updateInputValue, false);

    let errorMap = [
        "Valid number",
        "Invalid country code",
        "Number is to short",
        "Number is to long",
        "Invalid number",
        "Invalid length",
    ];

    let reset = function () {
        input.classList.remove("error");
        errorMsg.innerHTML = "";
        errorMsg.classList.add("hide");
        validMsg.classList.add("hide");
    };

    input.addEventListener("blur", function () {
        reset();
        if (input.value.trim()) {
            if (iti.isValidNumber()) {
                dialCode.value =
                    "+" + iti.getSelectedCountryData().dialCode + input.value;
                validMsg.classList.remove("hide");
            } else {
                input.classList.add("error");
                let errorCode = iti.getValidationError();
                errorMsg.innerHTML = errorMap[errorCode];
                errorMsg.classList.remove("hide");
                checkForAnswer();
            }
        }
    });

    input.addEventListener("change", reset);
    input.addEventListener("keyup", reset);





    $(".section_lead-gen-intro").css("display", "flex");
    $(".section_lead-gen-form").css("display", "none");
    $(".section_lead-gen-form").css("opacity", "0");
    $(".section_lead-gen-nav").css("display", "none");
    $(".section_lead-gen-nav").css("opacity", "0");
    $(".section_lead-gen-hubspot").css("display", "none");
    $(".section_lead-gen-hubspot").css("opacity", "0");

    $(".lead-gen_radio-button").removeClass("is-active");
    $(".lead-gen_prev-button_wrapper").css("opacity", "0");


    function getURLParameters() {
        var queryString = window.location.search.slice(1);
        var params = {};

        if (queryString) {
            var paramArray = queryString.split('&');
            for (var i = 0; i < paramArray.length; i++) {
                var param = paramArray[i].split('=');
                params[param[0]] = decodeURIComponent(param[1]);
            }
        }

        return params;
    }





    $("[lead-gen-start-form]").on("click", function () {

        gsap.to(".section_lead-gen-intro", {
            opacity: 0, duration: 0.25,
            onComplete() {
                $(".section_lead-gen-intro").css("display", "none");
                $(".section_lead-gen-form").css("display", "block");
                $(".section_lead-gen-nav").css("display", "block");
                gsap.to(".section_lead-gen-form", { opacity: 1, duration: 0.25 });
                gsap.to(".section_lead-gen-nav", { opacity: 1, duration: 0.25 });
                checkForAnswer();
            }
        });


        gsap.to(".header-notes_right-component", { opacity: 0, duration: 0.25 });
    });


    $("[lead-gen-next]").on("click", function () {
        nextFormSlide();
    });

    $(document).keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            nextFormSlide();
        }
    });

    $(document).keydown(function (objEvent) {
        if (objEvent.keyCode == 9) {
            objEvent.preventDefault();
            nextFormSlide();
        }
    })

    $("[lead-gen-prev]").on("click", function () {
        prevFormSlide();
    });

    $(document).keydown(function (event) {
        if (event.which == '37') {
            event.preventDefault();
            prevFormSlide();
        }
    });

    function nextFormSlide() {
        if (currentQuestion >= totalQuestions && !$("[lead-gen-next]").hasClass("is-disabled")) {
            submitForm();
        }
        else if (currentQuestion >= totalQuestions || $("[lead-gen-next]").hasClass("is-disabled")) {
            return;
        }
        else {
            $(".lead-gen_form-next").click();
            currentQuestion++;
            if (currentQuestion > 0) {
                gsap.to(".lead-gen_prev-button_wrapper", { opacity: 1, duration: 0.25 });
            }
            if (currentQuestion >= totalQuestions) {
                $("[lead-gen-next-text]").text("Finish");
            }
            checkForAnswer();
        }
    }

    function prevFormSlide() {
        if (currentQuestion <= 0) {
            return;
        }
        else {
            $(".lead-gen_form-prev").click();
            currentQuestion--;
            if (currentQuestion <= 0) {
                gsap.to(".lead-gen_prev-button_wrapper", { opacity: 0, duration: 0.25 });
            }
            if (currentQuestion < totalQuestions) {
                $("[lead-gen-next-text]").text("Continue");
            }
            checkForAnswer();
        }
    }

    $(".lead-gen_radio-button").on("click", function () {
        if (!$(this).hasClass("is-active")) {
            $(this).siblings(".lead-gen_radio-button").removeClass("is-active");
            $(this).addClass("is-active");
            checkForAnswer();
        }
    });

    $(".form_input").on('keyup', function () {
        checkForAnswer();
    });

    function checkForAnswer() {

        let questionType = $(".lead-gen_question").eq(currentQuestion).attr("lead-gen-question-type");

        if (questionType == "email") {

            if ($(".lead-gen_question").eq(currentQuestion).find(".form_input").val().length <= 0) {
                checkNextButton(false);
                return;
            }

            let email = $(".lead-gen_question").eq(currentQuestion).find(".form_input").val();

            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            var validEndings = [".com", ".net", ".org", ".edu", ".gov", ".au", ".ca", ".co", ".de", ".edu", ".fr", ".gov", ".in", ".io", ".net", ".no", ".org", ".uk", ".us", ".br"];

            if (!emailPattern.test(email) || !isValidEmailEnding(email, validEndings)) {
                $(".lead-gen_email-invalid").removeClass("hide");
                checkNextButton(false);
            }
            else {
                $(".lead-gen_email-invalid").addClass("hide");
                checkNextButton(true);
            }
        }
        else if (questionType == "radio") {
            if ($(".lead-gen_question").eq(currentQuestion).find(".lead-gen_radio-button.is-active").length <= 0) {
                checkNextButton(false);
            }
            else {
                checkNextButton(true);
            }
        }
        else if (questionType == "input") {
            if ($(".lead-gen_question").eq(currentQuestion).find(".form_input").val().length <= 0) {
                checkNextButton(false);
            }
            else {
                checkNextButton(true);
            }
        }
        else if (questionType == "phone") {
            if ($(".lead-gen_question").eq(currentQuestion).find(".form_input").hasClass("error")) {
                checkNextButton(false);
            }
            else if ($(".lead-gen_question").eq(currentQuestion).find(".form_input").val().length <= 0) {
                checkNextButton(false);
            }
            else {
                checkNextButton(true);
            }
        }
    }

    function isValidEmailEnding(email, validEndings) {
        var emailEnding = email.substring(email.lastIndexOf(".") + 1);
        return validEndings.includes("." + emailEnding);
    }

    function checkNextButton(active) {
        if (!active) {
            if (!$("[lead-gen-next]").hasClass("is-disabled")) {
                $("[lead-gen-next]").addClass("is-disabled");
            }
        }
        else {
            $("[lead-gen-next]").removeClass("is-disabled");
        }
    }

    function submitForm() {
        $("#lead-gen-form").submit();
        if ($("#Schedule-a-time-for-call").parent().hasClass("is-active")) {
            gsap.to(".section_lead-gen-nav", { opacity: 0, duration: 0.25 });
            gsap.to(".section_lead-gen-form", {
                opacity: 0, duration: 0.25,
                onComplete() {
                    $(".section_lead-gen-nav").css("display", "none");
                    $(".section_lead-gen-form").css("display", "none");
                    $(".section_lead-gen-hubspot").css("display", "block");
                    gsap.to(".section_lead-gen-hubspot", { opacity: 1, duration: 0.25 });
                }
            });
        }
        else {
            window.location.href = "/staging/thank-you";
        }
    }

    window.addEventListener('message', function (event) {

        if (event.data.type !== 'hsFormCallback') return;

        if (event.data.eventName === 'onFormSubmit') {
            setTimeout(() => {
                window.location.href = "/staging/thank-you";
            }, 1000);
        }
    });