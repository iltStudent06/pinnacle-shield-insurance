// Wait until HTML loads before running this code
document.addEventListener("DOMContentLoaded", function () {

  // Find the search input field by its ID: <input id="faq-search">
  var searchInput = document.getElementById("faq-search");

  // Find all FAQ accordion items inside the element with ID "faqAccordion"
  // This returns a list of all .accordion-item elements
  var faqItems = document.querySelectorAll("#faqAccordion .accordion-item");

  // If the search box does not exist OR there are no FAQ items, stop running the script
  if (!searchInput || !faqItems.length) return;

  // Listen for typing inside the search box
  // The "input" event runs every time the user types, deletes, or changes the text
  searchInput.addEventListener("input", function () {

    // Get the current value the user typed into the search box
    // Convert it to lowercase so the search is not case-sensitive
    // trim() removes extra spaces at the beginning or end
    var searchTerm = this.value.toLowerCase().trim();

    // Loop through each FAQ accordion item one by one
    faqItems.forEach(function (item) {

      // Get all the text inside this FAQ item (question + answer)
      // Convert it to lowercase so matching is case-insensitive
      var itemText = item.textContent.toLowerCase();

      // Find the collapsible answer section inside this FAQ item
      // This is the part that expands/collapses in the accordion
      var collapseEl = item.querySelector(".accordion-collapse");

      // If the search box is empty
      // OR if the FAQ item's text contains the search term
      if (searchTerm === "" || itemText.indexOf(searchTerm) !== -1) {

        // Show this FAQ item
        // An empty string lets the browser use the default display style
        item.style.display = "";

      } else {

        // If it does not match the search text, hide this FAQ item
        item.style.display = "none";

        // If the hidden item is currently open, close it
        if (collapseEl) {

          // Remove Bootstrap's "show" class so the accordion answer collapses
          collapseEl.classList.remove("show");
        }
      }
    });
  });
});


