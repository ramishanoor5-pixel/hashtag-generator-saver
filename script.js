
// GENERATOR MODULE

const Generator = {

  generate(topic) {
    if (!topic.trim()) return [];

    const clean = topic.trim().toLowerCase();
    const words = clean.split(/\s+/);
    const main = words.join("");

    const suggestions = new Set();

    // Basic variations
    suggestions.add(`#${main}`);
    suggestions.add(`#${words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`);
    
    // Common patterns
    const prefixes = ["Learn", "Master", "Daily", "Tips", "Ideas", "Guide", "Tutorial"];
    const suffixes = ["Tips", "Ideas", "Life", "Goals", "Community", "Inspiration", "2025"];

    prefixes.forEach(p => suggestions.add(`#${p}${main.charAt(0).toUpperCase() + main.slice(1)}`));
    suffixes.forEach(s => suggestions.add(`#${main}${s}`));

    if (words.length > 1) {
      suggestions.add(`#${words[0]}${words[1]}`);
      suggestions.add(`#${words.join("")}`);
    }

    return Array.from(suggestions).slice(0, 12);
  },

  // Display hashtags in the UI
  render(hashtags) {
    const container = document.getElementById("hashtagsContainer");
    container.innerHTML = "";

    if (hashtags.length === 0) {
      container.innerHTML = `<p class="placeholder-text">Your hashtags will appear here...</p>`;
      return;
    }

    hashtags.forEach(tag => {
      const el = document.createElement("span");
      el.className = "hashtag";
      el.textContent = tag;

      el.addEventListener("click", () => {
        navigator.clipboard.writeText(tag).then(() => {
          el.classList.add("copied");
          el.textContent = "Copied!";
          setTimeout(() => {
            el.classList.remove("copied");
            el.textContent = tag;
          }, 1200);
        });
      });

      container.appendChild(el);
    });
  }
};

// SAVER MODULE

const Saver = {
  storageKey: "hashtagSets",

  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  },

  save(name, hashtags) {
    if (!name.trim() || hashtags.length === 0) {
      alert("Please generate hashtags and give the set a name.");
      return false;
    }

    const sets = this.getAll();
    const existingIndex = sets.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    
    const newSet = {
      id: Date.now(),
      name: name.trim(),
      hashtags: hashtags,
      createdAt: new Date().toLocaleDateString()
    };

    if (existingIndex !== -1) {
      sets[existingIndex] = newSet; 
    } else {
      sets.unshift(newSet);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(sets));
    return true;
  },

  delete(id) {
    const sets = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(sets));
  },

  render() {
    const list = document.getElementById("savedSetsList");
    const sets = this.getAll();

    list.innerHTML = "";

    if (sets.length === 0) {
      list.innerHTML = `<p class="empty-message">No saved sets yet</p>`;
      return;
    }

    sets.forEach(set => {
      const item = document.createElement("div");
      item.className = "saved-item";

      item.innerHTML = `
        <div>
          <div class="saved-item-name">${set.name}</div>
          <small style="color:#94a3b8">${set.hashtags.length} hashtags • ${set.createdAt}</small>
        </div>
        <div class="saved-item-actions">
          <button class="btn-load" data-id="${set.id}">Load</button>
          <button class="btn-delete" data-id="${set.id}">Delete</button>
        </div>
      `;

      list.appendChild(item);
    });
  }
};

// APP LOGIC (Connecting everything)

let currentHashtags = [];

const topicInput = document.getElementById("topicInput");
const generateBtn = document.getElementById("generateBtn");
const setNameInput = document.getElementById("setNameInput");
const saveBtn = document.getElementById("saveBtn");
const savedSetsList = document.getElementById("savedSetsList");

// Generate hashtags
generateBtn.addEventListener("click", () => {
  const topic = topicInput.value;
  currentHashtags = Generator.generate(topic);
  Generator.render(currentHashtags);
});

topicInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    generateBtn.click();
  }
});

saveBtn.addEventListener("click", () => {
  const name = setNameInput.value;
  const success = Saver.save(name, currentHashtags);
  if (success) {
    setNameInput.value = "";
    Saver.render();
  }
});

// Load or Delete (Event Delegation)
savedSetsList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains("btn-load")) {
    const sets = Saver.getAll();
    const found = sets.find(s => s.id === id);
    if (found) {
      currentHashtags = found.hashtags;
      Generator.render(currentHashtags);
      topicInput.value = found.name;
    }
  }

  if (e.target.classList.contains("btn-delete")) {
    if (confirm("Delete this set?")) {
      Saver.delete(id);
      Saver.render();
    }
  }
});
Saver.render();