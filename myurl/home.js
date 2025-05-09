document.addEventListener("DOMContentLoaded", () => {
  // 🔒 Password protection
  let tries = 3;
  const correctPassword = "qwerty123456"; // Change this

  while (tries > 0) {
    const input = prompt("Kung ikaw ay ako, at ako ay ikaw, Sinong ng yare?:");
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

  let links = [];

  const loadLinks = async () => {
    try {
      const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/list");
      links = await response.json();

      shortenedLinksDiv.innerHTML = "";

      for (let index = 0; index < links.length; index++) {
        const link = links[index];
        const shortCode = link.short.split("/").pop();

        const div = document.createElement("div");
        div.className = "shortened-item";
        div.innerHTML = `
          <div><strong>${link.short}</strong></div>
          <div id="visits-${index}" style="font-size: 0.9em; margin-bottom: 5px; color: #666;">Loading visits...</div>
          <input type="text" value="${link.title || ""}" id="edit-title-${index}" placeholder="Title" />
          <input type="text" value="${link.original}" id="edit-original-${index}" />
          <button onclick="saveLink(${index})">Save</button>
          <button onclick="deleteLink(${index})">Delete</button>
          <button onclick="copyToClipboard('${link.short}')">Copy</button>
        `;
        shortenedLinksDiv.appendChild(div);

        // Fetch visits in the background
        fetch(`https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/visits/${shortCode}`)
          .then(res => res.json())
          .then(visitData => {
            const stats = `
              🔹 Today: ${visitData.today || 0} |
              🔸 Week: ${visitData.week || 0} |
              🌐 Total: ${visitData.total || 0}
            `;
            document.getElementById(`visits-${index}`).textContent = stats;
          })
          .catch(() => {
            document.getElementById(`visits-${index}`).textContent = "Failed to load visit data.";
          });
      }
    } catch (err) {
      alert("Failed to load links.");
    }
  };

  window.saveLink = async (index) => {
    const title = document.getElementById(`edit-title-${index}`).value;
    const url = document.getElementById(`edit-original-${index}`).value;
    const short = links[index].short.split("/").pop();

    try {
      const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short, url, title }),
      });

      if (!response.ok) throw new Error();
      alert("Updated successfully.");
      await loadLinks();
    } catch {
      alert("Failed to update.");
    }
  };

  window.deleteLink = async (index) => {
    const short = links[index].short.split("/").pop();
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short }),
      });

      if (!response.ok) throw new Error();
      alert("Deleted.");
      await loadLinks();
    } catch {
      alert("Failed to delete.");
    }
  };

  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = longUrlInput.value;
    const title = titleInput.value;

    try {
      const response = await fetch("https://proud-morning-fb39.wqeqweqweqfasdadq.workers.dev/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title }),
      });

      if (!response.ok) throw new Error();
      longUrlInput.value = "";
      titleInput.value = "";
      await loadLinks();
    } catch {
      alert("Failed to shorten link.");
    }
  });

  loadLinks();
});
