// Wait until the HTML page loads before running JavaScript
document.addEventListener("DOMContentLoaded", function () {

    // Get the quote form
    var form = document.getElementById("quoteForm");

    // Get insurance types
    var insuranceTypeRadios = document.querySelectorAll('input[name="insuranceType"]');

    // Get the auto/home/life conditional form sections
    var autoFields = document.getElementById("autoFields");
    var homeFields = document.getElementById("homeFields");
    var lifeFields = document.getElementById("lifeFields");

    // Get the age input
    var ageInput = document.getElementById("age");

    // Get the quote results and its display fields
    var quoteResults = document.getElementById("quoteResults");
    var resultCustomerName = document.getElementById("resultCustomerName");
    var resultInsuranceType = document.getElementById("resultInsuranceType");
    var resultMonthly = document.getElementById("resultMonthly");
    var resultAnnual = document.getElementById("resultAnnual");
    var quoteBreakdownBody = document.getElementById("quoteBreakdownBody");


        // Get the "Print Quote" button
    var printQuoteBtn = document.getElementById("printQuoteBtn");

    // Get the "Get Another Quote" button
    var getAnotherQuoteBtn = document.getElementById("getAnotherQuoteBtn");

    // Get the "Save Quote" button
    var saveQuoteBtn = document.getElementById("saveQuoteBtn");

    // Get the Saved Quotes section elements
    var savedQuotesList = document.getElementById("savedQuotesList");
    var savedQuotesEmpty = document.getElementById("savedQuotesEmpty");

    // Local storage key for saved quotes
    var savedQuotesStorageKey = "pinnacleSavedQuotes";

    // Hold the currently displayed quote so it can be saved
    var currentQuoteToSave = null;

    // Set up insurance type switching events
    initializeFormSwitching();

    // Set up form submit event
    initializeFormSubmission();

    // Set up "Get Another Quote" button event
    initializeGetAnotherQuote();

    // Set up "Save Quote" button event
    initializeSaveQuote();

        // Set up "Print Quote" button event
    initializePrintQuote();


    // Set up live validation for the Full Name field
initializeFullNameLiveValidation();


    // Load saved quotes from local storage
    loadSavedQuotes();

    // Set up delete handling for saved quotes
initializeSavedQuoteDeletion();

    // Show/hide the correct sections when the page first loads
    updateQuoteSections();

    // Hide the quote results when the page first loads
    hideQuoteResults();

    /* =========================================
       1. Insurance type and form switching
    ========================================= */

    // Add a change event to each insurance type radio button
    function initializeFormSwitching() {
        insuranceTypeRadios.forEach(function (radio) {
            radio.addEventListener("change", handleInsuranceTypeChange);
        });
    }

    // Run when the user changes insurance type
    function handleInsuranceTypeChange() {
        // Remove old validation messages
        clearAllValidation(form);

        // Hide previous quote results
        hideQuoteResults();

        // Show the correct form section
        updateQuoteSections();
    }

    // Show the correct section based on selected insurance type
    function updateQuoteSections() {
        // Get selected insurance type: auto, home, or life
        var selectedType = getSelectedInsuranceType();

        // Show the auto section only if "auto" is selected
        toggleSection(autoFields, selectedType === "auto");

        // Show the home section only if "home" is selected
        toggleSection(homeFields, selectedType === "home");

        // Show the life section only if "life" is selected
        toggleSection(lifeFields, selectedType === "life");

        // Update age input rules based on selected type
        updateAgeFieldForInsuranceType(selectedType);
    }

    // Return the selected insurance type radio value
    function getSelectedInsuranceType() {
        return getCheckedValue("insuranceType");
    }

    // Show or hide a section and enable/disable its fields
    function toggleSection(section, shouldShow) {
        // Stop if the section does not exist
        if (!section) return;

        // Get inputs, selects, and text areas inside that section
        var fields = section.querySelectorAll("input, select, textarea");

        // Add or remove Bootstrap's d-none class
        section.classList.toggle("d-none", !shouldShow);

        // Loop through each field in the section
        fields.forEach(function (field) {
            // Enable visible fields, disable hidden fields
            setFieldEnabledState(field, shouldShow);

            // Make visible required fields required
            setFieldRequiredState(field, shouldShow);

            // If the section is being hidden, reset the field
            if (!shouldShow) {
                resetFieldValue(field);
                clearFieldError(field);
            }
        });
    }

    // Enable or disable one field
    function setFieldEnabledState(field, shouldShow) {
        field.disabled = !shouldShow;
    }

    // Turn required fields on/off based on whether the field is visible
    function setFieldRequiredState(field, shouldShow) {
        // Only fields marked with data-required="true" should become required
        if (field.dataset.required === "true") {
            field.required = shouldShow;
        } else {
            field.required = false;
        }
    }

    // Reset a field when its section is hidden
    function resetFieldValue(field) {
        // If this is a radio button or checkbox, uncheck it
        if (field.type === "radio" || field.type === "checkbox") {
            field.checked = false;
            return;
        }

        // If this is a dropdown, return it to the first option
        if (field.tagName === "SELECT") {
            field.selectedIndex = 0;
            return;
        }

        // Otherwise clear the text/number value
        field.value = "";
    }

    // Update the age field's min, max, and placeholder
    function updateAgeFieldForInsuranceType(selectedType) {
        // Stop if the age field does not exist
        if (!ageInput) return;

        // Get the correct age rules for the selected insurance type
        var rules = getAgeRulesByInsuranceType(selectedType);

        // Apply the rules to the age input
        ageInput.min = rules.min;
        ageInput.max = rules.max;
        ageInput.placeholder = rules.placeholder;

        // If current age value is outside the allowed range, clear it
        clearAgeIfOutsideAllowedRange();
    }

    // Return the age rules for each insurance type
    function getAgeRulesByInsuranceType(selectedType) {
        // Auto insurance age rules
        if (selectedType === "auto") {
            return {
                min: "16",
                max: "100",
                placeholder: "Enter your age (16-100)"
            };
        }

        // Home insurance age rules
        if (selectedType === "home") {
            return {
                min: "18",
                max: "100",
                placeholder: "Enter your age (18-100)"
            };
        }

        // Life insurance age rules
        if (selectedType === "life") {
            return {
                min: "18",
                max: "85",
                placeholder: "Enter your age (18-85)"
            };
        }

        // Default rules if nothing is selected yet
        return {
            min: "16",
            max: "100",
            placeholder: "Enter your age"
        };
    }

    // Clear the age field if the current value is outside the allowed min/max
    function clearAgeIfOutsideAllowedRange() {
        // Stop if the age field does not exist
        if (!ageInput) return;

        // Stop if the age field is blank
        if (!ageInput.value) return;

        // Read the current age value
        var ageValue = parseInt(ageInput.value, 10);

        // Read the min and max from the input
        var minAge = parseInt(ageInput.min, 10);
        var maxAge = parseInt(ageInput.max, 10);

        // If age is invalid for the selected type, clear it
        if (ageValue < minAge || ageValue > maxAge) {
            ageInput.value = "";
        }
    }

    /* =========================================
       2. Validate Data & Show Errors
    ========================================= */

    // Add a submit event to the form
    function initializeFormSubmission() {
        form.addEventListener("submit", handleFormSubmit);
    }

    // Run when the form is submitted
    function handleFormSubmit(e) {
        // Stop the browser from doing the normal form submit
        e.preventDefault();

        // Remove old validation messages
        clearAllValidation(form);

        // If the form is not valid, hide results and stop
        if (!validateQuoteForm()) {
            hideQuoteResults();
            return;
        }

        // Clear validation before showing results
        clearAllValidation(form);

        // If valid, calculate the quote
        calculateQuote();
    }

    // Validate the full form
    function validateQuoteForm() {
        // Start by assuming the form is valid
        var isValid = true;

        // Get selected insurance type
        var selectedType = getSelectedInsuranceType();

        // Validate insurance type selection
        if (!validateInsuranceTypeSelection(selectedType)) {
            isValid = false;
        }

        // Validate shared fields used for all quote types
        if (!validateSharedFields()) {
            isValid = false;
        }

        // Validate the selected insurance type's specific fields
        if (!validateInsuranceTypeFields(selectedType)) {
            isValid = false;
        }

        // Return final result
        return isValid;
    }

    // Make sure an insurance type has been chosen
    function validateInsuranceTypeSelection(selectedType) {
        // If nothing is selected, show group error
        if (!selectedType) {
            showGroupError("insuranceType", "Please select an insurance type.");
            return false;
        }

        // If selected, clear old group error
        clearGroupError("insuranceType");
        return true;
    }

    // Validate the shared fields used for all quote types
    function validateSharedFields() {
        // Start by assuming valid
        var isValid = true;

// Validate full name
if (!validateFullNameField("fullName")) {
    isValid = false;
}

        // Validate email
        if (!validateEmailField("email")) {
            isValid = false;
        }

        // Validate age
        if (!validateNumberField("age", "Age")) {
            isValid = false;
        }

        // Validate zip code
        if (!validateZipCodeField("zipCode")) {
            isValid = false;
        }

        // Return result
        return isValid;
    }

    // Validate fields based on selected insurance type
    function validateInsuranceTypeFields(selectedType) {
        // Auto fields
        if (selectedType === "auto") {
            return validateAutoFields();
        }

        // Home fields
        if (selectedType === "home") {
            return validateHomeFields();
        }

        // Life fields
        if (selectedType === "life") {
            return validateLifeFields();
        }

        // If no type selected, return true here because insurance type is checked elsewhere
        return true;
    }

    // Validate auto fields
    function validateAutoFields() {
        var isValid = true;

        if (!validateNumberField("vehicleYear", "Vehicle Year")) {
            isValid = false;
        }

        if (!validateSelectField("vehicleMake", "Vehicle Make")) {
            isValid = false;
        }

        if (!validateTextField("vehicleModel", "Vehicle Model", 1)) {
            isValid = false;
        }

        if (!validateSelectField("annualMileage", "Annual Mileage")) {
            isValid = false;
        }

        if (!validateSelectField("drivingRecord", "Driving Record")) {
            isValid = false;
        }

        if (!validateRadioGroup("coverageLevel", "Please select a coverage level.")) {
            isValid = false;
        }

        return isValid;
    }

    // Validate home fields
    function validateHomeFields() {
        var isValid = true;

        if (!validateNumberField("homeValue", "Home Value")) {
            isValid = false;
        }

        if (!validateNumberField("yearBuilt", "Year Built")) {
            isValid = false;
        }

        if (!validateNumberField("squareFootage", "Square Footage")) {
            isValid = false;
        }

        if (!validateSelectField("constructionType", "Construction Type")) {
            isValid = false;
        }

        if (!validateRadioGroup("coverageLevel", "Please select a coverage level.")) {
            isValid = false;
        }

        return isValid;
    }

    // Validate life fields
    function validateLifeFields() {
        var isValid = true;

        if (!validateSelectField("gender", "Gender")) {
            isValid = false;
        }

        if (!validateRadioGroup("smoker", "Please select smoker status.")) {
            isValid = false;
        }

        if (!validateSelectField("coverageAmount", "Coverage Amount")) {
            isValid = false;
        }

        if (!validateSelectField("exerciseFrequency", "Exercise Frequency")) {
            isValid = false;
        }

        if (!validateRadioGroup("coverageLevel", "Please select a coverage level.")) {
            isValid = false;
        }

        return isValid;
    }

// Set up live validation for the Full Name field
function initializeFullNameLiveValidation() {
    // Get the Full Name field
    var fullNameField = document.getElementById("fullName");

    // Stop if the field does not exist
    if (!fullNameField) return;

    // Validate while the user types
    fullNameField.addEventListener("input", function () {
        validateFullNameLive(this);
    });

    // Also validate when the user leaves the field
    fullNameField.addEventListener("blur", function () {
        validateFullNameLive(this);
    });
}

// Check the Full Name field while the user types
function validateFullNameLive(field) {
    // Stop if the field is missing or disabled
    if (!field || field.disabled) return true;

    // Read the current value exactly as typed
    var value = field.value;

    // If the field is blank, remove the invalid-character message
    // The required-field error will still be handled on form submit
    if (!value.trim()) {
        clearFieldError(field);
        return true;
    }

    // Show an error if the value contains numbers or invalid special characters
    if (!containsOnlyValidFullNameCharacters(value)) {
        showFieldError(field, "Full Name cannot contain numbers or special characters.");
        return false;
    }

    // If valid, clear the error
    clearFieldError(field);
    return true;
}

// Return true if the name contains only allowed characters while typing
function containsOnlyValidFullNameCharacters(value) {
    // Allows letters, spaces, apostrophes, and hyphens
    var fullNameCharacterRegex = /^[A-Za-zÀ-ÿ '\-]*$/;
    return fullNameCharacterRegex.test(value);
}

// Validate Full Name on form submit
function validateFullNameField(id) {
    // Get the field by ID
    var field = document.getElementById(id);

    // Skip validation if field is missing or disabled
    if (!field || field.disabled) return true;

    // Remove extra spaces from the entered value
    var value = field.value.trim();

    // Check if blank
    if (!value) {
        showFieldError(field, "Full Name is required.");
        return false;
    }

    // Check minimum length
    if (value.length < 2) {
        showFieldError(field, "Full Name must be at least 2 characters.");
        return false;
    }

    // Check final Full Name format
    if (!isValidFullName(value)) {
        showFieldError(field, "Full Name cannot contain numbers or special characters.");
        return false;
    }

    // If valid, clear any old error
    clearFieldError(field);
    return true;
}

// Return true if the Full Name has a valid final structure
function isValidFullName(value) {
    // Requires letters and allows spaces, apostrophes, and hyphens between words
    var fullNameRegex = /^[A-Za-zÀ-ÿ]+([ '-][A-Za-zÀ-ÿ]+)*$/;
    return fullNameRegex.test(value);
}



    // Validate a text field
    function validateTextField(id, label, minLength) {
        // If minLength was not passed in, use 1
        if (typeof minLength === "undefined") {
            minLength = 1;
        }

        // Get the field by ID
        var field = document.getElementById(id);

        // Skip validation if field is missing or disabled
        if (!field || field.disabled) return true;

        // Remove extra spaces from the entered value
        var value = field.value.trim();

        // Check if blank
        if (!value) {
            showFieldError(field, label + " is required.");
            return false;
        }

        // Check minimum length
        if (value.length < minLength) {
            showFieldError(field, label + " must be at least " + minLength + " characters.");
            return false;
        }

        // If valid, clear any old error
        clearFieldError(field);
        return true;
    }

    // Validate email field
    function validateEmailField(id) {
        var field = document.getElementById(id);

        // Skip validation if field is missing or disabled
        if (!field || field.disabled) return true;

        var value = field.value.trim();

        // Check if blank
        if (!value) {
            showFieldError(field, "Email address is required.");
            return false;
        }

        // Check if email format is valid
        if (!isValidEmail(value)) {
            showFieldError(field, "Please enter a valid email address.");
            return false;
        }

        // If valid, clear error
        clearFieldError(field);
        return true;
    }

    // Return true if the email format looks valid
    function isValidEmail(value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    // Validate number field
    function validateNumberField(id, label) {
        var field = document.getElementById(id);

        // Skip validation if field is missing or disabled
        if (!field || field.disabled) return true;

        var value = field.value.trim();

        // Check if blank
        if (!value) {
            showFieldError(field, label + " is required.");
            return false;
        }

        // Convert the value to a number
        var numericValue = Number(value);

        // Get min and max from the field
        var min = getFieldMinValue(field);
        var max = getFieldMaxValue(field);

        // Check if it is a valid number
        if (Number.isNaN(numericValue)) {
            showFieldError(field, label + " must be a valid number.");
            return false;
        }

        // Check min value
        if (min !== null && numericValue < min) {
            showFieldError(field, label + " must be at least " + min + ".");
            return false;
        }

        // Check max value
        if (max !== null && numericValue > max) {
            showFieldError(field, label + " must be no more than " + max + ".");
            return false;
        }

        // If valid, clear error
        clearFieldError(field);
        return true;
    }

    // Read the min value from a number field
    function getFieldMinValue(field) {
        if (field.min !== "") {
            return Number(field.min);
        }

        return null;
    }

    // Read the max value from a number field
    function getFieldMaxValue(field) {
        if (field.max !== "") {
            return Number(field.max);
        }

        return null;
    }

    // Validate Zip Code field
    function validateZipCodeField(id) {
        var field = document.getElementById(id);

        // Skip validation if field is missing or disabled
        if (!field || field.disabled) return true;

        var value = field.value.trim();

        // Check if blank
        if (!value) {
            showFieldError(field, "Zip Code is required.");
            return false;
        }

        // Check if Zip Code format is valid
        if (!validateZipCode(value)) {
            showFieldError(field, "Zip Code must be exactly 5 digits.");
            return false;
        }

        // If valid, clear error
        clearFieldError(field);
        return true;
    }

    // Return true if the Zip Code is exactly 5 digits
    function validateZipCode(zip) {
        return /^\d{5}$/.test(zip);
    }

    // Validate a select dropdown
    function validateSelectField(id, label) {
        var field = document.getElementById(id);

        // Skip validation if field is missing or disabled
        if (!field || field.disabled) return true;

        // Check if the user selected a value
        if (!field.value) {
            showFieldError(field, "Please select " + label.toLowerCase() + ".");
            return false;
        }

        // If valid, clear error
        clearFieldError(field);
        return true;
    }

    // Validate a radio group by name
    function validateRadioGroup(name, message) {
        // Get all enabled radios in the group
        var radios = getEnabledRadioGroup(name);

        // If there are no enabled radios, skip validation
        if (!radios.length) return true;

        // Find the checked radio in the enabled group
        var checked = getCheckedEnabledRadio(name);

        // If one is checked, clear old error and return true
        if (checked) {
            clearGroupError(name);
            return true;
        }

        // Otherwise show group error
        showGroupError(name, message);
        return false;
    }

    // Return all enabled radio buttons in a group
    function getEnabledRadioGroup(name) {
        return form.querySelectorAll('input[name="' + name + '"]:enabled');
    }

    // Return the checked enabled radio button in a group
    function getCheckedEnabledRadio(name) {
        return form.querySelector('input[name="' + name + '"]:enabled:checked');
    }

    // Show an error message for one field
    function showFieldError(field, message) {
        // Remove any old error first
        clearFieldError(field);

        // Add Bootstrap invalid class
        field.classList.add("is-invalid");

        // Create a new error element
        var error = createFieldErrorElement(field.id, message);

        // Place the error right after the field
        field.insertAdjacentElement("afterend", error);
    }

    // Create one field error element
    function createFieldErrorElement(fieldId, message) {
        var error = document.createElement("div");
        error.className = "invalid-feedback d-block dynamic-error";
        error.textContent = message;
        error.dataset.errorFor = fieldId;
        return error;
    }

    // Clear one field's error
    function clearFieldError(field) {
        // Stop if field doesn't exist
        if (!field) return;

        // Remove the Bootstrap invalid class
        field.classList.remove("is-invalid");

        // Find all dynamic errors for that field
        var errors = form.querySelectorAll('[data-error-for="' + field.id + '"]');

        // Remove them
        errors.forEach(function (error) {
            error.remove();
        });
    }

    // Show an error for a whole radio group
    function showGroupError(name, message) {
        // Remove old group error first
        clearGroupError(name);

        // Get enabled radios in that group
        var enabledRadios = getEnabledRadioGroup(name);

        // Stop if none exist
        if (!enabledRadios.length) return;

        // Mark the radios and labels as invalid
        markRadioGroupInvalid(enabledRadios);

        // Find a place to put the error message
        var container = getRadioGroupErrorContainer(name, enabledRadios[0]);

        // Create the error message element
        var error = createGroupErrorElement(name, message);

        // Add the message to the page
        container.appendChild(error);
    }

    // Add invalid styling to all radios in a group
    function markRadioGroupInvalid(radios) {
        radios.forEach(function (radio) {
            // Add invalid class to radio
            radio.classList.add("is-invalid");

            // Find the label attached to this radio
            var label = form.querySelector('label[for="' + radio.id + '"]');

            // Add red border styling to the label
            if (label) {
                label.classList.add("border", "border-danger");
            }
        });
    }

    // Find the best container element for a radio group error message
    function getRadioGroupErrorContainer(name, firstRadio) {
        var customContainer = firstRadio.closest('[data-group-container="' + name + '"]');

        if (customContainer) {
            return customContainer;
        }

        return (
            firstRadio.closest("fieldset") ||
            firstRadio.closest(".col-12") ||
            firstRadio.closest(".col-md-6") ||
            firstRadio.parentElement
        );
    }

    // Create one radio group error element
    function createGroupErrorElement(name, message) {
        var error = document.createElement("div");
        error.className = "invalid-feedback d-block dynamic-error";
        error.textContent = message;
        error.dataset.groupErrorFor = name;
        return error;
    }

    // Clear errors for one radio group
    function clearGroupError(name) {
        // Get all radios in that group
        var radios = form.querySelectorAll('input[name="' + name + '"]');

        // Remove invalid styles from each radio and label
        radios.forEach(function (radio) {
            radio.classList.remove("is-invalid");

            var label = form.querySelector('label[for="' + radio.id + '"]');
            if (label) {
                label.classList.remove("border", "border-danger");
            }
        });

        // Remove all dynamic error messages for that group
        var errors = form.querySelectorAll('[data-group-error-for="' + name + '"]');
        errors.forEach(function (error) {
            error.remove();
        });
    }

    // Clear all validation messages and styles from the form
    function clearAllValidation(formElement) {
        // Stop if form does not exist
        if (!formElement) return;

        // Remove all generated error messages
        removeDynamicErrors(formElement);

        // Remove invalid classes from fields
        removeInvalidClasses(formElement);

        // Remove danger border classes from labels
        removeDangerBorders(formElement);
    }

    // Remove all elements with the dynamic-error class
    function removeDynamicErrors(formElement) {
        formElement.querySelectorAll(".dynamic-error").forEach(function (error) {
            error.remove();
        });
    }

    // Remove is-invalid from all fields
    function removeInvalidClasses(formElement) {
        formElement.querySelectorAll(".is-invalid").forEach(function (field) {
            field.classList.remove("is-invalid");
        });
    }

    // Remove border-danger styling from labels
    function removeDangerBorders(formElement) {
        formElement.querySelectorAll("label.border-danger").forEach(function (label) {
            label.classList.remove("border", "border-danger");
        });
    }

    /* =========================================
       3. Calculate Quote & Show Results
    ========================================= */

    // Decide which quote calculation to run
    function calculateQuote() {
        // Get selected insurance type
        var selectedType = getSelectedInsuranceType();

        // Run auto quote calculation
        if (selectedType === "auto") {
            calculateAutoQuote();
            return;
        }

        // Run home quote calculation
        if (selectedType === "home") {
            calculateHomeQuote();
            return;
        }

        // Run life quote calculation
        if (selectedType === "life") {
            calculateLifeQuote();
        }
    }

    // Calculate auto quote and show results
    function calculateAutoQuote() {
        // Read all form values needed for auto
        var data = getAutoFormData();

        // Calculate premium numbers
        var premium = calculateAutoPremium(data);

        // Build the breakdown rows
        var breakdown = buildAutoBreakdown(data, premium);

        // Show the results
        showQuoteResults({
            customerName: getCustomerName(),
            type: "Auto Insurance",
            monthly: premium.monthly,
            annual: premium.annual,
            breakdown: breakdown
        });
    }

    // Read auto quote values from the form
    function getAutoFormData() {
        // Get the current year for vehicle age calculation
        var currentYear = new Date().getFullYear();

        // Read the vehicle year
        var vehicleYear = getNumberValue("vehicleYear");

        // Return a single object with all needed values
        return {
            age: getNumberValue("age"),
            vehicleYear: vehicleYear,
            vehicleMake: getInputValue("vehicleMake"),
            vehicleModel: getTrimmedValue("vehicleModel"),
            annualMileage: getInputValue("annualMileage"),
            drivingRecord: getInputValue("drivingRecord"),
            coverageLevel: getCheckedValue("coverageLevel"),
            vehicleAge: currentYear - vehicleYear
        };
    }

    // Calculate the auto quote numbers
    function calculateAutoPremium(data) {
        // Base monthly auto rate
        var baseRate = 75;

        // Get multipliers for each factor
        var ageFactor = getAutoAgeFactor(data.age);
        var vehicleAgeFactor = getVehicleAgeFactor(data.vehicleAge);
        var mileageFactor = getMileageFactor(data.annualMileage);
        var drivingRecordFactor = getDrivingRecordFactor(data.drivingRecord);
        var coverageFactor = getCoverageFactor(data.coverageLevel);

        // Multiply all factors together
        var monthly =
            baseRate *
            ageFactor *
            vehicleAgeFactor *
            mileageFactor *
            drivingRecordFactor *
            coverageFactor;

        // Return all useful values
        return {
            baseRate: baseRate,
            ageFactor: ageFactor,
            vehicleAgeFactor: vehicleAgeFactor,
            mileageFactor: mileageFactor,
            drivingRecordFactor: drivingRecordFactor,
            coverageFactor: coverageFactor,
            monthly: roundMoney(monthly),
            annual: roundMoney(monthly * 12)
        };
    }

    // Build the breakdown table data for auto insurance
    function buildAutoBreakdown(data, premium) {
        // Labels for mileage values
        var mileageLabels = {
            "Under 5000": "Under 5,000",
            "5000-10000": "5,000-10,000",
            "10001-15000": "10,001-15,000",
            "15001-20000": "15,001-20,000",
            "Over 20000": "Over 20,000"
        };

        // Labels for coverage levels
        var coverageLabels = {
            basic: "Basic coverage",
            standard: "Standard coverage",
            premium: "Premium coverage"
        };

        // Return table row data
        return [
            {
                factor: "Base Rate",
                info: formatCurrency(premium.baseRate) + "/month",
                impact: "Starting rate"
            },
            {
                factor: "Age (" + data.age + ")",
                info: getAutoAgeInfo(data.age),
                impact: formatImpact(premium.ageFactor, "young driver surcharge", "driver discount")
            },
            {
                factor: "Vehicle (" + data.vehicleYear + " " + data.vehicleMake + " " + data.vehicleModel + ")",
                info: getVehicleAgeInfo(data.vehicleAge),
                impact: formatImpact(
                    premium.vehicleAgeFactor,
                    "newer vehicle surcharge",
                    "older vehicle discount"
                )
            },
            {
                factor: "Annual Mileage",
                info: mileageLabels[data.annualMileage] || data.annualMileage,
                impact: formatImpact(
                    premium.mileageFactor,
                    "higher mileage surcharge",
                    "low mileage discount"
                )
            },
            {
                factor: "Driving Record",
                info: data.drivingRecord,
                impact: formatImpact(
                    premium.drivingRecordFactor,
                    "driving history surcharge",
                    "driving record discount"
                )
            },
            {
                factor: "Coverage Level",
                info: coverageLabels[data.coverageLevel] || getCoverageLabel(data.coverageLevel),
                impact: formatImpact(
                    premium.coverageFactor,
                    "higher coverage cost",
                    "lower coverage discount"
                )
            }
        ];
    }

    // Return auto age text
    function getAutoAgeInfo(age) {
        if (age < 25) return "Under 25 - young driver";
        if (age <= 65) return "25-65 - standard rate";
        return "Over 65 - senior driver";
    }

    // Return vehicle age text
    function getVehicleAgeInfo(vehicleAge) {
        if (vehicleAge < 3) return "Under 3 years old";
        if (vehicleAge <= 10) return "3-10 years old";
        return "Over 10 years old";
    }

    // Calculate home quote and show results
    function calculateHomeQuote() {
        var data = getHomeFormData();
        var premium = calculateHomePremium(data);
        var breakdown = buildHomeBreakdown(data, premium);

        showQuoteResults({
            customerName: getCustomerName(),
            type: "Home Insurance",
            monthly: premium.monthly,
            annual: premium.annual,
            breakdown: breakdown
        });
    }

    // Read home quote values from the form
    function getHomeFormData() {
        return {
            homeValue: getNumberValue("homeValue"),
            yearBuilt: getNumberValue("yearBuilt"),
            squareFootage: getNumberValue("squareFootage"),
            constructionType: getInputValue("constructionType"),
            hasSecuritySystem: isChecked("hasSecuritySystem"),
            hasFireSprinklers: isChecked("hasFireSprinklers"),
            coverageLevel: getCheckedValue("coverageLevel")
        };
    }

    // Calculate the home quote numbers
    function calculateHomePremium(data) {
        var baseMonthlyRate = (data.homeValue * 0.003) / 12;
        var yearBuiltFactor = getYearBuiltFactor(data.yearBuilt);
        var constructionFactor = getConstructionFactor(data.constructionType);
        var sizeCharge = data.squareFootage * 0.01;
        var securityDiscount = data.hasSecuritySystem ? 0.95 : 1.0;
        var sprinklerDiscount = data.hasFireSprinklers ? 0.92 : 1.0;
        var coverageFactor = getCoverageFactor(data.coverageLevel);

        var monthly =
            (baseMonthlyRate * yearBuiltFactor * constructionFactor + sizeCharge) *
            securityDiscount *
            sprinklerDiscount *
            coverageFactor;

        return {
            baseMonthlyRate: baseMonthlyRate,
            yearBuiltFactor: yearBuiltFactor,
            constructionFactor: constructionFactor,
            sizeCharge: sizeCharge,
            securityDiscount: securityDiscount,
            sprinklerDiscount: sprinklerDiscount,
            coverageFactor: coverageFactor,
            monthly: roundMoney(monthly),
            annual: roundMoney(monthly * 12)
        };
    }

    // Build the breakdown table data for home insurance
    function buildHomeBreakdown(data, premium) {
        return [
            {
                factor: "Base Rate",
                info: formatCurrency(premium.baseMonthlyRate) + "/month",
                impact: "Starting rate"
            },
            {
                factor: "Home Value",
                info: formatCurrency(data.homeValue),
                impact: "Used to determine base rate"
            },
            {
                factor: "Year Built",
                info: getYearBuiltInfo(data.yearBuilt),
                impact: formatImpact(
                    premium.yearBuiltFactor,
                    "older home surcharge",
                    "newer home discount"
                )
            },
            {
                factor: "Construction Type",
                info: data.constructionType,
                impact: formatImpact(
                    premium.constructionFactor,
                    "higher construction risk",
                    "safer construction discount"
                )
            },
            {
                factor: "Square Footage",
                info: data.squareFootage.toLocaleString() + " sq ft",
                impact: "+" + formatCurrency(premium.sizeCharge) + "/month size charge"
            },
            {
                factor: "Security System",
                info: data.hasSecuritySystem ? "Yes" : "No",
                impact: data.hasSecuritySystem
                    ? formatImpact(premium.securityDiscount, "security surcharge", "security discount")
                    : "No impact (x1.0)"
            },
            {
                factor: "Fire Sprinklers",
                info: data.hasFireSprinklers ? "Yes" : "No",
                impact: data.hasFireSprinklers
                    ? formatImpact(premium.sprinklerDiscount, "sprinkler surcharge", "sprinkler discount")
                    : "No impact (x1.0)"
            },
            {
                factor: "Coverage Level",
                info: getCoverageLabel(data.coverageLevel),
                impact: formatImpact(
                    premium.coverageFactor,
                    "higher coverage cost",
                    "lower coverage discount"
                )
            }
        ];
    }

    // Return year-built label
    function getYearBuiltInfo(yearBuilt) {
        if (yearBuilt < 1970) return "Before 1970";
        if (yearBuilt <= 1999) return "1970-1999";
        return "2000+";
    }

    // Calculate life quote and show results
    function calculateLifeQuote() {
        var data = getLifeFormData();
        var premium = calculateLifePremium(data);
        var breakdown = buildLifeBreakdown(data, premium);

        showQuoteResults({
            customerName: getCustomerName(),
            type: "Life Insurance",
            monthly: premium.monthly,
            annual: premium.annual,
            breakdown: breakdown
        });
    }

    // Read life quote values from the form
    function getLifeFormData() {
        return {
            age: getNumberValue("age"),
            gender: getInputValue("gender"),
            smoker: getCheckedValue("smoker"),
            coverageAmount: getNumberValue("coverageAmount"),
            exerciseFrequency: getInputValue("exerciseFrequency"),
            hasPreExistingConditions: isChecked("preExistingConditions"),
            coverageLevel: getCheckedValue("coverageLevel")
        };
    }

    // Calculate the life quote numbers
    function calculateLifePremium(data) {
        var baseMonthlyRate = (data.coverageAmount * 0.0005) / 12;
        var ageFactor = getLifeAgeFactor(data.age);
        var smokerFactor = getSmokerFactor(data.smoker);
        var exerciseFactor = getExerciseFactor(data.exerciseFrequency);
        var preExistingFactor = data.hasPreExistingConditions ? 1.5 : 1.0;
        var genderFactor = getGenderFactor(data.gender);
        var coverageFactor = getCoverageFactor(data.coverageLevel);

        var monthly =
            baseMonthlyRate *
            ageFactor *
            smokerFactor *
            exerciseFactor *
            preExistingFactor *
            genderFactor *
            coverageFactor;

        return {
            baseMonthlyRate: baseMonthlyRate,
            ageFactor: ageFactor,
            smokerFactor: smokerFactor,
            exerciseFactor: exerciseFactor,
            preExistingFactor: preExistingFactor,
            genderFactor: genderFactor,
            coverageFactor: coverageFactor,
            monthly: roundMoney(monthly),
            annual: roundMoney(monthly * 12)
        };
    }

    // Build the breakdown table data for life insurance
    function buildLifeBreakdown(data, premium) {
        return [
            {
                factor: "Base Rate",
                info: formatCurrency(premium.baseMonthlyRate) + "/month",
                impact: "Starting rate"
            },
            {
                factor: "Age (" + data.age + ")",
                info: getLifeAgeRangeLabel(data.age),
                impact: formatImpact(premium.ageFactor, "age-related surcharge", "age discount")
            },
            {
                factor: "Gender",
                info: data.gender,
                impact: formatImpact(premium.genderFactor, "gender-based surcharge", "gender discount")
            },
            {
                factor: "Smoker",
                info: data.smoker === "yes" ? "Yes" : "No",
                impact: formatImpact(premium.smokerFactor, "smoker surcharge", "non-smoker discount")
            },
            {
                factor: "Coverage Amount",
                info: formatCurrency(data.coverageAmount),
                impact: "Used to determine base rate"
            },
            {
                factor: "Exercise Frequency",
                info: data.exerciseFrequency,
                impact: formatImpact(
                    premium.exerciseFactor,
                    "lower activity surcharge",
                    "healthy lifestyle discount"
                )
            },
            {
                factor: "Pre-existing Conditions",
                info: data.hasPreExistingConditions ? "Yes" : "No",
                impact: data.hasPreExistingConditions
                    ? formatImpact(
                        premium.preExistingFactor,
                        "medical surcharge",
                        "medical discount"
                    )
                    : "No impact (x1.0)"
            },
            {
                factor: "Coverage Level",
                info: getCoverageLabel(data.coverageLevel),
                impact: formatImpact(
                    premium.coverageFactor,
                    "higher coverage cost",
                    "lower coverage discount"
                )
            }
        ];
    }

    // Return age range label for life insurance
    function getLifeAgeRangeLabel(age) {
        if (age <= 30) return "18-30";
        if (age <= 45) return "31-45";
        if (age <= 60) return "46-60";
        return "61-85";
    }

    // Return the customer's trimmed full name
    function getCustomerName() {
        return getTrimmedValue("fullName");
    }

    // Return a field's raw value
    function getInputValue(id) {
        var field = document.getElementById(id);
        return field ? field.value : "";
    }

    // Return a field's value with surrounding spaces removed
    function getTrimmedValue(id) {
        var field = document.getElementById(id);
        return field ? field.value.trim() : "";
    }

    // Return a numeric value from a field
    function getNumberValue(id) {
        var field = document.getElementById(id);
        return field ? Number(field.value) : 0;
    }

    // Return true if a checkbox is checked
    function isChecked(id) {
        var field = document.getElementById(id);
        return field ? field.checked : false;
    }

    // Return the checked value of a radio group, using only enabled radios
    function getCheckedValue(name) {
        var checked = form.querySelector('input[name="' + name + '"]:enabled:checked');
        return checked ? checked.value : "";
    }

    // Round a money value to 2 decimal places
    function roundMoney(value) {
        return Number(value.toFixed(2));
    }

    // Return label for coverage type
    function getCoverageLabel(level) {
        switch (level) {
            case "basic":
                return "Basic";
            case "standard":
                return "Standard";
            case "premium":
                return "Premium";
            default:
                return "--";
        }
    }

    // Return price multiplier for coverage level
    function getCoverageFactor(level) {
        switch (level) {
            case "basic":
                return 0.8;
            case "standard":
                return 1.0;
            case "premium":
                return 1.4;
            default:
                return 1.0;
        }
    }

    // Return auto insurance age multiplier
    function getAutoAgeFactor(age) {
        if (age < 25) return 1.5;
        if (age <= 65) return 1.0;
        return 1.3;
    }

    // Return vehicle age multiplier
    function getVehicleAgeFactor(vehicleAge) {
        if (vehicleAge < 3) return 1.3;
        if (vehicleAge <= 10) return 1.0;
        return 0.8;
    }

    // Return mileage multiplier
    function getMileageFactor(mileage) {
        switch (mileage) {
            case "Under 5000":
                return 0.8;
            case "5000-10000":
                return 1.0;
            case "10001-15000":
                return 1.1;
            case "15001-20000":
                return 1.3;
            case "Over 20000":
                return 1.5;
            default:
                return 1.0;
        }
    }

    // Return driving record multiplier
    function getDrivingRecordFactor(record) {
        switch (record) {
            case "Clean":
                return 1.0;
            case "1 Ticket":
                return 1.2;
            case "2+ Tickets":
                return 1.5;
            case "Accident in Last 3 Years":
                return 1.8;
            default:
                return 1.0;
        }
    }

    // Return home year-built multiplier
    function getYearBuiltFactor(yearBuilt) {
        if (yearBuilt < 1970) return 1.4;
        if (yearBuilt <= 1999) return 1.1;
        return 1.0;
    }

    // Return construction type multiplier
    function getConstructionFactor(constructionType) {
        switch (constructionType) {
            case "Wood Frame":
                return 1.2;
            case "Brick":
                return 1.0;
            case "Concrete":
                return 0.9;
            case "Steel":
                return 0.85;
            default:
                return 1.0;
        }
    }

    // Return life insurance age multiplier
    function getLifeAgeFactor(age) {
        if (age >= 18 && age <= 30) return 1.0;
        if (age >= 31 && age <= 45) return 1.5;
        if (age >= 46 && age <= 60) return 2.5;
        return 4.0;
    }

    // Return smoker multiplier
    function getSmokerFactor(smoker) {
        switch (smoker) {
            case "yes":
                return 2.0;
            case "no":
                return 1.0;
            default:
                return 1.0;
        }
    }

    // Return exercise frequency multiplier
    function getExerciseFactor(exerciseFrequency) {
        switch (exerciseFrequency) {
            case "Rarely":
                return 1.3;
            case "1-2 times/week":
                return 1.1;
            case "3-4 times/week":
                return 1.0;
            case "5+ times/week":
                return 0.9;
            default:
                return 1.0;
        }
    }

    // Return gender multiplier
    function getGenderFactor(gender) {
        switch (gender) {
            case "Male":
                return 1.1;
            case "Female":
                return 1.0;
            case "Non-binary":
                return 1.05;
            default:
                return 1.0;
        }
    }

    /* =========================================
       4. Display Quote Result Summary & Breakdown
    ========================================= */

    // Show the quote results area
    function showQuoteResults(data) {
        // Stop if the results container does not exist
        if (!quoteResults) return;

        // Save the currently displayed quote so it can be stored later
        currentQuoteToSave = {
            customerName: data.customerName || "--",
            type: data.type || "--",
            monthly: data.monthly || 0,
            annual: data.annual || 0,
            savedAt: new Date().toLocaleString()
        };

        // Fill the summary values
        populateQuoteSummary(data);

        // Fill the breakdown table
        renderBreakdownRows(data.breakdown || []);

        // Reveal the results area
        revealQuoteResults();
    }

    // Fill in the summary text values
    function populateQuoteSummary(data) {
        resultCustomerName.textContent = data.customerName || "--";
        resultInsuranceType.textContent = data.type || "--";
        resultMonthly.textContent = formatCurrency(data.monthly || 0);
        resultAnnual.textContent = formatCurrency(data.annual || 0);
    }

    // Show and scroll to the results section
    function revealQuoteResults() {
        quoteResults.classList.remove("d-none");
        quoteResults.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // Hide and reset the results section
    function hideQuoteResults() {
        // Stop if results section does not exist
        if (!quoteResults) return;

        // Clear the currently savable quote
        currentQuoteToSave = null;

        // Hide the section
        quoteResults.classList.add("d-none");

        // Clear the table and summary
        clearBreakdownTable();
        resetQuoteSummary();
    }

    // Clear the breakdown table body
    function clearBreakdownTable() {
        if (quoteBreakdownBody) {
            quoteBreakdownBody.innerHTML = "";
        }
    }

    // Reset the summary display values
    function resetQuoteSummary() {
        if (resultCustomerName) resultCustomerName.textContent = "--";
        if (resultInsuranceType) resultInsuranceType.textContent = "--";
        if (resultMonthly) resultMonthly.textContent = "$0.00";
        if (resultAnnual) resultAnnual.textContent = "$0.00";
    }

    // Render all breakdown rows into the table body
    function renderBreakdownRows(rows) {
        // Stop if the table body does not exist
        if (!quoteBreakdownBody) return;

        // Convert each row object into HTML and join them together
        quoteBreakdownBody.innerHTML = rows
            .map(createBreakdownRowHtml)
            .join("");
    }

    // Create the HTML for one table row
    function createBreakdownRowHtml(row) {
        return (
            "<tr>" +
            "<td>" + row.factor + "</td>" +
            "<td>" + row.info + "</td>" +
            "<td>" + row.impact + "</td>" +
            "</tr>"
        );
    }

    // Format a number as US currency
    function formatCurrency(value) {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    // Format a multiplier as readable impact text
    function formatImpact(multiplier, positiveLabel, negativeLabel) {
        // If over 1, it increases cost
        if (multiplier > 1) {
            return "+" + Math.round((multiplier - 1) * 100) + "% (" + positiveLabel + ")";
        }

        // If under 1, it decreases cost
        if (multiplier < 1) {
            return "-" + Math.round((1 - multiplier) * 100) + "% (" + negativeLabel + ")";
        }

        // If exactly 1, no change
        return "No impact (x1.0)";
    }

    /* =========================================
       5. Save Quote Button & Saved Quotes
    ========================================= */

    // Add click event to the "Save Quote" button
    function initializeSaveQuote() {
        if (!saveQuoteBtn) return;
        saveQuoteBtn.addEventListener("click", handleSaveQuote);
    }

    // Save the currently displayed quote
    function handleSaveQuote() {
        // Stop if no calculated quote is available
        if (!currentQuoteToSave) return;

        // Get the saved quotes array
        var savedQuotes = getSavedQuotes();

        // Add the newest quote to the top
        savedQuotes.unshift({
            id: Date.now(),
            customerName: currentQuoteToSave.customerName,
            type: currentQuoteToSave.type,
            monthly: currentQuoteToSave.monthly,
            annual: currentQuoteToSave.annual,
            savedAt: new Date().toLocaleString()
        });

        // Save back to local storage
        saveSavedQuotes(savedQuotes);

        // Re-render saved quotes
        renderSavedQuotes(savedQuotes);
    }

    // Load saved quotes on page load
    function loadSavedQuotes() {
        renderSavedQuotes(getSavedQuotes());
    }

    // Get saved quotes from local storage
    function getSavedQuotes() {
        var raw = localStorage.getItem(savedQuotesStorageKey);

        if (!raw) {
            return [];
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return [];
        }
    }

    // Save quotes array to local storage
    function saveSavedQuotes(savedQuotes) {
        localStorage.setItem(savedQuotesStorageKey, JSON.stringify(savedQuotes));
    }

    // Render the Saved Quotes cards
    function renderSavedQuotes(savedQuotes) {
        if (!savedQuotesList || !savedQuotesEmpty) return;

        if (!savedQuotes.length) {
            savedQuotesList.innerHTML = "";
            savedQuotesEmpty.classList.remove("d-none");
            return;
        }

        savedQuotesEmpty.classList.add("d-none");

        savedQuotesList.innerHTML = savedQuotes
            .map(createSavedQuoteCardHtml)
            .join("");
    }

    // Set up click handling for dynamically generated delete buttons
function initializeSavedQuoteDeletion() {
    if (!savedQuotesList) return;

    savedQuotesList.addEventListener("click", handleSavedQuotesClick);
}

// Handle clicks inside the Saved Quotes list
function handleSavedQuotesClick(e) {
    var deleteButton = e.target.closest(".delete-saved-quote-btn");

    // Stop if the click was not on a delete button
    if (!deleteButton) return;

    var quoteId = Number(deleteButton.dataset.quoteId);

    // Stop if the ID is invalid
    if (!quoteId) return;

    deleteSavedQuoteById(quoteId);
}

// Delete one saved quote by ID
function deleteSavedQuoteById(quoteId) {
    var savedQuotes = getSavedQuotes();

    var updatedQuotes = savedQuotes.filter(function (quote) {
        return quote.id !== quoteId;
    });

    saveSavedQuotes(updatedQuotes);
    renderSavedQuotes(updatedQuotes);
}


    // Create one saved quote card
function createSavedQuoteCardHtml(quote) {
    return (
        '<div class="col-md-6 col-lg-4">' +
            '<div class="card saved-quote-card shadow-sm">' +
                '<div class="card-body d-flex flex-column">' +
                    '<h4 class="saved-quote-title h6">' + escapeHtml(quote.customerName) + '</h4>' +
'<p class="saved-quote-meta mb-1"><strong>Insurance Type:</strong> ' + escapeHtml(getShortInsuranceTypeLabel(quote.type)) + '</p>' +
                    '<p class="saved-quote-meta mb-1"><strong>Monthly:</strong> <span class="saved-quote-amount">' + formatCurrency(quote.monthly) + '</span></p>' +
                    '<p class="saved-quote-meta mb-2"><strong>Annual:</strong> <span class="saved-quote-amount">' + formatCurrency(quote.annual) + '</span></p>' +
                    '<p class="saved-quote-saved-at mb-3">Saved: ' + escapeHtml(quote.savedAt) + '</p>' +
                    '<div class="mt-auto">' +
                        '<button type="button" class="btn btn-outline-danger btn-sm delete-saved-quote-btn" data-quote-id="' + quote.id + '">' +
                            '<i class="bi bi-trash-fill me-1"></i>Delete' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    );
}

function getShortInsuranceTypeLabel(type) {
    switch (type) {
        case "Auto Insurance":
            return "Auto";
        case "Home Insurance":
            return "Home";
        case "Life Insurance":
            return "Life";
        default:
            return type;
    }
}

    // Escape text before inserting into HTML
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }






    /* =========================================
       6. Print Quote Button
    ========================================= */

    // Add click event to the "Print Quote" button
    function initializePrintQuote() {
        if (!printQuoteBtn) return;

        printQuoteBtn.addEventListener("click", handlePrintQuote);
    }

    // Print only if quote results are visible
    function handlePrintQuote() {
        if (!quoteResults || quoteResults.classList.contains("d-none")) {
            return;
        }

        window.print();
    }



    /* =========================================
       7. Get Another Quote Button
    ========================================= */

    // Add click event to the "Get Another Quote" button
    function initializeGetAnotherQuote() {
        // Stop if button doesn't exist
        if (!getAnotherQuoteBtn) return;

        // Add click handler
        getAnotherQuoteBtn.addEventListener("click", handleGetAnotherQuote);
    }

    // Reset the form and go back to the top of the form
    function handleGetAnotherQuote() {
        // Reset quote-specific fields but preserve shared/common fields
        resetQuoteForm();

        // Remove all validation styling and errors
        clearAllValidation(form);

        // Hide old quote results
        hideQuoteResults();

        // Recalculate which sections should be visible
        updateQuoteSections();

        // Scroll back to the form
        scrollToForm();
    }

    // Reset the quote form but preserve shared/common fields
    function resetQuoteForm() {
        // Save shared/common field values before resetting
        var sharedValues = getSharedFieldValues();

        // Reset the whole form
        form.reset();

        // Restore shared/common field values
        restoreSharedFieldValues(sharedValues);
    }

    // Save the shared fields so the user does not have to re-enter them
    function getSharedFieldValues() {
        return {
            fullName: getTrimmedValue("fullName"),
            email: getTrimmedValue("email"),
            age: getInputValue("age"),
            zipCode: getTrimmedValue("zipCode")
        };
    }

    // Put the shared values back into the form after reset
    function restoreSharedFieldValues(values) {
        setFieldValue("fullName", values.fullName);
        setFieldValue("email", values.email);
        setFieldValue("age", values.age);
        setFieldValue("zipCode", values.zipCode);
    }

    // Set a field's value by ID
    function setFieldValue(id, value) {
        var field = document.getElementById(id);
        if (field) {
            field.value = value;
        }
    }

    // Smooth scroll back to the form
    function scrollToForm() {
        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});
