# Application structure and file/folder organization

The application follows a straightforward static website structure. Each main page is stored as a separate HTML file at the root level of the project. These include index.html, quote.html, about.html, and faq.html. Keeping each page separate makes the project easier to understand and maintain.

Supporting assets are organized into folders by type. The css folder stores the stylesheet files. The main styles.css controls the site’s layout, visual design, and responsiveness. The print.css controls the layout and visual design for a print-friendly version of the quote results.

The js folder stores the JavaScript files. Shared site-wide functionality is kept in main.js. Quote-page-specific interactivity is stored in quote.js. And FAQ filtering logic is stored in faq.js. This separation keeps concerns organized and prevents unrelated scripts from loading on every page.

In summary, the structure looks like this:

index.html – homepage
quote.html – quote calculator page
about.html – company information page
faq.html – frequently asked questions page
css/styles.css – main styling and responsive rules
css/print.css – print view styling for quote results
js/main.js – shared navigation and scrolling behavior
js/quote.js – quote logic, validation, saved quotes, comparison, print support
js/faq.js – FAQ search/filter behavior
images/ceo.jpeg – image of chief executive officer
images/cfo.jpeg – image of chief financial officer
images/coo.jpeg – image of chief operating officer
images/cco.jpeg – image of chief claims officer

This organization supports scalability. As the site grows, each feature area already has a logical place for related code.

# Component or page organization and how they relate

The website follows a reusable page structure. Every page uses the same overall layout pattern:

a shared navigation bar in the <header>
the page-specific content in <main>
a shared footer at the bottom

This creates consistency across the site and improves usability. Users can move between pages without relearning the interface.

Each page has a specific purpose:

Homepage
The homepage introduces the company and gives users clear entry points into the site. It contains a hero section, reasons to choose the company, product types, and testimonials. These sections build trust and guide the user toward the quote page.

Get a Quote Page
The quote page is the most interactive part of the application. It combines a shared customer information form with dynamic insurance-specific sections for Auto, Home, and Life quotes. It also includes quote results, a quote breakdown, saved quotes, comparison features, and print functionality. This page acts as the application’s main tool.

About Us Page
The About page provides background on the company, introduces the executive team, and highlights company values. This page supports the credibility of the brand and makes the site feel more complete and realistic.

FAQ Page
The FAQ page helps answer common user questions without requiring customer support. It uses a Bootstrap accordion layout and includes a search input that filters items in real time. This makes information easier to access for users.

These pages relate to each other in a logical flow. A visitor may land on the homepage, learn about the company on the About page, get answers on the FAQ page, and then complete the quote process. The navigation and repeated layout elements connect these pages into one coherent application.

# Data flow explanation

Because this is a static front-end website, data flow is handled entirely on the client side through JavaScript rather than a backend server or database.

On the quote page, the data flow process works like this:

1. The user selects an insurance type using radio-button cards.
2. JavaScript detects the selection and displays only the relevant form section for Auto, Home, or Life insurance.
3. The user fills out the shared customer information fields and the insurance-specific fields.
4. When the form is submitted, JavaScript validates the input. Validation checks required fields, numeric ranges, ZIP code format, coverage selection, and name formatting.
5. If validation passes, the quote calculator runs the logic for the selected insurance type.
6. The calculated quote data is stored in a JavaScript object and displayed in the results section.
7. A breakdown array is generated to explain how each factor affected the quote. That array is then rendered into the breakdown table.
8. If the user clicks Save Quote, a summary of the current quote is stored in localStorage and rendered in the Saved Quotes section.
9. If the user clicks Compare Quotes, the current quote is stored in a temporary comparison variable, the form is reset for quote-specific fields, and after the second quote is calculated, the page displays both results side by side.
10. If the user clicks Print Quote, the visible quote results are sent to the browser print dialog using a print-specific layout.

The FAQ page has a simpler data flow. The user types into the search bar, JavaScript reads the input value, and then checks every accordion item’s text content. Matching items remain visible, and non-matching items are hidden. Clearing the search restores all FAQ entries.

# Deployment approach

The website uses GitHub Pages for deployment. A GitHub Actions workflow is used to validate the project before deployment. The workflow checks and confirms that required HTML, CSS, and JavaScript files exist, then uploads the site as a GitHub Pages artifact and publishes it. This creates a lightweight continuous deployment pipeline.

# Key technical decisions and trade-offs you made

One technical decision I made was to use a single main styles.css file to control the layout, visual design, and responsiveness across the entire website instead of creating separate CSS files for each page. The main advantage of this approach is consistency and efficiency. Shared elements such as the header, navigation bar, buttons, and footer only need to be styled once, so updates can be made in one place and automatically apply across all pages. The trade-off is that the stylesheet becomes larger and requires clear organization and comments so that specific sections can still be found and maintained easily.

Another decision I made was to keep the Full Name, Age, Email Address, and Zip Code fields as shared fields on the Quote page. This improves the user experience because if a customer wants to get a second quote, they do not have to re-enter the same personal information again. However, this choice added extra complexity to the JavaScript logic because I had to reset only the quote-specific fields while preserving the shared fields. That took additional development time that could otherwise have gone toward building other required features.

Finally, I chose to use print-specific CSS to control what appears when a user prints a quote, rather than creating a separate print-only page. This kept the implementation lighter and allowed the same page to serve both screen and print purposes. The trade-off is that print styling can be more difficult to manage consistently across browsers. Through this process, I learned that some print elements, such as browser-generated headers and footers, are controlled by the browser itself and cannot be fully removed or managed by the developer through code alone.

# What you would improve with more time

With more time, I would make the website more polished to be production-quality and add the following enhancements:

1. When users click Get Auto Quote, Get Home Quote, or Get Life Quote on the homepage, they get directed to the quote form with the appropriate insurance type and related form fields displayed automatically

2. Allow users to compare quotes pulled from the Saved Quotes section instead of only comparing two consecutive quotes

3. Add a “No results found” message and keyword highlighting on FAQ page

4. Add a visual progress indicator to the quote form
