document.addEventListener("DOMContentLoaded", () => {
  // 🔒 Password protection (3 attempts)
  let tries = 3;
  const correctPassword = "qwerty123456"; // ✅ change this to your real password

  while (tries > 0) {
    const input = prompt("Enter password to use the URL shortener:");
    if (input === correctPassword) break;
    tries--;
    if (tries === 0) {
      alert("Access denied.");
      document.body.innerHTML = "";
      return;
    } else {
      alert(`Incorrect password. ${tries} ${tries === 1 ? "try" : "tries"} left.`);
    }
  }

  // ✅ Main app logic
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
        <input type="text" value="${link.original}" id="edit-original-${index}" />
        <button onclick="saveLink(${index})">Save</button>
        <button onclick="copyToClipboard('${link.short}')">Copy</button>
      `;
      shortenedLinksDiv.appendChild(div);
    });
  };

  window.saveLink = (index) => {
    const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
    const input = document.getElementById(`edit-original-${index}`);
    links[index].original = input.value;
    localStorage.setItem("shortenedLinks", JSON.stringify(links));
    alert("Link updated locally.");
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

    const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/create", {
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
