// [ VARIABLES ]
let currentQuestion = 0;
let totalQuestions = $(".lead-gen_question").length - 1;

// [ INIT CONFIG ]
$(".section_lead-gen-intro").css("display", "flex");
$(".section_lead-gen-form").css("display", "none");
$(".section_lead-gen-form").css("opacity", "0");
$(".section_lead-gen-nav").css("display", "none");
$(".section_lead-gen-nav").css("opacity", "0");
$(".section_lead-gen-hubspot").css("display", "none");
$(".section_lead-gen-hubspot").css("opacity", "0");
$(".lead-gen_radio-button").removeClass("is-active");
$(".lead-gen_prev-button_wrapper").css("opacity", "0");

// [ KEYBOARD ]
// Enter
$(document).keypress(function (event) {
    if (event.which == '13') {
        event.preventDefault();
        nextSlide();
    }
});
// Tab
$(document).keydown(function (objEvent) {
    if (objEvent.keyCode == 9) { 
        objEvent.preventDefault();
        nextSlide();
    }
});
// Left Arrow
$(document).keydown(function (event) {
    if (event.which == '37') {
        event.preventDefault();
        prevSlide();
    }
});

// [ VIRTUAL BUTTONS ]
// Next
$("[lead-gen-next]").on("click", function () {
    nextSlide();
});
// Prev
$("[lead-gen-prev]").on("click", function () {
    prevSlide();
});
// Radio
$(".lead-gen_radio-button").on("click", function () {
    if (!$(this).hasClass("is-active")) {
        $(this).siblings(".lead-gen_radio-button").removeClass("is-active");
        $(this).addClass("is-active");
        checkAnswer();
    }
});
// Input
$(".form_input").on('keyup', function () {
    checkAnswer();
});

// [ FIRST ]
// Check for parameters to populate the fields
let urlParams = getURLParameters();
if (urlParams["Email"]) {
    $("#your-email").val(urlParams["Email"]);
    $("[name=email]").val(urlParams["Email"]);
}

function getURLParameters() {
    let queryString = window.location.search.slice(1);
    let params = {};

    if (queryString) {
        var paramArray = queryString.split('&');
        for (let i = 0; i < paramArray.length; i++) {
            var param = paramArray[i].split('=');
            params[param[0]] = decodeURIComponent(param[1]);
        }
    }

    return params;
}

// [ SECOND ]
// Starting the form
$("[lead-gen-start-form]").on("click", function () {
    gsap.to(".section_lead-gen-intro", {
        opacity: 0, duration: 0.25,
        onComplete() {
            $(".section_lead-gen-intro").css("display", "none");
            $(".section_lead-gen-form").css("display", "block");
            $(".section_lead-gen-nav").css("display", "block");
            gsap.to(".section_lead-gen-form", { opacity: 1, duration: 0.25 });
            gsap.to(".section_lead-gen-nav", { opacity: 1, duration: 0.25 });
            if ($("#your-email").val().length > 0) {
                nextSlide();
            }
            else {
                checkAnswer();
            }
        }
    });
    gsap.to(".header-notes_right-component", { opacity: 0, duration: 0.25 });
});

// [ NAVIGATION ]
function nextSlide() {
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
        checkAnswer();
    }
}

function prevSlide() {
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
        checkAnswer();
    }
}

// [ CHECKERS ]

// Email Checker
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let validEndings = [".com", ".net", ".org", ".edu", ".gov", ".au", ".ca", ".co", ".de", ".edu", ".fr", ".gov", ".in", ".io", ".net", ".no", ".org", ".uk", ".us", ".br"];

$("#your-email").on("change", function() {
    $(".lead-gen_email-invalid").removeClass("hide");
});

$("#your-email").on("keyup", function() {
    $(".lead-gen_email-invalid").removeClass("hide");
});

function isValidEmailEnding(email, validEndings) {
    var emailEnding = email.substring(email.lastIndexOf(".") + 1);
    return validEndings.includes("." + emailEnding);
}

// Phone Checker
let input = document.querySelector("#your-phone"),
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
            checkAnswer();
        }
    }
});

input.addEventListener("change", reset);
input.addEventListener("keyup", reset);

// Answer Checker
function checkAnswer() {
    // Get the type
    let questionType = $(".lead-gen_question").eq(currentQuestion).attr("lead-gen-question");
    // Check based on the type
    if (questionType == "email") {
        let email = $("#your-email").val();

        if (!emailPattern.test(email) || !isValidEmailEnding(email, validEndings)) {
            $(".lead-gen_email-invalid").removeClass("hide");
            $("[name=email]").val("");
            checkNextButton(false);
        }
        else {
            $(".lead-gen_email-invalid").addClass("hide");
            $("[name=email]").val(email);
            checkNextButton(true);
        }
    }
    else if (questionType == "violin-experience") {
        if ($(".lead-gen_question").eq(currentQuestion).find(".lead-gen_radio-button.is-active").length <= 0) {
            $("[name=violin_experience]").val("");
            checkNextButton(false);
        }
        else {
            let value = $(".lead-gen_question").eq(currentQuestion).find(".lead-gen_radio-button.is-active").find(".lead-gen_radio-label").text();
            $("[name=violin_experience]").val(value);
            checkNextButton(true);
        }
    }
    else if (questionType == "age") {
        let age = $("#your-age").val();

        if ($("#your-age").val().length <= 0) {
            $("[name=age]").val("");
            checkNextButton(false);
        }
        else {
            $("[name=age]").val(age);
            checkNextButton(true);
        }
    }
    else if(questionType == "contact-method") {
        if ($(".lead-gen_question").eq(currentQuestion).find(".lead-gen_radio-button.is-active").length <= 0) {
            $("[name=how_would_you_like_us_to_reach_out]").val("");
            checkNextButton(false);
        }
        else {
            let value = $(".lead-gen_question").eq(currentQuestion).find(".lead-gen_radio-button.is-active").find(".lead-gen_radio-label").text();
            $("[name=how_would_you_like_us_to_reach_out]").val(value);
            checkNextButton(true);
        }
    }
    else if (questionType == "phone") {
        let phone = $("#your-phone").val();

        if ($("#your-phone").val().length <= 0) {
            $("[name=phone]").val("");
            checkNextButton(false);
        }
        else {
            $("[name=phone]").val($("#dialCode"));
            checkNextButton(true);
        }
    }
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