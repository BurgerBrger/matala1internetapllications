

// controllers/feed.js
exports.render = (req, res) => {
  res.render("feed");
};


// res.render("feed", { content });

// exports.render = (req, res) => {
//   res.render("feed");
// };

// function render(req, res) {
//   res.render("feed", { feeds: contents });
// }

// function createContent(req, res) {
//   const newContent = { ...req.body, id: contents.length + 1 };
//   contents.push(newContent);
//   res.json(newContent);
// }

// function getAllContents(req, res) {
//   res.json(contents);
// }

// function getContentById(req, res) {
//   const id = Number(req.params.id);
//   const selectedContent = contents.find((m) => m.id === id);
//   if (!selectedContent) return res.status(404).json({ error: "Content not found" });
//   res.json(selectedContent);
// }

// function updateContentById(req, res) {
//   const id = Number(req.params.id);
//   const i = contents.findIndex((m) => m.id === id);
//   if (i === -1) return res.status(404).json({ error: "Content not found" });

//   const { title, content, author, image } = req.body;
//   contents[i] = {
//     ...contents[i],
//     ...(title !== undefined && { title }),
//     ...(content !== undefined && { content }),
//     ...(author !== undefined && { author }),
//     ...(image !== undefined && { image }),
//   };
//   res.json(contents[i]);
// }

// function deleteContentById(req, res) {
//   const id = Number(req.params.id);
//   const i = contents.findIndex((m) => m.id === id);
//   if (i === -1) return res.status(404).json({ error: "Content not found" });
//   const deleted = contents.splice(i, 1)[0];
//   res.json({ message: "Content deleted", content: deleted });
// }





// module.exports = {
//   render,
//   createContent,
//   getAllContents,
//   getContentById,
//   updateContentById,
//   deleteContentById,
// };
