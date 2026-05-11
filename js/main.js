// Wait until html file has fully loaded before running the code below

document.addEventListener("DOMContentLoaded", function () {
  
    // Get the current page file name from the URL path

    const currentPage = window.location.pathname.split("/").pop();


/*  =========================================
    Smooth scroll for same page links
    ========================================= */
  
    // Select all tags that has href starting with "#"
    // Add a click event listener to each anchor link
    // Prevent the browser's default jump-to-section behavior
    // Get the href value from the clicked link
    // Then find the element on the page that matches that selector
    // If the target element exists on the page
    // Scroll to that element smoothly instead of jumping instantly

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });


/*  =========================================
    Active nav highlighting
    ========================================= */
  
    // Select all elements with class "nav-link" inside the navbar
    // Loop through each nav link
    // Remove the "active" class from the link first to clear old highlighting
    // Create a URL object from the link's href
    // Get the file name from the link's path
    // Check if: 1. the link points to the current page and 2. the link does NOT contain a hash
    // Add the "active" class to highlight the current page link


  const navLinks = document.querySelectorAll(".navbar .nav-link");

  navLinks.forEach(function (link) {
    link.classList.remove("active");

    const url = new URL(link.href, window.location.origin);
    const linkPage = url.pathname.split("/").pop();

    if (linkPage === currentPage && !url.hash) {
      link.classList.add("active");
    }
  });
});
