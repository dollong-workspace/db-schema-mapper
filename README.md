# 🔥 SchemaCraft

**Design Databases at the Speed of Thought.**

### 🛑 The Problem: Database Design is Broken

Designing databases usually forces you into one of two crappy options:

1. **Writing pure SQL:** Fast for devs, but trying to picture complex relationships in your head is a nightmare. It turns into "spaghetti tables."
2. **Drag-and-Drop Tools:** Great for visuals, but painfully slow when you're actually entering data. Right-click → Add Column → Type Name → Select Type… way too many clicks.

### 🚀 The Solution: SchemaCraft

**SchemaCraft** combines the speed of coding with the clarity of visual diagrams.
We built a real-time bridge between a **Text Editor** and an **Infinite Canvas**. Type code → diagram appears. Draw lines on the diagram → code updates.
**Best of both worlds. Zero friction.**

---

## ✨ Key Features

### ⚡ Bi-Directional Sync (The Magic)

Change something on one side, and the other updates instantly.

- **Code-to-Canvas:** Type `Table Users {}` and boom, the table shows up on the canvas.
- **Canvas-to-Code:** Draw a connection line between tables on the canvas, and we automatically add the `Ref:` in your code. Delete a table visually? The code cleans itself up too.

### 💻 Developer-First Editor

Our editor isn't just a basic textarea. It's basically **VS Code in the browser**:

- **Syntax Highlighting:** Smart colors to distinguish tables, types, and refs.
- **Intellisense/Autocomplete:** Forget DBML syntax? Just type `Ta...` and hit Enter.
- **Error Detection:** Catch typos before they become real problems.

### 🎨 Interactive Infinite Canvas

- **Auto-Layout:** No need to manually arrange tables.
- **Smart Relationships:** Clear visuals for one-to-many or many-to-one.
- **Glow Effects:** Modern UI with a comfy dark theme (cyberpunk/dark mode vibes).

---

## 🛠️ How It Works (End-to-End Workflow)

Imagine you're building the backend for an e-commerce app. Here's how SchemaCraft speeds things up:

### 1. Define (Write)

Open the left panel. Write your schema using simple **DBML** language.

```dbml
Table users {
  id integer [primary key]
  username varchar
  email varchar
}
Table orders {
  id integer [primary key]
  user_id integer
  total decimal
}
```

_Result:_ Both tables pop up on the right canvas in real time.

### 2. Connect (Link Them Up)

Too lazy to type relationships? No worries.

- Head to the right canvas.
- Drag a line from `users.id` to `orders.user_id`.
- Voila! The connection appears, and `Ref: users.id < orders.user_id` gets added to the editor automatically.

### 3. Refine (Tweak It)

Use autocomplete to add details fast. Type `stat...` and pick `status varchar`. Delete a wrong table on the canvas with Delete, and the code disappears too.

### 4. Persist (Save)

SchemaCraft is **local-first**. Your work auto-saves in the browser. Close the tab, come back tomorrow—everything's still there.

---

## 🔮 Roadmap: What's Next?

We're just getting started. Here's what's cooking:

- [ ] **SQL Export:** Export your DBML straight to `.sql` (PostgreSQL, MySQL).
- [ ] **Team Collaboration:** Real-time editing with your team (like Figma).
- [ ] **Version History:** Unlimited undo/redo and change history.
- [ ] **Screenshot Mode:** Export diagrams to high-quality transparent PNG/SVG for docs.

---

## 💎 SchemaCraft PRO (Coming Soon)

Support the project and unlock power-user features:
| Feature | Free Tier | PRO Tier |
|---------------------|------------------------|-----------------------------------|
| Projects | 1 Local Project | Unlimited Cloud Projects |
| **AI Assistant** | - | **Text-to-Schema** (Generate tables from prompts) |
| Export | DBML Only | SQL, JSON, PDF, SVG |
| Privacy | Public/Local | Private Projects & Password Protection |
| Support | Community | Priority Support |

---

## 💌 Feedback & Bug Reports

This is still in **Beta**. We're building it for developers, by developers.
Got a wild feature idea? Found a annoying bug? Or just wanna say hi?
Fill out this quick form (takes 1 minute):
👉 **[Link to Feedback Form]** _(e.g., Google Forms / Typeform)_

---

## 👨‍💻 Tech Stack

Built with ❤️ using modern web tech:

- **Framework:** Next.js 14
- **Editor Engine:** Monaco Editor (the heart of VS Code)
- **Visual Engine:** React Flow
- **Styling:** Tailwind CSS + HeroUI
- **Icons:** Lucide React

_Star the repo if this looks useful! ⭐️_
