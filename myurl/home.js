document.addEventListener("DOMContentLoaded", () => {
  // 🔒 Password protection (3 attempts)
  let tries = 3;
  const correctPassword = "qwerty123456"; // 🔐 Your password here

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

  window.saveLink = async (index) => {
    const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
    const input = document.getElementById(`edit-original-${index}`);
    const newOriginal = input.value;
    const shortUrl = links[index].short;

    // ✅ This ensures we extract the short code correctly, regardless of domain
    const shortCode = shortUrl.replace(/^https?:\/\/[^\/]+\/?/, "").trim();

    try {
      const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ short: shortCode, url: newOriginal }),
      });

      if (!response.ok) {
        throw new Error("Worker update failed");
      }

      links[index].original = newOriginal;
      localStorage.setItem("shortenedLinks", JSON.stringify(links));
      alert("Link updated successfully.");
      loadLinks();
    } catch (err) {
      alert("Failed to update backend. Changes not saved.");
    }
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
