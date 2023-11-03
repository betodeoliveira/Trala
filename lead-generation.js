// [ INIT CONFIG ]
$(".lead-gen_radio-button").removeClass("is-active");
$(".lead-gen_prev-button_wrapper").css("opacity", "0");

$(document).ready(function () {
    // [ KEEP FORM HEIGHT ]
    $(window).bind("load resize submit", function (e) {
        $('form').each(function () {
            var formHeight = $(this).height();
            $(this).siblings('.w-form-done').css({ 'min-height': formHeight });
        });
    });

    // [ VARIABLES ]
    let currentQuestion = 0;
    let totalQuestions = $(".lead-gen_question").length - 1;
    let stepsDictionary = {
        "0": "0",
        "1": "20",
        "2": "50",
        "3": "69",
        "4": "100"
    };

    // [ KEYBOARD ]
    // Enter
    $(document).keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            // Wait until the chekcers are running
            setTimeout(() => {
                nextSlide();
            }, 250);
        }
    });
    // Tab
    $(document).keydown(function (objEvent) {
        if (objEvent.keyCode == 9) {
            objEvent.preventDefault();
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
    $("#your-email").val(urlParams["Email"]);
    $("[name=email]").val(urlParams["Email"]);
    // UTM
    $("[name=visitID]").val(urlParams["visitID"]);
    $("[name=utm_source]").val(urlParams["utm_source"]);
    $("[name=utm_medium]").val(urlParams["utm_medium"]);
    $("[name=utm_campaign]").val(urlParams["utm_campaign"]);
    $("[name=utm_content]").val(urlParams["utm_content"]);
    $("[name=utm_term]").val(urlParams["utm_term"]);
    $("[name=utm_feeditemid]").val(urlParams["utm_feeditemid"]);
    $("[name=utm_device]").val(urlParams["utm_device"]);

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
    // Set the anim step
    gsap.set($("#mask-path_lead-gen-1"), { drawSVG: "0%  0%" });

    // If the URL has an email param skip the intro and the first question
    if ($("#your-email").val().length > 0) {
        nextSlide();
        setTimeout(() => {
            $(".section_lead-gen-form").css("display", "block");
            $(".section_lead-gen-form").css("opacity", "1");
            $(".section_lead-gen-nav").css("display", "block");
            $(".section_lead-gen-nav").css("opacity", "1");
            gsap.set(".header-notes_right-component", { opacity: 0 });
            gsap.set($("[step-anim-bullet]").eq(0), { opacity: 1 });
        }, 500);
    }
    else {
        $(".section_lead-gen-intro").css("display", "block");
        $("[lead-gen-start-form]").on("click", function () {
            gsap.to(".section_lead-gen-intro", {
                opacity: 0, duration: 0.25,
                onComplete() {
                    $(".section_lead-gen-intro").css("display", "none");
                    $(".section_lead-gen-form").css("display", "block");
                    $(".section_lead-gen-nav").css("display", "block");
                    gsap.to(".section_lead-gen-form", { opacity: 1, duration: 0.25 });
                    gsap.to(".section_lead-gen-nav", { opacity: 1, duration: 0.25 });
                    checkAnswer();
                    setLeadGenAnimStep("next");
                }
            });
            gsap.to(".header-notes_right-component", { opacity: 0, duration: 0.25 });
        });
    }

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
            setLeadGenAnimStep("next");
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
            setLeadGenAnimStep("prev");
        }
    }

    function setLeadGenAnimStep(direction) {
        if (direction == "next") {
            gsap.to($("[step-anim-bullet]").eq(currentQuestion), { opacity: 1, duration: 0.3, delay: 0.8 });

        }
        else {
            gsap.to($("[step-anim-bullet]").eq(currentQuestion + 1), { opacity: 0.2, duration: 0.3, delay: 0 });
        }

        gsap.to($("#mask-path_lead-gen-anim-step"), { drawSVG: "0% " + stepsDictionary[currentQuestion] + "%", duration: 0.8 });
    }

    // [ CHECKERS ]
    // Email Checker
    let emailInput = document.querySelector("#your-email");
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let validEndings = [".com", ".net", ".org", ".edu", ".gov", ".au", ".ca", ".co", ".de", ".edu", ".fr", ".gov", ".in", ".io", ".net", ".no", ".org", ".uk", ".us", ".br"];

    $("#your-email").on("change", function () {
        resetEmail();
    });

    $("#your-email").on("keyup", function () {
        resetEmail();
    });

    $("#your-email").keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $(this).blur();
        }
    });

    function resetEmail() {
        $(".lead-gen_email-invalid").addClass("hide");
        emailInput.classList.remove("error");
    };

    emailInput.addEventListener("blur", function () {
        resetEmail();
        if (!isValidEmailEnding($("#your-email").val(), validEndings)) {
            emailInput.classList.add("error");
            $(".lead-gen_email-invalid").removeClass("hide");
            checkAnswer();
        }
    });

    function isValidEmailEnding(email, validEndings) {
        var emailEnding = email.substring(email.lastIndexOf(".") + 1);
        return validEndings.includes("." + emailEnding);
    }

    // Phone Checker
    let phoneInput = document.querySelector("#your-phone"),
        dialCode = document.querySelector(".dial-code"),
        errorMsg = document.querySelector(".lead-gen_phone-invalid"),
        validMsg = document.querySelector(".lead-gen_phone-valid");

    let iti = intlTelInput(phoneInput, {
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
    phoneInput.addEventListener("input", updateInputValue, false);
    phoneInput.addEventListener("countrychange", updateInputValue, false);

    let errorMap = [
        "Check number",
        "Invalid country code",
        "Number is to short",
        "Number is to long",
        "Invalid number",
        "Invalid length",
    ];

    let resetPhone = function () {
        phoneInput.classList.remove("error");
        errorMsg.innerHTML = "";
        errorMsg.classList.add("hide");
        validMsg.classList.add("hide");
    };

    phoneInput.addEventListener("blur", function () {
        resetPhone();
        if (phoneInput.value.trim()) {
            if (iti.isValidNumber()) {
                dialCode.value =
                    "+" + iti.getSelectedCountryData().dialCode + phoneInput.value;
                validMsg.classList.remove("hide");
            }
            else {
                phoneInput.classList.add("error");
                let errorCode = iti.getValidationError();
                errorMsg.innerHTML = errorMap[errorCode];
                errorMsg.classList.remove("hide");
            }

            checkAnswer();
        }
    });

    $("#your-phone").keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $(this).blur();
        }
    })

    $("#your-phone").on("change", function () {
        resetPhone();
    });

    $("#your-phone").on("keyup", function () {
        resetPhone();
    });

    // Answer Checker
    function checkAnswer() {
        // Get the type
        let questionType = $(".lead-gen_question").eq(currentQuestion).attr("lead-gen-question");
        // Check based on the type
        if (questionType == "email") {
            if ($("#your-email").hasClass("error")) {
                $("[name=email]").val("");
                checkNextButton(false);
            }
            else if ($("#your-email").val().length <= 0) {
                checkNextButton(false);
            }
            else {
                $("[name=email]").val($("#your-email").val());
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
        else if (questionType == "contact-method") {
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
            if ($("#your-phone").hasClass("error")) {
                $("[name=phone]").val("");
                checkNextButton(false);
            }
            else if ($("#your-phone").val().length <= 0) {
                checkNextButton(false);
            }
            else {
                $("[name=phone]").val("+" + iti.getSelectedCountryData().dialCode + phoneInput.value);
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
        gsap.to($("#mask-path_lead-gen-anim-step"), { drawSVG: "0% 100%", duration: 1 });
        // First submit the hubspot form
        $("#hubspot-form").find("[type=submit]").click();
        // Then submit the one from webflow
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
            waitUntilHubspotSubmit();
        }
    }

    window.addEventListener('message', function (event) {

        if (event.data.type !== 'hsFormCallback') return;

        if (event.data.eventName === 'onFormSubmit') {
            setTimeout(() => {
                window.location.href = "/staging/thank-you";
            }, 50);
        }
    });

    function waitUntilHubspotSubmit() {
        setTimeout(() => {
            if ($("#hubspot-form").find("div").length <= 0) {
                waitUntilHubspotSubmit();
            }
            else {
                window.location.href = "/staging/thank-you";
            }
        }, 50);
    }
});