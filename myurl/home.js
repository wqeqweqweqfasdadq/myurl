document.addEventListener("DOMContentLoaded", () => {
  // 🔒 Password protection (3 attempts)
  let tries = 3;
  const correctPassword = "qwerty123456"; // Change this

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
  const titleInput = document.getElementById("titleInput");
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
        <input type="text" value="${link.title || ""}" id="edit-title-${index}" placeholder="Title" />
        <input type="text" value="${link.original}" id="edit-original-${index}" />
        <button onclick="saveLink(${index})">Save</button>
        <button onclick="deleteLink(${index})">Delete</button>
        <button onclick="copyToClipboard('${link.short}')">Copy</button>
      `;
      shortenedLinksDiv.appendChild(div);
    });
  };

  window.saveLink = async (index) => {
    const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
    const shortUrl = links[index].short;
    const shortCode = shortUrl.split("/").pop();
    const newTitle = document.getElementById(`edit-title-${index}`).value;
    const newUrl = document.getElementById(`edit-original-${index}`).value;

    try {
      const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ short: shortCode, url: newUrl, title: newTitle }),
      });

      if (!response.ok) throw new Error("Failed to update backend");

      links[index].original = newUrl;
      links[index].title = newTitle;
      localStorage.setItem("shortenedLinks", JSON.stringify(links));
      alert("Updated successfully.");
      loadLinks();
    } catch (err) {
      alert("Failed to update backend. Local change only.");
    }
  };

  window.deleteLink = (index) => {
    const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
    if (confirm("Delete this shortened link?")) {
      links.splice(index, 1);
      localStorage.setItem("shortenedLinks", JSON.stringify(links));
      loadLinks();
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
    const title = titleInput.value;

    const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: longUrl, title }),
    });

    const data = await response.json();

    const links = JSON.parse(localStorage.getItem("shortenedLinks") || "[]");
    links.push({ original: data.original, short: data.short, title: data.title || "" });
    localStorage.setItem("shortenedLinks", JSON.stringify(links));

    longUrlInput.value = "";
    titleInput.value = "";
    loadLinks();
  });

  loadLinks();
});
