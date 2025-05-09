// home.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("shortenForm");
    const longUrlInput = document.getElementById("longUrl");
    const shortenedLinksDiv = document.getElementById("shortenedLinks");
  
    const loadLinks = () => {
      const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
      shortenedLinksDiv.innerHTML = "";
      links.forEach((link, index) => {
        const div = document.createElement("div");
        div.className = "shortened-item";
        div.innerHTML = `
          <input type="text" value="${link.short}" readonly />
          <input type="text" value="${link.original}" />
          <button onclick="editLink(${index})">Edit</button>
        `;
        shortenedLinksDiv.appendChild(div);
      });
    };
  
    window.editLink = (index) => {
      const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
      const div = shortenedLinksDiv.children[index];
      const newOriginal = div.querySelectorAll("input")[1].value;
      links[index].original = newOriginal;
      localStorage.setItem("shortenedLinks", JSON.stringify(links));
      loadLinks();
    };
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const longUrl = longUrlInput.value;
      const randomId = Math.random().toString(36).substring(2, 8);
      const shortUrl = `https://short.ly/${randomId}`;
  
      const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
      links.push({ original: longUrl, short: shortUrl });
      localStorage.setItem("shortenedLinks", JSON.stringify(links));
  
      longUrlInput.value = "";
      loadLinks();
    });
  
    loadLinks();
  });
  