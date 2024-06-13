let currentIndex =
  localStorage.getItem("currentIndex") ||
  document.currentScript.getAttribute("currentIndex");
currentIndex = parseInt(currentIndex);

const images = ["cover1.jpg", "cover2.jpg", "cover3.jpg"];
const backgrounds = ["background1.svg", "background2.svg", "background3.svg"];
const colorSets = [
  {
    "--text-color": "#cdd6f4",
    "--hover-color": "#bb9af7",
    "--accent-color": "#cba6f7",
    "--accent-color-2": "#eba0ac",
    "--background-color": "#11111b",
  },
  {
    "--text-color": "#cdd6f4",
    "--hover-color": "#9B5856",
    "--accent-color": "#f7768e",
    "--accent-color-2": "#f38ba8",
    "--background-color": "#11111b",
  },
  {
    "--text-color": "#cdd6f4",
    "--hover-color": "#e0af68",
    "--accent-color": "#fab387",
    "--accent-color-2": "#f9e2af",
    "--background-color": "#11111b",
  },
];

function preloadImages() {
  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    img.src = "../src/images/" + images[i];
  }
}



function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  localStorage.setItem("currentIndex", currentIndex); // Update currentIndex in localStorage
  const imageElement = document.getElementById("carouselImage");
  imageElement.style.opacity = 0;
  updateColors(currentIndex);

  setTimeout(() => {
    imageElement.src = "../src/images/" + images[currentIndex];
    imageElement.style.opacity = 1;
  }, 200); // Match the transition duration in style.css
}



function updateColors() {
  const colorSet = colorSets[currentIndex];
  // Iterate through the colorSet and set the CSS variables
  for (const [property, value] of Object.entries(colorSet)) {
    document.documentElement.style.setProperty(property, value);
  }
}

// Set colors with current index first
updateColors(currentIndex);

// Set the initial image
document.getElementById("carouselImage").src =
  "../src/images/" + images[currentIndex];


// Image is opacity 0 and text is translated off screen by default
// Add the loaded class to the image and text to animate them in
window.onload = function () {
  document.getElementById("image").classList.add("loaded");
  document.getElementById("text").classList.add("loaded");
	document.getElementsByTagName("html")[0].classList.add("loaded");
  // Preload the remaining images
  preloadImages();
};
