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
        <button onclick="copyToClipboard('${link.short}')">Copy</button>
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

  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const longUrl = longUrlInput.value;

    // ✅ Fixed URL: uses the correct workers.dev domain
    const response = await fetch("https://proud-morning-fb39.wqeqqweqweqfasdadaq.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: longUrl }),
    });

    const data = await response.json();

    const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
    links.push({ original: data.original, short: data.short });
    localStorage.setItem("shortenedLinks", JSON.stringify(links));

    longUrlInput.value = "";
    loadLinks();
  });

  loadLinks();
});
