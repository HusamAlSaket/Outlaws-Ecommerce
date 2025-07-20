// Stagger animation for product cards
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".fade-in");
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
});
