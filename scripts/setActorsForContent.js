/*
Set topActors for a single Content doc.

Usage:
  node scripts/setActorsForContent.js <contentId> "Actor One,Actor Two,Actor Three"

Example:
  node scripts/setActorsForContent.js 1 "Marlon Brando,Al Pacino,James Caan"
*/

require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('../models/mongo/Content');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/setActorsForContent.js <contentId> "Actor One,Actor Two,Actor Three"');
    process.exit(2);
  }
  const contentId = Number(args[0]);
  if (Number.isNaN(contentId)) {
    console.error('contentId must be a number');
    process.exit(2);
  }
  const actorsRaw = args[1];
  const actors = actorsRaw.split(',').map(s => s.trim()).filter(Boolean).slice(0,3);

  await mongoose.connect(process.env.MONGODB_URI);
  const res = await Content.updateOne({ id: contentId }, { $set: { topActors: actors } });
  if (res.matchedCount === 0 && res.nModified === 0) {
    console.error('No document updated. Check that content id exists.');
  } else {
    console.log('Updated content', contentId, 'with actors:', actors);
  }
  process.exit(0);
}

main().catch(e => { console.error('Error', e && e.message ? e.message : e); process.exit(1); });
