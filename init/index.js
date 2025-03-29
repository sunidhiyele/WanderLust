const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initData=require("./data.js");

main().then(()=>{
    console.log("connected to db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

}

const initDb=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:'67ce94cab66b2d2eea3d8d46'}));
    await Listing.insertMany(initData.data);
    console.log("data initialized");
}
initDb();