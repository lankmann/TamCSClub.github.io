let theme = "purple";

let colors = {
  "blue": "#4169E1",
  "red": "#CC0202",
  "purple": "rgb(102, 78, 167)"
}

document.addEventListener("DOMContentLoaded", () => {
  updateTheme();
  console.log("loaded", theme);
  let anchors = document.querySelectorAll("li a");
  anchors.forEach((a) => {
    a.addEventListener("click", () => {
      theme = a.innerText.toLowerCase();
      // If theme is a color update theme
      if (theme != "theme") {
        updateTheme();
      }
    });
  })
});

function updateTheme() {
  let logo = document.querySelector("#logo");
  if(logo) logo.src = "Images/"+theme+"logo.png";
  let title = document.querySelector(".page_title");
  title.style.backgroundColor = colors[theme];
}

// switch(theme) {
//   case "red":
//     let logo = = document.querySelector("#logo");
//     logo.src = "Images/redlogo.png"
// }
