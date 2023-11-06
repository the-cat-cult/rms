import { jsPDF } from "jspdf";

var doc = new jsPDF();

// Background color
doc.setFillColor(15, 17, 26);
doc.rect(0, 0, 210, 297, "F");

// Font colors
let primaryColor = "#ffffff";
let secondaryColor = "#66aaff";
let tertiaryColor = "#bb92c9";

// Font sizes
let primaryFontSize = 16;
let secondaryFontSize = 12;
let tertiaryFontSize = 10;
let titleFontSize = 24;

// Font family
let Font = "helvetica";

// Font weights
let primaryFontWeight = "bold";
let secondaryFontWeight = "normal";
let tertiaryFontWeight = "normal";

function create_header() {

    doc.setFillColor("#2b3035");
    doc.rect(0, 0, 210, 35, "F");

    doc.setFont(Font, primaryFontWeight);
    doc.setFontSize(titleFontSize);
    doc.setTextColor(tertiaryColor);
    doc.text("START", 15, 15);
}

function create_body() {

    doc.setFillColor("#212529");
    doc.rect(0, 35, 210, 297, "F");

    doc.setFont(Font, secondaryFontWeight);
    doc.setFontSize(secondaryFontSize);
    doc.setTextColor(primaryColor);
    doc.text("Rental Details", 15, 45);

    doc.setFont(Font, tertiaryFontWeight);
    doc.setFontSize(tertiaryFontSize);
    doc.setTextColor(primaryColor);
    doc.text("Rental ID: 123456789", 15, 50);
}

create_header();
create_body();

doc.save("test.pdf");